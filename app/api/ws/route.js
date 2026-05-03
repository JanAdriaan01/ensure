export const dynamic = 'force-dynamic';

/**
 * WebSocket endpoint for real-time notifications and updates.
 * 
 * Note: Vercel serverless functions do not support WebSocket connections.
 * This endpoint returns a 404 with instructions for using alternative methods.
 * 
 * For real-time updates in production, consider using:
 * - Server-Sent Events (SSE) via streaming responses
 * - Polling with incremental updates
 * - Third-party services like Pusher, Ably, or Supabase Realtime
 */

export async function GET(request) {
  const { headers } = request;
  const upgrade = headers.get('upgrade');

  // Check if this is a WebSocket upgrade request
  if (upgrade && upgrade.toLowerCase() === 'websocket') {
    return new Response('WebSocket connections are not supported in serverless environment. Use polling or SSE instead.', {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  // Return helpful response for regular HTTP GET
  return new Response(
    JSON.stringify({
      success: false,
      error: 'WebSocket not supported',
      message: 'This endpoint is for WebSocket connections. For real-time updates, use polling or Server-Sent Events (SSE).',
      alternatives: [
        {
          method: 'Polling',
          description: 'Periodically fetch /api/notifications with ?since=timestamp',
          example: 'GET /api/notifications?since=1712345678000'
        },
        {
          method: 'Server-Sent Events (SSE)',
          description: 'Use /api/events endpoint for streaming updates',
          example: 'GET /api/events'
        },
        {
          method: 'Third-party Services',
          description: 'Consider using Pusher, Ably, or Supabase Realtime',
          docs: 'https://vercel.com/docs/limits#websockets'
        }
      ]
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Handle POST requests for WebSocket-like message sending
export async function POST(request) {
  try {
    const body = await request.json();
    const { event, data, target_users } = body;

    // For serverless, we can't broadcast via WebSocket
    // Instead, store notification for clients to poll
    if (event && data) {
      // Store notification in database for polling
      const { query } = await import('@/lib/db');
      
      if (target_users && target_users.length > 0) {
        // Store for specific users
        for (const userId of target_users) {
          await query(
            `INSERT INTO notifications (user_id, type, title, message, data, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, event, data.title || event, data.message, JSON.stringify(data)]
          );
        }
      } else {
        // Store for all users with notification permission
        await query(
          `INSERT INTO notifications (user_id, type, title, message, data, created_at)
           SELECT id, $1, $2, $3, $4, NOW()
           FROM users
           WHERE role IN ('admin', 'manager') OR permissions @> '["notifications:receive"]'`,
          [event, data.title || event, data.message, JSON.stringify(data)]
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Notification stored successfully',
          pending_clients: target_users?.length || 'all eligible users'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Missing required fields: event and data',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('WebSocket POST error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process request',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Upgrade',
      'Access-Control-Max-Age': '86400',
    },
  });
}