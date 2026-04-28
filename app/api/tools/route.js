import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import { hasPermission } from '@/app/lib/permissions';

// GET - Fetch all tools
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'tool:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let sqlQuery = `
      SELECT 
        t.*,
        COUNT(tc.id) as checkout_count,
        MAX(CASE WHEN tc.status = 'checked_out' THEN tc.checkout_date END) as last_checkout_date
      FROM tools t
      LEFT JOIN tool_checkouts tc ON t.id = tc.tool_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      sqlQuery += ` AND t.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (category) {
      sqlQuery += ` AND t.category = $${paramIndex++}`;
      params.push(category);
    }
    
    if (search) {
      sqlQuery += ` AND (t.tool_code ILIKE $${paramIndex++} OR t.tool_name ILIKE $${paramIndex++} OR t.serial_number ILIKE $${paramIndex++})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sqlQuery += ` GROUP BY t.id ORDER BY t.tool_name`;
    
    const result = await query(sqlQuery, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new tool
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'tool:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      tool_code,
      tool_name,
      description,
      category,
      serial_number,
      condition = 'good',
      purchase_date,
      purchase_cost,
      location,
    } = body;
    
    if (!tool_code || !tool_name) {
      return NextResponse.json(
        { error: 'Tool code and name are required' },
        { status: 400 }
      );
    }
    
    // Check if tool code exists
    const existing = await query(
      'SELECT id FROM tools WHERE tool_code = $1',
      [tool_code]
    );
    
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'Tool code already exists' },
        { status: 409 }
      );
    }
    
    const result = await query(
      `INSERT INTO tools (
        tool_code, tool_name, description, category, serial_number,
        condition, status, purchase_date, purchase_cost, location, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'available', $7, $8, $9, NOW())
      RETURNING *`,
      [
        tool_code, tool_name, description || null, category || null,
        serial_number || null, condition, purchase_date || null,
        purchase_cost || 0, location || null
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}