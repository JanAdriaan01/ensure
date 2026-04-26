import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch single quote with items
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const quoteResult = await query(`
      SELECT q.*, c.client_name 
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      WHERE q.id = $1
    `, [id]);
    
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const itemsResult = await query(`
      SELECT * FROM quote_items 
      WHERE quote_id = $1 
      ORDER BY item_number
    `, [id]);
    
    return NextResponse.json({
      ...quoteResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update quote status (approve/reject) and create job
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }
    
    // Get current quote
    const currentQuote = await query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (currentQuote.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = currentQuote.rows[0];
    
    // Start transaction
    await query('BEGIN');
    
    // Update quote status
    await query('UPDATE quotes SET status = $1 WHERE id = $2', [status, id]);
    
    let jobId = quote.job_id;
    let jobCreated = false;
    
    // If status changed to 'approved' and no job exists, create job
    if (status === 'approved' && !jobId) {
      const lcNumber = `JOB-${quote.quote_number}`;
      
      const jobResult = await query(
        `INSERT INTO jobs (
          lc_number, client_id, po_status, completion_status, 
          po_amount, quote_id, total_quoted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [lcNumber, quote.client_id, 'approved', 'not_started', quote.total_amount || 0, id, quote.total_amount || 0]
      );
      
      jobId = jobResult.rows[0].id;
      jobCreated = true;
      
      // Update quote with job reference
      await query('UPDATE quotes SET job_id = $1 WHERE id = $2', [jobId, id]);
      
      // Get quote items
      const quoteItems = await query('SELECT * FROM quote_items WHERE quote_id = $1', [id]);
      
      // Create job items from quote items - WITHOUT quoted_total (it's generated)
      for (const item of quoteItems.rows) {
        await query(
          `INSERT INTO job_items (
            job_id, 
            item_name, 
            description, 
            quoted_quantity, 
            quoted_unit_price, 
            completion_status,
            actual_quantity,
            actual_cost,
            is_finalized
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            jobId, 
            item.description, 
            item.additional_description || null, 
            item.quantity, 
            item.price_ex_vat, 
            'pending',
            0,
            0,
            false
          ]
        );
      }
      
      console.log('Auto-created job from PATCH:', lcNumber, 'with ID:', jobId);
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      job_id: jobId,
      status: status,
      job_created: jobCreated,
      message: jobCreated ? 'Job created successfully' : 'Status updated successfully'
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Alternative full update
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;
    
    const result = await query(
      'UPDATE quotes SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Prevent deletion
export async function DELETE(request, { params }) {
  return NextResponse.json({ 
    error: 'Quotes cannot be deleted. Create a new version instead.'
  }, { status: 405 });
}