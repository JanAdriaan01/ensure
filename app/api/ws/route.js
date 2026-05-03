export const dynamic = 'force-dynamic';

export async function GET() {
  // WebSocket upgrade not supported in serverless functions
  // Return 404 to let client know it's not available
  return new Response('WebSocket not supported', { status: 404 });
}