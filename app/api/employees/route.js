// app/api/employees/route.js
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
      employee_number, 
      name,
      surname,
      date_of_birth, 
      nationality, 
      passport_number, 
      work_permit, 
      company_start_date,
      hourly_rate
    } = body;
    
    if (!employee_number || !name || !surname || !date_of_birth || !company_start_date) {
      return NextResponse.json({ 
        error: 'Missing required fields: employee_number, name, surname, date_of_birth, company_start_date' 
      }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO employees (
        employee_number, name, surname, date_of_birth, 
        nationality, passport_number, work_permit, company_start_date,
        hourly_rate, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [employee_number, name, surname, date_of_birth, 
       nationality || null, passport_number || null, work_permit || null, company_start_date,
       hourly_rate || null]
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