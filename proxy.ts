import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/lib/auth';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'digiinsta_session';

/**
 * Authentication proxy for protecting admin routes
 * Validates session tokens and redirects unauthenticated requests
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session token in cookies
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // If accessing the login page
  if (pathname === '/admin' || pathname === '/admin/') {
    // If user has a session token, validate it
    if (sessionToken) {
      const sessionManager = new SessionManager();
      const isValid = await sessionManager.validateSession(sessionToken);
      
      // If session is valid, redirect to dashboard (user is already logged in)
      if (isValid) {
        const dashboardUrl = new URL('/admin/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      
      // If session is invalid, clear the cookie and allow access to login page
      const response = NextResponse.next();
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
    
    // No session token, allow access to login page
    return NextResponse.next();
  }

  // For all other admin routes, require authentication
  if (!sessionToken) {
    // No session token, redirect to login
    const loginUrl = new URL('/admin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Validate the session token
  const sessionManager = new SessionManager();
  const isValid = await sessionManager.validateSession(sessionToken);

  if (!isValid) {
    // Invalid or expired session, redirect to login
    const loginUrl = new URL('/admin', request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear the invalid session cookie
    response.cookies.delete(SESSION_COOKIE_NAME);
    
    return response;
  }

  // Session is valid, allow the request to proceed
  return NextResponse.next();
}

/**
 * Configure which routes the proxy should run on
 * Applies to all /admin routes including the login page
 */
export const config = {
  matcher: [
    '/admin',        // Match /admin (login page)
    '/admin/',       // Match /admin/ (login page with trailing slash)
    '/admin/:path+', // Match all /admin routes with at least one path segment
  ],
};
