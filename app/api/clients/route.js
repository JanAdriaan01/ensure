// app/api/clients/route.js - Fix the GET method to always return an array
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json([]); // Return empty array, not error object
    }

    const { searchParams } = new URL(request.url);
    const organization_id = searchParams.get('organization_id');

    let sql = `
      SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.mobile,
        c.organization_id,
        c.job_title,
        c.department,
        c.address_line1,
        c.address_line2,
        c.city,
        c.postal_code,
        c.date_of_birth,
        c.notes,
        c.created_at,
        o.organization_name,
        STRING_AGG(DISTINCT cs.site_name, ', ') as site_names
      FROM clients c
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN client_site_assignments csa ON c.id = csa.client_id
      LEFT JOIN client_sites cs ON csa.client_site_id = cs.id
      WHERE 1=1
    `;
    const params = [];
    
    if (organization_id) {
      sql += ` AND c.organization_id = $1`;
      params.push(parseInt(organization_id));
    }
    
    sql += ` GROUP BY c.id, o.organization_name ORDER BY c.first_name, c.last_name`;
    
    const result = await query(sql, params);
    
    // Always return an array
    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('GET clients error:', error);
    // Return empty array on error
    return NextResponse.json([]);
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
      first_name,
      last_name,
      email,
      phone,
      mobile,
      organization_id,
      job_title,
      department,
      address_line1,
      address_line2,
      city,
      postal_code,
      date_of_birth,
      notes
    } = body;
    
    // Validate required fields
    if (!first_name || !last_name) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }
    
    if (!organization_id) {
      return NextResponse.json({ error: 'Organization is required' }, { status: 400 });
    }
    
    // Check if organization exists
    const orgCheck = await query(`SELECT id FROM organizations WHERE id = $1`, [organization_id]);
    if (orgCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Selected organization does not exist' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO clients (
        first_name, last_name, email, phone, mobile, organization_id,
        job_title, department, address_line1, address_line2, city, postal_code,
        date_of_birth, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        first_name, last_name, email || null, phone || null, mobile || null, organization_id,
        job_title || null, department || null, address_line1 || null, address_line2 || null, 
        city || null, postal_code || null, date_of_birth || null, notes || null
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}