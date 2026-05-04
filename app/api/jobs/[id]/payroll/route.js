// app/api/jobs/[id]/payroll/route.js
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
    
    // Get all payroll entries for this job
    const result = await query(`
      SELECT 
        jp.*,
        u.name as user_name,
        u.email as user_email,
        jt.hourly_rate as rate_at_time
      FROM job_payroll jp
      LEFT JOIN users u ON jp.user_id = u.id
      LEFT JOIN job_team jt ON jt.job_id = jp.job_id AND jt.user_id = jp.user_id
      WHERE jp.job_id = $1
      ORDER BY jp.date DESC, jp.created_at DESC
    `, [jobId]);
    
    // Calculate cost for each entry based on hourly rate
    const enrichedData = result.rows.map(entry => {
      const hourlyRate = parseFloat(entry.hourly_rate) || parseFloat(entry.rate_at_time) || 0;
      const regularCost = (parseFloat(entry.hours) || 0) * hourlyRate;
      const overtimeCost = (parseFloat(entry.overtime_hours) || 0) * hourlyRate * 1.5;
      const totalCost = regularCost + overtimeCost;
      
      return {
        ...entry,
        calculated_hourly_rate: hourlyRate,
        regular_cost: regularCost,
        overtime_cost: overtimeCost,
        cost: totalCost
      };
    });
    
    // Calculate totals
    const totals = {
      total_hours: enrichedData.reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0),
      total_overtime_hours: enrichedData.reduce((sum, e) => sum + (parseFloat(e.overtime_hours) || 0), 0),
      total_cost: enrichedData.reduce((sum, e) => sum + (e.cost || 0), 0),
      approved_hours: enrichedData.filter(e => e.approved).reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0),
      pending_hours: enrichedData.filter(e => !e.approved).reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0),
      total_entries: enrichedData.length,
      approved_entries: enrichedData.filter(e => e.approved).length,
      pending_entries: enrichedData.filter(e => !e.approved).length
    };
    
    return NextResponse.json({ 
      success: true, 
      data: enrichedData,
      totals: totals
    });
  } catch (error) {
    console.error('Error fetching job payroll:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}