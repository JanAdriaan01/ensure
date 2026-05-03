export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// POST - Record Purchase Order and create job from quote
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    const body = await request.json();
    const { po_number, po_amount, po_date, po_document, notes } = body;
    
    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }
    
    // Validate required fields
    if (!po_number) {
      return NextResponse.json({ error: 'PO Number is required' }, { status: 400 });
    }
    if (!po_amount || po_amount <= 0) {
      return NextResponse.json({ error: 'Valid PO Amount is required' }, { status: 400 });
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Get the quote first
    const quoteResult = await query(`
      SELECT q.*, c.name as client_name 
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      WHERE q.id = $1
    `, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = quoteResult.rows[0];
    
    // Check if PO already received (prevent double submission)
    if (quote.po_received === true) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'PO already received for this quote. Cannot update.' }, { status: 400 });
    }
    
    // Check if quote is already converted to job
    if (quote.converted_to_job_id) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Quote has already been converted to a job' }, { status: 400 });
    }
    
    // Update quote with PO information
    await query(
      `UPDATE quotes 
       SET po_number = $1, 
           po_amount = $2, 
           po_date = $3, 
           po_document = $4,
           po_notes = $5,
           po_received = TRUE,
           status = 'po_received',
           updated_at = NOW()
       WHERE id = $6`,
      [po_number, po_amount, po_date || new Date().toISOString().split('T')[0], po_document || null, notes || null, quoteId]
    );
    
    // Generate job number
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
        lc_number, 
        client_id, 
        description,
        po_status, 
        completion_status, 
        po_amount,
        po_number,
        total_budget,
        quote_id, 
        total_quoted,
        created_by,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, 'approved', 'not_started', $4, $5, $4, $6, $7, $8, NOW(), NOW()) RETURNING id, lc_number`,
      [
        lcNumber, 
        quote.client_id, 
        `Job from quote: ${quote.quote_number} - ${quote.client_name || ''}`,
        po_amount, 
        po_number, 
        quoteId, 
        quote.total_amount || 0,
        auth.userId
      ]
    );
    
    const jobId = jobResult.rows[0].id;
    const jobNumber = jobResult.rows[0].lc_number;
    
    // Link job back to quote
    await query(
      `UPDATE quotes SET converted_to_job_id = $1, job_id = $1, status = 'converted', updated_at = NOW() WHERE id = $2`,
      [jobId, quoteId]
    );
    
    // Log in quote status history
    await query(
      `INSERT INTO quote_status_history (quote_id, status, notes, changed_by, created_at) 
       VALUES ($1, 'converted', $2, $3, NOW())`,
      [quoteId, `PO received and job ${jobNumber} created`, auth.userId]
    );
    
    // Get quote items
    const quoteItems = await query('SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY sort_order', [quoteId]);
    
    // Create job items from quote items
    for (const item of quoteItems.rows) {
      await query(
        `INSERT INTO job_items (
          job_id, 
          description, 
          quantity, 
          unit_price, 
          total_price,
          item_type, 
          status,
          created_at
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
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      job_id: jobId,
      job_number: jobNumber,
      message: 'PO recorded and job created successfully'
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error recording PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Fetch PO information for a quote
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
    
    const result = await query(
      `SELECT 
        po_number, 
        po_amount, 
        po_date, 
        po_document,
        po_notes,
        po_received, 
        job_id,
        converted_to_job_id,
        status
       FROM quotes 
       WHERE id = $1`,
      [quoteId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    // If job exists, get job details
    let job = null;
    if (result.rows[0].converted_to_job_id) {
      const jobResult = await query(
        `SELECT id, lc_number, completion_status, po_status, po_amount 
         FROM jobs 
         WHERE id = $1`,
        [result.rows[0].converted_to_job_id]
      );
      if (jobResult.rows.length > 0) {
        job = jobResult.rows[0];
      }
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      job: job
    });
    
  } catch (error) {
    console.error('Error fetching PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update PO information (if not yet converted)
export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    const body = await request.json();
    const { po_number, po_amount, po_date, po_document, notes } = body;
    
    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }
    
    // Check if quote has already been converted to job
    const quoteResult = await query(`SELECT converted_to_job_id, po_received FROM quotes WHERE id = $1`, [quoteId]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    if (quoteResult.rows[0].converted_to_job_id) {
      return NextResponse.json({ error: 'Cannot update PO - quote has already been converted to a job' }, { status: 400 });
    }
    
    // Update PO information
    const updateFields = [];
    const params = [];
    let paramCount = 1;
    
    if (po_number !== undefined) {
      updateFields.push(`po_number = $${paramCount++}`);
      params.push(po_number);
    }
    if (po_amount !== undefined) {
      updateFields.push(`po_amount = $${paramCount++}`);
      params.push(po_amount);
    }
    if (po_date !== undefined) {
      updateFields.push(`po_date = $${paramCount++}`);
      params.push(po_date);
    }
    if (po_document !== undefined) {
      updateFields.push(`po_document = $${paramCount++}`);
      params.push(po_document);
    }
    if (notes !== undefined) {
      updateFields.push(`po_notes = $${paramCount++}`);
      params.push(notes);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    updateFields.push(`updated_at = NOW()`);
    params.push(quoteId);
    
    const result = await query(
      `UPDATE quotes SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'PO information updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove PO (only if not yet converted)
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
    
    // Check if quote has already been converted to job
    const quoteResult = await query(`SELECT converted_to_job_id, po_received FROM quotes WHERE id = $1`, [quoteId]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    if (quoteResult.rows[0].converted_to_job_id) {
      return NextResponse.json({ error: 'Cannot delete PO - quote has already been converted to a job' }, { status: 400 });
    }
    
    // Clear PO information
    const result = await query(
      `UPDATE quotes 
       SET po_number = NULL, 
           po_amount = NULL, 
           po_date = NULL, 
           po_document = NULL,
           po_notes = NULL,
           po_received = FALSE,
           status = 'draft',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [quoteId]
    );
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'PO information removed successfully'
    });
    
  } catch (error) {
    console.error('Error deleting PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}