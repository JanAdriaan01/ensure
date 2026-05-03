// app/api/jobs/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch all jobs with filtering
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const po_status = searchParams.get('po_status');
    const client_id = searchParams.get('client_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT 
        j.*,
        c.client_name,
        c.id as client_id,
        (SELECT COUNT(*) FROM job_tools WHERE job_id = j.id AND status = 'issued') as tools_issued,
        (SELECT COUNT(*) FROM job_team WHERE job_id = j.id AND status = 'assigned') as team_assigned,
        (SELECT COALESCE(SUM(hours), 0) FROM job_payroll WHERE job_id = j.id) as total_hours
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
    }

    if (client_id) {
      sql += ` AND j.client_id = $${paramCount++}`;
      params.push(parseInt(client_id));
    }

    sql += ` ORDER BY j.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM jobs j WHERE 1=1`;
    const countParams = [];
    let countParamCount = 1;
    
    if (status) {
      countSql += ` AND j.completion_status = $${countParamCount++}`;
      countParams.push(status);
    }
    if (po_status) {
      countSql += ` AND j.po_status = $${countParamCount++}`;
      countParams.push(po_status);
    }
    if (client_id) {
      countSql += ` AND j.client_id = $${countParamCount++}`;
      countParams.push(parseInt(client_id));
    }
    
    const countResult = await query(countSql, countParams);
    
    // Get statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN po_status = 'pending' THEN 1 END) as pending_po,
        COUNT(CASE WHEN po_status = 'approved' THEN 1 END) as approved_po,
        COUNT(CASE WHEN completion_status = 'not_started' THEN 1 END) as not_started,
        COUNT(CASE WHEN completion_status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) as completed,
        COALESCE(SUM(total_budget), 0) as total_budget,
        COALESCE(SUM(actual_cost), 0) as actual_cost
      FROM jobs
    `);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      stats: statsResult.rows[0],
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit,
        offset,
        pages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });
    
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
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
    
    // Generate LC number
    const year = new Date().getFullYear();
    const countResult = await query(
      `SELECT COUNT(*) as count FROM jobs WHERE EXTRACT(YEAR FROM created_at) = $1`,
      [year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const lc_number = `LC-${year}-${String(count).padStart(4, '0')}`;
    
    // Determine PO status
    const po_status = po_number ? 'approved' : 'pending';
    
    await query('BEGIN');
    
    const result = await query(`
      INSERT INTO jobs (
        lc_number, client_id, description, site_address,
        po_number, po_amount, po_date, po_status,
        total_budget, start_date, end_date, notes,
        completion_status, actual_cost, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'not_started', 0, $13, NOW(), NOW())
      RETURNING *
    `, [
      lc_number, client_id, description || null, site_address || null,
      po_number || null, po_amount || null, po_date || null, po_status,
      total_budget || 0, start_date || null, end_date || null, notes || null,
      auth.userId
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