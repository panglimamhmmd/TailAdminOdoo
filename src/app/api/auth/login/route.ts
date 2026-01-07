// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Environment variables
    const pmUser = process.env.PM_USERNAME;
    const pmPass = process.env.PM_PASSWORD;
    const bodUser = process.env.BOD_USERNAME;
    const bodPass = process.env.BOD_PASSWORD;
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    let role = null;

    if (username === pmUser && password === pmPass) role = 'pm';
    else if (username === bodUser && password === bodPass) role = 'bod';
    else if (username === adminUser && password === adminPass) role = 'superadmin';

    if (!role) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }



    // Create JWT token
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const token = await new SignJWT({ username, role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}