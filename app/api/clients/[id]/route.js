import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request, { params }) {
  try {
    const clientId = parseInt(params.id);
    const result = await query('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const clientId = parseInt(params.id);
    const body = await request.json();
    const { client_name, contact_person, client_address, email, phone } = body;
    
    const result = await query(
      `UPDATE clients SET client_name = $1, contact_person = $2, client_address = $3, email = $4, phone = $5
       WHERE id = $6 RETURNING *`,
      [client_name, contact_person, client_address, email, phone, clientId]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const clientId = parseInt(params.id);
    await query('DELETE FROM clients WHERE id = $1', [clientId]);
    return NextResponse.json({ message: 'Client deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}