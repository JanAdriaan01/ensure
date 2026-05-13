// app/api/client-sites/[id]/route.js
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
    const siteId = parseInt(id);
    
    if (isNaN(siteId)) {
      return NextResponse.json({ error: 'Invalid site ID' }, { status: 400 });
    }
    
    const result = await query(`
      SELECT 
        cs.*,
        o.organization_name
      FROM client_sites cs
      LEFT JOIN organizations o ON cs.organization_id = o.id
      WHERE cs.id = $1
    `, [siteId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client site not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('GET client site error:', error);
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
    const siteId = parseInt(id);
    const body = await request.json();
    
    const {
      site_name, site_type, site_code,
      contact_person, email, phone, site_address, city, postal_code,
      site_manager, operating_hours, is_primary,
      environment_types, safety_level, access_level,
      power_requirement, clearance_required,
      special_equipment, restricted_zones, notes
    } = body;
    
    // Get current site to check organization_id
    const currentSite = await query(`SELECT organization_id FROM client_sites WHERE id = $1`, [siteId]);
    if (currentSite.rows.length === 0) {
      return NextResponse.json({ error: 'Client site not found' }, { status: 404 });
    }
    
    const organization_id = currentSite.rows[0].organization_id;
    
    // If this is primary, unset other primary sites for this organization
    if (is_primary) {
      await query(`UPDATE client_sites SET is_primary = FALSE WHERE organization_id = $1 AND id != $2`, [organization_id, siteId]);
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
        siteId
      ]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT client site error:', error);
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
    const siteId = parseInt(id);
    
    // Check if site has any client assignments
    const assignmentCheck = await query(`SELECT COUNT(*) FROM client_site_assignments WHERE client_site_id = $1`, [siteId]);
    if (parseInt(assignmentCheck.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Cannot delete site with assigned clients' }, { status: 400 });
    }
    
    await query(`DELETE FROM client_sites WHERE id = $1`, [siteId]);
    
    return NextResponse.json({ success: true, message: 'Client site deleted successfully' });
  } catch (error) {
    console.error('DELETE client site error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}