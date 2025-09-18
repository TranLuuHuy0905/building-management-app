// src/app/api/auth/session/route.ts
import { authAdmin } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Set session cookie on login
export async function POST(request: Request) {
  const { idToken } = await request.json();
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  try {
    const sessionCookie = await authAdmin.createSessionCookie(idToken, { expiresIn });
    cookies().set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ status: 'error' }, { status: 401 });
  }
}

// Clear session cookie on logout
export async function DELETE() {
  cookies().delete('__session');
  return NextResponse.json({ status: 'success' });
}