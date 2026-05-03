export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch invoices for a job
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    
    const invoices = await query(`
      SELECT 
        i.*,
        COUNT(ili.id) as line_items_count
      FROM invoices i
      LEFT JOIN invoice_line_items ili ON i.id = ili.invoice_id
      WHERE i.job_id = $1
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `, [jobId]);
    
    return NextResponse.json(invoices.rows);
  } catch (error) {
    console.error('Error fetching job invoices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create invoice for job
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const { invoice_number, invoice_date, due_date, total_amount, notes } = await request.json();
    
    if (!invoice_number || !total_amount) {
      return NextResponse.json({ error: 'Invoice number and amount are required' }, { status: 400 });
    }
    
    const result = await query(
      `INSERT INTO invoices (job_id, invoice_number, invoice_date, due_date, total_amount, notes, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_DATE)
       RETURNING *`,
      [jobId, invoice_number, invoice_date, due_date, total_amount, notes]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating job invoice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}