import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const { invoice_number, invoice_date, due_date, notes, item_ids } = await request.json();
    
    if (!invoice_number || !item_ids || item_ids.length === 0) {
      return NextResponse.json({ error: 'Invoice number and items are required' }, { status: 400 });
    }
    
    await query('BEGIN');
    
    // Calculate total amount
    const itemsResult = await query(
      `SELECT SUM(ji.quoted_quantity * ji.quoted_unit_price) as total
       FROM job_items ji
       WHERE ji.id = ANY($1::int[]) AND ji.job_id = $2 AND ji.is_finalized = TRUE`,
      [item_ids, jobId]
    );
    
    const totalAmount = itemsResult.rows[0].total || 0;
    
    // Create invoice record
    const invoiceResult = await query(
      `INSERT INTO invoices (job_id, invoice_number, invoice_date, due_date, total_amount, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'sent') RETURNING *`,
      [jobId, invoice_number, invoice_date, due_date, totalAmount, notes]
    );
    
    const invoiceId = invoiceResult.rows[0].id;
    
    // Create invoice line items
    for (const itemId of item_ids) {
      await query(
        `INSERT INTO invoice_line_items (invoice_id, job_item_id, quantity, unit_price, total_amount)
         SELECT $1, ji.id, ji.quoted_quantity, ji.quoted_unit_price, ji.quoted_quantity * ji.quoted_unit_price
         FROM job_items ji
         WHERE ji.id = $2`,
        [invoiceId, itemId]
      );
      
      // Mark item as invoiced (optional - you might want to track this separately)
      await query(
        `UPDATE job_items SET invoiced = TRUE WHERE id = $1`,
        [itemId]
      );
    }
    
    // Update monthly invoicing summary
    const month = invoice_date.substring(0, 7);
    await query(
      `INSERT INTO job_monthly_invoicing (job_id, invoice_month, amount_invoiced)
       VALUES ($1, $2, $3)
       ON CONFLICT (job_id, invoice_month) 
       DO UPDATE SET amount_invoiced = job_monthly_invoicing.amount_invoiced + $3`,
      [jobId, month, totalAmount]
    );
    
    await query('COMMIT');
    
    return NextResponse.json(invoiceResult.rows[0], { status: 201 });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}