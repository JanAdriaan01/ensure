import { NextResponse } from 'next/server';

// Only protect API routes and main pages
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow all API routes to pass through - let the API handle auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Allow static files
  if (pathname.includes('/_next/') || pathname.includes('/favicon.ico')) {
    return NextResponse.next();
  }
  
  // Only protect the root path and main app paths
  const protectedPaths = ['/', '/financial', '/jobs', '/quotes', '/employees', '/clients', '/invoicing', '/tools', '/inventory', '/schedule', '/ohs', '/hr', '/payroll', '/operations', '/reports', '/Settings'];
  
  const isProtected = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  
  if (!isProtected && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
    return NextResponse.next();
  }
  
  // Check for token in cookie only
  const token = request.cookies.get('auth_token')?.value;
  
  if (isProtected && !token) {
    const url = new URL('/login', request.url);
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
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};