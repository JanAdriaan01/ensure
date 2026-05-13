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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    // Get recent transactions
    const recentResult = await query(`
      SELECT 
        'invoice' as type,
        id,
        invoice_number as reference,
        total_amount as amount,
        status,
        created_at as date,
        client_name
      FROM invoices
      WHERE status != 'draft'
      UNION ALL
      SELECT 
        'job' as type,
        id,
        job_number as reference,
        po_amount as amount,
        po_status as status,
        created_at as date,
        client_name
      FROM jobs
      WHERE po_status = 'approved'
      UNION ALL
      SELECT 
        'quote' as type,
        id,
        quote_number as reference,
        total_amount as amount,
        status,
        created_at as date,
        client_name
      FROM quotes
      ORDER BY date DESC
      LIMIT 20
    `);

    const invoices = invoicesResult.rows[0] || {};
    const jobs = jobsResult.rows[0] || {};
    const quotes = quotesResult.rows[0] || {};

    // Calculate variances
    const variance = {
      invoiced_vs_po: invoices.total_invoiced - jobs.total_po_value,
      paid_vs_invoiced: invoices.total_paid - invoices.total_invoiced,
      quotes_vs_jobs: quotes.total_quote_value - jobs.total_po_value
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_invoiced: parseFloat(invoices.total_invoiced),
          total_paid: parseFloat(invoices.total_paid),
          total_pending: parseFloat(invoices.total_pending),
          total_overdue: parseFloat(invoices.total_overdue),
          total_po_value: parseFloat(jobs.total_po_value),
          total_quote_value: parseFloat(quotes.total_quote_value),
          invoice_count: parseInt(invoices.invoice_count),
          paid_count: parseInt(invoices.paid_count),
          pending_count: parseInt(invoices.pending_count),
          overdue_count: parseInt(invoices.overdue_count),
          job_count: parseInt(jobs.job_count),
          quote_count: parseInt(quotes.quote_count),
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