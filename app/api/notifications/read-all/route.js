export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await query(
      `UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`,
      [auth.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}