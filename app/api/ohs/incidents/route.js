import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import { hasPermission } from '@/app/lib/permissions';

// GET - Fetch single incident
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'ohs:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    
    const result = await query(
      `SELECT i.*,
        e.name as employee_name,
        e.surname as employee_surname,
        r.name as reported_by_name,
        c.client_name,
        j.lc_number as job_number
      FROM ohs_incidents i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN users r ON i.reported_by = r.id
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      WHERE i.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }
    
    // Get investigation updates
    const updates = await query(
      `SELECT * FROM ohs_incident_updates 
       WHERE incident_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );
    
    return NextResponse.json({
      ...result.rows[0],
      updates: updates.rows,
    });
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update incident
export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'ohs:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    const body = await request.json();
    const {
      status,
      severity,
      investigation_notes,
      corrective_action,
      closed_date,
    } = body;
    
    const result = await query(
      `UPDATE ohs_incidents 
       SET status = COALESCE($1, status),
           severity = COALESCE($2, severity),
           investigation_notes = COALESCE($3, investigation_notes),
           corrective_action = COALESCE($4, corrective_action),
           closed_date = COALESCE($5, closed_date),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [status, severity, investigation_notes, corrective_action, closed_date, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}