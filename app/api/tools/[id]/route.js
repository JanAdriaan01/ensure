import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import { hasPermission } from '@/app/lib/permissions';

// GET - Fetch single tool
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'tool:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    
    const result = await query(
      `SELECT t.*,
        COALESCE(json_agg(tc.*) FILTER (WHERE tc.id IS NOT NULL), '[]') as checkout_history
      FROM tools t
      LEFT JOIN tool_checkouts tc ON t.id = tc.tool_id
      WHERE t.id = $1
      GROUP BY t.id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update tool
export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'tool:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    const body = await request.json();
    const {
      tool_name,
      description,
      category,
      serial_number,
      condition,
      purchase_date,
      purchase_cost,
      location,
    } = body;
    
    const result = await query(
      `UPDATE tools 
       SET tool_name = COALESCE($1, tool_name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           serial_number = COALESCE($4, serial_number),
           condition = COALESCE($5, condition),
           purchase_date = COALESCE($6, purchase_date),
           purchase_cost = COALESCE($7, purchase_cost),
           location = COALESCE($8, location),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        tool_name, description, category, serial_number,
        condition, purchase_date, purchase_cost, location, id
      ]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete tool
export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'tool:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    
    // Check if tool has checkouts
    const checkouts = await query(
      'SELECT COUNT(*) FROM tool_checkouts WHERE tool_id = $1 AND status = $2',
      [id, 'checked_out']
    );
    
    if (parseInt(checkouts.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tool that is currently checked out' },
        { status: 409 }
      );
    }
    
    await query('DELETE FROM tools WHERE id = $1', [id]);
    
    return NextResponse.json({ message: 'Tool deleted successfully' });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}