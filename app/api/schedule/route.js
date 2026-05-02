import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all work orders/schedule items
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'schedule:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const jobId = searchParams.get('jobId');
    
    let sqlQuery = `
      SELECT 
        ws.*,
        j.lc_number as job_number,
        j.client_name,
        j.completion_status as job_status,
        e.name as employee_name,
        e.surname as employee_surname,
        COUNT(DISTINCT tea.employee_id) as assigned_count
      FROM work_schedule ws
      LEFT JOIN jobs j ON ws.job_id = j.id
      LEFT JOIN work_schedule_employees tea ON ws.id = tea.schedule_id
      LEFT JOIN employees e ON tea.employee_id = e.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (startDate) {
      sqlQuery += ` AND ws.scheduled_date >= $${paramIndex++}`;
      params.push(startDate);
    }
    
    if (endDate) {
      sqlQuery += ` AND ws.scheduled_date <= $${paramIndex++}`;
      params.push(endDate);
    }
    
    if (status) {
      sqlQuery += ` AND ws.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (employeeId) {
      sqlQuery += ` AND tea.employee_id = $${paramIndex++}`;
      params.push(employeeId);
    }
    
    if (jobId) {
      sqlQuery += ` AND ws.job_id = $${paramIndex++}`;
      params.push(jobId);
    }
    
    sqlQuery += ` GROUP BY ws.id, j.lc_number, j.client_name, j.completion_status, e.name, e.surname
                  ORDER BY ws.scheduled_date ASC, ws.start_time ASC`;
    
    const result = await query(sqlQuery, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new work order
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
      job_id,
      scheduled_date,
      start_time,
      end_time,
      title,
      description,
      status = 'scheduled',
      priority = 'medium',
      estimated_hours,
      team_lead_id,
      employee_ids = [],
    } = body;
    
    if (!job_id || !scheduled_date || !title) {
      return NextResponse.json(
        { error: 'Job, date, and title are required' },
        { status: 400 }
      );
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Create work order
    const result = await query(
      `INSERT INTO work_schedule (
        job_id, scheduled_date, start_time, end_time, title, description,
        status, priority, estimated_hours, team_lead_id, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *`,
      [
        job_id, scheduled_date, start_time || null, end_time || null,
        title, description || null, status, priority,
        estimated_hours || null, team_lead_id || null, auth.userId
      ]
    );
    
    const scheduleId = result.rows[0].id;
    
    // Assign employees
    if (employee_ids.length > 0) {
      for (const employeeId of employee_ids) {
        await query(
          `INSERT INTO work_schedule_employees (schedule_id, employee_id, assigned_by)
           VALUES ($1, $2, $3)`,
          [scheduleId, employeeId, auth.userId]
        );
      }
    }
    
    await query('COMMIT');
    
    // Fetch complete record with assignments
    const completeRecord = await query(
      `SELECT ws.*, 
        json_agg(DISTINCT jsonb_build_object('id', e.id, 'name', e.name, 'surname', e.surname)) FILTER (WHERE e.id IS NOT NULL) as employees
      FROM work_schedule ws
      LEFT JOIN work_schedule_employees wse ON ws.id = wse.schedule_id
      LEFT JOIN employees e ON wse.employee_id = e.id
      WHERE ws.id = $1
      GROUP BY ws.id`,
      [scheduleId]
    );
    
    return NextResponse.json(completeRecord.rows[0], { status: 201 });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating work order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}