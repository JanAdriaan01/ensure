export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Get current flow status for a job
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);

    // Get current stage
    const currentStage = await query(
      `SELECT current_stage, stage_status, stage_entered_at, stage_completed_at
       FROM job_flow_tracking 
       WHERE job_id = $1 AND stage_status = 'in_progress'
       ORDER BY created_at DESC LIMIT 1`,
      [jobId]
    );

    // Get all stages with completion status
    const stages = await query(`
      SELECT 
        fs.*, 
        CASE WHEN jft.stage_completed_at IS NOT NULL THEN TRUE ELSE FALSE END as completed,
        jft.stage_entered_at, 
        jft.stage_completed_at,
        jft.validation_errors, 
        jft.validation_warnings
      FROM flow_stages fs
      LEFT JOIN job_flow_tracking jft ON fs.stage_name = jft.current_stage AND jft.job_id = $1
      ORDER BY fs.stage_order
    `, [jobId]);

    // Get flow history
    const history = await query(`
      SELECT jfh.*, u.name as triggered_by_name
      FROM job_flow_history jfh
      LEFT JOIN users u ON jfh.triggered_by = u.id
      WHERE jfh.job_id = $1
      ORDER BY jfh.created_at DESC
    `, [jobId]);

    // Get prerequisites
    const prerequisites = await query(`
      SELECT stage_name, prerequisite_stage
      FROM flow_prerequisites
    `);

    return NextResponse.json({
      current_stage: currentStage.rows[0] || null,
      stages: stages.rows,
      history: history.rows,
      prerequisites: prerequisites.rows
    });
  } catch (error) {
    console.error('Error fetching job flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Update flow stage
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const jobId = parseInt(id);
    const { action, stage_name, force = false } = await request.json();

    if (action === 'complete_stage') {
      // Complete current stage
      await query(
        `UPDATE job_flow_tracking 
         SET stage_status = 'completed', stage_completed_at = NOW()
         WHERE job_id = $1 AND current_stage = $2 AND stage_status = 'in_progress'`,
        [jobId, stage_name]
      );

      // Log history
      await query(
        `INSERT INTO job_flow_history (job_id, from_stage, to_stage, action, triggered_by)
         VALUES ($1, $2, NULL, 'complete', $3)`,
        [jobId, stage_name, auth.userId]
      );

    } else if (action === 'advance_to') {
      // Advance to new stage
      const nextStage = await query(
        `SELECT stage_name FROM flow_stages WHERE stage_order > 
          (SELECT stage_order FROM flow_stages WHERE stage_name = $1)
         ORDER BY stage_order LIMIT 1`,
        [stage_name]
      );

      if (nextStage.rows.length > 0) {
        await query(
          `INSERT INTO job_flow_tracking (job_id, current_stage, stage_status, stage_entered_at)
           VALUES ($1, $2, 'in_progress', NOW())`,
          [jobId, nextStage.rows[0].stage_name]
        );

        await query(
          `INSERT INTO job_flow_history (job_id, from_stage, to_stage, action, triggered_by)
           VALUES ($1, $2, $3, 'advance', $4)`,
          [jobId, stage_name, nextStage.rows[0].stage_name, auth.userId]
        );

        return NextResponse.json({
          success: true,
          new_stage: nextStage.rows[0].stage_name
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}