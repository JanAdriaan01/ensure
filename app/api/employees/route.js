export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
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
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      employee_number, first_name, last_name, date_of_birth, 
      nationality, passport_number, work_permit, company_start_date,
      email, phone, position, department, hourly_rate
    } = body;
    
    const result = await query(
      `INSERT INTO employees (
        employee_number, first_name, last_name, date_of_birth, 
        nationality, passport_number, work_permit, company_start_date,
        email, phone, position, department, hourly_rate, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
      RETURNING *`,
      [employee_number, first_name, last_name, date_of_birth, 
       nationality, passport_number, work_permit, company_start_date,
       email, phone, position, department, hourly_rate]
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