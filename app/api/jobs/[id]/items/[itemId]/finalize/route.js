export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// POST - Finalize a job item
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
    const jobId = parseInt(id);
    const itemIdNum = parseInt(itemId);
    const { actual_quantity, actual_cost } = await request.json();
    
    if (!actual_quantity || !actual_cost) {
      return NextResponse.json({ error: 'Actual quantity and cost are required' }, { status: 400 });
    }
    
    await query('BEGIN');
    
    // Update job item
    const result = await query(
      `UPDATE job_items 
       SET actual_quantity = $1,
           actual_cost = $2,
           is_finalized = TRUE,
           completion_status = 'completed',
           finalized_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND job_id = $4
       RETURNING *`,
      [actual_quantity, actual_cost, itemIdNum, jobId]
    );
    
    if (result.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Update job totals
    await query(
      `UPDATE jobs 
       SET total_actual = (
         SELECT COALESCE(SUM(actual_cost), 0)
         FROM job_items
         WHERE job_id = $1 AND is_finalized = TRUE
       )
       WHERE id = $1`,
      [jobId]
    );
    
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      item: result.rows[0],
      message: 'Item finalized successfully'
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error finalizing item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Check if item can be finalized
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
    const jobId = parseInt(id);
    const itemIdNum = parseInt(itemId);
    
    const item = await query(
      `SELECT * FROM job_items WHERE id = $1 AND job_id = $2`,
      [itemIdNum, jobId]
    );
    
    if (item.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    const canFinalize = !item.rows[0].is_finalized;
    
    return NextResponse.json({
      can_finalize: canFinalize,
      item: item.rows[0]
    });
  } catch (error) {
    console.error('Error checking finalize status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}