// app/api/jobs/[id]/stock/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }
    
    // Check if job exists
    const jobCheck = await query(`SELECT id FROM jobs WHERE id = $1`, [jobId]);
    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Get all stock items for this job
    const result = await query(`
      SELECT 
        js.*,
        si.name as item_name,
        si.sku,
        si.unit as unit_of_measure
      FROM job_stock js
      LEFT JOIN stock_items si ON js.stock_item_id = si.id
      WHERE js.job_id = $1
      ORDER BY js.created_at DESC
    `, [jobId]);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching job stock:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}