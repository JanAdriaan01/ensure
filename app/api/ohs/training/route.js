import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import { hasPermission } from '@/app/lib/permissions';

// GET - Fetch all training records
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'ohs:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    
    let sqlQuery = `
      SELECT 
        t.*,
        e.name as employee_name,
        e.surname as employee_surname,
        CASE 
          WHEN t.expiry_date < CURRENT_DATE THEN 'expired'
          WHEN t.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
          ELSE 'valid'
        END as status
      FROM ohs_training t
      LEFT JOIN employees e ON t.employee_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (employeeId) {
      sqlQuery += ` AND t.employee_id = $${paramIndex++}`;
      params.push(employeeId);
    }
    
    if (status === 'expiring_soon') {
      sqlQuery += ` AND t.expiry_date < CURRENT_DATE + INTERVAL '30 days' AND t.expiry_date >= CURRENT_DATE`;
    } else if (status === 'expired') {
      sqlQuery += ` AND t.expiry_date < CURRENT_DATE`;
    } else if (status === 'valid') {
      sqlQuery += ` AND t.expiry_date >= CURRENT_DATE`;
    }
    
    sqlQuery += ` ORDER BY t.expiry_date ASC NULLS LAST`;
    
    const result = await query(sqlQuery, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching training records:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Record training completion
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'ohs:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      employee_id,
      training_name,
      provider,
      completion_date,
      expiry_date,
      certificate_number,
      notes,
    } = body;
    
    if (!employee_id || !training_name || !completion_date) {
      return NextResponse.json(
        { error: 'Employee, training name, and completion date are required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO ohs_training (
        employee_id, training_name, provider, completion_date,
        expiry_date, certificate_number, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        employee_id, training_name, provider || null, completion_date,
        expiry_date || null, certificate_number || null, notes || null, auth.userId
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error recording training:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}