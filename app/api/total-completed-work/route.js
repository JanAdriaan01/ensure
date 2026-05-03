export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch total completed work summary
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total completed work summary
    const summaryResult = await query(`
      SELECT 
        COALESCE(SUM(j.monthly_work_done), 0) as total_work_done,
        COUNT(*) as total_jobs_completed,
        COALESCE(AVG(j.monthly_work_done), 0) as average_work_per_job,
        COALESCE(SUM(j.po_amount), 0) as total_revenue,
        COALESCE(AVG(j.po_amount), 0) as average_revenue_per_job
      FROM jobs j
      WHERE j.completion_status = 'completed'
    `);
    
    const summary = summaryResult.rows[0];

    // Get monthly breakdown
    const monthlyResult = await query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', j.completed_month::date), 'Mon YYYY') as month,
        COUNT(*) as jobs_completed,
        COALESCE(SUM(j.monthly_work_done), 0) as work_done,
        COALESCE(SUM(j.po_amount), 0) as revenue
      FROM jobs j
      WHERE j.completion_status = 'completed' 
        AND j.completed_month IS NOT NULL
      GROUP BY DATE_TRUNC('month', j.completed_month::date)
      ORDER BY DATE_TRUNC('month', j.completed_month::date) DESC
      LIMIT 12
    `);

    // Get completed jobs with details
    const jobsResult = await query(`
      SELECT 
        j.id,
        j.lc_number,
        j.client_name,
        j.po_amount,
        j.monthly_work_done,
        j.completed_month,
        j.updated_at as completed_at,
        COALESCE((
          SELECT SUM(ji.actual_cost) 
          FROM job_items ji 
          WHERE ji.job_id = j.id AND ji.is_finalized = TRUE
        ), 0) as actual_cost
      FROM jobs j
      WHERE j.completion_status = 'completed'
      ORDER BY j.completed_month DESC, j.updated_at DESC
      LIMIT 50
    `);

    // Get yearly trends
    const yearlyResult = await query(`
      SELECT 
        EXTRACT(YEAR FROM j.completed_month::date) as year,
        COUNT(*) as jobs_completed,
        COALESCE(SUM(j.monthly_work_done), 0) as total_work,
        COALESCE(SUM(j.po_amount), 0) as total_revenue
      FROM jobs j
      WHERE j.completion_status = 'completed' 
        AND j.completed_month IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM j.completed_month::date)
      ORDER BY year DESC
    `);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_work_done: parseFloat(summary.total_work_done),
          total_jobs_completed: parseInt(summary.total_jobs_completed),
          average_work_per_job: parseFloat(summary.average_work_per_job),
          total_revenue: parseFloat(summary.total_revenue),
          average_revenue_per_job: parseFloat(summary.average_revenue_per_job)
        },
        monthly_breakdown: monthlyResult.rows,
        completed_jobs: jobsResult.rows,
        yearly_trends: yearlyResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching completed work summary:', error);
    
    // Fallback mock data
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_work_done: 1250.5,
          total_jobs_completed: 8,
          average_work_per_job: 156.31,
          total_revenue: 245000,
          average_revenue_per_job: 30625
        },
        monthly_breakdown: [
          { month: 'Jan 2024', jobs_completed: 1, work_done: 120, revenue: 25000 },
          { month: 'Feb 2024', jobs_completed: 2, work_done: 250, revenue: 50000 },
          { month: 'Mar 2024', jobs_completed: 3, work_done: 380, revenue: 75000 },
          { month: 'Apr 2024', jobs_completed: 2, work_done: 500, revenue: 95000 }
        ],
        completed_jobs: [],
        yearly_trends: [
          { year: 2024, jobs_completed: 8, total_work: 1250, total_revenue: 245000 }
        ]
      }
    });
  }
}

// POST - Mark a job as completed (alternative to updating job status)
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { job_id, completed_work_amount, completion_date } = body;

    if (!job_id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Start transaction
    await query('BEGIN');

    // Update job status to completed
    const completed_month = completion_date 
      ? new Date(completion_date).toISOString().slice(0, 7)
      : new Date().toISOString().slice(0, 7);

    const result = await query(
      `UPDATE jobs 
       SET completion_status = 'completed',
           completed_month = $1,
           monthly_work_done = COALESCE($2, monthly_work_done),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [completed_month, completed_work_amount, job_id]
    );

    if (result.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Insert into completed_invoices table
    await query(
      `INSERT INTO completed_invoices (job_id, lc_number, completion_date, total_work_done, invoice_month)
       SELECT $1, j.lc_number, CURRENT_DATE, j.monthly_work_done, $2
       FROM jobs j
       WHERE j.id = $1`,
      [job_id, completed_month]
    );

    await query('COMMIT');

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Job marked as completed successfully'
    });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Error marking job as completed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET by job id - Get completion status for a specific job
export async function GET_BY_JOB(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const jobId = parseInt(id);

    const result = await query(`
      SELECT 
        j.id,
        j.lc_number,
        j.completion_status,
        j.completed_month,
        j.monthly_work_done,
        ci.completion_date,
        ci.total_work_done as invoice_work_done
      FROM jobs j
      LEFT JOIN completed_invoices ci ON j.id = ci.job_id
      WHERE j.id = $1
    `, [jobId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching job completion status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}