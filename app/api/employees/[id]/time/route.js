import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';

// POST add daily time entry
export async function POST(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    const { work_date, hours_worked, site_id, job_id, description } = await request.json();
    
    if (!work_date || !hours_worked) {
      return NextResponse.json({ error: 'Date and hours are required' }, { status: 400 });
    }
    
    // Check if entry already exists for this date
    const existing = await query(
      `SELECT id FROM employee_daily_time 
       WHERE employee_id = $1 AND work_date = $2`,
      [employeeId, work_date]
    );
    
    if (existing.rows.length > 0) {
      // Update existing
      await query(
        `UPDATE employee_daily_time 
         SET hours_worked = $1, site_id = $2, job_id = $3, description = $4
         WHERE employee_id = $5 AND work_date = $6`,
        [hours_worked, site_id, job_id, description, employeeId, work_date]
      );
    } else {
      // Insert new
      await query(
        `INSERT INTO employee_daily_time (employee_id, work_date, hours_worked, site_id, job_id, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [employeeId, work_date, hours_worked, site_id, job_id, description]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding time entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET employee time entries summary
export async function GET(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    
    const result = await query(`
      SELECT 
        SUM(hours_worked) as total_hours,
        COUNT(DISTINCT work_date) as days_worked,
        MIN(work_date) as first_day,
        MAX(work_date) as last_day
      FROM employee_daily_time
      WHERE employee_id = $1
    `, [employeeId]);
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching time summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}