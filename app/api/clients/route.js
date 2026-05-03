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
      ORDER BY c.name
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
      return NextResponse.json({ error: 'Forbidden - You do not have permission to create clients' }, { status: 403 });
    }

    const body = await request.json();
    const { name, contact_person, email, phone, address, vat_number, status } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO clients (name, contact_person, email, phone, address, vat_number, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [name, contact_person || null, email || null, phone || null, address || null, vat_number || null, status || 'active']
    );
    
    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('POST client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}