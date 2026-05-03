import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active_only = searchParams.get('active_only') === 'true';

    let sql = `SELECT * FROM terms_templates WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (category) {
      sql += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (active_only) {
      sql += ` AND is_active = TRUE`;
    }

    sql += ` ORDER BY sort_order, name`;

    const result = await query(sql, params);

    // Group by category
    const grouped = {};
    for (const template of result.rows) {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    }

    return NextResponse.json({ success: true, data: result.rows, grouped });

  } catch (error) {
    console.error('GET /api/settings/terms error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, category, description, content, is_active, is_default } = body;

    // Check if slug exists
    const existing = await query(`SELECT id FROM terms_templates WHERE slug = $1`, [slug]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'Template with this slug already exists' }, { status: 400 });
    }

    // Get max sort order
    const maxOrder = await query(`SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM terms_templates`);
    const sort_order = maxOrder.rows[0].next_order;

    const result = await query(
      `INSERT INTO terms_templates (name, slug, category, description, content, is_active, is_default, sort_order, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [name, slug, category, description, content, is_active, is_default || false, sort_order, auth.userId]
    );

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });

  } catch (error) {
    console.error('POST /api/settings/terms error:', error);
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
    const { id, name, slug, category, description, content, is_active, is_default } = body;

    const result = await query(
      `UPDATE terms_templates SET
        name = $1, slug = $2, category = $3, description = $4, content = $5,
        is_active = $6, is_default = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, slug, category, description, content, is_active, is_default, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('PUT /api/settings/terms error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    await query(`DELETE FROM terms_templates WHERE id = $1`, [id]);

    return NextResponse.json({ success: true, message: 'Template deleted' });

  } catch (error) {
    console.error('DELETE /api/settings/terms error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}