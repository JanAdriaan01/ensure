import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import { hasPermission } from '@/app/lib/permissions';

// GET - Fetch single stock item
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'stock:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    
    const result = await query(
      `SELECT s.*, 
        COALESCE(SUM(CASE WHEN sm.movement_type = 'IN' THEN sm.quantity ELSE 0 END), 0) as total_in,
        COALESCE(SUM(CASE WHEN sm.movement_type = 'OUT' THEN sm.quantity ELSE 0 END), 0) as total_out
      FROM stock_items s
      LEFT JOIN stock_movements sm ON s.id = sm.stock_item_id
      WHERE s.id = $1
      GROUP BY s.id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
    }
    
    // Get recent movements
    const movements = await query(
      `SELECT * FROM stock_movements 
       WHERE stock_item_id = $1 
       ORDER BY movement_date DESC 
       LIMIT 20`,
      [id]
    );
    
    return NextResponse.json({
      ...result.rows[0],
      movements: movements.rows
    });
  } catch (error) {
    console.error('Error fetching stock item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update stock item
export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'stock:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    const body = await request.json();
    const {
      item_name,
      description,
      category,
      unit_of_measure,
      unit_cost,
      selling_price,
      min_stock_level,
      max_stock_level,
      location,
    } = body;
    
    const result = await query(
      `UPDATE stock_items 
       SET item_name = COALESCE($1, item_name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           unit_of_measure = COALESCE($4, unit_of_measure),
           unit_cost = COALESCE($5, unit_cost),
           selling_price = COALESCE($6, selling_price),
           min_stock_level = COALESCE($7, min_stock_level),
           max_stock_level = COALESCE($8, max_stock_level),
           location = COALESCE($9, location),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        item_name, description, category, unit_of_measure,
        unit_cost, selling_price, min_stock_level, max_stock_level,
        location, id
      ]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating stock item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete stock item
export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'stock:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    
    // Check if item has movements
    const movements = await query(
      'SELECT COUNT(*) FROM stock_movements WHERE stock_item_id = $1',
      [id]
    );
    
    if (parseInt(movements.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete item with existing movements' },
        { status: 409 }
      );
    }
    
    await query('DELETE FROM stock_items WHERE id = $1', [id]);
    
    return NextResponse.json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}