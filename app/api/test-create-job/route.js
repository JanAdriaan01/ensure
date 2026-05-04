// app/api/test-create-job/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quote_id, po_number } = body;
    
    console.log('Test job creation for quote:', quote_id, 'PO:', po_number);
    
    // Get quote
    const quoteResult = await query(`SELECT * FROM quotes WHERE id = $1`, [quote_id]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = quoteResult.rows[0];
    
    // Get next job number
    const jobCountResult = await query(`SELECT COUNT(*) as count FROM jobs`);
    const jobCount = parseInt(jobCountResult.rows[0].count) + 1;
    const jobNumber = `JOB-2026-${String(jobCount).padStart(4, '0')}`;
    
    // Create job
    const jobResult = await query(
      `INSERT INTO jobs (
        job_number, client_id, description, po_status, completion_status,
        po_number, po_amount, total_budget, quote_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id`,
      [
        jobNumber, quote.client_id, `Job from quote: ${quote.quote_number}`,
        'approved', 'not_started', po_number, quote.total_amount, quote.total_amount, quote_id
      ]
    );
    
    const jobId = jobResult.rows[0].id;
    
    // Update quote
    await query(
      `UPDATE quotes SET job_id = $1, updated_at = NOW() WHERE id = $2`,
      [jobId, quote_id]
    );
    
    return NextResponse.json({ 
      success: true, 
      job_id: jobId,
      job_number: jobNumber
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}