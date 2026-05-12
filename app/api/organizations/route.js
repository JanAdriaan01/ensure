// app/api/organizations/route.js
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

    const result = await query(`
      SELECT 
        o.*,
        COUNT(DISTINCT cs.id) as site_count,
        COUNT(DISTINCT c.id) as client_count
      FROM organizations o
      LEFT JOIN client_sites cs ON o.id = cs.organization_id
      LEFT JOIN clients c ON o.id = c.organization_id
      GROUP BY o.id
      ORDER BY o.organization_name
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET organizations error:', error);
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
      organization_name, organization_type, registration_number, vat_number, tax_number,
      email, phone, website, address_line1, address_line2, city, postal_code, country,
      bank_name, bank_account_number, bank_account_type, bank_branch_code, bank_swift_code, bank_iban,
      billing_email, billing_phone, billing_address, payment_terms, credit_limit, notes
    } = body;
    
    if (!organization_name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO organizations (
        organization_name, organization_type, registration_number, vat_number, tax_number,
        email, phone, website, address_line1, address_line2, city, postal_code, country,
        bank_name, bank_account_number, bank_account_type, bank_branch_code, bank_swift_code, bank_iban,
        billing_email, billing_phone, billing_address, payment_terms, credit_limit, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, NOW(), NOW())
      RETURNING *`,
      [
        organization_name, organization_type, registration_number, vat_number, tax_number,
        email, phone, website, address_line1, address_line2, city, postal_code, country,
        bank_name, bank_account_number, bank_account_type, bank_branch_code, bank_swift_code, bank_iban,
        billing_email, billing_phone, billing_address, payment_terms, credit_limit, notes
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST organization error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Organization name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}