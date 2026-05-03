export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch finalized items for a job
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
        ji.id,
        ji.item_name,
        ji.description,
        ji.quoted_quantity,
        ji.quoted_unit_price,
        (ji.quoted_quantity * ji.quoted_unit_price) as quoted_total,
        ji.actual_quantity,
        ji.actual_cost,
        ji.is_finalized,
        ji.completion_status
      FROM job_items ji
      WHERE ji.job_id = $1 AND ji.is_finalized = TRUE
      ORDER BY ji.id
    `, [jobId]);
    
    const summary = await query(`
      SELECT 
        COALESCE(SUM(ji.quoted_quantity * ji.quoted_unit_price), 0) as total_quoted,
        COALESCE(SUM(ji.actual_cost), 0) as total_actual,
        COUNT(*) as finalized_count
      FROM job_items ji
      WHERE ji.job_id = $1 AND ji.is_finalized = TRUE
    `, [jobId]);
    
    return NextResponse.json({
      items: items.rows,
      summary: summary.rows[0]
    });
  } catch (error) {
    console.error('Error fetching finalized items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}