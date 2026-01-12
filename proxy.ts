/**
 * Admin Route Protection Proxy
 *
 * Proxy that runs before requests to check authentication status.
 * - Protected routes: Redirect to /login if no valid session
 * - Auth routes: Redirect to /dashboard if already authenticated
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Cookie name for admin session */
const SESSION_COOKIE_NAME = "admin-session";

/** Protected routes that require authentication */
const PROTECTED_ROUTES = ["/dashboard", "/creators", "/upload"];

/** Auth routes that should redirect if authenticated */
const AUTH_ROUTES = ["/login"];

/**
 * Check if a path matches any of the protected routes
 * @param path - The request path
 * @returns True if the path is a protected route
 */
function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

/**
 * Check if a path matches any of the auth routes
 * @param path - The request path
 * @returns True if the path is an auth route
 */
function isAuthRoute(path: string): boolean {
  return AUTH_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

/**
 * Check if the request has a valid session cookie
 * Note: This is a lightweight check (cookie presence only).
 * Full validation happens in the layout/page components.
 * @param request - The incoming request
 * @returns True if session cookie is present and non-empty
 */
function hasSessionCookie(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  return !!sessionCookie?.value;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = hasSessionCookie(request);

  // Protected routes: Redirect to login if not authenticated
  if (isProtectedRoute(pathname)) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Allow authenticated users to proceed
    return NextResponse.next();
  }

  // Auth routes: Redirect to dashboard if already authenticated
  if (isAuthRoute(pathname)) {
    if (hasSession) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Allow unauthenticated users to see login form
    return NextResponse.next();
  }

  // All other routes: Pass through
  return NextResponse.next();
}

/**
 * Proxy configuration
 * Only run proxy on admin-related routes for performance
 */
export const config = {
  matcher: [
    // Protected admin routes
    "/dashboard/:path*",
    "/creators/:path*",
    "/upload/:path*",
    // Auth routes
    "/login/:path*",
  ],
};
