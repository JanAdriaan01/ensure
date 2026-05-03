// app/api/quotes/route.js
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
      items,
      notes
    } = body;
    
    if (!client_id && !client_name) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 });
    }
    
    const quote_number = await generateQuoteNumber();
    
    let finalClientName = client_name;
    if (client_id && !client_name) {
      const clientResult = await query('SELECT client_name FROM clients WHERE id = $1', [client_id]);
      if (clientResult.rows[0]) finalClientName = clientResult.rows[0].client_name;
    }
    
    await query('BEGIN');
    
    const result = await query(
      `INSERT INTO quotes (
        quote_number, client_id, client_name, site_name, contact_person,
        quote_prepared_by, scope_subject, quote_date, status, notes,
        subtotal, vat_rate, vat_amount, total_amount, currency,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft', $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        quote_number, client_id || null, finalClientName, site_name || null,
        contact_person || null, quote_prepared_by || null, scope_subject || null,
        quote_date || new Date().toISOString().split('T')[0], notes || null,
        subtotal || 0, vat_rate || 15, vat_amount || 0, total_amount || 0, 'ZAR'
      ]
    );
    
    const quoteId = result.rows[0].id;
    
    // Insert line items with proper calculations
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const quantity = parseFloat(item.quantity) || 1;
      const unit_price = parseFloat(item.unit_price) || 0;
      const total_price = quantity * unit_price;
      
      await query(
        `INSERT INTO quote_items (
          quote_id, description, quantity, unit_price, total_price,
          item_type, notes, sort_order, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          quoteId, 
          item.description, 
          quantity, 
          unit_price, 
          total_price, 
          item.item_type || 'service',
          item.notes || null, 
          i + 1
        ]
      );
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update quote status (workflow: draft → sent → pending → approved → po_received)
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { action, po_number, po_date, rejection_reason } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }
    
    const quoteResult = await query(`SELECT * FROM quotes WHERE id = $1`, [id]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = quoteResult.rows[0];
    const currentStatus = quote.status;
    const now = new Date();
    
    // Validate state transitions
    const allowedTransitions = {
      'draft': ['send'],
      'sent': ['mark_viewed', 'reject'],
      'pending': ['approve', 'reject'],
      'approved': ['receive_po', 'reject'],
      'po_received': [],
      'rejected': []
    };
    
    if (!allowedTransitions[currentStatus]?.includes(action)) {
      return NextResponse.json({ 
        error: `Cannot ${action} a ${currentStatus} quote. Allowed: ${allowedTransitions[currentStatus]?.join(', ') || 'none'}` 
      }, { status: 400 });
    }
    
    await query('BEGIN');
    
    switch (action) {
      case 'send':
        await query(
          `UPDATE quotes SET status = 'sent', sent_date = $1, updated_at = NOW() WHERE id = $2`,
          [now, id]
        );
        break;
        
      case 'mark_viewed':
        await query(
          `UPDATE quotes SET status = 'pending', viewed_at = $1, updated_at = NOW() WHERE id = $2`,
          [now, id]
        );
        break;
        
      case 'approve':
        await query(
          `UPDATE quotes SET status = 'approved', accepted_date = $1, updated_at = NOW() WHERE id = $2`,
          [now, id]
        );
        break;
        
      case 'receive_po':
        if (!po_number) {
          await query('ROLLBACK');
          return NextResponse.json({ error: 'PO number is required' }, { status: 400 });
        }
        
        // Update quote with PO info and change status
        await query(
          `UPDATE quotes SET 
            status = 'po_received', 
            po_number = $1, 
            po_date = $2,
            po_amount = $3,
            updated_at = NOW()
          WHERE id = $4`,
          [po_number, po_date || now.toISOString().split('T')[0], quote.total_amount, id]
        );
        
        // Check if job already exists for this quote
        if (!quote.job_id) {
          // Create job ONLY when PO is received
          const year = new Date().getFullYear();
          const jobCountResult = await query(
            `SELECT COUNT(*) as count FROM jobs WHERE EXTRACT(YEAR FROM created_at) = $1`,
            [year]
          );
          const jobCount = parseInt(jobCountResult.rows[0].count) + 1;
          const lcNumber = `LC-${year}-${String(jobCount).padStart(4, '0')}`;
          
          // Create the job
          const jobResult = await query(
            `INSERT INTO jobs (
              lc_number, client_id, description, po_status, completion_status,
              po_number, po_amount, total_budget, quote_id, created_by, created_at, updated_at
            ) VALUES ($1, $2, $3, 'approved', 'not_started', $4, $5, $5, $6, $7, NOW(), NOW())
            RETURNING id, lc_number`,
            [lcNumber, quote.client_id, `Job from quote: ${quote.quote_number}`, po_number, quote.total_amount, id, auth.userId]
          );
          
          const jobId = jobResult.rows[0].id;
          
          // Update quote with job reference
          await query(`UPDATE quotes SET job_id = $1, updated_at = NOW() WHERE id = $2`, [jobId, id]);
          
          // Copy quote items to job items
          const quoteItems = await query(
            `SELECT description, quantity, unit_price, total_price, item_type 
             FROM quote_items 
             WHERE quote_id = $1 
             ORDER BY sort_order`, 
            [id]
          );
          
          for (const item of quoteItems.rows) {
            await query(
              `INSERT INTO job_items (
                job_id, description, quantity, unit_price, total_price,
                item_type, status, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())`,
              [jobId, item.description, item.quantity, item.unit_price, item.total_price, item.item_type || 'service']
            );
          }
        }
        break;
        
      case 'reject':
        await query(
          `UPDATE quotes SET status = 'rejected', rejected_date = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3`,
          [now, rejection_reason, id]
        );
        break;
        
      default:
        await query('ROLLBACK');
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    await query('COMMIT');
    
    const message = action === 'receive_po' 
      ? 'PO received and job created successfully' 
      : `Quote ${action}ed successfully`;
    
    return NextResponse.json({ 
      success: true, 
      message 
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete draft quote only
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
    
    const quoteResult = await query(`SELECT status FROM quotes WHERE id = $1`, [id]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    if (quoteResult.rows[0].status !== 'draft') {
      return NextResponse.json({ error: 'Only draft quotes can be deleted' }, { status: 400 });
    }
    
    await query('BEGIN');
    await query(`DELETE FROM quote_items WHERE quote_id = $1`, [id]);
    await query(`DELETE FROM quotes WHERE id = $1`, [id]);
    await query('COMMIT');
    
    return NextResponse.json({ success: true, message: 'Quote deleted successfully' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}