import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`SELECT * FROM quote_settings LIMIT 1`);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('GET /api/settings/quote error:', error);
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
    const { default_vat_rate, default_valid_days, quote_prefix, quote_footer, show_logo, show_company_details } = body;

    const existing = await query(`SELECT id FROM quote_settings LIMIT 1`);
    
    let result;
    if (existing.rows.length === 0) {
      result = await query(
        `INSERT INTO quote_settings (default_vat_rate, default_valid_days, quote_prefix, quote_footer, show_logo, show_company_details, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         RETURNING *`,
        [default_vat_rate, default_valid_days, quote_prefix, quote_footer, show_logo, show_company_details]
      );
    } else {
      result = await query(
        `UPDATE quote_settings SET
          default_vat_rate = $1, default_valid_days = $2, quote_prefix = $3,
          quote_footer = $4, show_logo = $5, show_company_details = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 RETURNING *`,
        [default_vat_rate, default_valid_days, quote_prefix, quote_footer, show_logo, show_company_details, existing.rows[0].id]
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('PUT /api/settings/quote error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}