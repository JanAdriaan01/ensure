// app/api/jobs/[id]/tools/route.js
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
    
    const result = await query(`
      SELECT jt.*, t.name as tool_name, t.code as tool_code
      FROM job_tools jt
      LEFT JOIN tools t ON jt.tool_id = t.id
      WHERE jt.job_id = $1
      ORDER BY jt.created_at DESC
    `, [id]);
    
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching job tools:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}