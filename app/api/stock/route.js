export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all stock items with optional filters
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = `
      SELECT 
        s.*,
        COALESCE(SUM(sm.quantity), 0) as total_in,
        COALESCE(SUM(CASE WHEN sm.type = 'out' THEN sm.quantity ELSE 0 END), 0) as total_out,
        (s.quantity + COALESCE(SUM(sm.quantity), 0) - COALESCE(SUM(CASE WHEN sm.type = 'out' THEN sm.quantity ELSE 0 END), 0)) as current_quantity
      FROM stock_items s
      LEFT JOIN stock_movements sm ON s.id = sm.stock_item_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (category) {
      sql += ` AND s.category = $${paramCount++}`;
      params.push(category);
    }

    if (lowStock) {
      sql += ` AND (s.quantity - COALESCE(SUM(CASE WHEN sm.type = 'out' THEN sm.quantity ELSE 0 END), 0) + COALESCE(SUM(sm.quantity), 0)) <= s.min_quantity`;
    }

    if (search) {
      sql += ` AND (s.name ILIKE $${paramCount++} OR s.sku ILIKE $${paramCount} OR s.category ILIKE $${paramCount})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramCount += 3;
    }

    sql += ` GROUP BY s.id ORDER BY s.name LIMIT $${paramCount++}`;
    params.push(limit);

    const result = await query(sql, params);
    const stockItems = result.rows;

    // Get summary statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(DISTINCT category) as total_categories,
        SUM(quantity) as total_quantity,
        COUNT(CASE WHEN quantity <= min_quantity THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_count
      FROM stock_items
    `);

    // Get categories for filter
    const categoriesResult = await query(`
      SELECT DISTINCT category FROM stock_items WHERE category IS NOT NULL ORDER BY category
    `);

    return NextResponse.json({
      success: true,
      data: stockItems,
      stats: statsResult.rows[0],
      categories: categoriesResult.rows.map(r => r.category),
      total: stockItems.length
    });

  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

// POST - Create new stock item
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'stock:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      sku,
      category,
      quantity,
      min_quantity,
      max_quantity,
      unit,
      unit_price,
      supplier,
      location,
      description,
      reorder_point
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }
    if (!sku) {
      return NextResponse.json({ error: 'SKU is required' }, { status: 400 });
    }
    if (quantity === undefined) {
      return NextResponse.json({ error: 'Quantity is required' }, { status: 400 });
    }

    // Check if SKU already exists
    const existing = await query(`SELECT id FROM stock_items WHERE sku = $1`, [sku]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
    }

    // Start transaction
    await query('BEGIN');

    const result = await query(
      `INSERT INTO stock_items (
        name, sku, category, quantity, min_quantity, max_quantity,
        unit, unit_price, supplier, location, description, reorder_point,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        name, sku, category || null, quantity, min_quantity || 0, max_quantity || null,
        unit || 'each', unit_price || 0, supplier || null, location || null,
        description || null, reorder_point || min_quantity || 0, auth.userId
      ]
    );

    // Log initial stock movement
    if (quantity > 0) {
      await query(
        `INSERT INTO stock_movements (
          stock_item_id, quantity, type, reference_type, notes, created_by, created_at
        ) VALUES ($1, $2, 'in', 'initial_stock', $3, $4, NOW())`,
        [result.rows[0].id, quantity, 'Initial stock on creation', auth.userId]
      );
    }

    await query('COMMIT');

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Stock item created successfully'
    }, { status: 201 });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating stock item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update stock item
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'stock:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const {
      name,
      sku,
      category,
      min_quantity,
      max_quantity,
      unit,
      unit_price,
      supplier,
      location,
      description,
      reorder_point
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      params.push(name);
    }
    if (sku !== undefined) {
      updates.push(`sku = $${paramCount++}`);
      params.push(sku);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      params.push(category);
    }
    if (min_quantity !== undefined) {
      updates.push(`min_quantity = $${paramCount++}`);
      params.push(min_quantity);
    }
    if (max_quantity !== undefined) {
      updates.push(`max_quantity = $${paramCount++}`);
      params.push(max_quantity);
    }
    if (unit !== undefined) {
      updates.push(`unit = $${paramCount++}`);
      params.push(unit);
    }
    if (unit_price !== undefined) {
      updates.push(`unit_price = $${paramCount++}`);
      params.push(unit_price);
    }
    if (supplier !== undefined) {
      updates.push(`supplier = $${paramCount++}`);
      params.push(supplier);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      params.push(location);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      params.push(description);
    }
    if (reorder_point !== undefined) {
      updates.push(`reorder_point = $${paramCount++}`);
      params.push(reorder_point);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE stock_items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Stock item updated successfully'
    });

  } catch (error) {
    console.error('Error updating stock item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete stock item
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'stock:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Check if item has movement history
    const movements = await query(`SELECT COUNT(*) FROM stock_movements WHERE stock_item_id = $1`, [id]);
    if (parseInt(movements.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Cannot delete item with movement history' }, { status: 400 });
    }

    const result = await query(`DELETE FROM stock_items WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Stock item deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting stock item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}