import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/auth';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'digiinsta_session';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      const authService = new AuthenticationService();
      const sessionManager = authService.getSessionManager();
      await sessionManager.invalidateSession(sessionToken);
    }

    // Clear session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error('Error in logout route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
