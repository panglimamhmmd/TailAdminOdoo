import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  // ALWAYS ALLOW /api/auth/*
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // FOR OTHER /api/* ROUTES - CHECK AUTHENTICATION
  if (pathname.startsWith('/api')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    try {
      const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
      await jwtVerify(session, secret);
      // Authenticated, allow API access
      return NextResponse.next();
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
  }

  // PUBLIC ROUTES (pages)
  const publicPaths = ['/signin', '/signup', '/login', '/404'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // If already logged in and trying to access signin, redirect to home
    if (session && pathname.startsWith('/signin')) {
      try {
        const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
        await jwtVerify(session, secret);
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        // Invalid session, allow to continue to signin
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // PROTECTED ROUTES (pages) - REQUIRE SESSION
  if (!session) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    await jwtVerify(session, secret);
    return NextResponse.next();
  } catch (error) {
    console.error('JWT error:', error);
    // Clear invalid cookie and redirect to signin
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};