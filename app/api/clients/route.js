import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET all clients
export async function GET() {
  try {
    const result = await query(`
      SELECT c.*, 
        COUNT(DISTINCT q.id) as quote_count,
        COUNT(DISTINCT j.id) as job_count
      FROM clients c
      LEFT JOIN quotes q ON c.id = q.client_id
      LEFT JOIN jobs j ON c.id = j.client_id
      GROUP BY c.id
      ORDER BY c.client_name
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create client
export async function POST(request) {
  try {
    const body = await request.json();
    const { client_name, contact_person, client_address, signup_date, email, phone } = body;
    
    const result = await query(
      `INSERT INTO clients (client_name, contact_person, client_address, signup_date, email, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [client_name, contact_person, client_address, signup_date || new Date().toISOString().split('T')[0], email, phone]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}