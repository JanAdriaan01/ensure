// app/api/financial/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Helper function to get financial year range
function getFinancialYearRange(date, startMonth = 3, startDay = 1) {
  const year = date.getFullYear();
  const financialStart = new Date(year, startMonth - 1, startDay);
  
  if (date < financialStart) {
    // Date is in previous financial year
    const start = new Date(year - 1, startMonth - 1, startDay);
    const end = new Date(year, startMonth - 1, startDay - 1);
    return { start, end, label: `${start.getFullYear()}/${end.getFullYear()}` };
  } else {
    // Date is in current financial year
    const start = new Date(year, startMonth - 1, startDay);
    const end = new Date(year + 1, startMonth - 1, startDay - 1);
    return { start, end, label: `${start.getFullYear()}/${end.getFullYear()}` };
  }
}

function getPreviousFinancialYear(date, startMonth = 3, startDay = 1) {
  const current = getFinancialYearRange(date, startMonth, startDay);
  const prevStart = new Date(current.start);
  prevStart.setFullYear(prevStart.getFullYear() - 1);
  const prevEnd = new Date(current.end);
  prevEnd.setFullYear(prevEnd.getFullYear() - 1);
  return { start: prevStart, end: prevEnd, label: `${prevStart.getFullYear()}/${prevEnd.getFullYear()}` };
}

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'current'; // current, previous, custom
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');

    // Get company settings for financial year
    const settingsResult = await query(`
      SELECT financial_year_start_month, financial_year_start_day, currency 
      FROM company_settings 
      WHERE id = 1
    `);

    let fyStartMonth = 3;  // Default to March (South Africa)
    let fyStartDay = 1;

    if (settingsResult.rows.length > 0 && settingsResult.rows[0].financial_year_start_month) {
      fyStartMonth = settingsResult.rows[0].financial_year_start_month;
      fyStartDay = settingsResult.rows[0].financial_year_start_day;
    }

    const now = new Date();
    let startDate, endDate;
    let currentFYRange, previousFYRange;

    // Determine date range based on period
    if (period === 'current') {
      currentFYRange = getFinancialYearRange(now, fyStartMonth, fyStartDay);
      startDate = currentFYRange.start;
      endDate = currentFYRange.end;
    } else if (period === 'previous') {
      previousFYRange = getPreviousFinancialYear(now, fyStartMonth, fyStartDay);
      startDate = previousFYRange.start;
      endDate = previousFYRange.end;
    } else if (period === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else {
      // Default to current financial year
      currentFYRange = getFinancialYearRange(now, fyStartMonth, fyStartDay);
      startDate = currentFYRange.start;
      endDate = currentFYRange.end;
    }

    console.log(`Financial year starts: ${fyStartMonth}/${fyStartDay}`);
    console.log(`Filtering data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get jobs financials for the period
    const jobsResult = await query(`
      SELECT 
        COALESCE(SUM(po_amount), 0) as total_po_amount,
        COALESCE(SUM(total_invoiced), 0) as total_jobs_invoiced,
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN completion_status != 'completed' AND completion_status != 'done' THEN 1 END) as active_jobs,
        COUNT(CASE WHEN completion_status = 'completed' OR completion_status = 'done' THEN 1 END) as completed_jobs
      FROM jobs
      WHERE po_status = 'approved'
        AND created_at BETWEEN $1 AND $2
    `, [startDate, endDate]);

    // Get quotes financials for the period
    const quotesResult = await query(`
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_quotes,
        COUNT(CASE WHEN status = 'approved' OR status = 'accepted' THEN 1 END) as accepted_quotes,
        COALESCE(SUM(CASE WHEN status = 'approved' OR status = 'accepted' THEN total_amount ELSE 0 END), 0) as accepted_quotes_value
      FROM quotes
      WHERE created_at BETWEEN $1 AND $2
    `, [startDate, endDate]);

    // Get invoices financials for the period
    const invoicesResult = await query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_invoiced,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END), 0) as total_pending,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END), 0) as total_overdue,
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count
      FROM invoices
      WHERE issue_date BETWEEN $1 AND $2
    `, [startDate, endDate]);

    // Get clients count
    const clientsResult = await query(`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(*) as active_clients
      FROM clients
    `);

    // Get monthly revenue from paid invoices for the period
    const monthlyResult = await query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', issue_date), 'Mon YYYY') as month_label,
        EXTRACT(MONTH FROM issue_date) as month_num,
        EXTRACT(YEAR FROM issue_date) as year_num,
        DATE_TRUNC('month', issue_date) as month_date,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as invoice_count
      FROM invoices
      WHERE status = 'paid' 
        AND issue_date IS NOT NULL
        AND issue_date BETWEEN $1 AND $2
      GROUP BY DATE_TRUNC('month', issue_date), EXTRACT(MONTH FROM issue_date), EXTRACT(YEAR FROM issue_date)
      ORDER BY month_date ASC
    `, [startDate, endDate]);

    // Get recent invoices for the period
    const recentInvoices = await query(`
      SELECT 
        i.id,
        i.invoice_number,
        i.client_name,
        i.total_amount,
        i.status,
        i.issue_date,
        i.due_date,
        i.created_at
      FROM invoices i
      WHERE i.issue_date BETWEEN $1 AND $2
      ORDER BY i.issue_date DESC, i.created_at DESC
      LIMIT 10
    `, [startDate, endDate]);

    const jobs = jobsResult.rows[0] || {};
    const quotes = quotesResult.rows[0] || {};
    const invoices = invoicesResult.rows[0] || {};
    const clients = clientsResult.rows[0] || {};

    // Calculate derived values
    const totalRevenue = parseFloat(jobs.total_po_amount || 0);
    const totalInvoiced = parseFloat(invoices.total_invoiced || 0);
    const totalPaid = parseFloat(invoices.total_paid || 0);
    const pendingAmount = parseFloat(invoices.total_pending || 0);
    const overdueAmount = parseFloat(invoices.total_overdue || 0);
    const netProfit = totalPaid * 0.3;

    // Format monthly revenue
    const monthlyRevenue = monthlyResult.rows.map(row => ({
      month: row.month_label,
      amount: parseFloat(row.revenue),
      year: parseInt(row.year_num),
      monthNum: parseInt(row.month_num),
      invoiceCount: parseInt(row.invoice_count)
    }));

    // Get comparison data for previous period
    let comparisonData = null;
    if (period === 'current') {
      const previousFYRange = getPreviousFinancialYear(now, fyStartMonth, fyStartDay);
      const previousResult = await query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_paid
        FROM invoices
        WHERE status = 'paid' 
          AND issue_date BETWEEN $1 AND $2
      `, [previousFYRange.start, previousFYRange.end]);
      
      const previousTotalPaid = parseFloat(previousResult.rows[0]?.total_paid || 0);
      const percentageChange = previousTotalPaid > 0 
        ? ((totalPaid - previousTotalPaid) / previousTotalPaid) * 100 
        : 0;
      
      comparisonData = {
        period: previousFYRange.label,
        totalPaid: previousTotalPaid,
        percentageChange: percentageChange
      };
    }

    console.log('Monthly Revenue Data:', monthlyRevenue);

    return NextResponse.json({
      success: true,
      data: {
        period: {
          label: period === 'current' ? currentFYRange?.label : 
                 period === 'previous' ? previousFYRange?.label : 
                 'Custom Range',
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          periodType: period
        },
        comparison: comparisonData,
        overview: {
          totalRevenue,
          totalInvoiced,
          totalPaid,
          pendingAmount,
          overdueAmount,
          netProfit,
        },
        jobs: {
          active: parseInt(jobs.active_jobs || 0),
          completed: parseInt(jobs.completed_jobs || 0),
          totalPoValue: totalRevenue,
          totalJobsInvoiced: parseFloat(jobs.total_jobs_invoiced || 0),
        },
        quotes: {
          pending: parseInt(quotes.pending_quotes || 0),
          accepted: parseInt(quotes.accepted_quotes || 0),
          acceptedValue: parseFloat(quotes.accepted_quotes_value || 0),
        },
        invoices: {
          total: totalInvoiced,
          paid: totalPaid,
          paidCount: parseInt(invoices.paid_count || 0),
          pending: pendingAmount,
          pendingCount: parseInt(invoices.pending_count || 0),
          overdue: overdueAmount,
          overdueCount: parseInt(invoices.overdue_count || 0),
          totalCount: parseInt(invoices.total_invoices || 0),
        },
        clients: {
          total: parseInt(clients.total_clients || 0),
          active: parseInt(clients.active_clients || 0),
        },
        monthlyRevenue: monthlyRevenue,
        recentInvoices: recentInvoices.rows
      }
    });

  } catch (error) {
    console.error('Financial API error:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}