// app/api/clients/[id]/route.js
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
    
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }
    
    const result = await query(`
      SELECT 
        c.*,
        o.organization_name,
        STRING_AGG(DISTINCT cs.site_name, ', ') as site_names
      FROM clients c
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN client_site_assignments csa ON c.id = csa.client_id
      LEFT JOIN client_sites cs ON csa.client_site_id = cs.id
      WHERE c.id = $1
      GROUP BY c.id, o.organization_name
    `, [clientId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('GET client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}