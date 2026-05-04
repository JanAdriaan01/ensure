// app/api/jobs/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    
    if (!auth.authenticated) {
      return NextResponse.json({ success: true, data: [] });
    }
    
    // Get ALL jobs - using correct column name 'client_name'
    const result = await query(`
      SELECT 
        j.id,
        j.job_number,
        j.po_number,
        j.po_status,
        j.completion_status,
        j.client_id,
        j.quote_id,
        j.description,
        j.po_amount,
        j.total_budget,
        j.created_at,
        c.client_name
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      ORDER BY j.id DESC
    `);
    
    console.log(`Jobs API: Returning ${result.rows.length} jobs`);
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
    
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}