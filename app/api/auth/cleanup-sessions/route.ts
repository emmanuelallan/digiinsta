import { NextResponse } from 'next/server';
import { AuthenticationService } from '@/lib/auth';

/**
 * API route for cleaning up expired sessions
 * This can be called periodically or triggered manually
 */
export async function POST() {
  try {
    const authService = new AuthenticationService();
    const sessionManager = authService.getSessionManager();
    
    await sessionManager.cleanupExpiredSessions();

    return NextResponse.json({
      success: true,
      message: 'Expired sessions cleaned up successfully',
    });
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}
