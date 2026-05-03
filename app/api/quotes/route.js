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

// GET - Fetch all quotes
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const client_id = searchParams.get('client_id');

    let sql = `
      SELECT 
        q.*,
        c.client_name
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
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

    sql += ` ORDER BY q.created_at DESC`;

    const result = await query(sql, params);
    
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('GET /api/quotes error:', error);
    return NextResponse.json([]);
  }
}

// POST - Create new quote
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
      notes
    } = body;
    
    // Validate required fields
    if (!client_id && !client_name) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }
    
    // Generate quote number
    const quote_number = await generateQuoteNumber();
    
    // Get client name if only client_id provided
    let finalClientName = client_name;
    if (client_id && !client_name) {
      const clientResult = await query('SELECT client_name FROM clients WHERE id = $1', [client_id]);
      if (clientResult.rows[0]) finalClientName = clientResult.rows[0].client_name;
    }
    
    // Insert quote - use 'draft' as default status
    const result = await query(
      `INSERT INTO quotes (
        quote_number, client_id, client_name, site_name, contact_person,
        quote_prepared_by, scope_subject, quote_date, status, notes,
        subtotal, vat_rate, vat_amount, total_amount, currency,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING *`,
      [
        quote_number,
        client_id || null,
        finalClientName,
        site_name || null,
        contact_person || null,
        quote_prepared_by || null,
        scope_subject || null,
        quote_date || new Date().toISOString().split('T')[0],
        'draft',
        notes || null,
        subtotal || 0,
        vat_rate || 15,
        vat_amount || 0,
        total_amount || 0,
        'ZAR'
      ]
    );
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows[0] 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update quote (status, send, etc.)
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { action, rejection_reason } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }
    
    // Get current quote
    const quoteResult = await query(`SELECT * FROM quotes WHERE id = $1`, [id]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }
    
    let newStatus = quoteResult.rows[0].status;
    const now = new Date();
    let updateFields = {};
    
    switch (action) {
      case 'send':
        newStatus = 'sent';
        updateFields = { status: newStatus, sent_date: now, updated_at: now };
        break;
      case 'mark_viewed':
        newStatus = 'pending';  // After viewing, it becomes pending
        updateFields = { status: newStatus, viewed_at: now, updated_at: now };
        break;
      case 'approve':
        newStatus = 'approved';
        updateFields = { status: newStatus, accepted_date: now, updated_at: now };
        break;
      case 'receive_po':
        newStatus = 'po_received';
        updateFields = { status: newStatus, updated_at: now };
        break;
      case 'reject':
        newStatus = 'rejected';
        updateFields = { status: newStatus, rejected_date: now, rejection_reason: rejection_reason, updated_at: now };
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
    
    // Build the update query dynamically
    const setClause = Object.keys(updateFields).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = Object.values(updateFields);
    values.push(id);
    
    const result = await query(
      `UPDATE quotes SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: `Quote ${action}ed successfully`
    });
    
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete quote (only draft status)
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
    
    await query(`DELETE FROM quotes WHERE id = $1`, [id]);
    
    return NextResponse.json({ success: true, message: 'Quote deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}