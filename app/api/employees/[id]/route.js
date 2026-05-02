import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';

// GET single employee with all related data
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    
    // Get employee details
    const employeeResult = await query(`
      SELECT 
        e.*,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.date_of_birth)) as age,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.company_start_date)) as years_worked
      FROM employees e
      WHERE e.id = $1
    `, [id]);
    
    if (employeeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    
    // Get certifications
    const certsResult = await query(`
      SELECT c.certification_name, ec.certified_date, ec.expiry_date
      FROM employee_certifications ec
      JOIN certifications c ON ec.certification_id = c.id
      WHERE ec.employee_id = $1
    `, [id]);
    
    // Get skills
    const skillsResult = await query(`
      SELECT s.skill_name, es.years_experience
      FROM employee_skills es
      JOIN skills s ON es.skill_id = s.id
      WHERE es.employee_id = $1
    `, [id]);
    
    // Get sites worked
    const sitesResult = await query(`
      SELECT s.site_name, s.location, es.work_date, es.hours_worked
      FROM employee_sites es
      JOIN sites s ON es.site_id = s.id
      WHERE es.employee_id = $1
      ORDER BY es.work_date DESC
    `, [id]);
    
    // Get daily time entries
    const timeResult = await query(`
      SELECT edt.*, j.lc_number as job_number, s.site_name
      FROM employee_daily_time edt
      LEFT JOIN jobs j ON edt.job_id = j.id
      LEFT JOIN sites s ON edt.site_id = s.id
      WHERE edt.employee_id = $1
      ORDER BY edt.work_date DESC
    `, [id]);
    
    return NextResponse.json({
      employee: employeeResult.rows[0],
      certifications: certsResult.rows,
      skills: skillsResult.rows,
      sites: sitesResult.rows,
      time_entries: timeResult.rows
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update employee
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, surname, nationality, passport_number, work_permit } = body;
    
    const result = await query(
      `UPDATE employees 
       SET name = $1, surname = $2, nationality = $3, 
           passport_number = $4, work_permit = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, surname, nationality, passport_number, work_permit, id]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE employee
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    await query('DELETE FROM employees WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}