export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch attendance logs for a job
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    
    const result = await query(`
      SELECT 
        al.*,
        e.first_name,
        e.last_name,
        e.employee_number
      FROM attendance_logs al
      JOIN employees e ON al.employee_id = e.id
      WHERE al.job_id = $1
      ORDER BY al.log_date DESC
    `, [jobId]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add attendance log
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const { employee_id, log_date, hours_worked, notes } = await request.json();
    
    if (!employee_id || !log_date || !hours_worked) {
      return NextResponse.json({ error: 'Employee, date, and hours are required' }, { status: 400 });
    }
    
    // Check if entry already exists
    const existing = await query(
      `SELECT id FROM attendance_logs WHERE job_id = $1 AND employee_id = $2 AND log_date = $3`,
      [jobId, employee_id, log_date]
    );
    
    let result;
    if (existing.rows.length > 0) {
      result = await query(
        `UPDATE attendance_logs 
         SET hours_worked = $1, notes = $2
         WHERE job_id = $3 AND employee_id = $4 AND log_date = $5
         RETURNING *`,
        [hours_worked, notes, jobId, employee_id, log_date]
      );
    } else {
      result = await query(
        `INSERT INTO attendance_logs (job_id, employee_id, log_date, hours_worked, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [jobId, employee_id, log_date, hours_worked, notes]
      );
    }
    
    // Update job monthly work done
    await query(
      `UPDATE jobs 
       SET monthly_work_done = (
         SELECT COALESCE(SUM(hours_worked), 0)
         FROM attendance_logs
         WHERE job_id = $1
         AND EXTRACT(YEAR_MONTH FROM log_date) = EXTRACT(YEAR_MONTH FROM CURRENT_DATE)
       )
       WHERE id = $1`,
      [jobId]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}