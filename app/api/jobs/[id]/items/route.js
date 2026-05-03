export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch all job items
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    
    const items = await query(`
      SELECT 
        ji.*,
        CASE 
          WHEN ji.actual_cost > (ji.quoted_quantity * ji.quoted_unit_price) THEN TRUE 
          ELSE FALSE 
        END as is_over_budget
      FROM job_items ji
      WHERE ji.job_id = $1
      ORDER BY ji.id
    `, [jobId]);
    
    const summary = await query(`
      SELECT 
        COALESCE(SUM(ji.quoted_quantity * ji.quoted_unit_price), 0) as total_quoted,
        COALESCE(SUM(ji.actual_cost), 0) as total_actual,
        COUNT(CASE WHEN ji.is_finalized = TRUE THEN 1 END) as finalized_count,
        COUNT(CASE WHEN ji.completion_status = 'completed' THEN 1 END) as completed_count
      FROM job_items ji
      WHERE ji.job_id = $1
    `, [jobId]);
    
    return NextResponse.json({
      items: items.rows,
      summary: summary.rows[0]
    });
  } catch (error) {
    console.error('Error fetching job items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new job item
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const { item_name, description, quoted_quantity, quoted_unit_price, item_type } = await request.json();
    
    if (!item_name || !quoted_quantity || !quoted_unit_price) {
      return NextResponse.json({ error: 'Item name, quantity, and price are required' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO job_items (
        job_id, item_name, description, quoted_quantity, 
        quoted_unit_price, item_type, completion_status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *`,
      [jobId, item_name, description, quoted_quantity, quoted_unit_price, item_type || 'service']
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating job item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}