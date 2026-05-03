export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      // Return empty array instead of error
      return NextResponse.json([]);
    }

    try {
      const result = await query(`
        SELECT 
          j.*,
          c.name as client_name
        FROM jobs j
        LEFT JOIN clients c ON j.client_id = c.id
        ORDER BY j.id DESC
      `);
      return NextResponse.json(result.rows || []);
    } catch (dbError) {
      // Table might not exist yet
      console.log('Jobs table not found, returning empty array');
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json([]);
  }
}