// app/api/jobs/[id]/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }
    
    // Get job details - flattened for frontend
    const jobResult = await query(`
      SELECT 
        j.id,
        j.job_number,
        j.description,
        j.po_number,
        j.po_status,
        j.completion_status,
        j.po_amount,
        j.total_budget,
        j.client_id,
        j.quote_id,
        j.created_at,
        j.updated_at,
        j.start_date,
        j.end_date,
        j.site_address,
        j.actual_cost,
        c.client_name as client_name,
        q.quote_number
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN quotes q ON j.quote_id = q.id
      WHERE j.id = $1
    `, [jobId]);
    
    if (jobResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = jobResult.rows[0];
    
    // Get additional data (optional - for dashboard)
    const itemsResult = await query(`
      SELECT * FROM job_items WHERE job_id = $1 ORDER BY id
    `, [jobId]);
    
    const attendanceResult = await query(`
      SELECT * FROM attendance_logs WHERE job_id = $1 ORDER BY log_date DESC LIMIT 10
    `, [jobId]);
    
    // Return flattened job object with additional data as separate properties
    return NextResponse.json({
      ...job,
      items: itemsResult.rows,
      attendance: attendanceResult.rows,
      tools_count: itemsResult.rows.filter(i => i.item_type === 'tool').length,
      stock_items_count: itemsResult.rows.filter(i => i.item_type === 'stock').length
    });
    
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const updates = await request.json();
    
    const { po_status, completion_status, po_amount, total_invoiced, notes, start_date, end_date, site_address } = updates;
    
    const result = await query(
      `UPDATE jobs SET 
        po_status = COALESCE($1, po_status),
        completion_status = COALESCE($2, completion_status),
        po_amount = COALESCE($3, po_amount),
        total_invoiced = COALESCE($4, total_invoiced),
        notes = COALESCE($5, notes),
        start_date = COALESCE($6, start_date),
        end_date = COALESCE($7, end_date),
        site_address = COALESCE($8, site_address),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [po_status, completion_status, po_amount, total_invoiced, notes, start_date, end_date, site_address, jobId]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    
    // Check if job can be deleted (only if no related data)
    const checks = await query(`
      SELECT 
        (SELECT COUNT(*) FROM job_items WHERE job_id = $1) as items,
        (SELECT COUNT(*) FROM job_tools WHERE job_id = $1) as tools,
        (SELECT COUNT(*) FROM job_team WHERE job_id = $1) as team,
        (SELECT COUNT(*) FROM job_payroll WHERE job_id = $1) as payroll
    `, [jobId]);
    
    const hasRelatedData = checks.rows[0].items > 0 || 
                          checks.rows[0].tools > 0 || 
                          checks.rows[0].team > 0 || 
                          checks.rows[0].payroll > 0;
    
    if (hasRelatedData) {
      return NextResponse.json({ 
        error: 'Cannot delete job with existing items, tools, team members, or payroll entries' 
      }, { status: 400 });
    }
    
    await query('DELETE FROM jobs WHERE id = $1', [jobId]);
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}