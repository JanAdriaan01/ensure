// app/api/employees/[id]/route.js
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
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }
    
    // Get employee details
    const employeeResult = await query(`
      SELECT 
        e.id,
        e.employee_number,
        e.name,
        e.surname,
        CONCAT(e.name, ' ', e.surname) as full_name,
        e.date_of_birth,
        e.nationality,
        e.passport_number,
        e.work_permit,
        e.company_start_date,
        e.hourly_rate,
        e.created_at,
        e.updated_at,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.date_of_birth)) as age,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.company_start_date)) as years_worked
      FROM employees e
      WHERE e.id = $1
    `, [employeeId]);
    
    if (employeeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    const employee = employeeResult.rows[0];
    
    // Try to get certifications (table may not exist)
    let certifications = [];
    try {
      const certsResult = await query(`
        SELECT c.certification_name, ec.certified_date, ec.expiry_date
        FROM employee_certifications ec
        JOIN certifications c ON ec.certification_id = c.id
        WHERE ec.employee_id = $1
      `, [employeeId]);
      certifications = certsResult.rows;
    } catch (err) {
      // Table doesn't exist, ignore
      console.log('Certifications table not found');
    }
    
    // Try to get skills (table may not exist)
    let skills = [];
    try {
      const skillsResult = await query(`
        SELECT s.skill_name, es.years_experience
        FROM employee_skills es
        JOIN skills s ON es.skill_id = s.id
        WHERE es.employee_id = $1
      `, [employeeId]);
      skills = skillsResult.rows;
    } catch (err) {
      // Table doesn't exist, ignore
      console.log('Skills table not found');
    }
    
    // Try to get time entries (table may not exist)
    let timeEntries = [];
    try {
      const timeResult = await query(`
        SELECT edt.*, j.job_number
        FROM employee_daily_time edt
        LEFT JOIN jobs j ON edt.job_id = j.id
        WHERE edt.employee_id = $1
        ORDER BY edt.work_date DESC
        LIMIT 10
      `, [employeeId]);
      timeEntries = timeResult.rows;
    } catch (err) {
      // Table doesn't exist, ignore
      console.log('Employee daily time table not found');
    }
    
    return NextResponse.json({
      employee: employee,
      certifications: certifications,
      skills: skills,
      time_entries: timeEntries
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
    
    const { 
      name, 
      surname, 
      nationality, 
      passport_number, 
      work_permit, 
      hourly_rate 
    } = body;
    
    const result = await query(
      `UPDATE employees 
       SET name = COALESCE($1, name),
           surname = COALESCE($2, surname),
           nationality = COALESCE($3, nationality),
           passport_number = COALESCE($4, passport_number),
           work_permit = COALESCE($5, work_permit),
           hourly_rate = COALESCE($6, hourly_rate),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, surname, nationality, passport_number, work_permit, hourly_rate, employeeId]
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
    return NextResponse.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}