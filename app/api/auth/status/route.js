export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  const auth = await verifyAuth(request);
  
  return NextResponse.json({
    authenticated: auth.authenticated,
    userId: auth.userId,
    email: auth.email,
    role: auth.role,
    error: auth.error
  });
}