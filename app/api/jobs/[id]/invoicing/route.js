export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Get monthly invoicing summary for job
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    
    const summary = await query(`
      SELECT 
        COALESCE(SUM(amount_invoiced), 0) as total_invoiced,
        COUNT(*) as monthly_entries
      FROM job_monthly_invoicing
      WHERE job_id = $1
    `, [jobId]);
    
    const monthly = await query(`
      SELECT 
        invoice_month,
        amount_invoiced
      FROM job_monthly_invoicing
      WHERE job_id = $1
      ORDER BY invoice_month DESC
    `, [jobId]);
    
    return NextResponse.json({
      summary: summary.rows[0],
      monthly: monthly.rows
    });
  } catch (error) {
    console.error('Error fetching monthly invoicing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add monthly invoicing
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const { invoice_month, amount_invoiced } = await request.json();
    
    if (!invoice_month || !amount_invoiced) {
      return NextResponse.json({ error: 'Month and amount are required' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO job_monthly_invoicing (job_id, invoice_month, amount_invoiced)
       VALUES ($1, $2, $3)
       ON CONFLICT (job_id, invoice_month) 
       DO UPDATE SET amount_invoiced = job_monthly_invoicing.amount_invoiced + $3
       RETURNING *`,
      [jobId, invoice_month, amount_invoiced]
    );
    
    // Update job total invoiced
    await query(
      `UPDATE jobs 
       SET total_invoiced = (
         SELECT COALESCE(SUM(amount_invoiced), 0)
         FROM job_monthly_invoicing
         WHERE job_id = $1
       )
       WHERE id = $1`,
      [jobId]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding monthly invoicing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}