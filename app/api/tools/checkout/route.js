import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// POST - Checkout tool
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'tool:checkout')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      tool_id,
      employee_id,
      job_id,
      expected_return_date,
      notes,
    } = body;
    
    if (!tool_id || !employee_id) {
      return NextResponse.json(
        { error: 'Tool ID and employee ID are required' },
        { status: 400 }
      );
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Check if tool is available
    const tool = await query(
      'SELECT status FROM tools WHERE id = $1',
      [tool_id]
    );
    
    if (tool.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    if (tool.rows[0].status !== 'available') {
      await query('ROLLBACK');
      return NextResponse.json(
        { error: 'Tool is not available for checkout' },
        { status: 409 }
      );
    }
    
    // Create checkout record
    const result = await query(
      `INSERT INTO tool_checkouts (
        tool_id, employee_id, job_id, checkout_date, expected_return_date,
        status, notes, checked_out_by
      ) VALUES ($1, $2, $3, NOW(), $4, 'checked_out', $5, $6)
      RETURNING *`,
      [tool_id, employee_id, job_id || null, expected_return_date || null, notes || null, auth.userId]
    );
    
    // Update tool status
    await query(
      'UPDATE tools SET status = $1, updated_at = NOW() WHERE id = $2',
      ['checked_out', tool_id]
    );
    
    await query('COMMIT');
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error checking out tool:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get checked out tools
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'tool:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const overdue = searchParams.get('overdue') === 'true';
    
    let sqlQuery = `
      SELECT 
        tc.*,
        t.tool_code,
        t.tool_name,
        t.serial_number,
        e.name as employee_name,
        e.surname as employee_surname,
        j.lc_number as job_number
      FROM tool_checkouts tc
      JOIN tools t ON tc.tool_id = t.id
      JOIN employees e ON tc.employee_id = e.id
      LEFT JOIN jobs j ON tc.job_id = j.id
      WHERE tc.status = 'checked_out'
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (employeeId) {
      sqlQuery += ` AND tc.employee_id = $${paramIndex++}`;
      params.push(employeeId);
    }
    
    if (overdue) {
      sqlQuery += ` AND tc.expected_return_date < CURRENT_DATE`;
    }
    
    sqlQuery += ` ORDER BY tc.expected_return_date NULLS LAST, tc.checkout_date DESC`;
    
    const result = await query(sqlQuery, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching checked out tools:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}