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

    const result = await query(`
      SELECT 
        ci.*,
        j.lc_number as job_number,
        j.client_name
      FROM completed_invoices ci
      JOIN jobs j ON ci.job_id = j.id
      ORDER BY ci.completion_date DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Completed invoices error:', error);
    return NextResponse.json([], { status: 200 });
  }
}