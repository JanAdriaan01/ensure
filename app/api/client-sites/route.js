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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Creating client site with data:', body);
    
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
    
    if (!organization_id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }
    
    if (!site_name) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }
    
    // Check if organization exists
    const orgCheck = await query(`SELECT id FROM organizations WHERE id = $1`, [organization_id]);
    if (orgCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Check if site already exists for this organization
    const existingCheck = await query(
      `SELECT id FROM client_sites WHERE organization_id = $1 AND site_name = $2`,
      [organization_id, site_name]
    );
    if (existingCheck.rows.length > 0) {
      return NextResponse.json({ error: 'A site with this name already exists for this organization' }, { status: 409 });
    }
    
    // If this is primary, unset other primary sites for this organization
    if (is_primary) {
      await query(`UPDATE client_sites SET is_primary = FALSE WHERE organization_id = $1`, [organization_id]);
    }
    
    const result = await query(
      `INSERT INTO client_sites (
        organization_id, 
        site_name, 
        contact_person, 
        email, 
        phone, 
        site_address, 
        city, 
        postal_code, 
        is_primary,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        organization_id, 
        site_name, 
        contact_person || null, 
        email || null, 
        phone || null, 
        site_address || null, 
        city || null, 
        postal_code || null, 
        is_primary || false
      ]
    );
    
    console.log('Client site created:', result.rows[0]);
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST client site error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, organization_id, site_name, contact_person, email, phone, site_address, city, postal_code, is_primary } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }
    
    // Get current site
    const currentSite = await query(`SELECT organization_id FROM client_sites WHERE id = $1`, [id]);
    if (currentSite.rows.length === 0) {
      return NextResponse.json({ error: 'Client site not found' }, { status: 404 });
    }
    
    const currentOrgId = currentSite.rows[0].organization_id;
    
    // If this is primary, unset other primary sites for this organization
    if (is_primary) {
      await query(`UPDATE client_sites SET is_primary = FALSE WHERE organization_id = $1 AND id != $2`, [currentOrgId, id]);
    }
    
    const result = await query(
      `UPDATE client_sites SET
        site_name = COALESCE($1, site_name),
        contact_person = COALESCE($2, contact_person),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        site_address = COALESCE($5, site_address),
        city = COALESCE($6, city),
        postal_code = COALESCE($7, postal_code),
        is_primary = COALESCE($8, is_primary),
        updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        site_name, contact_person, email, phone, site_address, city, postal_code, is_primary, id
      ]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT client site error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }
    
    // Check if site has client assignments
    const assignmentCheck = await query(`SELECT COUNT(*) FROM client_site_assignments WHERE client_site_id = $1`, [id]);
    if (parseInt(assignmentCheck.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Cannot delete site with assigned clients' }, { status: 400 });
    }
    
    await query(`DELETE FROM client_sites WHERE id = $1`, [id]);
    
    return NextResponse.json({ success: true, message: 'Client site deleted successfully' });
  } catch (error) {
    console.error('DELETE client site error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}