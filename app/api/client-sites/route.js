// app/api/client-sites/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json([], { status: 401 });
    }

    const result = await query(`
      SELECT 
        cs.id,
        cs.site_name,
        cs.contact_person,
        cs.email,
        cs.phone,
        cs.site_address,
        cs.city,
        cs.postal_code,
        cs.is_primary,
        cs.created_at,
        o.organization_name,
        o.id as organization_id
      FROM client_sites cs
      LEFT JOIN organizations o ON cs.organization_id = o.id
      ORDER BY cs.site_name
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET client sites error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      organization_id,
      site_name,
      contact_person,
      email,
      phone,
      site_address,
      city,
      postal_code,
      is_primary
    } = body;
    
    // Validate required fields
    if (!organization_id) {
      return NextResponse.json({ error: 'Organization is required' }, { status: 400 });
    }
    
    if (!site_name) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }
    
    // Check if organization exists
    const orgCheck = await query(`SELECT id FROM organizations WHERE id = $1`, [organization_id]);
    if (orgCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Selected organization does not exist' }, { status: 400 });
    }
    
    // If this is primary, unset other primary sites for this organization
    if (is_primary) {
      await query(`UPDATE client_sites SET is_primary = FALSE WHERE organization_id = $1`, [organization_id]);
    }
    
    const result = await query(
      `INSERT INTO client_sites (
        organization_id, site_name, contact_person, email, phone, 
        site_address, city, postal_code, is_primary, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        organization_id, site_name, contact_person || null, email || null, phone || null,
        site_address || null, city || null, postal_code || null, is_primary || false
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST client site error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}