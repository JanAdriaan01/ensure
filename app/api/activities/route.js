export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 10;

    const result = await query(
      `SELECT 
        'job' as type,
        j.id,
        j.lc_number as title,
        j.completion_status as status,
        j.updated_at as created_at,
        'Job updated' as description
      FROM jobs j
      UNION ALL
      SELECT 
        'quote' as type,
        q.id,
        q.quote_number as title,
        q.status as status,
        q.updated_at as created_at,
        'Quote updated' as description
      FROM quotes q
      ORDER BY created_at DESC
      LIMIT $1`,
      [limit]
    );

    return NextResponse.json(result.rows || []);
  } catch (error) {
    console.error('Activities error:', error);
    return NextResponse.json([]);
  }
}