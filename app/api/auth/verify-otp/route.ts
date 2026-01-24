import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/auth';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'digiinsta_session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { success: false, error: 'OTP is required' },
        { status: 400 }
      );
    }

    const authService = new AuthenticationService();
    const result = await authService.verifyOTP(email, otp);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Set session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, result.sessionToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
