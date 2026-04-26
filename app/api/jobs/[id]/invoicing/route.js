import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const { month, amount } = await request.json();
    
    // Insert or update monthly invoicing
    const result = await query(
      `INSERT INTO job_monthly_invoicing (job_id, invoice_month, amount_invoiced)
       VALUES ($1, $2, $3)
       ON CONFLICT (job_id, invoice_month) 
       DO UPDATE SET amount_invoiced = job_monthly_invoicing.amount_invoiced + $3
       RETURNING *`,
      [jobId, month, amount]
    );
    
    // Update job's total invoiced
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
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error recording monthly invoicing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const result = await query(
      `SELECT * FROM job_monthly_invoicing 
       WHERE job_id = $1 
       ORDER BY invoice_month DESC`,
      [jobId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}