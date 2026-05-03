// app/api/jobs/[id]/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch single job by ID
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const result = await query(`
      SELECT 
        j.*,
        c.id as client_id,
        c.client_name,
        c.email as client_email,
        c.phone as client_phone,
        q.quote_number,
        q.quote_date,
        (SELECT COUNT(*) FROM job_items WHERE job_id = j.id) as item_count,
        (SELECT COUNT(*) FROM job_tools WHERE job_id = j.id AND status = 'issued') as tools_issued,
        (SELECT COUNT(*) FROM job_team WHERE job_id = j.id AND status = 'assigned') as team_assigned,
        (SELECT COALESCE(SUM(hours), 0) FROM job_payroll WHERE job_id = j.id) as total_hours_logged
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN quotes q ON j.quote_id = q.id
      WHERE j.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
    
  } catch (error) {
    console.error('GET /api/jobs/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update job details
export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const {
      description,
      site_address,
      start_date,
      end_date,
      total_budget,
      po_status,
      completion_status,
      notes
    } = body;
    
    // Check if job exists
    const checkResult = await query('SELECT id FROM jobs WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (site_address !== undefined) {
      updates.push(`site_address = $${paramCount++}`);
      values.push(site_address);
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(end_date);
    }
    if (total_budget !== undefined) {
      updates.push(`total_budget = $${paramCount++}`);
      values.push(total_budget);
    }
    if (po_status !== undefined) {
      updates.push(`po_status = $${paramCount++}`);
      values.push(po_status);
    }
    if (completion_status !== undefined) {
      updates.push(`completion_status = $${paramCount++}`);
      values.push(completion_status);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    if (updates.length === 1) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    const queryText = `UPDATE jobs SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(queryText, values);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Job updated successfully' 
    });
    
  } catch (error) {
    console.error('PUT /api/jobs/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete job (only if no related data)
export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if job exists
    const checkResult = await query('SELECT id, po_status FROM jobs WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = checkResult.rows[0];
    
    // Check if job has any related data
    const relatedChecks = await query(`
      SELECT 
        (SELECT COUNT(*) FROM job_items WHERE job_id = $1) as item_count,
        (SELECT COUNT(*) FROM job_tools WHERE job_id = $1) as tool_count,
        (SELECT COUNT(*) FROM job_stock WHERE job_id = $1) as stock_count,
        (SELECT COUNT(*) FROM job_team WHERE job_id = $1) as team_count,
        (SELECT COUNT(*) FROM job_payroll WHERE job_id = $1) as payroll_count
    `, [id]);
    
    const counts = relatedChecks.rows[0];
    
    if (counts.item_count > 0 || counts.tool_count > 0 || counts.stock_count > 0 || 
        counts.team_count > 0 || counts.payroll_count > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete job with existing items, tools, stock, team assignments, or payroll records' 
      }, { status: 400 });
    }
    
    // Begin transaction
    await query('BEGIN');
    
    // Delete job stages
    await query('DELETE FROM job_stages WHERE job_id = $1', [id]);
    
    // Delete job
    await query('DELETE FROM jobs WHERE id = $1', [id]);
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Job deleted successfully' 
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('DELETE /api/jobs/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Partial update for specific job actions
export async function PATCH(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, data } = body;
    
    // Check if job exists
    const checkResult = await query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = checkResult.rows[0];
    
    await query('BEGIN');
    let result;
    
    switch (action) {
      case 'update_status':
        // Update job status
        result = await query(`
          UPDATE jobs 
          SET po_status = COALESCE($1, po_status),
              completion_status = COALESCE($2, completion_status),
              updated_at = NOW()
          WHERE id = $3
          RETURNING *
        `, [data.po_status, data.completion_status, id]);
        break;
        
      case 'update_po':
        // Update PO information
        result = await query(`
          UPDATE jobs 
          SET po_number = COALESCE($1, po_number),
              po_amount = COALESCE($2, po_amount),
              po_date = COALESCE($3, po_date),
              po_status = 'approved',
              updated_at = NOW()
          WHERE id = $4
          RETURNING *
        `, [data.po_number, data.po_amount, data.po_date, id]);
        break;
        
      case 'update_budget':
        // Update budget
        result = await query(`
          UPDATE jobs 
          SET total_budget = $1,
              updated_at = NOW()
          WHERE id = $2
          RETURNING *
        `, [data.total_budget, id]);
        break;
        
      case 'update_dates':
        // Update start/end dates
        result = await query(`
          UPDATE jobs 
          SET start_date = $1,
              end_date = $2,
              updated_at = NOW()
          WHERE id = $3
          RETURNING *
        `, [data.start_date, data.end_date, id]);
        break;
        
      case 'add_note':
        // Add note to job (if you have a notes field or separate notes table)
        result = await query(`
          UPDATE jobs 
          SET notes = CONCAT(COALESCE(notes, ''), '\n', $1, ' - ', $2, ': ', $3),
              updated_at = NOW()
          WHERE id = $4
          RETURNING *
        `, [new Date().toISOString(), auth.userName || 'System', data.note, id]);
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
    console.error('PATCH /api/jobs/[id] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}