export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch schedule entries with filters
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employee_id = searchParams.get('employee_id');
    const job_id = searchParams.get('job_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = `
      SELECT 
        ws.*,
        e.first_name,
        e.last_name,
        e.employee_number,
        j.lc_number as job_number,
        j.description as job_description
      FROM work_schedule ws
      LEFT JOIN employees e ON ws.employee_id = e.id
      LEFT JOIN jobs j ON ws.job_id = j.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (startDate) {
      sql += ` AND ws.date >= $${paramCount++}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND ws.date <= $${paramCount++}`;
      params.push(endDate);
    }

    if (employee_id) {
      sql += ` AND ws.employee_id = $${paramCount++}`;
      params.push(parseInt(employee_id));
    }

    if (job_id) {
      sql += ` AND ws.job_id = $${paramCount++}`;
      params.push(parseInt(job_id));
    }

    sql += ` ORDER BY ws.date ASC, ws.start_time ASC LIMIT $${paramCount++}`;
    params.push(limit);

    const result = await query(sql, params);
    const schedules = result.rows;

    // Get summary stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_schedules,
        COUNT(DISTINCT employee_id) as total_employees_scheduled,
        COUNT(DISTINCT job_id) as total_jobs_scheduled,
        COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_schedules
      FROM work_schedule
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    `);

    return NextResponse.json({
      success: true,
      data: schedules,
      stats: statsResult.rows[0],
      total: schedules.length
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

// POST - Create new schedule entry
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'schedule:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      employee_id, 
      job_id, 
      date, 
      start_time, 
      end_time, 
      role, 
      notes,
      status
    } = body;

    // Validate required fields
    if (!employee_id) {
      return NextResponse.json({ error: 'Employee is required' }, { status: 400 });
    }
    if (!job_id) {
      return NextResponse.json({ error: 'Job is required' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    if (!start_time || !end_time) {
      return NextResponse.json({ error: 'Start time and end time are required' }, { status: 400 });
    }

    // Check if employee already scheduled for this date
    const existing = await query(
      `SELECT id FROM work_schedule 
       WHERE employee_id = $1 AND date = $2 
       AND status NOT IN ('cancelled')`,
      [employee_id, date]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ 
        error: 'Employee already scheduled for this date' 
      }, { status: 409 });
    }

    // Check if job has conflicting schedules
    const jobConflict = await query(
      `SELECT id, employee_id FROM work_schedule 
       WHERE job_id = $1 AND date = $2 AND status NOT IN ('cancelled')`,
      [job_id, date]
    );

    // Start transaction
    await query('BEGIN');

    const result = await query(
      `INSERT INTO work_schedule (
        employee_id, job_id, date, start_time, end_time, role, notes, status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        employee_id, job_id, date, start_time, end_time, 
        role || null, notes || null, status || 'scheduled', auth.userId
      ]
    );

    // If there's a conflict, add a warning note
    let conflictWarning = null;
    if (jobConflict.rows.length > 0) {
      conflictWarning = `Warning: This job already has ${jobConflict.rows.length} other employee(s) scheduled on this date`;
    }

    await query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      warning: conflictWarning,
      message: 'Schedule entry created successfully'
    }, { status: 201 });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating schedule:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update schedule entry
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'schedule:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { 
      employee_id, 
      job_id, 
      date, 
      start_time, 
      end_time, 
      role, 
      notes,
      status
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (employee_id !== undefined) {
      updates.push(`employee_id = $${paramCount++}`);
      params.push(employee_id);
    }
    if (job_id !== undefined) {
      updates.push(`job_id = $${paramCount++}`);
      params.push(job_id);
    }
    if (date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      params.push(date);
    }
    if (start_time !== undefined) {
      updates.push(`start_time = $${paramCount++}`);
      params.push(start_time);
    }
    if (end_time !== undefined) {
      updates.push(`end_time = $${paramCount++}`);
      params.push(end_time);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      params.push(role);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      params.push(notes);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE work_schedule SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Schedule entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Schedule updated successfully'
    });

  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete schedule entry
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'schedule:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID is required' }, { status: 400 });
    }

    const result = await query(`DELETE FROM work_schedule WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Schedule entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule entry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}