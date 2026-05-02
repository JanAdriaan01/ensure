import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET job assignments
export async function GET(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const result = await query(`
      SELECT ja.*, e.name, e.surname, e.employee_number, e.daily_capacity_hours
      FROM job_assignments ja
      JOIN employees e ON ja.employee_id = e.id
      WHERE ja.job_id = $1
    `, [jobId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST assign employee to job
export async function POST(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const { employee_id, role, estimated_hours } = await request.json();
    
    const result = await query(
      `INSERT INTO job_assignments (job_id, employee_id, role, estimated_hours)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (job_id, employee_id) 
       DO UPDATE SET role = EXCLUDED.role, estimated_hours = EXCLUDED.estimated_hours
       RETURNING *`,
      [jobId, employee_id, role, estimated_hours]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE remove assignment
export async function DELETE(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employee_id');
    
    await query('DELETE FROM job_assignments WHERE job_id = $1 AND employee_id = $2', [jobId, employeeId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}