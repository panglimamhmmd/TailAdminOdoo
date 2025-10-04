// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const publicPaths = ['/signin', '/signup', '/404', '/login'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

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
    /*
     * Match all request paths except:
     * - api routes
     * - static files
     * - signin/signup (authentication pages)
     * - 404 page
     */
    '/((?!api|_next/static|_next/image|favicon.ico|signin|signup|404|forbidden).*)',
  ],
};