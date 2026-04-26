import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { id, itemId } = params;
    const { actual_quantity, actual_cost, finalized_at } = await request.json();
    
    console.log('Finalizing item:', { id, itemId, actual_quantity, actual_cost });
    
    // Start transaction
    await query('BEGIN');
    
    // Update the job item with actual values and mark as finalized
    const result = await query(
      `UPDATE job_items 
       SET actual_quantity = $1,
           actual_cost = $2,
           is_finalized = TRUE,
           completion_status = 'completed',
           finalized_at = $3
       WHERE id = $4 AND job_id = $5
       RETURNING *`,
      [actual_quantity, actual_cost, finalized_at || new Date().toISOString(), itemId, id]
    );
    
    if (result.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Create invoice line item for this finalized item
    await query(
      `INSERT INTO invoice_line_items (
        job_id, job_item_id, invoice_date, quantity, unit_price, total_amount, is_billed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, itemId, new Date().toISOString().split('T')[0], actual_quantity, actual_cost / actual_quantity, actual_cost, false]
    );
    
    // Update job totals
    await query(
      `UPDATE jobs 
       SET total_actual = (
         SELECT COALESCE(SUM(actual_cost), 0) 
         FROM job_items 
         WHERE job_id = $1 AND is_finalized = TRUE
       )
       WHERE id = $1`,
      [id]
    );
    
    await query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      item: result.rows[0],
      message: 'Item finalized and ready for invoicing'
    });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error finalizing item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}