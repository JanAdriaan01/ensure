import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET - Fetch all quotes
export async function GET(request) {
  try {
    const result = await query(`
      SELECT 
        q.*, 
        c.client_name, 
        j.lc_number as job_lc_number, 
        j.id as job_id
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

// POST - Create new quote with line items and auto-create job if approved
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Creating quote with body:', JSON.stringify(body, null, 2));
    
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
    
    // Check if quote number already exists
    const existingQuote = await query('SELECT id FROM quotes WHERE quote_number = $1', [quote_number]);
    if (existingQuote.rows.length > 0) {
      return NextResponse.json({ error: 'Quote number already exists' }, { status: 409 });
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
    
    let jobId = null;
    
    // If status is 'approved', auto-create job
    if (status === 'approved') {
      const lcNumber = `JOB-${quote_number}`;
      
      const jobResult = await query(
        `INSERT INTO jobs (
          lc_number, client_id, po_status, completion_status, 
          po_amount, quote_id, total_quoted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [lcNumber, client_id, 'approved', 'not_started', total_amount || 0, quoteId, total_amount || 0]
      );
      
      jobId = jobResult.rows[0].id;
      
      // Update quote with job reference
      await query('UPDATE quotes SET job_id = $1 WHERE id = $2', [jobId, quoteId]);
      
      // Create job items from quote items (without quoted_total - it's generated)
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
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