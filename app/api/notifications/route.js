export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    
    // If not authenticated, return empty array
    if (!auth.authenticated) {
      return NextResponse.json([]);
    }

    // Try to get real notifications
    try {
      const result = await query(
        `SELECT id, title, message, type, link, read, created_at 
         FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 20`,
        [auth.userId]
      );
      
      const unreadResult = await query(
        `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false`,
        [auth.userId]
      );
      
      return NextResponse.json({
        notifications: result.rows || [],
        unreadCount: parseInt(unreadResult.rows[0]?.count || 0)
      });
    } catch (dbError) {
      // If table doesn't exist, return empty array
      console.log('Notifications table not found, returning empty');
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Notifications error:', error);
    return NextResponse.json([]);
  }
}

export async function PATCH(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    await query(
      `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
      [id, auth.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}