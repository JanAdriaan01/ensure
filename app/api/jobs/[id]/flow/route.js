import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';

// GET - Get current flow status for a job
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const jobId = parseInt(id);

    // Get current stage
    const currentStage = await query(
      `SELECT current_stage, stage_status FROM job_flow_tracking 
       WHERE job_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [jobId]
    );

    // Get all stages with completion status
    const stages = await query(`
      SELECT fs.*, 
        CASE WHEN jft.stage_completed_at IS NOT NULL THEN TRUE ELSE FALSE END as completed,
        jft.stage_entered_at, jft.stage_completed_at,
        jft.validation_errors, jft.validation_warnings
      FROM flow_stages fs
      LEFT JOIN job_flow_tracking jft ON fs.stage_name = jft.current_stage AND jft.job_id = $1
      ORDER BY fs.stage_order
    `, [jobId]);

    // Get prerequisites for next stages
    const prerequisites = await query(`
      SELECT fp.stage_name, fp.prerequisite_stage
      FROM flow_prerequisites fp
    `);

    // Get current blockers for this job
    const blockers = await getBlockersForJob(jobId);

    return NextResponse.json({
      current_stage: currentStage.rows[0]?.current_stage || 'QUOTE',
      stages: stages.rows,
      prerequisites: prerequisites.rows,
      blockers,
      can_advance: blockers.blockers.length === 0
    });
  } catch (error) {
    console.error('Error fetching job flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Advance to next stage
export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const jobId = parseInt(id);
    const { target_stage, force_advance } = await request.json();

    // Validate stage transition
    const validation = await validateStageTransition(jobId, target_stage, force_advance);
    
    if (!validation.valid && !force_advance) {
      return NextResponse.json({
        error: 'Stage transition blocked',
        blockers: validation.blockers,
        warnings: validation.warnings
      }, { status: 422 });
    }

    // Start transaction
    await query('BEGIN');

    // Update current stage
    await query(
      `INSERT INTO job_flow_tracking (job_id, current_stage, stage_status, stage_entered_at)
       VALUES ($1, $2, 'in_progress', NOW())
       ON CONFLICT (job_id, current_stage) DO UPDATE SET stage_entered_at = NOW()`,
      [jobId, target_stage]
    );

    // Log history
    const currentStage = await query(
      `SELECT current_stage FROM job_flow_tracking 
       WHERE job_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [jobId]
    );

    await query(
      `INSERT INTO job_flow_history (job_id, from_stage, to_stage, action, notes, triggered_by)
       VALUES ($1, $2, $3, 'stage_advance', $4, $5)`,
      [jobId, currentStage.rows[0]?.current_stage, target_stage, validation.message || 'Stage advanced', auth.userId]
    );

    // Update job status if final stage
    if (target_stage === 'PO_COMPLETE') {
      await query(
        `UPDATE jobs SET completion_status = 'completed' WHERE id = $1`,
        [jobId]
      );
    }

    await query('COMMIT');

    // Send notifications for warnings
    if (validation.warnings.length > 0) {
      await createNotifications(jobId, validation.warnings, target_stage);
    }

    return NextResponse.json({
      success: true,
      stage: target_stage,
      warnings: validation.warnings
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error advancing job stage:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to validate stage transition
async function validateStageTransition(jobId, targetStage, forceAdvance = false) {
  const blockers = [];
  const warnings = [];

  // Get job data
  const job = await query(`
    SELECT j.*, 
      COALESCE(SUM(ji.quoted_total), 0) as total_quoted,
      COALESCE(SUM(ji.actual_cost), 0) as total_actual,
      COUNT(CASE WHEN ji.completion_status != 'completed' THEN 1 END) as unfinalized_items,
      (SELECT COUNT(*) FROM job_assignments WHERE job_id = j.id) as assigned_employees_count,
      (SELECT COUNT(*) FROM tool_checkouts WHERE job_id = j.id AND status = 'checked_out') as tools_assigned_count,
      (SELECT COUNT(*) FROM tool_checkouts WHERE job_id = j.id AND expected_return_date < CURRENT_DATE AND status = 'checked_out') as tools_overdue_count,
      (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE job_id = j.id) as total_paid,
      (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE job_id = j.id AND status != 'cancelled') as total_invoiced
    FROM jobs j
    LEFT JOIN job_items ji ON j.id = ji.job_id
    WHERE j.id = $1
    GROUP BY j.id
  `, [jobId]);

  const jobData = job.rows[0] || {};

  // Get quote data if exists
  let quoteData = null;
  if (jobData.quote_id) {
    const quote = await query(`
      SELECT q.*, 
        (SELECT COUNT(*) FROM quote_items WHERE quote_id = q.id) as quote_items_count
      FROM quotes q WHERE q.id = $1
    `, [jobData.quote_id]);
    quoteData = quote.rows[0];
  }

  // Get rules for target stage
  const rules = await query(
    `SELECT * FROM flow_validation_rules WHERE stage_name = $1 ORDER BY validation_type DESC`,
    [targetStage]
  );

  for (const rule of rules.rows) {
    let value;
    switch (rule.condition_field) {
      case 'quote_status':
        value = quoteData?.status;
        break;
      case 'quote_items_count':
        value = quoteData?.quote_items_count || 0;
        break;
      case 'po_number':
        value = jobData.po_number;
        break;
      case 'po_amount':
        value = jobData.po_amount;
        break;
      case 'quote_amount':
        value = quoteData?.total_amount;
        break;
      case 'assigned_employees_count':
        value = jobData.assigned_employees_count || 0;
        break;
      case 'estimated_hours':
        value = jobData.estimated_hours;
        break;
      case 'tools_assigned_count':
        value = jobData.tools_assigned_count || 0;
        break;
      case 'tools_overdue_count':
        value = jobData.tools_overdue_count || 0;
        break;
      case 'unfinalized_items':
        value = jobData.unfinalized_items || 0;
        break;
      case 'actual_hours':
        value = jobData.actual_hours;
        break;
      case 'total_actual_cost':
        value = jobData.total_actual || 0;
        break;
      case 'over_budget_items':
        value = jobData.over_budget_items || 0;
        break;
      case 'total_paid':
        value = jobData.total_paid || 0;
        break;
      case 'total_invoiced':
        value = jobData.total_invoiced || 0;
        break;
      case 'remaining_balance':
        value = (jobData.total_invoiced || 0) - (jobData.total_paid || 0);
        break;
      case 'unreturned_tools':
        value = jobData.tools_assigned_count || 0;
        break;
      case 'payment_days_overdue':
        const lastInvoice = await query(
          `SELECT invoice_date FROM invoices WHERE job_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [jobId]
        );
        if (lastInvoice.rows[0]) {
          const days = Math.floor((new Date() - new Date(lastInvoice.rows[0].invoice_date)) / (1000 * 60 * 60 * 24));
          value = days;
        } else {
          value = 0;
        }
        break;
      default:
        value = null;
    }

    let conditionMet = false;
    switch (rule.condition_operator) {
      case '=':
        conditionMet = value == rule.condition_value;
        break;
      case '!=':
        conditionMet = value != rule.condition_value;
        break;
      case '>':
        conditionMet = value > parseFloat(rule.condition_value);
        break;
      case '<':
        conditionMet = value < parseFloat(rule.condition_value);
        break;
      case '>=':
        conditionMet = value >= parseFloat(rule.condition_value);
        break;
      case '<=':
        conditionMet = value <= parseFloat(rule.condition_value);
        break;
      case 'is_null':
        conditionMet = value === null || value === undefined;
        break;
      case 'is_not_null':
        conditionMet = value !== null && value !== undefined;
        break;
    }

    if (conditionMet) {
      if (rule.validation_type === 'blocker') {
        blockers.push({
          rule_id: rule.id,
          message: rule.message,
          field: rule.condition_field,
          value
        });
      } else if (rule.validation_type === 'warning') {
        warnings.push({
          rule_id: rule.id,
          message: rule.message,
          field: rule.condition_field,
          value
        });
      }
    }
  }

  return {
    valid: blockers.length === 0 || forceAdvance,
    blockers,
    warnings,
    message: blockers.length > 0 ? 'Stage transition blocked' : 'Ready to advance'
  };
}

// Helper function to get blockers for a job
async function getBlockersForJob(jobId) {
  const stages = await query(
    `SELECT stage_name FROM flow_stages ORDER BY stage_order`
  );
  
  const blockers = [];
  
  for (const stage of stages.rows) {
    const validation = await validateStageTransition(jobId, stage.stage_name);
    if (validation.blockers.length > 0) {
      blockers.push({
        stage: stage.stage_name,
        blockers: validation.blockers
      });
    }
  }
  
  return { blockers };
}

// Helper function to create notifications
async function createNotifications(jobId, warnings, stage) {
  const job = await query('SELECT lc_number FROM jobs WHERE id = $1', [jobId]);
  
  for (const warning of warnings) {
    await query(
      `INSERT INTO notifications (user_id, title, message, type, link, created_at)
       SELECT u.id, $1, $2, 'warning', $3, NOW()
       FROM users u WHERE u.role IN ('admin', 'manager')`,
      [
        `Warning: ${stage} Stage`,
        `${warning.message} for job ${job.rows[0]?.lc_number}`,
        `/jobs/${jobId}`
      ]
    );
  }
}