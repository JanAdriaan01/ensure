export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientId = parseInt(id);
    
    const result = await query(
      `SELECT c.*, 
        COUNT(DISTINCT j.id) as total_jobs,
        COALESCE(SUM(j.po_amount), 0) as total_value
      FROM clients c
      LEFT JOIN jobs j ON c.id = j.client_id
      WHERE c.id = $1
      GROUP BY c.id`,
      [clientId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('GET client by id error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientId = parseInt(id);
    const body = await request.json();
    const { name, contact_person, email, phone, address, vat_number, status } = body;
    
    const result = await query(
      `UPDATE clients SET 
        name = $1, 
        contact_person = $2, 
        email = $3, 
        phone = $4, 
        address = $5, 
        vat_number = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 
       RETURNING *`,
      [name, contact_person, email, phone, address, vat_number, status, clientId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientId = parseInt(id);
    
    // Check if client has jobs
    const jobCheck = await query(`SELECT COUNT(*) FROM jobs WHERE client_id = $1`, [clientId]);
    if (parseInt(jobCheck.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Cannot delete client with existing jobs' }, { status: 400 });
    }
    
    await query(`DELETE FROM clients WHERE id = $1`, [clientId]);
    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('DELETE client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}