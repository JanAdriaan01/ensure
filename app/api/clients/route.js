export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all clients
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      SELECT 
        c.*,
        COUNT(DISTINCT j.id) as total_jobs,
        COALESCE(SUM(j.po_amount), 0) as total_value
      FROM clients c
      LEFT JOIN jobs j ON c.id = j.client_id
      GROUP BY c.id
      ORDER BY c.client_name
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Clients error:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - Create new client
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'client:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { client_name, contact_person, client_address, email, phone, signup_date } = body;
    
    if (!client_name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO clients (client_name, contact_person, client_address, email, phone, signup_date, created_at)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), CURRENT_TIMESTAMP)
       RETURNING *`,
      [client_name, contact_person || null, client_address || null, email || null, phone || null, signup_date || null]
    );
    
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('POST client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update client
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'client:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { client_name, contact_person, client_address, email, phone, signup_date } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    
    const result = await query(
      `UPDATE clients SET 
        client_name = COALESCE($1, client_name),
        contact_person = COALESCE($2, contact_person),
        client_address = COALESCE($3, client_address),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        signup_date = COALESCE($6, signup_date)
       WHERE id = $7
       RETURNING *`,
      [client_name, contact_person, client_address, email, phone, signup_date, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('PUT client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete client
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'client:delete')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    
    // Check if client has jobs
    const jobCheck = await query(`SELECT COUNT(*) FROM jobs WHERE client_id = $1`, [id]);
    if (parseInt(jobCheck.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Cannot delete client with existing jobs' }, { status: 400 });
    }
    
    await query(`DELETE FROM clients WHERE id = $1`, [id]);
    
    return NextResponse.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('DELETE client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}