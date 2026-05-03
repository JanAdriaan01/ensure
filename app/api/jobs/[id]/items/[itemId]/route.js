export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch single job item
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
    const jobId = parseInt(id);
    const itemIdNum = parseInt(itemId);
    
    const result = await query(
      `SELECT * FROM job_items WHERE id = $1 AND job_id = $2`,
      [itemIdNum, jobId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching job item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update job item
export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
    const jobId = parseInt(id);
    const itemIdNum = parseInt(itemId);
    const { quoted_quantity, quoted_unit_price, description, revision_reason } = await request.json();
    
    if (!quoted_quantity || !quoted_unit_price) {
      return NextResponse.json({ error: 'Quantity and price are required' }, { status: 400 });
    }
    
    // Get current revision number
    const current = await query(`SELECT revision_number FROM job_items WHERE id = $1`, [itemIdNum]);
    const newRevision = (current.rows[0]?.revision_number || 1) + 1;
    
    const result = await query(
      `UPDATE job_items 
       SET quoted_quantity = $1,
           quoted_unit_price = $2,
           description = COALESCE($3, description),
           revision_number = $4,
           revision_reason = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND job_id = $7
       RETURNING *`,
      [quoted_quantity, quoted_unit_price, description, newRevision, revision_reason, itemIdNum, jobId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating job item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete job item
export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
    const jobId = parseInt(id);
    const itemIdNum = parseInt(itemId);
    
    const result = await query(
      `DELETE FROM job_items WHERE id = $1 AND job_id = $2 RETURNING id`,
      [itemIdNum, jobId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting job item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}