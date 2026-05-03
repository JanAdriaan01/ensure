export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch all jobs
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      SELECT 
        j.*,
        c.name as client_name,
        q.quote_number,
        COALESCE(SUM(ji.quoted_quantity * ji.quoted_unit_price), 0) as total_quoted,
        COALESCE(SUM(ji.actual_cost), 0) as total_actual
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN quotes q ON j.quote_id = q.id
      LEFT JOIN job_items ji ON j.id = ji.job_id
      GROUP BY j.id, c.name, q.quote_number
      ORDER BY j.id DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - Create new job
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lc_number, client_id, po_status, completion_status, po_amount, quote_id } = body;
    
    const result = await query(
      `INSERT INTO jobs (lc_number, client_id, po_status, completion_status, po_amount, quote_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [lc_number, client_id, po_status || 'pending', completion_status || 'not_started', po_amount || 0, quote_id || null]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update job status
export async function PUT(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const { completion_status, po_status } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    let updateFields = [];
    let values = [];
    
    if (completion_status !== undefined) {
      updateFields.push(`completion_status = $${updateFields.length + 1}`);
      values.push(completion_status);
    }
    if (po_status !== undefined) {
      updateFields.push(`po_status = $${updateFields.length + 1}`);
      values.push(po_status);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    values.push(id);
    const result = await query(
      `UPDATE jobs SET ${updateFields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete job
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }
    
    await query('DELETE FROM jobs WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}