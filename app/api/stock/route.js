import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all stock items
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'stock:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search');
    
    let sqlQuery = `
      SELECT 
        s.*,
        COALESCE(SUM(sm.quantity), 0) as total_in,
        COALESCE(SUM(CASE WHEN sm.movement_type = 'OUT' THEN sm.quantity ELSE 0 END), 0) as total_out
      FROM stock_items s
      LEFT JOIN stock_movements sm ON s.id = sm.stock_item_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      sqlQuery += ` AND s.category = $${paramIndex++}`;
      params.push(category);
    }
    
    if (lowStock) {
      sqlQuery += ` AND s.quantity_on_hand < s.min_stock_level`;
    }
    
    if (search) {
      sqlQuery += ` AND (s.item_code ILIKE $${paramIndex++} OR s.item_name ILIKE $${paramIndex++})`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sqlQuery += ` GROUP BY s.id ORDER BY s.item_name`;
    
    const result = await query(sqlQuery, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      item_code,
      item_name,
      description,
      category,
      quantity_on_hand = 0,
      unit_of_measure = 'each',
      unit_cost,
      selling_price,
      min_stock_level = 5,
      max_stock_level,
      location,
    } = body;
    
    // Validate required fields
    if (!item_code || !item_name) {
      return NextResponse.json(
        { error: 'Item code and name are required' },
        { status: 400 }
      );
    }
    
    // Check if item code already exists
    const existing = await query(
      'SELECT id FROM stock_items WHERE item_code = $1',
      [item_code]
    );
    
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Item code already exists' },
        { status: 409 }
      );
    }
    
    const result = await query(
      `INSERT INTO stock_items (
        item_code, item_name, description, category, quantity_on_hand,
        unit_of_measure, unit_cost, selling_price, min_stock_level,
        max_stock_level, location, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING *`,
      [
        item_code, item_name, description || null, category || null,
        quantity_on_hand, unit_of_measure, unit_cost || 0, selling_price || 0,
        min_stock_level, max_stock_level || null, location || null
      ]
    );
    
    // Log initial stock movement if quantity > 0
    if (quantity_on_hand > 0) {
      await query(
        `INSERT INTO stock_movements (
          stock_item_id, movement_type, quantity, reference_number, notes, movement_date, created_by
        ) VALUES ($1, 'IN', $2, 'INITIAL', 'Initial stock setup', NOW(), $3)`,
        [result.rows[0].id, quantity_on_hand, auth.userId]
      );
    }
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating stock item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}