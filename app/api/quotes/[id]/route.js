export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch single quote
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    
    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }
    
    // Get quote details
    const quoteResult = await query(`
      SELECT 
        q.*,
        c.client_name
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      WHERE q.id = $1
    `, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = quoteResult.rows[0];
    
    // Get quote items if quote_items table exists
    let items = [];
    try {
      const itemsResult = await query(`
        SELECT * FROM quote_items 
        WHERE quote_id = $1 
        ORDER BY sort_order, id
      `, [quoteId]);
      items = itemsResult.rows;
    } catch (err) {
      console.log('Quote items table not found');
    }
    
    return NextResponse.json({
      ...quote,
      items: items
    });
    
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update quote status
export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    const body = await request.json();
    const { status } = body;
    
    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }
    
    // Check if quote exists
    const existingQuote = await query(`SELECT status FROM quotes WHERE id = $1`, [quoteId]);
    if (existingQuote.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    // Update quote status
    const result = await query(
      `UPDATE quotes SET status = $1 WHERE id = $2 RETURNING *`,
      [status, quoteId]
    );
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: `Quote status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete quote (only draft or pending status)
export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    
    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }
    
    // Check if quote exists and can be deleted
    const quoteResult = await query(`SELECT status FROM quotes WHERE id = $1`, [quoteId]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const status = quoteResult.rows[0].status;
    if (status !== 'draft' && status !== 'pending') {
      return NextResponse.json({ error: 'Only draft or pending quotes can be deleted' }, { status: 400 });
    }
    
    // Delete quote items if table exists
    try {
      await query(`DELETE FROM quote_items WHERE quote_id = $1`, [quoteId]);
    } catch (err) {
      // Table doesn't exist, ignore
    }
    
    await query(`DELETE FROM quotes WHERE id = $1`, [quoteId]);
    
    return NextResponse.json({ success: true, message: 'Quote deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}