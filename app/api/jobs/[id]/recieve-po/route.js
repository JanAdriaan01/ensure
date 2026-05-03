export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const { po_number, po_amount, po_date } = await request.json();
    
    if (!po_number || !po_amount) {
      return NextResponse.json({ error: 'PO number and amount are required' }, { status: 400 });
    }
    
    // Update job with PO information
    const result = await query(
      `UPDATE jobs 
       SET po_number = $1, 
           po_amount = $2, 
           po_received_date = $3, 
           po_status = 'approved',
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [po_number, po_amount, po_date || new Date().toISOString().split('T')[0], jobId]
    );
    
    // Also update the associated quote
    await query(
      `UPDATE quotes 
       SET po_number = $1, po_amount = $2, po_received_date = $3, status = 'po_received'
       WHERE job_id = $4`,
      [po_number, po_amount, po_date || new Date().toISOString().split('T')[0], jobId]
    );
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'PO received and job is now active'
    });
  } catch (error) {
    console.error('Error receiving PO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}