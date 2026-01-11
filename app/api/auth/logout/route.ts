/**
 * Admin Logout API Route
 *
 * Destroys admin session and clears cookie.
 *
 * Requirements: 8.3
 */

import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession } from "@/lib/auth/session";

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin-session")?.value;

    if (sessionToken) {
      // Destroy session in database
      await destroySession(sessionToken);
    }

    // Clear session cookie
    cookieStore.delete("admin-session");

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);

    // Still clear the cookie even if database operation fails
    const cookieStore = await cookies();
    cookieStore.delete("admin-session");

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
  }
}

// Also support GET for simple logout links
export async function GET(_request: NextRequest) {
  return POST(_request);
}
