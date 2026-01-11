/**
 * Admin OTP Verification API Route
 *
 * Verifies OTP and creates admin session.
 *
 * Requirements: 8.2, 8.3
 */

import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthorizedAdmin } from "@/lib/auth/admin";
import { verifyAdminOTP } from "@/lib/auth/admin-db";
import { createSession, SESSION_EXPIRATION_MS } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json({ error: "OTP is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is authorized
    if (!isAuthorizedAdmin(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email or OTP" }, { status: 401 });
    }

    // Verify OTP
    const isValid = await verifyAdminOTP(normalizedEmail, otp);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // Create session
    const session = await createSession(normalizedEmail);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("admin-session", session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_EXPIRATION_MS / 1000, // Convert to seconds
      path: "/",
    });

    return NextResponse.json(
      {
        message: "Login successful",
        email: session.email,
        expiresAt: session.sessionExpiresAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
