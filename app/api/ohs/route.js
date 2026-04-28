import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all incidents
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
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let sqlQuery = `
      SELECT 
        i.*,
        e.name as employee_name,
        e.surname as employee_surname,
        r.name as reported_by_name,
        c.client_name
      FROM ohs_incidents i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN users r ON i.reported_by = r.id
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      sqlQuery += ` AND i.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (severity) {
      sqlQuery += ` AND i.severity = $${paramIndex++}`;
      params.push(severity);
    }
    
    if (startDate) {
      sqlQuery += ` AND i.incident_date >= $${paramIndex++}`;
      params.push(startDate);
    }
    
    if (endDate) {
      sqlQuery += ` AND i.incident_date <= $${paramIndex++}`;
      params.push(endDate);
    }
    
    sqlQuery += ` ORDER BY i.incident_date DESC, i.created_at DESC`;
    
    const result = await query(sqlQuery, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Report new incident
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
      incident_date,
      incident_type,
      description,
      severity,
      location,
      employee_id,
      client_id,
      job_id,
      witness_names,
      immediate_action,
    } = body;
    
    if (!incident_date || !incident_type || !description || !severity) {
      return NextResponse.json(
        { error: 'Incident date, type, description, and severity are required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO ohs_incidents (
        incident_date, incident_type, description, severity, location,
        employee_id, client_id, job_id, witness_names, immediate_action,
        status, reported_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'reported', $11, NOW())
      RETURNING *`,
      [
        incident_date, incident_type, description, severity, location || null,
        employee_id || null, client_id || null, job_id || null,
        witness_names || null, immediate_action || null, auth.userId
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error reporting incident:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}