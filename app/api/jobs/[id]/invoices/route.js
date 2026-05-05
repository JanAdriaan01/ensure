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
    const jobCheck = await query(`
      SELECT 
        id, 
        po_amount, 
        COALESCE(total_invoiced, 0) as total_invoiced,
        COALESCE(total_paid, 0) as total_paid,
        COALESCE(invoicing_progress, 0) as invoicing_progress
      FROM jobs 
      WHERE id = $1
    `, [jobId]);
    
    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = jobCheck.rows[0];
    
    // Get all invoices for this job
    const result = await query(`
      SELECT 
        i.*,
        c.client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.job_id = $1
      ORDER BY i.issue_date DESC, i.created_at DESC
    `, [jobId]);
    
    // Calculate invoice summaries
    const summaries = {
      total_invoiced: parseFloat(job.total_invoiced) || 0,
      total_paid: parseFloat(job.total_paid) || 0,
      total_outstanding: (parseFloat(job.total_invoiced) || 0) - (parseFloat(job.total_paid) || 0),
      po_amount: parseFloat(job.po_amount) || 0,
      po_remaining: (parseFloat(job.po_amount) || 0) - (parseFloat(job.total_invoiced) || 0),
      invoice_count: result.rows.length,
      paid_invoices: result.rows.filter(inv => inv.status === 'paid').length,
      pending_invoices: result.rows.filter(inv => inv.status === 'pending').length,
      progress_percentage: parseFloat(job.invoicing_progress) || 0
    };
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      summaries: summaries
    });
  } catch (error) {
    console.error('Error fetching job invoices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}