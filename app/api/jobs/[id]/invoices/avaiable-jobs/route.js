// app/api/invoices/available-jobs/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get jobs with available funds for invoicing
    const result = await query(`
      SELECT 
        j.id,
        j.job_number,
        j.client_id,
        c.client_name,
        j.po_amount,
        COALESCE(j.total_invoiced, 0) as total_invoiced,
        (j.po_amount - COALESCE(j.total_invoiced, 0)) as available_balance
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      WHERE j.po_status = 'approved' 
        AND j.po_amount > COALESCE(j.total_invoiced, 0)
      ORDER BY j.job_number
    `);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching available jobs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}