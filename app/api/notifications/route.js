export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET - Fetch notifications for current user
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let sql = `
      SELECT * FROM notifications 
      WHERE user_id = $1
    `;
    const params = [auth.userId];
    let paramCount = 2;

    if (unreadOnly) {
      sql += ` AND read = FALSE`;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await query(sql, params);

    const unreadResult = await query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = FALSE`,
      [auth.userId]
    );

    return NextResponse.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadResult.rows[0].count)
    });

  } catch (error) {
    console.error('Notifications error:', error);
    // Return empty array instead of error
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

// POST - Create notification
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, title, message, type, link } = body;

    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, link, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [user_id, title, message, type || 'info', link || null]
    );

    return NextResponse.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Mark notification as read
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
      `UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, auth.userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete notification
export async function DELETE(request) {
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

    await query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [id, auth.userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}