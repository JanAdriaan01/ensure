export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Helper function to generate quote number
async function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const result = await query(
    `SELECT COUNT(*) as count FROM quotes WHERE EXTRACT(YEAR FROM created_at) = $1`,
    [year]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `Q-${year}-${String(count).padStart(4, '0')}`;
}

// GET - Fetch all quotes with filters
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const client_id = searchParams.get('client_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = `
      SELECT 
        q.*,
        c.client_name as client_name,
        j.lc_number as job_lc_number,
        j.id as job_id,
        (SELECT COUNT(*) FROM quote_items WHERE quote_id = q.id) as item_count
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN jobs j ON q.job_id = j.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND q.status = $${paramCount++}`;
      params.push(status);
    }

    if (client_id) {
      sql += ` AND q.client_id = $${paramCount++}`;
      params.push(parseInt(client_id));
    }

    sql += ` ORDER BY q.created_at DESC LIMIT $${paramCount++}`;
    params.push(limit);

    const result = await query(sql, params);
    const quotes = result.rows;

    // Get statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_quotes,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'viewed' THEN 1 END) as viewed,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted,
        COALESCE(SUM(total_amount), 0) as total_value,
        COALESCE(SUM(CASE WHEN status IN ('accepted', 'converted') THEN total_amount ELSE 0 END), 0) as accepted_value
      FROM quotes
    `);

    return NextResponse.json({
      success: true,
      data: quotes,
      stats: statsResult.rows[0],
      total: quotes.length
    });

  } catch (error) {
    console.error('GET /api/quotes error:', error);
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

// POST - Create new quote with line items
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      client_id,
      client_name,
      site_name,
      contact_person,
      quote_prepared_by,
      scope_subject,
      quote_date,
      subtotal,
      vat_rate,
      vat_amount,
      total_amount,
      items,
      status = 'draft',
      notes
    } = body;
    
    // Validate required fields
    if (!client_id && !client_name) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 });
    }
    
    // Generate quote number
    const finalQuoteNumber = await generateQuoteNumber();
    
    // Get client name if client_id provided
    let finalClientName = client_name;
    if (client_id && !client_name) {
      const clientResult = await query('SELECT client_name FROM clients WHERE id = $1', [client_id]);
      if (clientResult.rows[0]) finalClientName = clientResult.rows[0].client_name;
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Insert quote - using only columns that exist in your table
    const quoteResult = await query(
      `INSERT INTO quotes (
        quote_number, client_id, client_name, site_name, contact_person,
        quote_prepared_by, scope_subject, quote_date, status, notes,
        subtotal, vat_rate, vat_amount, total_amount, currency,
        created_at, updated_at, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW(), 1)
      RETURNING *`,
      [
        finalQuoteNumber,
        client_id || null,
        finalClientName,
        site_name || null,
        contact_person || null,
        quote_prepared_by || null,
        scope_subject || null,
        quote_date || new Date().toISOString().split('T')[0],
        status,
        notes || null,
        subtotal || 0,
        vat_rate || 15,
        vat_amount || 0,
        total_amount || 0,
        'ZAR'
      ]
    );
    
    const quoteId = quoteResult.rows[0].id;
    
    // Insert line items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await query(
        `INSERT INTO quote_items (
          quote_id, description, quantity, unit_price, total_price,
          item_type, notes, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          quoteId,
          item.description,
          item.quantity || 1,
          item.unit_price || 0,
          (item.quantity || 1) * (item.unit_price || 0),
          item.item_type || 'service',
          item.notes || null,
          i + 1
        ]
      );
    }
    
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      data: quoteResult.rows[0]
    }, { status: 201 });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update quote status
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { status } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }
    
    // Get current quote
    const quoteResult = await query(`SELECT * FROM quotes WHERE id = $1`, [id]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }
    
    // Update quote status
    const updateResult = await query(
      `UPDATE quotes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    return NextResponse.json({
      success: true,
      data: updateResult.rows[0],
      message: `Quote status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete draft quote (only draft status)
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }
    
    // Check if quote is draft
    const quoteResult = await query(`SELECT status FROM quotes WHERE id = $1`, [id]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }
    
    if (quoteResult.rows[0].status !== 'draft') {
      return NextResponse.json({ success: false, error: 'Only draft quotes can be deleted' }, { status: 400 });
    }
    
    // Delete quote items first
    await query(`DELETE FROM quote_items WHERE quote_id = $1`, [id]);
    await query(`DELETE FROM quotes WHERE id = $1`, [id]);
    
    return NextResponse.json({ success: true, message: 'Quote deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}