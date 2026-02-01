import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes - allow access to login and auth callback (from main site redirect)
  if (pathname === '/login' || pathname === '/' || pathname === '/auth/callback') {
    return NextResponse.next();
  }

  // Protected routes - check for token in cookie
  // Note: We can't access localStorage in middleware, so we rely on cookies
  // The client-side will handle localStorage-based auth
  if (pathname.startsWith('/admin') || pathname.startsWith('/organization')) {
    if (!token) {
      // Don't redirect if no cookie - let client-side handle it
      // This allows localStorage-based auth to work
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
