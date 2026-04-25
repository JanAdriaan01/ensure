import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const quoteId = parseInt(params.id);
    const result = await query('SELECT * FROM quotes WHERE id = $1', [quoteId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const quoteId = parseInt(params.id);
    const body = await request.json();
    const { quote_number, client_id, job_number, quote_date, quote_amount, currency, status, notes } = body;
    
    const result = await query(
      `UPDATE quotes 
       SET quote_number = $1, client_id = $2, job_number = $3, quote_date = $4, 
           quote_amount = $5, currency = $6, status = $7, notes = $8
       WHERE id = $9 RETURNING *`,
      [quote_number, client_id, job_number, quote_date, quote_amount, currency, status, notes, quoteId]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Quote number already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const quoteId = parseInt(params.id);
    await query('DELETE FROM quotes WHERE id = $1', [quoteId]);
    return NextResponse.json({ message: 'Quote deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}