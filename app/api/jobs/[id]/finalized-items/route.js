import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    
    const items = await query(`
      SELECT 
        ji.id,
        ji.item_name,
        ji.description,
        ji.quoted_quantity,
        ji.quoted_unit_price,
        (ji.quoted_quantity * ji.quoted_unit_price) as quoted_total,
        ji.is_finalized
      FROM job_items ji
      WHERE ji.job_id = $1 AND ji.is_finalized = TRUE
      ORDER BY ji.id
    `, [jobId]);
    
    const summary = await query(`
      SELECT COALESCE(SUM(ji.quoted_quantity * ji.quoted_unit_price), 0) as total_finalized
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