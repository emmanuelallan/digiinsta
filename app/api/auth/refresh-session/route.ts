import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/auth';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'digiinsta_session';

/**
 * API route for refreshing session expiration
 * This extends the session lifetime on user activity
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'No session token found' },
        { status: 401 }
      );
    }

    const authService = new AuthenticationService();
    const sessionManager = authService.getSessionManager();
    const refreshed = await sessionManager.refreshSession(sessionToken);

    if (!refreshed) {
      return NextResponse.json(
        { success: false, error: 'Session is invalid or expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
