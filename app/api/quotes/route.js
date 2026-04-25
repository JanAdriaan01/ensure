import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST create quote - also creates job if approved
export async function POST(request) {
  try {
    const body = await request.json();
    const { quote_number, client_id, job_number, quote_date, quote_amount, currency, status, notes } = body;
    
    // Start transaction
    await query('BEGIN');
    
    // Insert quote
    const quoteResult = await query(
      `INSERT INTO quotes (quote_number, client_id, job_number, quote_date, quote_amount, currency, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [quote_number, client_id, job_number, quote_date, quote_amount, currency || 'ZAR', status || 'pending', notes]
    );
    
    let jobId = null;
    
    // If quote is approved, auto-create job
    if (status === 'approved') {
      const lcNumber = `JOB-${quote_number}`;
      const jobResult = await query(
        `INSERT INTO jobs (lc_number, client_id, po_status, completion_status, po_amount)
         VALUES ($1, $2, 'approved', 'not_started', $3) RETURNING id`,
        [lcNumber, client_id, quote_amount]
      );
      jobId = jobResult.rows[0].id;
      
      // Update quote with job reference
      await query(
        'UPDATE quotes SET job_id = $1 WHERE id = $2',
        [jobId, quoteResult.rows[0].id]
      );
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      ...quoteResult.rows[0], 
      job_id: jobId 
    }, { status: 201 });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating quote:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Quote number already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update quote status - can auto-create job when approved
export async function PUT(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const { status } = body;
    
    await query('BEGIN');
    
    // Get current quote
    const quote = await query('SELECT * FROM quotes WHERE id = $1', [id]);
    if (quote.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    // Update quote status
    await query('UPDATE quotes SET status = $1 WHERE id = $2', [status, id]);
    
    let jobId = quote.rows[0].job_id;
    
    // If approved and no job exists, create job automatically
    if (status === 'approved' && !jobId) {
      const lcNumber = `JOB-${quote.rows[0].quote_number}`;
      const jobResult = await query(
        `INSERT INTO jobs (lc_number, client_id, po_status, completion_status, po_amount)
         VALUES ($1, $2, 'approved', 'not_started', $3) RETURNING id`,
        [lcNumber, quote.rows[0].client_id, quote.rows[0].quote_amount]
      );
      jobId = jobResult.rows[0].id;
      
      await query('UPDATE quotes SET job_id = $1 WHERE id = $2', [jobId, id]);
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ success: true, job_id: jobId });
  } catch (error) {
    await query('ROLLBACK');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}