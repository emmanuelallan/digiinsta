"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isAuthorizedAdmin } from "@/lib/auth/admin";
import { generateOTP, hashOTP, verifyOTP } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { sql } from "@/lib/db/client";
import { sendEmail } from "@/lib/email";

/**
 * Sign in with email and password (simplified for admin)
 * This is a basic email/password auth that creates a session
 */
export async function signInWithEmail(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Check if email is authorized
  if (!isAuthorizedAdmin(email)) {
    return { error: "Unauthorized email address" };
  }

  // For admin auth, we use a simple password check
  // In production, this should be replaced with proper password hashing
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || password !== adminPassword) {
    return { error: "Invalid credentials" };
  }

  // Create session
  const session = await createSession(email);

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("admin_session", session.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  redirect("/dashboard");
}

/**
 * Request OTP for admin sign-in
 */
export async function requestOTP(email: string) {
  // Check if email is authorized
  if (!isAuthorizedAdmin(email)) {
    return { error: "Unauthorized email address" };
  }

  // Generate OTP
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in database
  await sql`
    INSERT INTO admin_sessions (email, otp_hash, otp_expires_at, created_at)
    VALUES (${email}, ${otpHash}, ${expiresAt.toISOString()}, NOW())
    ON CONFLICT (email) DO UPDATE SET
      otp_hash = ${otpHash},
      otp_expires_at = ${expiresAt.toISOString()}
  `;

  // Send OTP email
  await sendEmail({
    to: email,
    subject: "Your DigiInsta Admin Login Code",
    html: `
      <h1>Your Login Code</h1>
      <p>Your one-time password is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
    `,
  });

  return { success: true };
}

/**
 * Verify OTP and create session
 */
export async function verifyOTPAndSignIn(email: string, otp: string) {
  // Get stored OTP
  const result = await sql`
    SELECT otp_hash, otp_expires_at FROM admin_sessions
    WHERE email = ${email}
  `;

  if (result.length === 0) {
    return { error: "No OTP found. Please request a new one." };
  }

  const row = result[0] as { otp_hash: string; otp_expires_at: string };
  const { otp_hash, otp_expires_at } = row;

  // Check expiration
  if (new Date(otp_expires_at) < new Date()) {
    return { error: "OTP has expired. Please request a new one." };
  }

  // Verify OTP
  const isValid = await verifyOTP(otp, otp_hash);
  if (!isValid) {
    return { error: "Invalid OTP" };
  }

  // Create session
  const session = await createSession(email);

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("admin_session", session.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  redirect("/dashboard");
}
