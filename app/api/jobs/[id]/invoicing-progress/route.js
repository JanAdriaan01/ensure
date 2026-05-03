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
    
    // Get job details
    const jobResult = await query(`
      SELECT j.*, 
             COALESCE(SUM(i.total_amount), 0) as total_invoiced,
             COUNT(i.id) as invoice_count
      FROM jobs j
      LEFT JOIN invoices i ON j.id = i.job_id AND i.status != 'cancelled'
      WHERE j.id = $1
      GROUP BY j.id
    `, [jobId]);
    
    if (jobResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = jobResult.rows[0];
    const progress = job.po_amount > 0 ? (job.total_invoiced / job.po_amount) * 100 : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        job_id: job.id,
        lc_number: job.lc_number,
        po_amount: job.po_amount,
        total_invoiced: job.total_invoiced,
        remaining_to_invoice: job.po_amount - job.total_invoiced,
        invoicing_progress: Math.min(progress, 100),
        invoice_count: job.invoice_count,
        can_invoice: job.po_amount > 0 && job.total_invoiced < job.po_amount,
        is_complete: job.total_invoiced >= job.po_amount
      }
    });
  } catch (error) {
    console.error('Error fetching invoicing progress:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const { amount_invoiced, invoice_number, invoice_date, due_date } = await request.json();
    
    if (!amount_invoiced || amount_invoiced <= 0) {
      return NextResponse.json({ error: 'Valid invoice amount is required' }, { status: 400 });
    }
    
    // Get job details
    const jobResult = await query(`SELECT po_amount, total_invoiced FROM jobs WHERE id = $1`, [jobId]);
    if (jobResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = jobResult.rows[0];
    const newTotalInvoiced = (job.total_invoiced || 0) + amount_invoiced;
    
    if (newTotalInvoiced > job.po_amount) {
      return NextResponse.json({ error: 'Cannot invoice more than the PO amount' }, { status: 400 });
    }
    
    // Generate invoice number if not provided
    const finalInvoiceNumber = invoice_number || `INV-${new Date().getFullYear()}-${Date.now()}`;
    
    // Create invoice
    const invoiceResult = await query(
      `INSERT INTO invoices (
        invoice_number, job_id, total_amount, status, issue_date, due_date, created_at
      ) VALUES ($1, $2, $3, 'sent', $4, $5, NOW())
      RETURNING *`,
      [finalInvoiceNumber, jobId, amount_invoiced, invoice_date || new Date().toISOString().split('T')[0], due_date || null]
    );
    
    // Update job total invoiced
    await query(
      `UPDATE jobs SET total_invoiced = $1, updated_at = NOW() WHERE id = $2`,
      [newTotalInvoiced, jobId]
    );
    
    const progress = (newTotalInvoiced / job.po_amount) * 100;
    const isComplete = newTotalInvoiced >= job.po_amount;
    
    return NextResponse.json({
      success: true,
      data: {
        invoice: invoiceResult.rows[0],
        total_invoiced: newTotalInvoiced,
        invoicing_progress: progress,
        remaining: job.po_amount - newTotalInvoiced,
        is_complete: isComplete
      },
      message: isComplete ? 'Job fully invoiced!' : `Invoice created. ${progress.toFixed(1)}% complete`
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}