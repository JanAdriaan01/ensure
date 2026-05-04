// app/api/jobs/[id]/invoices/route.js
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
    const jobCheck = await query(`SELECT id, po_amount FROM jobs WHERE id = $1`, [jobId]);
    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = jobCheck.rows[0];
    
    // Get all invoices for this job
    const result = await query(`
      SELECT 
        i.*,
        c.client_name,
        (SELECT COUNT(*) FROM invoice_items WHERE invoice_id = i.id) as item_count
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.job_id = $1
      ORDER BY i.invoice_date DESC, i.created_at DESC
    `, [jobId]);
    
    // Calculate invoice summaries
    const summaries = {
      total_invoiced: result.rows.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0),
      total_paid: result.rows.reduce((sum, inv) => sum + (parseFloat(inv.amount_paid) || 0), 0),
      total_outstanding: result.rows.reduce((sum, inv) => sum + ((parseFloat(inv.total_amount) || 0) - (parseFloat(inv.amount_paid) || 0)), 0),
      po_remaining: (parseFloat(job.po_amount) || 0) - result.rows.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0),
      invoice_count: result.rows.length,
      paid_invoices: result.rows.filter(inv => inv.status === 'paid').length,
      unpaid_invoices: result.rows.filter(inv => inv.status === 'unpaid').length,
      partial_invoices: result.rows.filter(inv => inv.status === 'partial').length
    };
    
    // Calculate invoicing progress percentage
    summaries.progress_percentage = job.po_amount > 0 
      ? Math.min(100, Math.round((summaries.total_invoiced / parseFloat(job.po_amount)) * 100))
      : 0;
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      summaries: summaries,
      job_po_amount: job.po_amount
    });
  } catch (error) {
    console.error('Error fetching job invoices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}