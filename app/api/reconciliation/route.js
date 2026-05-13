// app/api/reconciliation/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Get invoices data
    const invoicesResult = await query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_invoiced,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END), 0) as total_pending,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END), 0) as total_overdue,
        COUNT(*) as invoice_count,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
      FROM invoices
      WHERE status != 'draft'
    `);

    // Get jobs data (PO amounts)
    const jobsResult = await query(`
      SELECT 
        COALESCE(SUM(po_amount), 0) as total_po_value,
        COUNT(*) as job_count,
        COUNT(CASE WHEN po_status = 'approved' THEN 1 END) as approved_jobs,
        COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) as completed_jobs
      FROM jobs
      WHERE po_status = 'approved'
    `);

    // Get quotes data
    const quotesResult = await query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_quote_value,
        COUNT(*) as quote_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_quotes,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_quotes
      FROM quotes
    `);

    // Get monthly reconciliation data
    const monthlyResult = await query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
        EXTRACT(MONTH FROM created_at) as month_num,
        EXTRACT(YEAR FROM created_at) as year_num,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_amount,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM invoices
      WHERE status IN ('paid', 'pending')
      GROUP BY DATE_TRUNC('month', created_at), EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at)
      ORDER BY year_num DESC, month_num DESC
      LIMIT 12
    `);

    // Get recent transactions - FIXED: removed client_name from jobs and quotes
    const recentResult = await query(`
      SELECT 
        'invoice' as type,
        i.id,
        i.invoice_number as reference,
        i.total_amount as amount,
        i.status,
        i.created_at as date,
        COALESCE(i.client_name, 'Unknown') as client_name
      FROM invoices i
      WHERE i.status != 'draft'
      
      UNION ALL
      
      SELECT 
        'job' as type,
        j.id,
        j.job_number as reference,
        j.po_amount as amount,
        j.po_status as status,
        j.created_at as date,
        COALESCE(c.client_name, 'Unknown') as client_name
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      WHERE j.po_status = 'approved'
      
      UNION ALL
      
      SELECT 
        'quote' as type,
        q.id,
        q.quote_number as reference,
        q.total_amount as amount,
        q.status,
        q.created_at as date,
        COALESCE(c.client_name, 'Unknown') as client_name
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      
      ORDER BY date DESC
      LIMIT 20
    `);

    const invoices = invoicesResult.rows[0] || {};
    const jobs = jobsResult.rows[0] || {};
    const quotes = quotesResult.rows[0] || {};

    // Calculate variances
    const variance = {
      invoiced_vs_po: (parseFloat(invoices.total_invoiced) || 0) - (parseFloat(jobs.total_po_value) || 0),
      paid_vs_invoiced: (parseFloat(invoices.total_paid) || 0) - (parseFloat(invoices.total_invoiced) || 0),
      quotes_vs_jobs: (parseFloat(quotes.total_quote_value) || 0) - (parseFloat(jobs.total_po_value) || 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_invoiced: parseFloat(invoices.total_invoiced) || 0,
          total_paid: parseFloat(invoices.total_paid) || 0,
          total_pending: parseFloat(invoices.total_pending) || 0,
          total_overdue: parseFloat(invoices.total_overdue) || 0,
          total_po_value: parseFloat(jobs.total_po_value) || 0,
          total_quote_value: parseFloat(quotes.total_quote_value) || 0,
          invoice_count: parseInt(invoices.invoice_count) || 0,
          paid_count: parseInt(invoices.paid_count) || 0,
          pending_count: parseInt(invoices.pending_count) || 0,
          overdue_count: parseInt(invoices.overdue_count) || 0,
          job_count: parseInt(jobs.job_count) || 0,
          quote_count: parseInt(quotes.quote_count) || 0,
          variance: variance
        },
        monthly: monthlyResult.rows,
        recent: recentResult.rows
      }
    });

  } catch (error) {
    console.error('Reconciliation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}