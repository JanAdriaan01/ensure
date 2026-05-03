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
    const employeeId = parseInt(id);
    
    // Get employee details
    const employeeResult = await query(`
      SELECT 
        e.*,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.date_of_birth)) as age,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.company_start_date)) as years_worked
      FROM employees e
      WHERE e.id = $1
    `, [employeeId]);
    
    if (employeeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    // Get certifications
    const certsResult = await query(`
      SELECT c.certification_name, ec.certified_date, ec.expiry_date
      FROM employee_certifications ec
      JOIN certifications c ON ec.certification_id = c.id
      WHERE ec.employee_id = $1
    `, [employeeId]);
    
    // Get skills
    const skillsResult = await query(`
      SELECT s.skill_name, es.years_experience
      FROM employee_skills es
      JOIN skills s ON es.skill_id = s.id
      WHERE es.employee_id = $1
    `, [employeeId]);
    
    // Get daily time entries
    const timeResult = await query(`
      SELECT edt.*, j.lc_number as job_number
      FROM employee_daily_time edt
      LEFT JOIN jobs j ON edt.job_id = j.id
      WHERE edt.employee_id = $1
      ORDER BY edt.work_date DESC
    `, [employeeId]);
    
    return NextResponse.json({
      employee: employeeResult.rows[0],
      certifications: certsResult.rows,
      skills: skillsResult.rows,
      time_entries: timeResult.rows
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
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
    const employeeId = parseInt(id);
    const body = await request.json();
    const { first_name, last_name, nationality, passport_number, work_permit, email, phone, position, department, hourly_rate } = body;
    
    const result = await query(
      `UPDATE employees 
       SET first_name = $1, last_name = $2, nationality = $3, 
           passport_number = $4, work_permit = $5, email = $6, 
           phone = $7, position = $8, department = $9, hourly_rate = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [first_name, last_name, nationality, passport_number, work_permit, email, phone, position, department, hourly_rate, employeeId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
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
    const employeeId = parseInt(id);
    
    await query('DELETE FROM employees WHERE id = $1', [employeeId]);
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}