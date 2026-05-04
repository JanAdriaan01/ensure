// app/api/jobs/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      console.log('Jobs API: User not authenticated');
      return NextResponse.json({ success: true, data: [] });
    }

    console.log('Jobs API: Fetching approved jobs');
    
    // Simple query - get all jobs with po_status = 'approved'
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
      WHERE j.po_status = 'approved'
      ORDER BY j.id DESC
    `);
    
    console.log(`Jobs API: Found ${result.rows.length} approved jobs`);
    
    // Log each job for debugging
    result.rows.forEach(job => {
      console.log(`  - Job ${job.id}: ${job.job_number}, PO: ${job.po_number}, Client: ${job.client_name}`);
    });
    
    // Return in the format the frontend expects
    return NextResponse.json({ 
      success: true, 
      data: result.rows 
    });
    
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}