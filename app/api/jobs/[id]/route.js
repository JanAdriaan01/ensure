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
    
    // Get job details
    const jobResult = await query(`
      SELECT 
        j.*,
        c.name as client_name,
        q.quote_number
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN quotes q ON j.quote_id = q.id
      WHERE j.id = $1
    `, [jobId]);
    
    if (jobResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Get job items
    const itemsResult = await query(`
      SELECT * FROM job_items WHERE job_id = $1 ORDER BY id
    `, [jobId]);
    
    // Get attendance logs
    const attendanceResult = await query(`
      SELECT * FROM attendance_logs WHERE job_id = $1 ORDER BY log_date DESC
    `, [jobId]);
    
    return NextResponse.json({
      job: jobResult.rows[0],
      items: itemsResult.rows,
      attendance: attendanceResult.rows
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
    
    const { po_status, completion_status, po_amount, total_invoiced, notes } = updates;
    
    const result = await query(
      `UPDATE jobs SET 
        po_status = COALESCE($1, po_status),
        completion_status = COALESCE($2, completion_status),
        po_amount = COALESCE($3, po_amount),
        total_invoiced = COALESCE($4, total_invoiced),
        notes = COALESCE($5, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [po_status, completion_status, po_amount, total_invoiced, notes, jobId]
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
    
    await query('DELETE FROM jobs WHERE id = $1', [jobId]);
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}