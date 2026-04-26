import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all job items for a specific job
export async function GET(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }
    
    const itemsResult = await query(`
      SELECT 
        ji.*,
        CASE 
          WHEN ji.actual_cost > ji.quoted_total THEN TRUE 
          ELSE FALSE 
        END as is_over_budget
      FROM job_items ji
      WHERE ji.job_id = $1
      ORDER BY ji.id
    `, [jobId]);
    
    // Get summary stats
    const summary = await query(`
      SELECT 
        COALESCE(SUM(ji.quoted_total), 0) as total_quoted,
        COALESCE(SUM(ji.actual_cost), 0) as total_actual,
        COALESCE(SUM(CASE WHEN ji.is_finalized THEN ji.quoted_total ELSE 0 END), 0) as completed_value,
        COUNT(CASE WHEN ji.actual_cost > ji.quoted_total THEN 1 END) as over_budget_count
      FROM job_items ji
      WHERE ji.job_id = $1
    `, [jobId]);
    
    return NextResponse.json({
      items: itemsResult.rows,
      summary: summary.rows[0]
    });
  } catch (error) {
    console.error('Error fetching job items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new job item
export async function POST(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const { item_name, description, quoted_quantity, quoted_unit_price } = await request.json();
    
    if (!item_name || !quoted_quantity || !quoted_unit_price) {
      return NextResponse.json({ error: 'Item name, quantity, and price are required' }, { status: 400 });
    }
    
    const quoted_total = quoted_quantity * quoted_unit_price;
    
    const result = await query(
      `INSERT INTO job_items (
        job_id, item_name, description, quoted_quantity, 
        quoted_unit_price, quoted_total, completion_status,
        original_quantity, original_unit_price, original_total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [jobId, item_name, description || null, quoted_quantity, quoted_unit_price, quoted_total, 'pending',
       quoted_quantity, quoted_unit_price, quoted_total]
    );
    
    // Update job totals
    await query(
      `UPDATE jobs 
       SET total_quoted = (
         SELECT COALESCE(SUM(quoted_total), 0) 
         FROM job_items 
         WHERE job_id = $1
       )
       WHERE id = $1`,
      [jobId]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating job item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a specific job item (with revision tracking)
export async function PUT(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');
    const { 
      quoted_quantity, 
      quoted_unit_price, 
      description, 
      revision_number,
      revision_reason,
      original_quantity,
      original_unit_price,
      original_total,
      variation_po_required,
      variation_quote_id
    } = await request.json();
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    const quoted_total = quoted_quantity * quoted_unit_price;
    
    // Get current item to preserve original values if not provided
    const currentItem = await query('SELECT * FROM job_items WHERE id = $1 AND job_id = $2', [itemId, jobId]);
    if (currentItem.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    const current = currentItem.rows[0];
    const newRevisionNumber = (current.revision_number || 1) + 1;
    
    const result = await query(
      `UPDATE job_items 
       SET quoted_quantity = $1,
           quoted_unit_price = $2,
           quoted_total = $3,
           description = COALESCE($4, description),
           revision_number = $5,
           revision_reason = CASE 
             WHEN $6 IS NOT NULL THEN $6 
             ELSE revision_reason 
           END,
           original_quantity = COALESCE($7, original_quantity, $1),
           original_unit_price = COALESCE($8, original_unit_price, $2),
           original_total = COALESCE($9, original_total, $3),
           variation_po_required = COALESCE($10, variation_po_required, FALSE),
           variation_quote_id = COALESCE($11, variation_quote_id)
       WHERE id = $12 AND job_id = $13
       RETURNING *`,
      [
        quoted_quantity, 
        quoted_unit_price, 
        quoted_total, 
        description,
        revision_number || newRevisionNumber,
        revision_reason,
        original_quantity || current.quoted_quantity,
        original_unit_price || current.quoted_unit_price,
        original_total || (current.quoted_quantity * current.quoted_unit_price),
        variation_po_required,
        variation_quote_id,
        itemId, 
        jobId
      ]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Update job totals
    await query(
      `UPDATE jobs 
       SET total_quoted = (
         SELECT COALESCE(SUM(quoted_total), 0) 
         FROM job_items 
         WHERE job_id = $1
       )
       WHERE id = $1`,
      [jobId]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating job item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a job item
export async function DELETE(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    await query('DELETE FROM job_items WHERE id = $1 AND job_id = $2', [itemId, jobId]);
    
    // Update job totals
    await query(
      `UPDATE jobs 
       SET total_quoted = (
         SELECT COALESCE(SUM(quoted_total), 0) 
         FROM job_items 
         WHERE job_id = $1
       )
       WHERE id = $1`,
      [jobId]
    );
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting job item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}