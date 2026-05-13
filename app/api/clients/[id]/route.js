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

export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientId = parseInt(id);
    const body = await request.json();
    
    const { 
      first_name, last_name, email, phone, mobile,
      job_title, department, address_line1, address_line2,
      city, postal_code, date_of_birth, notes
    } = body;
    
    const result = await query(
      `UPDATE clients SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        mobile = COALESCE($5, mobile),
        job_title = COALESCE($6, job_title),
        department = COALESCE($7, department),
        address_line1 = COALESCE($8, address_line1),
        address_line2 = COALESCE($9, address_line2),
        city = COALESCE($10, city),
        postal_code = COALESCE($11, postal_code),
        date_of_birth = COALESCE($12, date_of_birth),
        notes = COALESCE($13, notes),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *`,
      [first_name, last_name, email, phone, mobile, job_title, department,
       address_line1, address_line2, city, postal_code, date_of_birth, notes, clientId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT client error:', error);
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
    const clientId = parseInt(id);
    
    // Check if client has jobs
    const jobCheck = await query(`SELECT COUNT(*) FROM jobs WHERE client_id = $1`, [clientId]);
    if (parseInt(jobCheck.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Cannot delete client with existing jobs' }, { status: 400 });
    }
    
    // Check if client has quotes
    const quoteCheck = await query(`SELECT COUNT(*) FROM quotes WHERE client_id = $1`, [clientId]);
    if (parseInt(quoteCheck.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Cannot delete client with existing quotes' }, { status: 400 });
    }
    
    // Delete client site assignments first
    await query(`DELETE FROM client_site_assignments WHERE client_id = $1`, [clientId]);
    
    // Delete client
    await query(`DELETE FROM clients WHERE id = $1`, [clientId]);
    
    return NextResponse.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('DELETE client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}