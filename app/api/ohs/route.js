export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all OHS incidents
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
    const limit = searchParams.get('limit') || 100;
    
    let sqlQuery = `
      SELECT 
        i.*,
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
    
    sqlQuery += ` ORDER BY i.incident_date DESC, i.created_at DESC LIMIT $${paramIndex++}`;
    params.push(limit);
    
    const result = await query(sqlQuery, params);
    
    // Get summary stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_incidents,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low,
        COUNT(CASE WHEN status = 'reported' THEN 1 END) as reported,
        COUNT(CASE WHEN status = 'investigating' THEN 1 END) as investigating,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
      FROM ohs_incidents
    `);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      stats: statsResult.rows[0],
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching OHS incidents:', error);
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

// POST - Report new OHS incident
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
      reported_by_name,
      reported_by_contact
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
        reported_by_name, reported_by_contact, status, reported_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'reported', $13, NOW(), NOW())
      RETURNING *`,
      [
        incident_date, incident_type, description, severity, location || null,
        employee_id || null, client_id || null, job_id || null,
        witness_names || null, immediate_action || null,
        reported_by_name || null, reported_by_contact || null,
        auth.userId
      ]
    );
    
    // Create notification for admins and managers
    await query(`
      INSERT INTO notifications (user_id, title, message, type, link, created_at)
      SELECT 
        u.id, 
        'New OHS Incident Reported', 
        $1, 
        'warning', 
        $2,
        NOW()
      FROM users u 
      WHERE u.role IN ('admin', 'manager')
    `, [
      `A ${severity} ${incident_type} incident has been reported on ${incident_date}`,
      `/ohs/${result.rows[0].id}`
    ]);
    
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error reporting OHS incident:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update incident status
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'ohs:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { status, investigation_notes, corrective_actions, resolved_at } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }
    
    const updates = [];
    const params = [];
    let paramCount = 1;
    
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }
    if (investigation_notes !== undefined) {
      updates.push(`investigation_notes = $${paramCount++}`);
      params.push(investigation_notes);
    }
    if (corrective_actions !== undefined) {
      updates.push(`corrective_actions = $${paramCount++}`);
      params.push(corrective_actions);
    }
    if (resolved_at !== undefined) {
      updates.push(`resolved_at = $${paramCount++}`);
      params.push(resolved_at);
    }
    
    updates.push(`updated_at = NOW()`);
    params.push(id);
    
    const result = await query(
      `UPDATE ohs_incidents SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating OHS incident:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete incident (admin only)
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }
    
    const result = await query(`DELETE FROM ohs_incidents WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Incident not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting OHS incident:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}