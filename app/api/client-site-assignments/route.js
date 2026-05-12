// app/api/client-site-assignments/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { client_id, site_ids } = body;
    
    if (!client_id || !site_ids || !site_ids.length) {
      return NextResponse.json({ error: 'Client ID and site IDs are required' }, { status: 400 });
    }
    
    // Delete existing assignments
    await query(`DELETE FROM client_site_assignments WHERE client_id = $1`, [client_id]);
    
    // Insert new assignments
    for (const site_id of site_ids) {
      await query(
        `INSERT INTO client_site_assignments (client_id, client_site_id, assigned_at)
         VALUES ($1, $2, NOW())`,
        [client_id, site_id]
      );
    }
    
    return NextResponse.json({ success: true, message: 'Sites assigned successfully' });
  } catch (error) {
    console.error('POST client site assignments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const client_id = searchParams.get('client_id');
    
    if (!client_id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    
    const result = await query(`
      SELECT 
        csa.*,
        cs.site_name,
        cs.site_type,
        cs.site_address
      FROM client_site_assignments csa
      JOIN client_sites cs ON csa.client_site_id = cs.id
      WHERE csa.client_id = $1
      ORDER BY cs.site_name
    `, [parseInt(client_id)]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET client site assignments error:', error);
    return NextResponse.json([], { status: 500 });
  }
}