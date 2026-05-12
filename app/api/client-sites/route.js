// app/api/client-sites/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organization_id = searchParams.get('organization_id');

    let sql = `
      SELECT 
        cs.*,
        o.organization_name
      FROM client_sites cs
      LEFT JOIN organizations o ON cs.organization_id = o.id
      WHERE 1=1
    `;
    const params = [];
    
    if (organization_id) {
      sql += ` AND cs.organization_id = $1`;
      params.push(parseInt(organization_id));
    }
    
    sql += ` ORDER BY cs.site_name`;
    
    const result = await query(sql, params);
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
      organization_id, site_name, site_type, site_code,
      contact_person, email, phone,
      site_address, city, postal_code,
      site_manager, operating_hours, special_instructions,
      is_primary
    } = body;
    
    if (!organization_id || !site_name) {
      return NextResponse.json({ error: 'Organization ID and site name are required' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO client_sites (
        organization_id, site_name, site_type, site_code,
        contact_person, email, phone,
        site_address, city, postal_code,
        site_manager, operating_hours, special_instructions,
        is_primary, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        organization_id, site_name, site_type, site_code,
        contact_person, email, phone,
        site_address, city, postal_code,
        site_manager, operating_hours, special_instructions,
        is_primary || false
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST client site error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}