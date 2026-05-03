export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all settings (company, quote, system)
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'settings:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get company settings
    const companyResult = await query(`SELECT * FROM company_settings LIMIT 1`);
    const company = companyResult.rows[0] || null;

    // Get quote settings
    const quoteResult = await query(`SELECT * FROM quote_settings LIMIT 1`);
    const quoteSettings = quoteResult.rows[0] || null;

    // Get default terms template
    const termsResult = await query(
      `SELECT id, name, slug, content FROM terms_templates WHERE is_default = TRUE LIMIT 1`
    );
    const defaultTerms = termsResult.rows[0] || null;

    // Get system info
    const systemInfo = {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database_connected: true,
      last_backup: null
    };

    return NextResponse.json({
      success: true,
      data: {
        company,
        quote: quoteSettings,
        default_terms: defaultTerms,
        system: systemInfo
      }
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update multiple settings
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(auth.role, 'settings:edit')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { company, quote } = body;

    await query('BEGIN');

    // Update company settings
    if (company) {
      const existingCompany = await query(`SELECT id FROM company_settings LIMIT 1`);
      
      if (existingCompany.rows.length === 0) {
        await query(
          `INSERT INTO company_settings (
            company_name, display_name, registration_number, vat_number, tax_number,
            email, phone, website, address_line1, address_line2, city, postal_code, country,
            logo_url, logo_data, currency, date_format, timezone, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())`,
          [
            company.company_name,
            company.display_name,
            company.registration_number,
            company.vat_number,
            company.tax_number,
            company.email,
            company.phone,
            company.website,
            company.address_line1,
            company.address_line2,
            company.city,
            company.postal_code,
            company.country,
            company.logo_url,
            company.logo_data,
            company.currency || 'ZAR',
            company.date_format || 'DD/MM/YYYY',
            company.timezone || 'Africa/Johannesburg'
          ]
        );
      } else {
        await query(
          `UPDATE company_settings SET
            company_name = COALESCE($1, company_name),
            display_name = COALESCE($2, display_name),
            registration_number = COALESCE($3, registration_number),
            vat_number = COALESCE($4, vat_number),
            tax_number = COALESCE($5, tax_number),
            email = COALESCE($6, email),
            phone = COALESCE($7, phone),
            website = COALESCE($8, website),
            address_line1 = COALESCE($9, address_line1),
            address_line2 = COALESCE($10, address_line2),
            city = COALESCE($11, city),
            postal_code = COALESCE($12, postal_code),
            country = COALESCE($13, country),
            logo_url = COALESCE($14, logo_url),
            logo_data = COALESCE($15, logo_data),
            currency = COALESCE($16, currency),
            date_format = COALESCE($17, date_format),
            timezone = COALESCE($18, timezone),
            updated_at = NOW()
          WHERE id = $19`,
          [
            company.company_name,
            company.display_name,
            company.registration_number,
            company.vat_number,
            company.tax_number,
            company.email,
            company.phone,
            company.website,
            company.address_line1,
            company.address_line2,
            company.city,
            company.postal_code,
            company.country,
            company.logo_url,
            company.logo_data,
            company.currency || 'ZAR',
            company.date_format || 'DD/MM/YYYY',
            company.timezone || 'Africa/Johannesburg',
            existingCompany.rows[0].id
          ]
        );
      }
    }

    // Update quote settings
    if (quote) {
      const existingQuote = await query(`SELECT id FROM quote_settings LIMIT 1`);
      
      if (existingQuote.rows.length === 0) {
        await query(
          `INSERT INTO quote_settings (
            default_vat_rate, default_valid_days, quote_prefix, quote_footer, 
            show_logo, show_company_details, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            quote.default_vat_rate || 15,
            quote.default_valid_days || 30,
            quote.quote_prefix || 'Q',
            quote.quote_footer,
            quote.show_logo !== false,
            quote.show_company_details !== false
          ]
        );
      } else {
        await query(
          `UPDATE quote_settings SET
            default_vat_rate = COALESCE($1, default_vat_rate),
            default_valid_days = COALESCE($2, default_valid_days),
            quote_prefix = COALESCE($3, quote_prefix),
            quote_footer = COALESCE($4, quote_footer),
            show_logo = COALESCE($5, show_logo),
            show_company_details = COALESCE($6, show_company_details),
            updated_at = NOW()
          WHERE id = $7`,
          [
            quote.default_vat_rate,
            quote.default_valid_days,
            quote.quote_prefix,
            quote.quote_footer,
            quote.show_logo,
            quote.show_company_details,
            existingQuote.rows[0].id
          ]
        );
      }
    }

    await query('COMMIT');

    // Fetch updated settings
    const updatedCompany = await query(`SELECT * FROM company_settings LIMIT 1`);
    const updatedQuote = await query(`SELECT * FROM quote_settings LIMIT 1`);

    return NextResponse.json({
      success: true,
      data: {
        company: updatedCompany.rows[0] || null,
        quote: updatedQuote.rows[0] || null
      },
      message: 'Settings updated successfully'
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Reset settings to defaults
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { section } = await request.json();

    await query('BEGIN');

    if (section === 'company' || !section) {
      // Reset company settings to defaults
      await query(`
        UPDATE company_settings SET
          company_name = 'Your Company Name',
          display_name = 'YOUR COMPANY',
          registration_number = '',
          vat_number = '',
          tax_number = '',
          email = '',
          phone = '',
          website = '',
          address_line1 = '',
          address_line2 = '',
          city = '',
          postal_code = '',
          country = 'South Africa',
          logo_url = NULL,
          logo_data = NULL,
          currency = 'ZAR',
          date_format = 'DD/MM/YYYY',
          timezone = 'Africa/Johannesburg',
          updated_at = NOW()
      `);
    }

    if (section === 'quote' || !section) {
      // Reset quote settings to defaults
      await query(`
        UPDATE quote_settings SET
          default_vat_rate = 15,
          default_valid_days = 30,
          quote_prefix = 'Q',
          quote_footer = NULL,
          show_logo = TRUE,
          show_company_details = TRUE,
          updated_at = NOW()
      `);
    }

    await query('COMMIT');

    return NextResponse.json({
      success: true,
      message: `${section || 'All'} settings reset to defaults successfully`
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error resetting settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}