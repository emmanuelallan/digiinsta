/**
 * Admin Logout API Route
 *
 * Destroys admin session, clears cookie, and redirects to login.
 *
 * Requirements: 4.1, 4.2, 4.3
 */

import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin-session")?.value;

    if (sessionToken) {
      // Destroy session in database (Requirement 4.3)
      await destroySession(sessionToken);
    }

    // Clear session cookie (Requirement 4.1)
    cookieStore.delete("admin-session");

    // Redirect to /login (Requirement 4.2)
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl, { status: 303 });
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear the cookie even if database operation fails
    const cookieStore = await cookies();
    cookieStore.delete("admin-session");

    // Redirect to /login even on error
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }
}

// Also support GET for simple logout links
export async function GET(request: NextRequest) {
  return POST(request);
}
