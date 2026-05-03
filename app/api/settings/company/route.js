import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`SELECT * FROM company_settings LIMIT 1`);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('GET /api/settings/company error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      company_name,
      display_name,
      registration_number,
      vat_number,
      tax_number,
      email,
      phone,
      website,
      address_line1,
      address_line2,
      city,
      postal_code,
      country,
      logo_url,
      logo_data,
      currency,
      date_format,
      timezone
    } = body;

    // Validate required fields
    if (!company_name) {
      return NextResponse.json({ success: false, error: 'Company name is required' }, { status: 400 });
    }

    // Check if settings exist
    const existing = await query(`SELECT id FROM company_settings LIMIT 1`);
    
    let result;
    if (existing.rows.length === 0) {
      // Insert
      result = await query(
        `INSERT INTO company_settings (
          company_name, display_name, registration_number, vat_number, tax_number,
          email, phone, website, address_line1, address_line2, city, postal_code, country,
          logo_url, logo_data, currency, date_format, timezone, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          company_name, display_name, registration_number, vat_number, tax_number,
          email, phone, website, address_line1, address_line2, city, postal_code, country,
          logo_url, logo_data, currency, date_format, timezone
        ]
      );
    } else {
      // Update
      result = await query(
        `UPDATE company_settings SET
          company_name = $1, display_name = $2, registration_number = $3, vat_number = $4, tax_number = $5,
          email = $6, phone = $7, website = $8, address_line1 = $9, address_line2 = $10,
          city = $11, postal_code = $12, country = $13, logo_url = $14, logo_data = $15,
          currency = $16, date_format = $17, timezone = $18, updated_at = CURRENT_TIMESTAMP
        WHERE id = $19 RETURNING *`,
        [
          company_name, display_name, registration_number, vat_number, tax_number,
          email, phone, website, address_line1, address_line2, city, postal_code, country,
          logo_url, logo_data, currency, date_format, timezone, existing.rows[0].id
        ]
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('PUT /api/settings/company error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}