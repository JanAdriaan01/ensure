import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-hash',
  '/api/auth/test',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Allow static files
  if (pathname.includes('/_next/') || pathname.includes('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // For API routes, return 401 instead of redirecting
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }
  
  // For page routes, check token and redirect to login
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};