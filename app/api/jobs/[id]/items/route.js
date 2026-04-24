import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET all job items for a job
export async function GET(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const result = await query(`
      SELECT ji.*, e.name as completed_by_name
      FROM job_items ji
      LEFT JOIN employees e ON ji.completed_by = e.id
      WHERE ji.job_id = $1
      ORDER BY ji.id
    `, [jobId]);
    
    // Get summary stats
    const summary = await query(`
      SELECT 
        SUM(quoted_total) as total_quoted,
        SUM(actual_cost) as total_actual,
        SUM(CASE WHEN completion_status = 'completed' THEN quoted_total ELSE 0 END) as completed_value,
        COUNT(CASE WHEN is_over_budget THEN 1 END) as over_budget_count
      FROM job_items
      WHERE job_id = $1
    `, [jobId]);
    
    return NextResponse.json({
      items: result.rows,
      summary: summary.rows[0]
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create job item
export async function POST(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const body = await request.json();
    const { item_name, description, quoted_quantity, quoted_unit_price } = body;
    
    const result = await query(
      `INSERT INTO job_items (job_id, item_name, description, quoted_quantity, quoted_unit_price)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [jobId, item_name, description, quoted_quantity, quoted_unit_price]
    );
    
    // Update job totals
    await updateJobTotals(jobId);
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT complete an item
export async function PUT(request, { params }) {
  try {
    const jobId = parseInt(params.id);
    const { itemId, actual_quantity, actual_cost, completed_by } = await request.json();
    
    // Get the quoted item
    const item = await query('SELECT quoted_total, quoted_quantity, quoted_unit_price FROM job_items WHERE id = $1 AND job_id = $2', [itemId, jobId]);
    if (item.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    const isOverBudget = actual_cost > item.rows[0].quoted_total;
    
    await query(
      `UPDATE job_items 
       SET actual_quantity = $1, actual_cost = $2, completion_status = 'completed', 
           completed_date = CURRENT_TIMESTAMP, completed_by = $3, is_over_budget = $4
       WHERE id = $5 AND job_id = $6`,
      [actual_quantity, actual_cost, completed_by, isOverBudget, itemId, jobId]
    );
    
    // Log the completion
    await query(
      `INSERT INTO item_completion_logs (job_item_id, completed_quantity, completed_by, notes)
       VALUES ($1, $2, $3, 'Item completed')`,
      [itemId, actual_quantity, completed_by]
    );
    
    // Update job totals
    await updateJobTotals(jobId);
    
    return NextResponse.json({ success: true, is_over_budget: isOverBudget });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateJobTotals(jobId) {
  const totals = await query(`
    SELECT 
      SUM(quoted_total) as total_quoted,
      SUM(actual_cost) as total_actual
    FROM job_items
    WHERE job_id = $1
  `, [jobId]);
  
  await query(
    `UPDATE jobs 
     SET total_quoted = $1, total_actual = $2
     WHERE id = $3`,
    [totals.rows[0].total_quoted || 0, totals.rows[0].total_actual || 0, jobId]
  );
}