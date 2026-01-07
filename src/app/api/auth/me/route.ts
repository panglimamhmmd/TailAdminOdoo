import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(session, secret);

    return NextResponse.json({
      user: {
        username: payload.username,
        role: payload.role || 'superadmin', // Default to superadmin if existing token lacks role
      }
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
