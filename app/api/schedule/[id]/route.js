import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch single work order
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'schedule:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    
    const result = await query(
      `SELECT ws.*,
        j.lc_number as job_number,
        j.client_name,
        j.completion_status as job_status,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', e.id, 'name', e.name, 'surname', e.surname)) FILTER (WHERE e.id IS NOT NULL),
          '[]'::json
        ) as employees,
        COALESCE(
          jsonb_build_object('id', tl.id, 'name', tl.name, 'surname', tl.surname),
          NULL
        ) as team_lead
      FROM work_schedule ws
      LEFT JOIN jobs j ON ws.job_id = j.id
      LEFT JOIN work_schedule_employees wse ON ws.id = wse.schedule_id
      LEFT JOIN employees e ON wse.employee_id = e.id
      LEFT JOIN employees tl ON ws.team_lead_id = tl.id
      WHERE ws.id = $1
      GROUP BY ws.id, j.lc_number, j.client_name, j.completion_status, tl.id, tl.name, tl.surname`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching work order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update work order
export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'schedule:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    const body = await request.json();
    const {
      scheduled_date,
      start_time,
      end_time,
      title,
      description,
      status,
      priority,
      estimated_hours,
      actual_hours,
      team_lead_id,
      notes,
      employee_ids,
    } = body;
    
    // Start transaction
    await query('BEGIN');
    
    // Update work order
    const result = await query(
      `UPDATE work_schedule 
       SET scheduled_date = COALESCE($1, scheduled_date),
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           title = COALESCE($4, title),
           description = COALESCE($5, description),
           status = COALESCE($6, status),
           priority = COALESCE($7, priority),
           estimated_hours = COALESCE($8, estimated_hours),
           actual_hours = COALESCE($9, actual_hours),
           team_lead_id = COALESCE($10, team_lead_id),
           notes = COALESCE($11, notes),
           updated_at = NOW(),
           updated_by = $12
       WHERE id = $13
       RETURNING *`,
      [
        scheduled_date, start_time, end_time, title, description,
        status, priority, estimated_hours, actual_hours,
        team_lead_id, notes, auth.userId, id
      ]
    );
    
    if (result.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }
    
    // Update employee assignments if provided
    if (employee_ids && Array.isArray(employee_ids)) {
      // Remove existing assignments
      await query('DELETE FROM work_schedule_employees WHERE schedule_id = $1', [id]);
      
      // Add new assignments
      for (const employeeId of employee_ids) {
        await query(
          `INSERT INTO work_schedule_employees (schedule_id, employee_id, assigned_by)
           VALUES ($1, $2, $3)`,
          [id, employeeId, auth.userId]
        );
      }
    }
    
    await query('COMMIT');
    
    // Fetch updated record with assignments
    const updatedRecord = await query(
      `SELECT ws.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', e.id, 'name', e.name, 'surname', e.surname)) FILTER (WHERE e.id IS NOT NULL),
          '[]'::json
        ) as employees
      FROM work_schedule ws
      LEFT JOIN work_schedule_employees wse ON ws.id = wse.schedule_id
      LEFT JOIN employees e ON wse.employee_id = e.id
      WHERE ws.id = $1
      GROUP BY ws.id`,
      [id]
    );
    
    return NextResponse.json(updatedRecord.rows[0]);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating work order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete work order
export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'schedule:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    
    // Check if work order exists
    const check = await query('SELECT id FROM work_schedule WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Work order not found' }, { status: 404 });
    }
    
    await query('DELETE FROM work_schedule WHERE id = $1', [id]);
    
    return NextResponse.json({ message: 'Work order deleted successfully' });
  } catch (error) {
    console.error('Error deleting work order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}