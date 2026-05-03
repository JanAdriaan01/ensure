export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch single quote with items, history, and related data
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
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        c.address as client_address,
        u.name as created_by_name,
        (SELECT COUNT(*) FROM quote_items WHERE quote_id = q.id) as item_count
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = $1
    `, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = quoteResult.rows[0];
    
    // Get quote items
    const itemsResult = await query(`
      SELECT * FROM quote_items 
      WHERE quote_id = $1 
      ORDER BY sort_order, id
    `, [quoteId]);
    
    // Get status history
    const historyResult = await query(`
      SELECT qsh.*, u.name as changed_by_name
      FROM quote_status_history qsh
      LEFT JOIN users u ON qsh.changed_by = u.id
      WHERE qsh.quote_id = $1
      ORDER BY qsh.created_at DESC
    `, [quoteId]);
    
    // Get view tracking
    const viewsResult = await query(`
      SELECT viewed_at, ip_address
      FROM quote_views
      WHERE quote_id = $1
      ORDER BY viewed_at DESC
    `, [quoteId]);
    
    // Get related job if exists
    let job = null;
    if (quote.converted_to_job_id) {
      const jobResult = await query(`
        SELECT id, lc_number, completion_status, po_status
        FROM jobs WHERE id = $1
      `, [quote.converted_to_job_id]);
      if (jobResult.rows.length > 0) {
        job = jobResult.rows[0];
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...quote,
        items: itemsResult.rows,
        history: historyResult.rows,
        views: viewsResult.rows,
        job: job
      }
    });
    
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update quote (full update, status changes, etc.)
export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    const body = await request.json();
    
    const { 
      client_name, 
      site_name, 
      contact_person, 
      quote_date, 
      valid_until,
      quote_prepared_by, 
      scope_subject, 
      terms_text,
      notes,
      subtotal,
      vat_amount,
      total_amount,
      items,
      status
    } = body;
    
    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }
    
    // Check if quote exists and is not already converted
    const existingQuote = await query(`SELECT status, converted_to_job_id FROM quotes WHERE id = $1`, [quoteId]);
    if (existingQuote.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    if (existingQuote.rows[0].converted_to_job_id) {
      return NextResponse.json({ error: 'Cannot modify a converted quote' }, { status: 400 });
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Update quote
    const updateResult = await query(
      `UPDATE quotes SET
        client_name = COALESCE($1, client_name),
        site_name = COALESCE($2, site_name),
        contact_person = COALESCE($3, contact_person),
        quote_date = COALESCE($4, quote_date),
        valid_until = COALESCE($5, valid_until),
        quote_prepared_by = COALESCE($6, quote_prepared_by),
        scope_subject = COALESCE($7, scope_subject),
        terms_text = COALESCE($8, terms_text),
        notes = COALESCE($9, notes),
        subtotal = COALESCE($10, subtotal),
        vat_amount = COALESCE($11, vat_amount),
        total_amount = COALESCE($12, total_amount),
        status = COALESCE($13, status),
        updated_at = NOW(),
        version = version + 1
      WHERE id = $14
      RETURNING *`,
      [
        client_name, site_name, contact_person, quote_date, valid_until,
        quote_prepared_by, scope_subject, terms_text, notes,
        subtotal, vat_amount, total_amount, status, quoteId
      ]
    );
    
    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await query(`DELETE FROM quote_items WHERE quote_id = $1`, [quoteId]);
      
      // Insert new items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await query(
          `INSERT INTO quote_items (
            quote_id, description, quantity, unit_price, total_price,
            item_type, stock_item_id, notes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            quoteId,
            item.description,
            item.quantity || 1,
            item.unit_price || 0,
            (item.quantity || 1) * (item.unit_price || 0),
            item.item_type || 'service',
            item.stock_item_id || null,
            item.notes || null,
            i + 1
          ]
        );
      }
    }
    
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      data: updateResult.rows[0],
      message: 'Quote updated successfully'
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH - Partial update (status changes, etc.)
export async function PATCH(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    const body = await request.json();
    const { action, rejection_reason } = body;
    
    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }
    
    // Get current quote
    const quoteResult = await query(`
      SELECT q.*, c.name as client_name 
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      WHERE q.id = $1
    `, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = quoteResult.rows[0];
    let newStatus = quote.status;
    const now = new Date();
    let jobCreated = false;
    let jobId = null;
    let jobNumber = null;
    
    // Start transaction
    await query('BEGIN');
    
    switch (action) {
      case 'send':
        newStatus = 'sent';
        await query(
          `UPDATE quotes SET status = $1, sent_date = $2, updated_at = NOW() WHERE id = $3`,
          [newStatus, now, quoteId]
        );
        break;
        
      case 'mark_viewed':
        newStatus = 'viewed';
        await query(
          `UPDATE quotes SET status = $1, viewed_at = $2, updated_at = NOW() WHERE id = $3`,
          [newStatus, now, quoteId]
        );
        break;
        
      case 'accept':
        newStatus = 'accepted';
        await query(
          `UPDATE quotes SET status = $1, accepted_date = $2, updated_at = NOW() WHERE id = $3`,
          [newStatus, now, quoteId]
        );
        break;
        
      case 'reject':
        newStatus = 'rejected';
        await query(
          `UPDATE quotes SET status = $1, rejected_date = $2, rejection_reason = $3, updated_at = NOW() WHERE id = $4`,
          [newStatus, now, rejection_reason, quoteId]
        );
        break;
        
      case 'convert':
        if (quote.status !== 'accepted') {
          await query('ROLLBACK');
          return NextResponse.json({ error: 'Only accepted quotes can be converted to jobs' }, { status: 400 });
        }
        
        if (quote.converted_to_job_id) {
          await query('ROLLBACK');
          return NextResponse.json({ error: 'Quote has already been converted to a job' }, { status: 400 });
        }
        
        // Get quote items
        const itemsResult = await query(`SELECT * FROM quote_items WHERE quote_id = $1`, [quoteId]);
        
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
            po_amount, total_budget, quote_id, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, 'approved', 'not_started', $4, $4, $5, $6, NOW(), NOW())
          RETURNING id, lc_number`,
          [lcNumber, quote.client_id, `Job from quote: ${quote.quote_number}`, quote.total_amount, quoteId, auth.userId]
        );
        
        jobId = jobResult.rows[0].id;
        jobNumber = jobResult.rows[0].lc_number;
        jobCreated = true;
        
        // Update quote with job reference
        await query(
          `UPDATE quotes SET converted_to_job_id = $1, status = 'converted', updated_at = NOW() WHERE id = $2`,
          [jobId, quoteId]
        );
        
        // Create job items from quote items
        for (const item of itemsResult.rows) {
          await query(
            `INSERT INTO job_items (
              job_id, description, quantity, unit_price, total_price,
              item_type, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())`,
            [
              jobId,
              item.description,
              item.quantity,
              item.unit_price,
              item.total_price,
              item.item_type || 'service'
            ]
          );
        }
        break;
        
      default:
        await query('ROLLBACK');
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Log status change
    await query(
      `INSERT INTO quote_status_history (quote_id, status, notes, changed_by, created_at) 
       VALUES ($1, $2, $3, $4, NOW())`,
      [quoteId, newStatus, rejection_reason || (action === 'convert' ? `Converted to job: ${jobNumber}` : null), auth.userId]
    );
    
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      status: newStatus,
      job_id: jobId,
      job_number: jobNumber,
      job_created: jobCreated,
      message: jobCreated ? `Job ${jobNumber} created successfully` : `Quote ${action}ed successfully`
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating quote status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete quote (only draft status)
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
    
    // Check if quote exists and is draft
    const quoteResult = await query(`SELECT status, converted_to_job_id FROM quotes WHERE id = $1`, [quoteId]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    if (quoteResult.rows[0].status !== 'draft') {
      return NextResponse.json({ error: 'Only draft quotes can be deleted' }, { status: 400 });
    }
    
    if (quoteResult.rows[0].converted_to_job_id) {
      return NextResponse.json({ error: 'Cannot delete a quote that has been converted to a job' }, { status: 400 });
    }
    
    // Delete quote items first (cascade should handle, but explicit for safety)
    await query(`DELETE FROM quote_items WHERE quote_id = $1`, [quoteId]);
    await query(`DELETE FROM quote_status_history WHERE quote_id = $1`, [quoteId]);
    await query(`DELETE FROM quote_views WHERE quote_id = $1`, [quoteId]);
    await query(`DELETE FROM quotes WHERE id = $1`, [quoteId]);
    
    return NextResponse.json({ success: true, message: 'Quote deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}