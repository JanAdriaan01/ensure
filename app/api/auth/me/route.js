import { getSession, requireAuth } from '@/lib/auth-server';

export async function GET(request) {
  try {
    const session = await requireAuth();
    return Response.json(session);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 401 });
  }
}