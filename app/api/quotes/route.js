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
    
    console.log('Creating quote with items:', { quote_number, client_id, itemsCount: items?.length });
    
    // Start transaction
    await query('BEGIN');
    
    // Insert quote
    const quoteResult = await query(
      `INSERT INTO quotes (
        quote_number, client_id, site_name, contact_person, 
        quote_date, quote_prepared_by, scope_subject, status,
        subtotal, vat_amount, total_amount, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1) RETURNING *`,
      [quote_number, client_id, site_name, contact_person, quote_date, 
       quote_prepared_by, scope_subject, status, subtotal, vat_amount, total_amount]
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
          [quoteId, item.item_number, item.description, item.additional_description,
           item.unit, item.quantity, item.unit_of_measure, item.price_ex_vat]
        );
      }
    }
    
    // If approved, auto-create job
    let jobId = null;
    if (status === 'approved') {
      const lcNumber = `JOB-${quote_number}`;
      const jobResult = await query(
        `INSERT INTO jobs (lc_number, client_id, po_status, completion_status, po_amount)
         VALUES ($1, $2, 'approved', 'not_started', $3) RETURNING id`,
        [lcNumber, client_id, total_amount]
      );
      jobId = jobResult.rows[0].id;
      
      await query('UPDATE quotes SET job_id = $1 WHERE id = $2', [jobId, quoteId]);
      
      // Copy quote items to job items
      for (const item of items) {
        await query(
          `INSERT INTO job_items (
            job_id, item_name, description, quoted_quantity, quoted_unit_price
          ) VALUES ($1, $2, $3, $4, $5)`,
          [jobId, item.description, item.additional_description, item.quantity, item.price_ex_vat]
        );
      }
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

// GET single quote with items
export async function GET_BY_ID(request, { params }) {
  try {
    const { id } = params;
    
    const quoteResult = await query(`
      SELECT q.*, c.client_name, j.lc_number as job_lc_number
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN jobs j ON q.job_id = j.id
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