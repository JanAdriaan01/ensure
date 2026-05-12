// app/api/organizations/[id]/route.js
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
    const orgId = parseInt(id);
    
    if (isNaN(orgId)) {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
    }
    
    const result = await query(`
      SELECT * FROM organizations WHERE id = $1
    `, [orgId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('GET organization error:', error);
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
    const orgId = parseInt(id);
    const body = await request.json();
    
    const {
      organization_name, organization_type, registration_number, vat_number, tax_number,
      email, phone, website, address_line1, address_line2, city, postal_code, country,
      bank_name, bank_account_number, bank_account_type, bank_branch_code, bank_swift_code, bank_iban,
      billing_email, billing_phone, billing_address, payment_terms, credit_limit, notes
    } = body;
    
    const result = await query(
      `UPDATE organizations SET
        organization_name = $1, organization_type = $2, registration_number = $3, vat_number = $4, tax_number = $5,
        email = $6, phone = $7, website = $8, address_line1 = $9, address_line2 = $10,
        city = $11, postal_code = $12, country = $13,
        bank_name = $14, bank_account_number = $15, bank_account_type = $16, bank_branch_code = $17,
        bank_swift_code = $18, bank_iban = $19,
        billing_email = $20, billing_phone = $21, billing_address = $22, payment_terms = $23, credit_limit = $24,
        notes = $25, updated_at = NOW()
      WHERE id = $26
      RETURNING *`,
      [
        organization_name, organization_type, registration_number, vat_number, tax_number,
        email, phone, website, address_line1, address_line2, city, postal_code, country,
        bank_name, bank_account_number, bank_account_type, bank_branch_code,
        bank_swift_code, bank_iban,
        billing_email, billing_phone, billing_address, payment_terms, credit_limit,
        notes, orgId
      ]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT organization error:', error);
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
    const orgId = parseInt(id);
    
    // Check if organization has sites
    const siteCheck = await query(`SELECT COUNT(*) FROM client_sites WHERE organization_id = $1`, [orgId]);
    if (parseInt(siteCheck.rows[0].count) > 0) {
      return NextResponse.json({ error: 'Cannot delete organization with existing sites. Delete or reassign sites first.' }, { status: 400 });
    }
    
    await query(`DELETE FROM organizations WHERE id = $1`, [orgId]);
    
    return NextResponse.json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('DELETE organization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}