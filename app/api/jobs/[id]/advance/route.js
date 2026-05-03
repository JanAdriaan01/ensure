export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// POST - Advance job to next stage
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { target_stage } = await request.json();

    // Call PostgreSQL function to advance stage
    const result = await query(
      `SELECT advance_job_stage($1, $2, $3) as result`,
      [id, target_stage, auth.userId]
    );

    const advanceResult = result.rows[0].result;

    if (!advanceResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Cannot advance stage',
        blocker_count: advanceResult.blocker_count,
        messages: advanceResult.messages
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      message: `Advanced to stage: ${target_stage}`,
      current_stage: target_stage,
      warnings: advanceResult.warning_count,
      messages: advanceResult.messages
    });

  } catch (error) {
    console.error('Error advancing job stage:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Get available next stages
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const currentResult = await query(
      `SELECT current_stage, stage_status 
       FROM job_flow_tracking 
       WHERE job_id = $1 AND stage_status = 'in_progress'
       LIMIT 1`,
      [id]
    );

    if (currentResult.rows.length === 0) {
      return NextResponse.json({ error: 'No active flow found for this job' }, { status: 404 });
    }

    const currentStage = currentResult.rows[0].current_stage;

    const nextStages = await query(
      `SELECT fs.stage_name, fs.stage_order, fs.description, fs.auto_advance
       FROM flow_stages fs
       WHERE fs.stage_order > (SELECT stage_order FROM flow_stages WHERE stage_name = $1)
       ORDER BY fs.stage_order ASC`,
      [currentStage]
    );

    return NextResponse.json({
      current_stage: currentStage,
      available_stages: nextStages.rows
    });

  } catch (error) {
    console.error('Error getting available stages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}