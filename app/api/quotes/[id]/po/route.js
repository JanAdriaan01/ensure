import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { po_number, po_amount, po_date, po_document } = await request.json();
    
    // Validate required fields
    if (!po_number || !po_amount) {
      return NextResponse.json({ error: 'PO Number and Amount are required' }, { status: 400 });
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Get the quote first
    const quoteResult = await query('SELECT * FROM quotes WHERE id = $1', [id]);
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
    
    // Update quote with PO information - this LOCKS the quote
    await query(
      `UPDATE quotes 
       SET po_number = $1, 
           po_amount = $2, 
           po_date = $3, 
           po_document = $4, 
           po_received = TRUE,
           status = 'po_received'
       WHERE id = $5`,
      [po_number, po_amount, po_date, po_document, id]
    );
    
    // Create the job
    const lcNumber = `JOB-${quote.quote_number}`;
    
    const jobResult = await query(
      `INSERT INTO jobs (
        lc_number, 
        client_id, 
        po_status, 
        completion_status, 
        po_amount, 
        quote_id, 
        total_quoted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [lcNumber, quote.client_id, 'approved', 'not_started', po_amount, id, quote.total_amount || 0]
    );
    
    const jobId = jobResult.rows[0].id;
    
    // Link job back to quote
    await query('UPDATE quotes SET job_id = $1 WHERE id = $2', [jobId, id]);
    
    // Get quote items
    const quoteItems = await query('SELECT * FROM quote_items WHERE quote_id = $1', [id]);
    
    // Create job items from quote items
    for (const item of quoteItems.rows) {
      await query(
        `INSERT INTO job_items (
          job_id, 
          item_name, 
          description, 
          quoted_quantity, 
          quoted_unit_price, 
          completion_status
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [jobId, item.description, item.additional_description || null, item.quantity, item.price_ex_vat, 'pending']
      );
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      job_id: jobId,
      message: 'PO recorded and job created successfully'
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error recording PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT po_number, po_amount, po_date, po_document, po_received, job_id FROM quotes WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}