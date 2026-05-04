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
        c.client_name,
        (SELECT COUNT(*) FROM quote_items WHERE quote_id = q.id) as item_count
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
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const quantity = parseFloat(item.quantity) || 1;
      const unit_price = parseFloat(item.unit_price) || 0;
      const total_price = quantity * unit_price;
      const itemNumber = i + 1;
      
      await query(
        `INSERT INTO quote_items (
          quote_id, item_number, description, quantity, unit_price, total_price,
          item_type, notes, sort_order, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          quoteId, itemNumber, item.description, quantity, unit_price, total_price,
          item.item_type || 'service', item.notes || null, i + 1
        ]
      );
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows[0] 
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
    const { action, po_number, po_date, rejection_reason } = body;
    
    console.log('=== QUOTE UPDATE ===');
    console.log('Quote ID:', id);
    console.log('Action:', action);
    console.log('PO Number:', po_number);
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }
    
    // Get current quote
    const quoteResult = await query(`SELECT * FROM quotes WHERE id = $1`, [id]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = quoteResult.rows[0];
    const currentStatus = quote.status;
    const now = new Date();
    
    console.log('Current status:', currentStatus);
    
    // Define allowed transitions
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
        error: `Cannot ${action} a ${currentStatus} quote. Allowed actions: ${allowedTransitions[currentStatus]?.join(', ') || 'none'}` 
      }, { status: 400 });
    }
    
    await query('BEGIN');
    
    try {
      switch (action) {
        case 'send':
          console.log('Sending quote...');
          await query(
            `UPDATE quotes SET status = 'sent', sent_date = $1, updated_at = NOW() WHERE id = $2`,
            [now, id]
          );
          break;
          
        case 'mark_viewed':
          console.log('Marking as viewed...');
          await query(
            `UPDATE quotes SET status = 'pending', viewed_at = $1, updated_at = NOW() WHERE id = $2`,
            [now, id]
          );
          break;
          
        case 'approve':
          console.log('Approving quote...');
          await query(
            `UPDATE quotes SET status = 'approved', accepted_date = $1, updated_at = NOW() WHERE id = $2`,
            [now, id]
          );
          break;
          
        case 'receive_po':
          if (!po_number) {
            throw new Error('PO number is required');
          }
          
          console.log('=== RECEIVING PO - CREATING JOB ===');
          console.log('PO Number:', po_number);
          console.log('Quote ID:', id);
          console.log('Client ID:', quote.client_id);
          console.log('Quote Total:', quote.total_amount);
          
          // Step 1: Generate a simple job number
          const timestamp = Date.now();
          const jobNumber = `JOB-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`;
          console.log('Generated job number:', jobNumber);
          
          // Step 2: Create the job with minimal required fields
          const jobResult = await query(
            `INSERT INTO jobs (
              job_number, 
              client_id, 
              description, 
              po_status, 
              completion_status,
              po_number, 
              po_amount, 
              total_budget, 
              quote_id, 
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING id`,
            [
              jobNumber, 
              quote.client_id, 
              `Job from quote: ${quote.quote_number}`,
              'approved',
              'not_started',
              po_number, 
              quote.total_amount,
              quote.total_amount,
              id
            ]
          );
          
          const newJobId = jobResult.rows[0].id;
          console.log('✅ Job CREATED with ID:', newJobId);
          
          // Step 3: Update quote with PO info AND job_id
          await query(
            `UPDATE quotes SET 
              status = 'po_received', 
              po_number = $1, 
              po_date = $2,
              po_amount = $3,
              job_id = $4,
              updated_at = NOW()
            WHERE id = $5`,
            [po_number, po_date || now.toISOString().split('T')[0], quote.total_amount, newJobId, id]
          );
          console.log('✅ Quote updated with job_id:', newJobId);
          
          // Step 4: Copy quote items to job items (optional)
          const quoteItems = await query(
            `SELECT description, quantity, unit_price, total_price, item_type 
             FROM quote_items 
             WHERE quote_id = $1`, 
            [id]
          );
          
          if (quoteItems.rows.length > 0) {
            console.log(`Copying ${quoteItems.rows.length} items to job...`);
            for (const item of quoteItems.rows) {
              await query(
                `INSERT INTO job_items (
                  job_id, description, quantity, unit_price, total_price,
                  item_type, status, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())`,
                [newJobId, item.description, item.quantity, item.unit_price, 
                 item.total_price, item.item_type || 'service']
              );
            }
            console.log('✅ Items copied to job');
          }
          
          break;
          
        case 'reject':
          console.log('Rejecting quote...');
          await query(
            `UPDATE quotes SET status = 'rejected', rejected_date = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3`,
            [now, rejection_reason, id]
          );
          break;
      }
      
      await query('COMMIT');
      
      console.log('=== TRANSACTION COMPLETE ===');
      
      let message = `Quote ${action}ed successfully`;
      if (action === 'receive_po') {
        message = `✅ PO #${po_number} received! Job created successfully.`;
      }
      
      return NextResponse.json({ 
        success: true, 
        message
      });
      
    } catch (error) {
      await query('ROLLBACK');
      console.error('Transaction error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
  } catch (error) {
    console.error('PUT error:', error);
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