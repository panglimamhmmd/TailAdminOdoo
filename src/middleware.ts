import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ALLOW ONLY /api/auth/*
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // BLOCK ALL OTHER /api/*
  if (pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: 'Unauthorized API access' },
      { status: 403 }
    );
  }

  // PUBLIC ROUTES
  const publicPaths = ['/signin', '/signup', '/login', '/404'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // PROTECTED ROUTES REQUIRE SESSION
  const session = request.cookies.get('session')?.value;
  if (!session) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    await jwtVerify(session, secret);
    return NextResponse.next();
  } catch (error) {
    console.error('JWT error:', error);
    return NextResponse.redirect(new URL('/404', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
