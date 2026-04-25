import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET all quotes
export async function GET() {
  try {
    const result = await query(`
      SELECT q.*, c.client_name, j.lc_number as job_lc_number
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN jobs j ON q.job_id = j.id
      ORDER BY q.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create quote with line items
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received quote data:', JSON.stringify(body, null, 2));
    
    const {
      quote_number,
      client_id,
      site_name,
      contact_person,
      quote_date,
      quote_prepared_by,
      scope_subject,
      status,
      subtotal,
      vat_amount,
      total_amount,
      items
    } = body;
    
    // Validate required fields
    if (!quote_number) {
      return NextResponse.json({ error: 'Quote number is required' }, { status: 400 });
    }
    if (!client_id) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }
    if (!quote_date) {
      return NextResponse.json({ error: 'Quote date is required' }, { status: 400 });
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Insert quote
    const quoteResult = await query(
      `INSERT INTO quotes (
        quote_number, client_id, site_name, contact_person, 
        quote_date, quote_prepared_by, scope_subject, status,
        subtotal, vat_amount, total_amount, quote_amount, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1) RETURNING *`,
      [
        quote_number, 
        client_id, 
        site_name || null, 
        contact_person || null, 
        quote_date, 
        quote_prepared_by || null, 
        scope_subject || null, 
        status || 'pending',
        subtotal || 0, 
        vat_amount || 0, 
        total_amount || 0, 
        total_amount || 0
      ]
    );
    
    const quoteId = quoteResult.rows[0].id;
    console.log('Quote created with ID:', quoteId);
    
    // Insert line items
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO quote_items (
            quote_id, item_number, description, additional_description,
            unit, quantity, unit_of_measure, price_ex_vat
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            quoteId, 
            item.item_number, 
            item.description, 
            item.additional_description || null,
            item.unit || null, 
            item.quantity, 
            item.unit_of_measure || 'each', 
            item.price_ex_vat
          ]
        );
      }
      console.log(`Added ${items.length} line items`);
    }
    
    // If approved, auto-create job
    let jobId = null;
    if (status === 'approved') {
      const lcNumber = `JOB-${quote_number}`;
      const jobResult = await query(
        `INSERT INTO jobs (lc_number, client_id, po_status, completion_status, po_amount)
         VALUES ($1, $2, 'approved', 'not_started', $3) RETURNING id`,
        [lcNumber, client_id, total_amount || 0]
      );
      jobId = jobResult.rows[0].id;
      
      await query('UPDATE quotes SET job_id = $1 WHERE id = $2', [jobId, quoteId]);
      
      // Copy quote items to job items
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await query(
            `INSERT INTO job_items (
              job_id, item_name, description, quoted_quantity, quoted_unit_price
            ) VALUES ($1, $2, $3, $4, $5)`,
            [jobId, item.description, item.additional_description || null, item.quantity, item.price_ex_vat]
          );
        }
      }
      console.log('Auto-created job with ID:', jobId);
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      ...quoteResult.rows[0], 
      job_id: jobId 
    }, { status: 201 });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}