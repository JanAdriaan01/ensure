import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Creating quote:', body);
    
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
        quote_number, client_id, site_name || null, contact_person || null, 
        quote_date, quote_prepared_by || null, scope_subject || null, status,
        subtotal || 0, vat_amount || 0, total_amount || 0, total_amount || 0
      ]
    );
    
    const quoteId = quoteResult.rows[0].id;
    
    // Insert line items
    if (items && items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO quote_items (
            quote_id, item_number, description, additional_description,
            unit, quantity, unit_of_measure, price_ex_vat
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [quoteId, item.item_number, item.description, item.additional_description || null,
           item.unit || null, item.quantity, item.unit_of_measure, item.price_ex_vat]
        );
      }
    }
    
    let jobId = null;
    
    // If status is 'approved', auto-create job
    if (status === 'approved') {
      const lcNumber = `JOB-${quote_number}`;
      
      const jobResult = await query(
        `INSERT INTO jobs (
          lc_number, client_id, po_status, completion_status, 
          po_amount, quote_id, total_quoted
        ) VALUES ($1, $2, 'approved', 'not_started', $3, $4, $5) RETURNING id`,
        [lcNumber, client_id, total_amount || 0, quoteId, total_amount || 0]
      );
      
      jobId = jobResult.rows[0].id;
      
      // Update quote with job reference
      await query('UPDATE quotes SET job_id = $1 WHERE id = $2', [jobId, quoteId]);
      
      // Create job items from quote items
      for (const item of items) {
        await query(
          `INSERT INTO job_items (
            job_id, item_name, description, quoted_quantity, 
            quoted_unit_price, quoted_total
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [jobId, item.description, item.additional_description || null, 
           item.quantity, item.price_ex_vat, item.quantity * item.price_ex_vat]
        );
      }
      
      console.log('Auto-created job:', lcNumber, 'with ID:', jobId);
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