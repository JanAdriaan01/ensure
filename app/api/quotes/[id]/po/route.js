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
    
    // Update quote with PO information
    const result = await query(
      `UPDATE quotes 
       SET po_number = $1, 
           po_amount = $2, 
           po_date = $3, 
           po_document = $4, 
           po_received = TRUE,
           status = 'po_received'
       WHERE id = $5 
       RETURNING *`,
      [po_number, po_amount, po_date, po_document, id]
    );
    
    if (result.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    // Update the linked job's po_amount if exists
    const quote = result.rows[0];
    if (quote.job_id) {
      await query(
        'UPDATE jobs SET po_amount = $1 WHERE id = $2',
        [po_amount, quote.job_id]
      );
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      quote: result.rows[0],
      message: 'PO recorded successfully'
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
      'SELECT po_number, po_amount, po_date, po_document, po_received FROM quotes WHERE id = $1',
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