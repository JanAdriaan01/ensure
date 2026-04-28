import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function POST(request, { params }) {
  try {
    const { id, itemId } = params;
    const { actual_quantity, actual_cost } = await request.json();
    
    console.log('Finalizing item:', { id, itemId, actual_quantity, actual_cost });
    
    // Validate inputs
    if (!actual_quantity || !actual_cost) {
      return NextResponse.json({ error: 'Actual quantity and cost are required' }, { status: 400 });
    }
    
    await query('BEGIN');
    
    // Update the job item
    const result = await query(
      `UPDATE job_items 
       SET actual_quantity = $1,
           actual_cost = $2,
           is_finalized = TRUE,
           completion_status = 'completed'
       WHERE id = $3 AND job_id = $4
       RETURNING *`,
      [actual_quantity, actual_cost, itemId, id]
    );
    
    if (result.rows.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    // Calculate unit price
    const unitPrice = actual_cost / actual_quantity;
    
    // Create invoice line item
    await query(
      `INSERT INTO invoice_line_items (
        job_id, 
        job_item_id, 
        invoice_date, 
        quantity, 
        unit_price, 
        total_amount, 
        is_billed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, itemId, new Date().toISOString().split('T')[0], actual_quantity, unitPrice, actual_cost, false]
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