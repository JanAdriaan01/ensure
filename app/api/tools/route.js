export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all tools with optional filters
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = `
      SELECT 
        t.*,
        tc.employee_name as checked_out_to_name,
        tc.expected_return_date,
        tc.checkout_date
      FROM tools t
      LEFT JOIN tool_checkouts tc ON t.id = tc.tool_id AND tc.status = 'checked_out'
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND t.status = $${paramCount++}`;
      params.push(status);
    }

    if (category) {
      sql += ` AND t.category = $${paramCount++}`;
      params.push(category);
    }

    if (location) {
      sql += ` AND t.location = $${paramCount++}`;
      params.push(location);
    }

    if (search) {
      sql += ` AND (t.name ILIKE $${paramCount++} OR t.serial_number ILIKE $${paramCount} OR t.category ILIKE $${paramCount})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramCount += 3;
    }

    sql += ` ORDER BY t.name LIMIT $${paramCount++}`;
    params.push(limit);

    const result = await query(sql, params);
    const tools = result.rows;

    // Get summary statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_tools,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available,
        COUNT(CASE WHEN status = 'checked_out' THEN 1 END) as checked_out,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance,
        COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost,
        COUNT(CASE WHEN status = 'retired' THEN 1 END) as retired,
        COUNT(DISTINCT category) as categories
      FROM tools
    `);

    // Get categories for filter
    const categoriesResult = await query(`
      SELECT DISTINCT category FROM tools WHERE category IS NOT NULL ORDER BY category
    `);

    // Get locations for filter
    const locationsResult = await query(`
      SELECT DISTINCT location FROM tools WHERE location IS NOT NULL ORDER BY location
    `);

    return NextResponse.json({
      success: true,
      data: tools,
      stats: statsResult.rows[0],
      categories: categoriesResult.rows.map(r => r.category),
      locations: locationsResult.rows.map(r => r.location),
      total: tools.length
    });

  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

// POST - Create new tool
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'tool:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      serial_number,
      category,
      status,
      location,
      condition,
      purchase_date,
      purchase_price,
      current_value,
      supplier,
      notes,
      last_maintenance_date,
      next_maintenance_date
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 });
    }

    // Check if serial number already exists
    if (serial_number) {
      const existing = await query(`SELECT id FROM tools WHERE serial_number = $1`, [serial_number]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Serial number already exists' }, { status: 409 });
      }
    }

    const result = await query(
      `INSERT INTO tools (
        name, serial_number, category, status, location, condition,
        purchase_date, purchase_price, current_value, supplier, notes,
        last_maintenance_date, next_maintenance_date, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        name, serial_number || null, category || null, status || 'available', location || null,
        condition || 'good', purchase_date || null, purchase_price || 0, current_value || purchase_price || 0,
        supplier || null, notes || null, last_maintenance_date || null, next_maintenance_date || null,
        auth.userId
      ]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Tool created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update tool
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'tool:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const {
      name,
      serial_number,
      category,
      status,
      location,
      condition,
      purchase_date,
      purchase_price,
      current_value,
      supplier,
      notes,
      last_maintenance_date,
      next_maintenance_date
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (serial_number !== undefined) {
      updates.push(`serial_number = $${paramCount++}`);
      params.push(serial_number);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      params.push(category);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      params.push(location);
    }
    if (condition !== undefined) {
      updates.push(`condition = $${paramCount++}`);
      params.push(condition);
    }
    if (purchase_date !== undefined) {
      updates.push(`purchase_date = $${paramCount++}`);
      params.push(purchase_date);
    }
    if (purchase_price !== undefined) {
      updates.push(`purchase_price = $${paramCount++}`);
      params.push(purchase_price);
    }
    if (current_value !== undefined) {
      updates.push(`current_value = $${paramCount++}`);
      params.push(current_value);
    }
    if (supplier !== undefined) {
      updates.push(`supplier = $${paramCount++}`);
      params.push(supplier);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      params.push(notes);
    }
    if (last_maintenance_date !== undefined) {
      updates.push(`last_maintenance_date = $${paramCount++}`);
      params.push(last_maintenance_date);
    }
    if (next_maintenance_date !== undefined) {
      updates.push(`next_maintenance_date = $${paramCount++}`);
      params.push(next_maintenance_date);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE tools SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Tool updated successfully'
    });

  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete tool (only if not checked out)
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'tool:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
    }

    // Check if tool is currently checked out
    const checkout = await query(
      `SELECT id FROM tool_checkouts WHERE tool_id = $1 AND status = 'checked_out'`,
      [id]
    );
    if (checkout.rows.length > 0) {
      return NextResponse.json({ error: 'Cannot delete tool that is currently checked out' }, { status: 400 });
    }

    const result = await query(`DELETE FROM tools WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tool deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}