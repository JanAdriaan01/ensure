import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET single quote with items
export async function GET(request, { params }) {
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

// PATCH update quote status
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { po_status, invoice_status, status } = await request.json();
    
    const updates = [];
    const values = [];
    
    if (po_status !== undefined) {
      updates.push(`po_status = $${updates.length + 1}`);
      values.push(po_status);
    }
    if (invoice_status !== undefined) {
      updates.push(`invoice_status = $${updates.length + 1}`);
      values.push(invoice_status);
    }
    if (status !== undefined) {
      updates.push(`status = $${updates.length + 1}`);
      values.push(status);
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    values.push(id);
    const result = await query(
      `UPDATE quotes SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}