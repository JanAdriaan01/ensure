import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch stock movements
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
    const stockItemId = searchParams.get('stockItemId');
    const movementType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let sqlQuery = `
      SELECT sm.*, s.item_code, s.item_name, s.unit_of_measure
      FROM stock_movements sm
      JOIN stock_items s ON sm.stock_item_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (stockItemId) {
      sqlQuery += ` AND sm.stock_item_id = $${paramIndex++}`;
      params.push(stockItemId);
    }
    
    if (movementType) {
      sqlQuery += ` AND sm.movement_type = $${paramIndex++}`;
      params.push(movementType);
    }
    
    if (startDate) {
      sqlQuery += ` AND sm.movement_date >= $${paramIndex++}`;
      params.push(startDate);
    }
    
    if (endDate) {
      sqlQuery += ` AND sm.movement_date <= $${paramIndex++}`;
      params.push(endDate);
    }
    
    sqlQuery += ` ORDER BY sm.movement_date DESC LIMIT 100`;
    
    const result = await query(sqlQuery, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Record stock movement (IN/OUT/ADJUST)
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'stock:adjust')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      stock_item_id,
      movement_type,
      quantity,
      reference_number,
      notes,
      job_id,
      client_id,
    } = body;
    
    // Validate required fields
    if (!stock_item_id || !movement_type || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Stock item, movement type, and positive quantity are required' },
        { status: 400 }
      );
    }
    
    if (!['IN', 'OUT', 'ADJUST'].includes(movement_type)) {
      return NextResponse.json(
        { error: 'Invalid movement type. Must be IN, OUT, or ADJUST' },
        { status: 400 }
      );
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Get current stock quantity
    const stockItem = await query(
      'SELECT quantity_on_hand FROM stock_items WHERE id = $1',
      [stock_item_id]
    );
    
    if (stockItem.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Stock item not found' }, { status: 404 });
    }
    
    let newQuantity = stockItem.rows[0].quantity_on_hand;
    
    if (movement_type === 'IN') {
      newQuantity += quantity;
    } else if (movement_type === 'OUT') {
      if (newQuantity < quantity) {
        await query('ROLLBACK');
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        );
      }
      newQuantity -= quantity;
    } else if (movement_type === 'ADJUST') {
      newQuantity = quantity;
    }
    
    // Update stock quantity
    await query(
      'UPDATE stock_items SET quantity_on_hand = $1, updated_at = NOW() WHERE id = $2',
      [newQuantity, stock_item_id]
    );
    
    // Record movement
    const result = await query(
      `INSERT INTO stock_movements (
        stock_item_id, movement_type, quantity, reference_number, notes,
        job_id, client_id, movement_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
      RETURNING *`,
      [
        stock_item_id, movement_type, quantity, reference_number || null,
        notes || null, job_id || null, client_id || null, auth.userId
      ]
    );
    
    await query('COMMIT');
    
    return NextResponse.json({
      movement: result.rows[0],
      new_quantity: newQuantity,
    }, { status: 201 });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error recording stock movement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}