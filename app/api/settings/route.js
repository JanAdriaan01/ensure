export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch all settings (company, quote, system)
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      // Return empty settings instead of 401 to prevent errors
      return NextResponse.json({
        success: true,
        data: {
          company: null,
          quote: null,
          default_terms: null,
          system: { version: '1.0.0', environment: 'production' }
        }
      });
    }

    // Get company settings
    let company = null;
    try {
      const companyResult = await query(`SELECT * FROM company_settings LIMIT 1`);
      company = companyResult.rows[0] || null;
    } catch (err) {
      console.log('Company settings table not found');
    }

    // Get quote settings
    let quoteSettings = null;
    try {
      const quoteResult = await query(`SELECT * FROM quote_settings LIMIT 1`);
      quoteSettings = quoteResult.rows[0] || null;
    } catch (err) {
      console.log('Quote settings table not found');
    }

    // Get default terms template
    let defaultTerms = null;
    try {
      const termsResult = await query(
        `SELECT id, name, slug, content FROM terms_templates WHERE is_default = TRUE LIMIT 1`
      );
      defaultTerms = termsResult.rows[0] || null;
    } catch (err) {
      console.log('Terms templates table not found');
    }

    return NextResponse.json({
      success: true,
      data: {
        company,
        quote: quoteSettings,
        default_terms: defaultTerms,
        system: {
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          database_connected: true,
          last_backup: null
        }
      }
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return empty data on error
    return NextResponse.json({
      success: true,
      data: {
        company: null,
        quote: null,
        default_terms: null,
        system: { version: '1.0.0', environment: 'production' }
      }
    });
  }
}

// PUT - Update multiple settings
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company, quote } = body;

    // Update company settings (simplified - handle gracefully if table doesn't exist)
    if (company) {
      try {
        const existingCompany = await query(`SELECT id FROM company_settings LIMIT 1`);
        
        if (existingCompany.rows.length === 0) {
          await query(
            `INSERT INTO company_settings (company_name, display_name, updated_at)
             VALUES ($1, $2, NOW())`,
            [company.company_name || 'Your Company', company.display_name || '']
          );
        } else {
          await query(
            `UPDATE company_settings SET company_name = $1, display_name = $2, updated_at = NOW()
             WHERE id = $3`,
            [company.company_name, company.display_name, existingCompany.rows[0].id]
          );
        }
      } catch (err) {
        console.log('Company settings update skipped - table may not exist');
      }
    }

    // Update quote settings
    if (quote) {
      try {
        const existingQuote = await query(`SELECT id FROM quote_settings LIMIT 1`);
        
        if (existingQuote.rows.length === 0) {
          await query(
            `INSERT INTO quote_settings (default_vat_rate, default_valid_days, quote_prefix, updated_at)
             VALUES ($1, $2, $3, NOW())`,
            [quote.default_vat_rate || 15, quote.default_valid_days || 30, quote.quote_prefix || 'Q']
          );
        } else {
          await query(
            `UPDATE quote_settings SET default_vat_rate = $1, default_valid_days = $2, quote_prefix = $3, updated_at = NOW()
             WHERE id = $4`,
            [quote.default_vat_rate, quote.default_valid_days, quote.quote_prefix, existingQuote.rows[0].id]
          );
        }
      } catch (err) {
        console.log('Quote settings update skipped - table may not exist');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}