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
        c.client_name,
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
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'po_received' THEN 1 END) as po_received,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COALESCE(SUM(total_amount), 0) as total_value,
        COALESCE(SUM(CASE WHEN status IN ('approved', 'po_received') THEN total_amount ELSE 0 END), 0) as approved_value
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

// POST - Create new quote with line items and auto-create job if approved
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
    
    // Insert quote
    const quoteResult = await query(
      `INSERT INTO quotes (
        quote_number, client_id, client_name, site_name, contact_person,
        quote_prepared_by, scope_subject, quote_date, status, notes,
        subtotal, vat_rate, vat_amount, total_amount, currency,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
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
    
    let jobId = null;
    let jobNumber = null;
    
    // If status is 'approved', auto-create job
    if (status === 'approved') {
      // Generate job number
      const year = new Date().getFullYear();
      const jobCountResult = await query(
        `SELECT COUNT(*) as count FROM jobs WHERE EXTRACT(YEAR FROM created_at) = $1`,
        [year]
      );
      const jobCount = parseInt(jobCountResult.rows[0].count) + 1;
      const lcNumber = `LC-${year}-${String(jobCount).padStart(4, '0')}`;
      
      // Create job
      const jobResult = await query(
        `INSERT INTO jobs (
          lc_number, client_id, description, po_status, completion_status,
          total_budget, quote_id, created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, 'pending', 'not_started', $4, $5, $6, NOW(), NOW())
        RETURNING id, lc_number`,
        [lcNumber, client_id || null, `Job from quote: ${finalQuoteNumber}`, total_amount, quoteId, auth.userId]
      );
      
      jobId = jobResult.rows[0].id;
      jobNumber = jobResult.rows[0].lc_number;
      
      // Update quote with job reference
      await query(
        `UPDATE quotes SET job_id = $1, updated_at = NOW() WHERE id = $2`,
        [jobId, quoteId]
      );
      
      // Create job items from quote items
      for (const item of items) {
        await query(
          `INSERT INTO job_items (
            job_id, description, quantity, unit_price, total_price,
            item_type, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())`,
          [
            jobId,
            item.description,
            item.quantity || 1,
            item.unit_price || 0,
            (item.quantity || 1) * (item.unit_price || 0),
            item.item_type || 'service'
          ]
        );
      }
    }
    
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      data: {
        ...quoteResult.rows[0],
        job_id: jobId,
        job_number: jobNumber
      }
    }, { status: 201 });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update quote status (send, mark as viewed, accept, reject)
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { action, rejection_reason, po_number, po_date } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }
    
    // Get current quote
    const quoteResult = await query(`SELECT * FROM quotes WHERE id = $1`, [id]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = quoteResult.rows[0];
    let newStatus = quote.status;
    const now = new Date();
    
    // Start transaction for complex operations
    await query('BEGIN');
    
    switch (action) {
      case 'send':
        newStatus = 'sent';
        await query(
          `UPDATE quotes SET status = $1, sent_date = $2, updated_at = NOW() WHERE id = $3`,
          [newStatus, now, id]
        );
        break;
        
      case 'mark_viewed':
        newStatus = 'pending';
        await query(
          `UPDATE quotes SET status = $1, viewed_at = $2, updated_at = NOW() WHERE id = $3`,
          [newStatus, now, id]
        );
        break;
        
      case 'approve':
        newStatus = 'approved';
        await query(
          `UPDATE quotes SET status = $1, accepted_date = $2, updated_at = NOW() WHERE id = $3`,
          [newStatus, now, id]
        );
        
        // Also create job if not exists
        if (!quote.job_id) {
          // Generate job number
          const year = new Date().getFullYear();
          const jobCountResult = await query(
            `SELECT COUNT(*) as count FROM jobs WHERE EXTRACT(YEAR FROM created_at) = $1`,
            [year]
          );
          const jobCount = parseInt(jobCountResult.rows[0].count) + 1;
          const lcNumber = `LC-${year}-${String(jobCount).padStart(4, '0')}`;
          
          // Create job
          const jobResult = await query(
            `INSERT INTO jobs (
              lc_number, client_id, description, po_status, completion_status,
              total_budget, quote_id, created_by, created_at, updated_at
            ) VALUES ($1, $2, $3, 'pending', 'not_started', $4, $5, $6, NOW(), NOW())
            RETURNING id, lc_number`,
            [lcNumber, quote.client_id, `Job from quote: ${quote.quote_number}`, quote.total_amount, id, auth.userId]
          );
          
          const jobId = jobResult.rows[0].id;
          
          // Update quote with job reference
          await query(`UPDATE quotes SET job_id = $1 WHERE id = $2`, [jobId, id]);
          
          // Get quote items
          const quoteItems = await query(`SELECT * FROM quote_items WHERE quote_id = $1`, [id]);
          
          // Create job items
          for (const item of quoteItems.rows) {
            await query(
              `INSERT INTO job_items (
                job_id, description, quantity, unit_price, total_price,
                item_type, status, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())`,
              [jobId, item.description, item.quantity, item.unit_price, item.total_price, item.item_type || 'service']
            );
          }
        }
        break;
        
      case 'receive_po':
        if (!po_number) {
          await query('ROLLBACK');
          return NextResponse.json({ error: 'PO number is required' }, { status: 400 });
        }
        newStatus = 'po_received';
        await query(
          `UPDATE quotes SET 
            status = $1, 
            po_number = $2, 
            po_date = $3, 
            po_amount = $4,
            updated_at = NOW() 
          WHERE id = $5`,
          [newStatus, po_number, po_date || now.toISOString().split('T')[0], quote.total_amount, id]
        );
        
        // Also update the associated job if exists
        if (quote.job_id) {
          await query(
            `UPDATE jobs SET 
              po_number = $1, 
              po_amount = $2, 
              po_received_date = $3, 
              po_status = 'approved',
              updated_at = NOW()
            WHERE id = $4`,
            [po_number, quote.total_amount, po_date || now.toISOString().split('T')[0], quote.job_id]
          );
        }
        break;
        
      case 'reject':
        newStatus = 'rejected';
        await query(
          `UPDATE quotes SET status = $1, rejected_date = $2, rejection_reason = $3, updated_at = NOW() WHERE id = $4`,
          [newStatus, now, rejection_reason, id]
        );
        break;
        
      default:
        await query('ROLLBACK');
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
    
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      data: { id, status: newStatus },
      message: `Quote ${action === 'receive_po' ? 'PO received and ' : ''}${newStatus}`
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete draft or pending quote
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
    
    // Check if quote can be deleted
    const quoteResult = await query(`SELECT status FROM quotes WHERE id = $1`, [id]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }
    
    const status = quoteResult.rows[0].status;
    if (status !== 'draft' && status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Only draft or pending quotes can be deleted' }, { status: 400 });
    }
    
    // Delete quote items
    await query(`DELETE FROM quote_items WHERE quote_id = $1`, [id]);
    await query(`DELETE FROM quotes WHERE id = $1`, [id]);
    
    return NextResponse.json({ success: true, message: 'Quote deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}