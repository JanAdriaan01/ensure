import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET single quote with items
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
      SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY item_number
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

// PATCH - Update quote status and create job if approved
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { status } = await request.json();
    
    // Get current quote
    const currentQuote = await query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (currentQuote.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Update quote status
    await query('UPDATE quotes SET status = $1 WHERE id = $2', [status, id]);
    
    let jobId = currentQuote.rows[0].job_id;
    
    // If status changed to 'approved' and no job exists, create job
    if (status === 'approved' && !jobId) {
      const lcNumber = `JOB-${currentQuote.rows[0].quote_number}`;
      
      const jobResult = await query(
        `INSERT INTO jobs (
          lc_number, client_id, po_status, completion_status, 
          po_amount, quote_id, total_quoted
        ) VALUES ($1, $2, 'approved', 'not_started', $3, $4, $5) RETURNING id`,
        [lcNumber, currentQuote.rows[0].client_id, currentQuote.rows[0].total_amount || 0, id, currentQuote.rows[0].total_amount || 0]
      );
      
      jobId = jobResult.rows[0].id;
      
      // Update quote with job reference
      await query('UPDATE quotes SET job_id = $1 WHERE id = $2', [jobId, id]);
      
      // Get quote items
      const quoteItems = await query('SELECT * FROM quote_items WHERE quote_id = $1', [id]);
      
      // Create job items from quote items
      for (const item of quoteItems.rows) {
        await query(
          `INSERT INTO job_items (
            job_id, item_name, description, quoted_quantity, 
            quoted_unit_price, quoted_total
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [jobId, item.description, item.additional_description || null, 
           item.quantity, item.price_ex_vat, item.quantity * item.price_ex_vat]
        );
      }
      
      console.log('Auto-created job from PATCH:', lcNumber, 'with ID:', jobId);
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      job_id: jobId,
      message: jobId ? 'Job created successfully' : 'Status updated'
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}