"use server";

/**
 * Admin Login Server Actions
 *
 * Handles OTP-based authentication for admin users.
 * Uses server actions for reliable form handling.
 *
 * Requirements: 8.2, 8.3
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthorizedAdmin } from "@/lib/auth/admin";
import { generateOTP } from "@/lib/auth/otp";
import { storeAdminOTP, verifyAdminOTP } from "@/lib/auth/admin-db";
import { sendEmail, emailTemplates } from "@/lib/email";
import { createSession } from "@/lib/auth/session";

// Rate limiting: track requests per email (in-memory, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export type LoginState = {
  step: "email" | "otp";
  email?: string;
  error?: string;
  message?: string;
};

/**
 * Request OTP - sends a login code to the admin email
 * Requirements: 1.2, 1.3, 1.5
 */
export async function requestOTP(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  try {
    const email = formData.get("email") as string;

    if (!email || typeof email !== "string") {
      return { step: "email", error: "Email is required" };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is authorized (Requirement 1.2)
    if (!isAuthorizedAdmin(normalizedEmail)) {
      // Return error for unauthorized emails (Requirement 1.5)
      return {
        step: "email",
        error: "Invalid email address",
      };
    }

    // Check rate limit
    if (!checkRateLimit(normalizedEmail)) {
      return { step: "email", error: "Too many login attempts. Please try again later." };
    }

    // Generate and store OTP (Requirement 1.3)
    const otp = generateOTP();

    let stored = false;
    try {
      stored = await storeAdminOTP(normalizedEmail, otp);
    } catch (dbError) {
      console.error("[AUTH/LOGIN] Database error storing OTP:", dbError);
      return { step: "email", error: "Database connection error. Please try again." };
    }

    if (!stored) {
      return { step: "email", error: "Failed to process login request. Please try again." };
    }

    // Send OTP email (Requirement 1.3)
    const emailContent = emailTemplates.adminOTP(otp);
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error("[AUTH/LOGIN] Failed to send OTP email:", emailError);
      return { step: "email", error: "Failed to send login code. Please try again." };
    }

    return {
      step: "otp",
      email: normalizedEmail,
      message: "A login code has been sent to your email",
    };
  } catch (error) {
    console.error("[AUTH/LOGIN] Unexpected error in requestOTP:", error);
    return { step: "email", error: "Something went wrong. Please try again." };
  }
}

/**
 * Verify OTP - validates the code and creates a session
 * Requirements: 2.2, 2.3, 2.4, 5.1, 5.2
 */
export async function verifyOTP(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  if (!email || !otp) {
    return { step: "otp", email, error: "Email and OTP are required" };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedOTP = otp.trim();

  // Verify OTP against stored hash (Requirement 2.2)
  const isValid = await verifyAdminOTP(normalizedEmail, normalizedOTP);

  if (!isValid) {
    // Return error for invalid or expired OTP (Requirement 2.4)
    return { step: "otp", email: normalizedEmail, error: "Invalid or expired code" };
  }

  // Create session (Requirement 2.3, 5.1)
  const session = await createSession(normalizedEmail);

  // Set session cookie (Requirement 5.2)
  const cookieStore = await cookies();
  cookieStore.set("admin-session", session.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days (Requirement 5.3)
    path: "/",
  });

  // Redirect to dashboard (Requirement 2.3)
  redirect("/dashboard");
}

/**
 * Resend OTP - generates a new code and sends it
 * Requirements: 3.2
 */
export async function resendOTP(email: string): Promise<{ error?: string; message?: string }> {
  if (!email) {
    return { error: "Email is required" };
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if email is authorized
  if (!isAuthorizedAdmin(normalizedEmail)) {
    return { error: "Invalid email address" };
  }

  // Check rate limit
  if (!checkRateLimit(normalizedEmail)) {
    return { error: "Too many attempts. Please try again later." };
  }

  // Generate and store new OTP
  const otp = generateOTP();
  const stored = await storeAdminOTP(normalizedEmail, otp);

  if (!stored) {
    return { error: "Failed to send new code. Please try again." };
  }

  // Send OTP email
  const emailContent = emailTemplates.adminOTP(otp);
  try {
    await sendEmail({
      to: normalizedEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  } catch {
    return { error: "Failed to send new code. Please try again." };
  }

  return { message: "A new code has been sent to your email" };
}
