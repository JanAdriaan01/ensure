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

    // Remove any filtering that might exclude new clients
    const result = await query(`
      SELECT 
        c.id,
        c.client_name,
        c.contact_person,
        c.client_address,
        c.signup_date,
        c.email,
        c.phone,
        c.created_at,
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
       RETURNING id, client_name, contact_person, client_address, email, phone, signup_date, created_at`,
      [client_name, contact_person || null, client_address || null, email || null, phone || null, signup_date || null]
    );
    
    // Verify the client was inserted
    console.log('Client created:', result.rows[0]);
    
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('POST client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}