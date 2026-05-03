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

    try {
      const result = await query(`
        SELECT 
          j.*,
          c.client_name,
          c.id as client_id
        FROM jobs j
        LEFT JOIN clients c ON j.client_id = c.id
        WHERE j.po_status = 'approved' OR j.po_status IS NULL
        ORDER BY j.id DESC
      `);
      
      return NextResponse.json({ 
        success: true, 
        data: result.rows || [] 
      });
    } catch (dbError) {
      console.error('Jobs table error:', dbError);
      return NextResponse.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}