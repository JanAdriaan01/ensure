import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// POST - Assign employee to work order
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
    const { schedule_id, employee_id, role } = body;
    
    if (!schedule_id || !employee_id) {
      return NextResponse.json(
        { error: 'Schedule ID and employee ID are required' },
        { status: 400 }
      );
    }
    
    // Check if assignment already exists
    const existing = await query(
      'SELECT id FROM work_schedule_employees WHERE schedule_id = $1 AND employee_id = $2',
      [schedule_id, employee_id]
    );
    
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Employee already assigned to this work order' },
        { status: 409 }
      );
    }
    
    const result = await query(
      `INSERT INTO work_schedule_employees (schedule_id, employee_id, role, assigned_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [schedule_id, employee_id, role || null, auth.userId]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error assigning employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove employee from work order
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'schedule:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const schedule_id = searchParams.get('schedule_id');
    const employee_id = searchParams.get('employee_id');
    
    if (!schedule_id || !employee_id) {
      return NextResponse.json(
        { error: 'Schedule ID and employee ID are required' },
        { status: 400 }
      );
    }
    
    await query(
      'DELETE FROM work_schedule_employees WHERE schedule_id = $1 AND employee_id = $2',
      [schedule_id, employee_id]
    );
    
    return NextResponse.json({ message: 'Employee removed successfully' });
  } catch (error) {
    console.error('Error removing employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}