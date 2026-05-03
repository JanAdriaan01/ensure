import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/debug',
  '/api/auth/test-login',
  '/api/ws',  // WebSocket endpoint
];

// Static file extensions that should be ignored
const staticFileExtensions = /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|json|woff|woff2|ttf|eot)$/i;

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow static files
  if (staticFileExtensions.test(pathname)) {
    return NextResponse.next();
  }

  // Allow Next.js internal paths
  if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For API routes, check token in cookie or authorization header
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication token missing' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // For all other page routes, check token in cookie
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token && pathname !== '/') {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static assets with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};