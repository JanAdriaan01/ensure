// app/api/jobs/[id]/flow/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Get current job stage
    const jobResult = await query(`
      SELECT po_status, completion_status, po_number, po_amount
      FROM jobs 
      WHERE id = $1
    `, [id]);
    
    if (jobResult.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const job = jobResult.rows[0];
    
    // Determine current stage based on job status
    let currentStage = 'QUOTE';
    if (job.po_number) currentStage = 'PO_RECEIVED';
    if (job.completion_status === 'in_progress') currentStage = 'MATERIAL_PURCHASED';
    if (job.completion_status === 'completed') currentStage = 'WORK_COMPLETED';
    
    // Get completed stages
    const stagesResult = await query(`
      SELECT stage_name, completed, completed_at
      FROM job_stages
      WHERE job_id = $1
      ORDER BY id
    `, [id]);
    
    const stages = stagesResult.rows;
    
    // Check if can advance
    let canAdvance = true;
    let blockers = [];
    
    if (currentStage === 'QUOTE') {
      if (!job.po_number) {
        canAdvance = false;
        blockers = [{ stage: 'QUOTE', message: 'PO number required to advance' }];
      }
    }
    
    return NextResponse.json({
      current_stage: currentStage,
      stages: stages,
      can_advance: canAdvance,
      blockers: blockers
    });
    
  } catch (error) {
    console.error('Job flow API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { target_stage, force_advance } = body;
    
    // Update job stage
    await query('BEGIN');
    
    // Mark current stage as completed
    await query(`
      INSERT INTO job_stages (job_id, stage_name, completed, completed_at, completed_by)
      VALUES ($1, $2, TRUE, NOW(), $3)
      ON CONFLICT (job_id, stage_name) 
      DO UPDATE SET completed = TRUE, completed_at = NOW(), completed_by = $3
    `, [id, target_stage, auth.userId]);
    
    // Update job status based on stage
    if (target_stage === 'PO_RECEIVED') {
      await query(`
        UPDATE jobs SET po_status = 'approved', updated_at = NOW()
        WHERE id = $1
      `, [id]);
    }
    
    await query('COMMIT');
    
    return NextResponse.json({ success: true, message: 'Stage advanced successfully' });
    
  } catch (error) {
    await query('ROLLBACK');
    console.error('Job flow advance error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}