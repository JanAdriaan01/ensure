// app/api/jobs/[id]/manage/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch all job management data
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Get job details
    const jobResult = await query(`
      SELECT j.*, c.client_name, q.quote_number
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN quotes q ON j.quote_id = q.id
      WHERE j.id = $1
    `, [id]);
    
    if (jobResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = jobResult.rows[0];
    
    // Get assigned tools
    const toolsResult = await query(`
      SELECT jt.*, t.name as tool_name, t.code as tool_code, u.name as issued_to_name
      FROM job_tools jt
      LEFT JOIN tools t ON jt.tool_id = t.id
      LEFT JOIN users u ON jt.issued_to = u.id
      WHERE jt.job_id = $1
      ORDER BY jt.created_at DESC
    `, [id]);
    
    // Get stock purchases
    const stockResult = await query(`
      SELECT js.*, si.name as item_name, si.sku
      FROM job_stock js
      LEFT JOIN stock_items si ON js.stock_item_id = si.id
      WHERE js.job_id = $1
      ORDER BY js.created_at DESC
    `, [id]);
    
    // Get team assignments
    const teamResult = await query(`
      SELECT jt.*, u.name as user_name, u.email
      FROM job_team jt
      LEFT JOIN users u ON jt.user_id = u.id
      WHERE jt.job_id = $1
      ORDER BY jt.assigned_date DESC
    `, [id]);
    
    // Get payroll hours
    const payrollResult = await query(`
      SELECT jp.*, u.name as user_name
      FROM job_payroll jp
      LEFT JOIN users u ON jp.user_id = u.id
      WHERE jp.job_id = $1
      ORDER BY jp.date DESC
    `, [id]);
    
    // Calculate totals
    const totals = {
      total_tool_cost: 0,
      total_stock_cost: stockResult.rows.reduce((sum, s) => sum + parseFloat(s.total_cost || 0), 0),
      total_labour_hours: payrollResult.rows.reduce((sum, p) => sum + parseFloat(p.hours || 0), 0),
      total_labour_cost: payrollResult.rows.reduce((sum, p) => sum + (parseFloat(p.hours || 0) * parseFloat(p.hourly_rate || 0)), 0),
      actual_cost: parseFloat(job.actual_cost || 0)
    };
    
    return NextResponse.json({
      success: true,
      data: {
        job,
        tools: toolsResult.rows,
        stock: stockResult.rows,
        team: teamResult.rows,
        payroll: payrollResult.rows,
        totals
      }
    });
    
  } catch (error) {
    console.error('Job management API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Manage job actions (tools, stock, team, payroll)
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, data } = body;
    
    // Verify job exists
    const jobCheck = await query('SELECT id, po_status FROM jobs WHERE id = $1', [id]);
    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = jobCheck.rows[0];
    
    // Only allow management if job has PO approved
    if (job.po_status !== 'approved') {
      return NextResponse.json({ 
        error: 'Job management only available after PO is received and approved' 
      }, { status: 400 });
    }
    
    await query('BEGIN');
    let result;
    
    switch (action) {
      case 'assign_tool':
        result = await query(`
          INSERT INTO job_tools (job_id, tool_id, quantity, issued_date, issued_to, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [id, data.tool_id, data.quantity, data.issued_date, auth.userId, data.notes]);
        
        // Update tool availability
        await query(`
          UPDATE tools SET status = 'in_use', current_job_id = $1, updated_at = NOW()
          WHERE id = $2
        `, [id, data.tool_id]);
        break;
        
      case 'return_tool':
        result = await query(`
          UPDATE job_tools 
          SET returned_date = $1, status = 'returned', updated_at = NOW()
          WHERE id = $2 AND job_id = $3
          RETURNING *
        `, [new Date(), data.tool_assignment_id, id]);
        
        // Update tool availability
        await query(`
          UPDATE tools SET status = 'available', current_job_id = NULL, updated_at = NOW()
          WHERE id = (SELECT tool_id FROM job_tools WHERE id = $1)
        `, [data.tool_assignment_id]);
        break;
        
      case 'purchase_stock':
        result = await query(`
          INSERT INTO job_stock (job_id, stock_item_id, quantity, unit_cost, total_cost, 
            purchase_date, supplier, invoice_number, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [id, data.stock_item_id, data.quantity, data.unit_cost, 
             data.quantity * data.unit_cost, data.purchase_date, data.supplier, 
             data.invoice_number, data.notes]);
        
        // Update job actual cost
        await query(`
          UPDATE jobs 
          SET actual_cost = COALESCE(actual_cost, 0) + $1, updated_at = NOW()
          WHERE id = $2
        `, [data.quantity * data.unit_cost, id]);
        
        // Update stock quantity
        await query(`
          UPDATE stock_items 
          SET quantity = quantity - $1, updated_at = NOW()
          WHERE id = $2
        `, [data.quantity, data.stock_item_id]);
        break;
        
      case 'assign_team':
        result = await query(`
          INSERT INTO job_team (job_id, user_id, role, assigned_date, start_date, end_date, 
            hourly_rate, estimated_hours, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `, [id, data.user_id, data.role, new Date(), data.start_date, data.end_date,
             data.hourly_rate, data.estimated_hours, data.notes]);
        break;
        
      case 'log_hours':
        result = await query(`
          INSERT INTO job_payroll (job_id, user_id, date, hours, overtime_hours, description)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [id, data.user_id, data.date, data.hours, data.overtime_hours || 0, data.description]);
        
        // Update job actual cost with labour
        const hourlyRate = await query(`
          SELECT hourly_rate FROM job_team 
          WHERE job_id = $1 AND user_id = $2 AND status = 'assigned'
          ORDER BY assigned_date DESC LIMIT 1
        `, [id, data.user_id]);
        
        if (hourlyRate.rows.length > 0) {
          const cost = (data.hours + (data.overtime_hours || 0) * 1.5) * parseFloat(hourlyRate.rows[0].hourly_rate);
          await query(`
            UPDATE jobs 
            SET actual_cost = COALESCE(actual_cost, 0) + $1, updated_at = NOW()
            WHERE id = $2
          `, [cost, id]);
        }
        break;
        
      case 'approve_hours':
        result = await query(`
          UPDATE job_payroll 
          SET approved = TRUE, approved_by = $1, approved_at = NOW(), updated_at = NOW()
          WHERE id = $2 AND job_id = $3
          RETURNING *
        `, [auth.userId, data.payroll_id, id]);
        break;
        
      default:
        await query('ROLLBACK');
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: `${action.replace('_', ' ')} completed successfully`
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Job management action error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}