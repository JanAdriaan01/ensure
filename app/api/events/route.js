export const dynamic = 'force-dynamic';

import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  // Verify auth either from header or query param token
  let auth;
  if (token) {
    // Create a mock request with the token in header
    const mockRequest = {
      headers: {
        get: (name) => {
          if (name === 'authorization') return `Bearer ${token}`;
          return null;
        }
      }
    };
    auth = await verifyAuth(mockRequest);
  } else {
    auth = await verifyAuth(request);
  }
  
  if (!auth.authenticated) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Set up SSE headers
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      let lastCheck = Date.now();
      let lastNotificationId = 0;

      // Send initial connection message
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status":"connected"}\n\n`));

      // Poll for new notifications every 2 seconds
      const interval = setInterval(async () => {
        try {
          const result = await query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 AND id > $2 AND read = false
             ORDER BY id ASC
             LIMIT 10`,
            [auth.userId, lastNotificationId]
          );

          for (const notification of result.rows) {
            lastNotificationId = Math.max(lastNotificationId, notification.id);
            controller.enqueue(encoder.encode(
              `event: notification\ndata: ${JSON.stringify(notification)}\n\n`
            ));
          }

          // Send heartbeat every 30 seconds to keep connection alive
          if (Date.now() - lastCheck > 30000) {
            controller.enqueue(encoder.encode(`event: heartbeat\ndata: {"timestamp":${Date.now()}}\n\n`));
            lastCheck = Date.now();
          }
        } catch (error) {
          console.error('SSE polling error:', error);
        }
      }, 2000);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}