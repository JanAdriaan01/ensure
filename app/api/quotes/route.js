import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET all quotes
export async function GET() {
  try {
    const result = await query(`
      SELECT q.*, c.client_name
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      ORDER BY q.quote_date DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create quote
export async function POST(request) {
  try {
    const body = await request.json();
    const { quote_number, client_id, job_number, quote_date, quote_amount, currency, status, notes } = body;
    
    const result = await query(
      `INSERT INTO quotes (quote_number, client_id, job_number, quote_date, quote_amount, currency, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [quote_number, client_id, job_number, quote_date, quote_amount, currency || 'USD', status || 'pending', notes]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Quote number already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}