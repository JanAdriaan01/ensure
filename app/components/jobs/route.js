// app/api/jobs/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch all jobs (prioritize approved jobs for management)
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const po_status = searchParams.get('po_status');
    const client_id = searchParams.get('client_id');

    let sql = `
      SELECT 
        j.*,
        c.client_name,
        c.id as client_id
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND j.completion_status = $${paramCount++}`;
      params.push(status);
    }

    if (po_status) {
      sql += ` AND j.po_status = $${paramCount++}`;
      params.push(po_status);
    } else {
      // Default: show approved jobs for management, but also allow filtering
      sql += ` AND j.po_status = 'approved'`;
    }

    if (client_id) {
      sql += ` AND j.client_id = $${paramCount++}`;
      params.push(parseInt(client_id));
    }

    sql += ` ORDER BY j.id DESC`;

    const result = await query(sql, params);
    
    console.log(`Jobs API: Found ${result.rows.length} approved jobs`);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
    
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

// POST - Create a new job manually (not from quote)
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      client_id,
      description,
      site_address,
      po_number,
      po_amount,
      po_date,
      total_budget,
      start_date,
      end_date,
      notes
    } = body;
    
    if (!client_id) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }
    
    // Generate job number (not lc_number)
    const year = new Date().getFullYear();
    const countResult = await query(
      `SELECT COUNT(*) as count FROM jobs WHERE EXTRACT(YEAR FROM created_at) = $1`,
      [year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const job_number = `JOB-${year}-${String(count).padStart(4, '0')}`;
    
    // Determine PO status
    const po_status = po_number ? 'approved' : 'pending';
    const completion_status = 'not_started';
    
    await query('BEGIN');
    
    const result = await query(`
      INSERT INTO jobs (
        job_number, 
        client_id, 
        description, 
        site_address,
        po_number, 
        po_amount, 
        po_date, 
        po_status,
        completion_status,
        total_budget, 
        start_date, 
        end_date, 
        notes,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `, [
      job_number, 
      client_id, 
      description || null, 
      site_address || null,
      po_number || null, 
      po_amount || null, 
      po_date || null, 
      po_status,
      completion_status,
      total_budget || 0, 
      start_date || null, 
      end_date || null, 
      notes || null
    ]);
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Job created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('POST /api/jobs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}