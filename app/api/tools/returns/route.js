import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import { hasPermission } from '@/app/lib/permissions';

// POST - Return tool
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
    const { checkout_id, condition_on_return, notes } = body;
    
    if (!checkout_id) {
      return NextResponse.json(
        { error: 'Checkout ID is required' },
        { status: 400 }
      );
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Get checkout record
    const checkout = await query(
      'SELECT tool_id FROM tool_checkouts WHERE id = $1 AND status = $2',
      [checkout_id, 'checked_out']
    );
    
    if (checkout.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json(
        { error: 'Checkout record not found or already returned' },
        { status: 404 }
      );
    }
    
    const toolId = checkout.rows[0].tool_id;
    
    // Update checkout record
    const result = await query(
      `UPDATE tool_checkouts 
       SET actual_return_date = NOW(),
           condition_on_return = $1,
           status = 'returned',
           return_notes = $2,
           returned_by = $3
       WHERE id = $4
       RETURNING *`,
      [condition_on_return || null, notes || null, auth.userId, checkout_id]
    );
    
    // Update tool status
    await query(
      'UPDATE tools SET status = $1, updated_at = NOW() WHERE id = $2',
      ['available', toolId]
    );
    
    await query('COMMIT');
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error returning tool:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}