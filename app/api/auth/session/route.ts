import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/auth';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'digiinsta_session';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { valid: false, error: 'No session token found' },
        { status: 401 }
      );
    }

    const authService = new AuthenticationService();
    const sessionManager = authService.getSessionManager();
    const isValid = await sessionManager.validateSession(sessionToken);

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: 'Session is invalid or expired' },
        { status: 401 }
      );
    }

    // Get session details
    const session = await sessionManager.getSession(sessionToken);

    return NextResponse.json({
      valid: true,
      email: session?.email,
    });
  } catch (error) {
    console.error('Error in session route:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
