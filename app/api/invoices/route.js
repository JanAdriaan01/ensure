// app/api/invoices/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch invoices with optional filters
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const job_id = searchParams.get('job_id');
    const client_id = searchParams.get('client_id');
    
    let sql = `
      SELECT 
        i.*,
        c.client_name,
        j.job_number
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN jobs j ON i.job_id = j.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (status && status !== 'all') {
      sql += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (job_id) {
      sql += ` AND i.job_id = $${paramCount}`;
      params.push(parseInt(job_id));
      paramCount++;
    }
    
    if (client_id) {
      sql += ` AND i.client_id = $${paramCount}`;
      params.push(parseInt(client_id));
      paramCount++;
    }
    
    sql += ` ORDER BY i.created_at DESC`;
    
    const result = await query(sql, params);
    const invoices = result.rows;
    
    // Get stats
    const statsResult = await query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_invoiced,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END), 0) as total_pending,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END), 0) as total_overdue,
        COALESCE(SUM(CASE WHEN status = 'draft' THEN total_amount ELSE 0 END), 0) as total_draft,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as count_paid,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as count_pending,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as count_overdue,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as count_draft
      FROM invoices
    `);
    
    const stats = statsResult.rows[0] || {};

    // Get available jobs for new invoices (jobs with remaining balance)
    const availableJobs = await query(`
      SELECT 
        j.id,
        j.job_number,
        j.client_id,
        c.client_name,
        j.po_amount,
        COALESCE(j.total_invoiced, 0) as total_invoiced,
        (j.po_amount - COALESCE(j.total_invoiced, 0)) as available_balance
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      WHERE j.po_status = 'approved' 
        AND j.po_amount > COALESCE(j.total_invoiced, 0)
      ORDER BY j.job_number
    `);
    
    return NextResponse.json({
      success: true,
      data: invoices,
      stats: stats,
      available_jobs: availableJobs.rows,
      total: invoices.length
    });
    
  } catch (error) {
    console.error('GET /api/invoices error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      data: []
    }, { status: 500 });
  }
}

// POST - Create new invoice with job validation
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      client_id, 
      job_id, 
      amount, 
      vat_rate = 15,
      issue_date,
      due_date,
      notes 
    } = body;
    
    // Validate job has available funds
    const jobCheck = await query(`
      SELECT 
        id, 
        po_amount, 
        COALESCE(total_invoiced, 0) as total_invoiced,
        client_id
      FROM jobs 
      WHERE id = $1 AND po_status = 'approved'
    `, [job_id]);
    
    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Job not found or not approved for invoicing' 
      }, { status: 400 });
    }
    
    const job = jobCheck.rows[0];
    const availableBalance = parseFloat(job.po_amount) - parseFloat(job.total_invoiced);
    
    if (amount > availableBalance) {
      return NextResponse.json({ 
        error: `Amount exceeds available balance. Available: ${availableBalance}` 
      }, { status: 400 });
    }
    
    // Calculate amounts
    const vat_amount = (amount * vat_rate) / 100;
    const total_amount = amount + vat_amount;
    
    // Generate invoice number
    const year = new Date().getFullYear();
    const countResult = await query(
      `SELECT COUNT(*) as count FROM invoices WHERE EXTRACT(YEAR FROM created_at) = $1`,
      [year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const invoice_number = `INV-${year}-${String(count).padStart(4, '0')}`;
    
    // Get client name and job number
    let client_name = null;
    let job_number = null;
    
    if (client_id) {
      const clientResult = await query(`SELECT client_name FROM clients WHERE id = $1`, [client_id]);
      if (clientResult.rows[0]) client_name = clientResult.rows[0].client_name;
    }
    
    if (job_id) {
      const jobResult = await query(`SELECT job_number FROM jobs WHERE id = $1`, [job_id]);
      if (jobResult.rows[0]) job_number = jobResult.rows[0].job_number;
    }
    
    await query('BEGIN');
    
    const result = await query(
      `INSERT INTO invoices (
        invoice_number, client_id, client_name, job_id, job_number,
        amount, vat_rate, vat_amount, total_amount, status,
        issue_date, due_date, notes, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        invoice_number, client_id, client_name, job_id, job_number,
        amount, vat_rate, vat_amount, total_amount,
        issue_date, due_date, notes, auth.userId
      ]
    );
    
    // Update job total_invoiced
    const newTotalInvoiced = parseFloat(job.total_invoiced) + total_amount;
    const remainingBalance = parseFloat(job.po_amount) - newTotalInvoiced;
    const progressPercentage = (newTotalInvoiced / parseFloat(job.po_amount)) * 100;
    
    await query(`
      UPDATE jobs 
      SET total_invoiced = $1, 
          remaining_balance = $2,
          invoicing_progress = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [newTotalInvoiced, remainingBalance, progressPercentage, job_id]);
    
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('POST /api/invoices error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update invoice (mark as paid, update status)
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, paid_date } = body;
    
    // Get current invoice
    const currentResult = await query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    if (currentResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 });
    }
    
    const currentInvoice = currentResult.rows[0];
    
    await query('BEGIN');
    
    const updates = [];
    const params = [];
    let paramCount = 1;
    
    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }
    
    if (paid_date) {
      updates.push(`paid_date = $${paramCount}`);
      params.push(paid_date);
      paramCount++;
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);
    
    const result = await query(
      `UPDATE invoices SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );
    
    // If marking as paid, update job payment tracking
    if (status === 'paid' && currentInvoice.status !== 'paid') {
      // Get job and update total_paid/remaining_balance
      const jobResult = await query(`
        SELECT 
          id, 
          total_paid, 
          remaining_balance,
          po_amount
        FROM jobs 
        WHERE id = $1
      `, [currentInvoice.job_id]);
      
      if (jobResult.rows.length > 0) {
        const job = jobResult.rows[0];
        const newTotalPaid = parseFloat(job.total_paid || 0) + parseFloat(currentInvoice.total_amount);
        const newRemainingBalance = parseFloat(job.po_amount) - newTotalPaid;
        
        await query(`
          UPDATE jobs 
          SET total_paid = $1, 
              remaining_balance = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [newTotalPaid, newRemainingBalance, currentInvoice.job_id]);
      }
    }
    
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('PUT /api/invoices error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete invoice (only draft status)
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Check if invoice exists and is draft
    const checkResult = await query(`SELECT status, job_id, total_amount FROM invoices WHERE id = $1`, [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 });
    }
    
    const invoice = checkResult.rows[0];
    
    if (invoice.status !== 'draft' && invoice.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: 'Only draft or pending invoices can be deleted'
      }, { status: 400 });
    }
    
    await query('BEGIN');
    
    // If invoice was linked to job, reduce total_invoiced
    if (invoice.job_id && invoice.status !== 'draft') {
      const jobResult = await query(`SELECT total_invoiced FROM jobs WHERE id = $1`, [invoice.job_id]);
      if (jobResult.rows.length > 0) {
        const newTotalInvoiced = parseFloat(jobResult.rows[0].total_invoiced || 0) - parseFloat(invoice.total_amount);
        await query(`
          UPDATE jobs 
          SET total_invoiced = $1 
          WHERE id = $2
        `, [Math.max(0, newTotalInvoiced), invoice.job_id]);
      }
    }
    
    await query(`DELETE FROM invoices WHERE id = $1`, [id]);
    await query('COMMIT');
    
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('DELETE /api/invoices error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}