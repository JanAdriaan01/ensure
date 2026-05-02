import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';

// GET all employees with summary
export async function GET() {
  try {
    const employees = await query(`
      SELECT 
        e.*,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.date_of_birth)) as age,
        EXTRACT(YEAR FROM age(CURRENT_DATE, e.company_start_date)) as years_worked,
        COALESCE(SUM(edt.hours_worked), 0) as total_hours_worked
      FROM employees e
      LEFT JOIN employee_daily_time edt ON e.id = edt.employee_id
      GROUP BY e.id
      ORDER BY e.employee_number
    `);
    return NextResponse.json(employees.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new employee
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      employee_number, name, surname, date_of_birth, 
      nationality, passport_number, work_permit, company_start_date 
    } = body;
    
    const result = await query(
      `INSERT INTO employees (employee_number, name, surname, date_of_birth, 
        nationality, passport_number, work_permit, company_start_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [employee_number, name, surname, date_of_birth, 
       nationality, passport_number, work_permit, company_start_date]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Employee number already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}