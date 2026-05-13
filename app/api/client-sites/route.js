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
    console.log('Creating client site with data:', body);
    
    const {
      organization_id, 
      site_name, 
      site_type, 
      site_code,
      contact_person, 
      email, 
      phone, 
      site_address, 
      city, 
      postal_code,
      site_manager, 
      operating_hours, 
      is_primary,
      environment_types, 
      safety_level, 
      access_level,
      power_requirement, 
      clearance_required,
      special_equipment, 
      restricted_zones, 
      notes
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
    
    // Check if site name already exists for this organization
    const existingCheck = await query(
      `SELECT id FROM client_sites WHERE organization_id = $1 AND site_name = $2`,
      [organization_id, site_name]
    );
    if (existingCheck.rows.length > 0) {
      return NextResponse.json({ error: 'A site with this name already exists for this organization' }, { status: 400 });
    }
    
    // If this is primary, unset other primary sites for this organization
    if (is_primary) {
      await query(`UPDATE client_sites SET is_primary = FALSE WHERE organization_id = $1`, [organization_id]);
    }
    
    const result = await query(
      `INSERT INTO client_sites (
        organization_id, site_name, site_type, site_code,
        contact_person, email, phone, site_address, city, postal_code,
        site_manager, operating_hours, is_primary,
        environment_types, safety_level, access_level,
        power_requirement, clearance_required,
        special_equipment, restricted_zones, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW())
      RETURNING *`,
      [
        organization_id, 
        site_name, 
        site_type || null, 
        site_code || null,
        contact_person || null, 
        email || null, 
        phone || null, 
        site_address || null, 
        city || null, 
        postal_code || null,
        site_manager || null, 
        operating_hours || null, 
        is_primary || false,
        environment_types || [], 
        safety_level || 'moderate', 
        access_level || 'moderate',
        power_requirement || null, 
        clearance_required || null,
        special_equipment || [], 
        restricted_zones || [], 
        notes || null
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
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }
    
    const {
      site_name, site_type, site_code,
      contact_person, email, phone, site_address, city, postal_code,
      site_manager, operating_hours, is_primary,
      environment_types, safety_level, access_level,
      power_requirement, clearance_required,
      special_equipment, restricted_zones, notes
    } = updateData;
    
    // Get current site to check organization_id
    const currentSite = await query(`SELECT organization_id FROM client_sites WHERE id = $1`, [id]);
    if (currentSite.rows.length === 0) {
      return NextResponse.json({ error: 'Client site not found' }, { status: 404 });
    }
    
    const organization_id = currentSite.rows[0].organization_id;
    
    // If this is primary, unset other primary sites for this organization
    if (is_primary) {
      await query(`UPDATE client_sites SET is_primary = FALSE WHERE organization_id = $1 AND id != $2`, [organization_id, id]);
    }
    
    const result = await query(
      `UPDATE client_sites SET
        site_name = COALESCE($1, site_name),
        site_type = COALESCE($2, site_type),
        site_code = COALESCE($3, site_code),
        contact_person = COALESCE($4, contact_person),
        email = COALESCE($5, email),
        phone = COALESCE($6, phone),
        site_address = COALESCE($7, site_address),
        city = COALESCE($8, city),
        postal_code = COALESCE($9, postal_code),
        site_manager = COALESCE($10, site_manager),
        operating_hours = COALESCE($11, operating_hours),
        is_primary = COALESCE($12, is_primary),
        environment_types = COALESCE($13, environment_types),
        safety_level = COALESCE($14, safety_level),
        access_level = COALESCE($15, access_level),
        power_requirement = COALESCE($16, power_requirement),
        clearance_required = COALESCE($17, clearance_required),
        special_equipment = COALESCE($18, special_equipment),
        restricted_zones = COALESCE($19, restricted_zones),
        notes = COALESCE($20, notes),
        updated_at = NOW()
      WHERE id = $21
      RETURNING *`,
      [
        site_name, site_type, site_code,
        contact_person, email, phone, site_address, city, postal_code,
        site_manager, operating_hours, is_primary,
        environment_types, safety_level, access_level,
        power_requirement, clearance_required,
        special_equipment, restricted_zones, notes,
        id
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
    
    // Check if site has any client assignments
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