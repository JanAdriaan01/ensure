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
        c.name as client_name,
        j.lc_number as job_number
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
    
    const stats = statsResult.rows[0] || {
      total_invoiced: 0,
      total_paid: 0,
      total_pending: 0,
      total_overdue: 0,
      total_draft: 0,
      count_paid: 0,
      count_pending: 0,
      count_overdue: 0,
      count_draft: 0
    };
    
    return NextResponse.json({
      success: true,
      data: invoices,
      stats: stats,
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

// POST - Create new invoice
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
      const clientResult = await query(`SELECT name FROM clients WHERE id = $1`, [client_id]);
      if (clientResult.rows[0]) client_name = clientResult.rows[0].name;
    }
    
    if (job_id) {
      const jobResult = await query(`SELECT lc_number FROM jobs WHERE id = $1`, [job_id]);
      if (jobResult.rows[0]) job_number = jobResult.rows[0].lc_number;
    }
    
    const result = await query(
      `INSERT INTO invoices (
        invoice_number, client_id, client_name, job_id, job_number,
        amount, vat_rate, vat_amount, total_amount, status,
        issue_date, due_date, notes, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        invoice_number, client_id, client_name, job_id, job_number,
        amount, vat_rate, vat_amount, total_amount, 'draft',
        issue_date, due_date, notes, auth.userId
      ]
    );
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 });
    
  } catch (error) {
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
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
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
    const checkResult = await query(`SELECT status FROM invoices WHERE id = $1`, [id]);
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 });
    }
    
    if (checkResult.rows[0].status !== 'draft') {
      return NextResponse.json({
        success: false,
        error: 'Only draft invoices can be deleted'
      }, { status: 400 });
    }
    
    await query(`DELETE FROM invoices WHERE id = $1`, [id]);
    
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
    
  } catch (error) {
    console.error('DELETE /api/invoices error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}