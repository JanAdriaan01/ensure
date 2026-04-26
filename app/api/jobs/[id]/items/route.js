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
          WHEN ji.actual_cost > (ji.quoted_quantity * ji.quoted_unit_price) THEN TRUE 
          ELSE FALSE 
        END as is_over_budget
      FROM job_items ji
      WHERE ji.job_id = $1
      ORDER BY ji.id
    `, [jobId]);
    
    const summary = await query(`
      SELECT 
        COALESCE(SUM(ji.quoted_quantity * ji.quoted_unit_price), 0) as total_quoted,
        COALESCE(SUM(ji.actual_cost), 0) as total_actual,
        COALESCE(SUM(CASE WHEN ji.is_finalized THEN (ji.quoted_quantity * ji.quoted_unit_price) ELSE 0 END), 0) as completed_value,
        COUNT(CASE WHEN ji.actual_cost > (ji.quoted_quantity * ji.quoted_unit_price) THEN 1 END) as over_budget_count
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
    
    // Do NOT include quoted_total - it's auto-generated
    const result = await query(
      `INSERT INTO job_items (
        job_id, item_name, description, quoted_quantity, 
        quoted_unit_price, completion_status,
        original_quantity, original_unit_price, original_total
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [jobId, item_name, description || null, quoted_quantity, quoted_unit_price, 'pending',
       quoted_quantity, quoted_unit_price, quoted_quantity * quoted_unit_price]
    );
    
    // Update job totals
    await query(
      `UPDATE jobs 
       SET total_quoted = (
         SELECT COALESCE(SUM(quoted_quantity * quoted_unit_price), 0) 
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
    const body = await request.json();
    
    const { 
      quoted_quantity, 
      quoted_unit_price, 
      description, 
      revision_reason
    } = body;
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }
    
    if (!quoted_quantity || !quoted_unit_price) {
      return NextResponse.json({ error: 'Quantity and unit price are required' }, { status: 400 });
    }
    
    // Get current item to preserve original values
    const currentItem = await query('SELECT * FROM job_items WHERE id = $1 AND job_id = $2', [itemId, jobId]);
    if (currentItem.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    const current = currentItem.rows[0];
    const newRevisionNumber = (current.revision_number || 1) + 1;
    
    // Preserve original values (use existing or current)
    const originalQty = current.original_quantity || current.quoted_quantity;
    const originalPrice = current.original_unit_price || current.quoted_unit_price;
    const originalTotal = current.original_total || (current.quoted_quantity * current.quoted_unit_price);
    
    // Do NOT update quoted_total - it's a generated column
    const result = await query(
      `UPDATE job_items 
       SET quoted_quantity = $1,
           quoted_unit_price = $2,
           description = COALESCE($3, description),
           revision_number = $4,
           revision_reason = COALESCE($5, revision_reason),
           original_quantity = $6,
           original_unit_price = $7,
           original_total = $8
       WHERE id = $9 AND job_id = $10
       RETURNING *`,
      [
        quoted_quantity, 
        quoted_unit_price, 
        description,
        newRevisionNumber,
        revision_reason,
        originalQty,
        originalPrice,
        originalTotal,
        itemId, 
        jobId
      ]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Update job totals (calculate from quoted_quantity * quoted_unit_price)
    await query(
      `UPDATE jobs 
       SET total_quoted = (
         SELECT COALESCE(SUM(quoted_quantity * quoted_unit_price), 0) 
         FROM job_items 
         WHERE job_id = $1
       )
       WHERE id = $1`,
      [jobId]
    );
    
    return NextResponse.json({ 
      success: true, 
      item: result.rows[0],
      message: 'Item updated successfully'
    });
    
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
         SELECT COALESCE(SUM(quoted_quantity * quoted_unit_price), 0) 
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