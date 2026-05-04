// app/api/jobs/[id]/team/route.js
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
    const jobId = parseInt(id);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }
    
    // Check if job exists
    const jobCheck = await query(`SELECT id FROM jobs WHERE id = $1`, [jobId]);
    if (jobCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // Get all team members for this job
    const result = await query(`
      SELECT 
        jt.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM job_team jt
      LEFT JOIN users u ON jt.user_id = u.id
      WHERE jt.job_id = $1
      ORDER BY jt.assigned_date DESC
    `, [jobId]);
    
    // Calculate totals
    const totals = {
      total_members: result.rows.length,
      active_members: result.rows.filter(m => m.status === 'assigned').length,
      total_estimated_hours: result.rows.reduce((sum, m) => sum + (parseFloat(m.estimated_hours) || 0), 0),
      total_estimated_cost: result.rows.reduce((sum, m) => sum + ((parseFloat(m.hourly_rate) || 0) * (parseFloat(m.estimated_hours) || 0)), 0)
    };
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      totals: totals
    });
  } catch (error) {
    console.error('Error fetching job team:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}