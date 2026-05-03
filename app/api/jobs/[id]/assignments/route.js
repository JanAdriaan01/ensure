export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch all assignments for a job
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
        ja.*,
        e.first_name,
        e.last_name,
        e.employee_number,
        e.hourly_rate
      FROM job_assignments ja
      JOIN employees e ON ja.employee_id = e.id
      WHERE ja.job_id = $1
      ORDER BY ja.assigned_date DESC
    `, [jobId]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching job assignments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Assign employee to job
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const { employee_id, role, estimated_hours, hourly_rate } = await request.json();
    
    if (!employee_id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO job_assignments (job_id, employee_id, role, estimated_hours, hourly_rate, assigned_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, (SELECT hourly_rate FROM employees WHERE id = $2)), CURRENT_DATE)
       ON CONFLICT (job_id, employee_id) 
       DO UPDATE SET 
         role = EXCLUDED.role, 
         estimated_hours = EXCLUDED.estimated_hours,
         hourly_rate = EXCLUDED.hourly_rate
       RETURNING *`,
      [jobId, employee_id, role, estimated_hours, hourly_rate]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error assigning employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove assignment
export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    
    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }
    
    await query('DELETE FROM job_assignments WHERE job_id = $1 AND employee_id = $2', [jobId, employeeId]);
    return NextResponse.json({ success: true, message: 'Assignment removed successfully' });
  } catch (error) {
    console.error('Error removing assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}