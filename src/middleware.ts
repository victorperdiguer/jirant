import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that don't require authentication
const publicPaths = ['/', '/auth/signin', '/api/auth'];

export async function middleware(request: NextRequest) {
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Allow public paths and API routes (except protected ones)
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/protected'))
  ) {
    return NextResponse.next();
  }

  // Redirect to signin if no session exists
  if (!session) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which routes to protect
export const config = {
  matcher: [
    '/workspace/:path*',
    '/templates/:path*',
    '/api/protected/:path*',
    '/api/tickets/:path*',
    '/api/ticket-types/:path*',
    '/api/ticket-relationships/:path*',
    '/api/openai/:path*',
    '/api/transcribe/:path*',
  ],
}; 