/**
 * Admin Login API Route
 *
 * Sends OTP to authorized admin emails for passwordless authentication.
 *
 * Requirements: 8.2, 8.3
 */

import { type NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/auth/admin";
import { generateOTP } from "@/lib/auth/otp";
import { storeAdminOTP } from "@/lib/auth/admin-db";
import { sendEmail, emailTemplates } from "@/lib/email";

// Rate limiting: track requests per email
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

export async function POST(request: NextRequest) {
  console.log("[AUTH/LOGIN] Received login request");

  try {
    const body = await request.json();
    const { email } = body;

    console.log("[AUTH/LOGIN] Email:", email);

    if (!email || typeof email !== "string") {
      console.log("[AUTH/LOGIN] Invalid email");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("[AUTH/LOGIN] Normalized email:", normalizedEmail);

    // Check if email is authorized
    if (!isAuthorizedAdmin(normalizedEmail)) {
      console.log("[AUTH/LOGIN] Email not authorized");
      // Return generic error to prevent email enumeration
      return NextResponse.json(
        { error: "If this email is registered, you will receive a login code" },
        { status: 200 }
      );
    }

    console.log("[AUTH/LOGIN] Email is authorized");

    // Check rate limit
    if (!checkRateLimit(normalizedEmail)) {
      console.log("[AUTH/LOGIN] Rate limited");
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Generate and store OTP
    const otp = generateOTP();
    console.log("[AUTH/LOGIN] Generated OTP:", otp);

    const stored = await storeAdminOTP(normalizedEmail, otp);
    console.log("[AUTH/LOGIN] OTP stored:", stored);

    if (!stored) {
      console.log("[AUTH/LOGIN] Failed to store OTP");
      return NextResponse.json({ error: "Failed to process login request" }, { status: 500 });
    }

    // Send OTP email
    const emailContent = emailTemplates.adminOTP(otp);
    console.log("[AUTH/LOGIN] Sending OTP email to", normalizedEmail);

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
      console.log("[AUTH/LOGIN] OTP email sent successfully");
    } catch (emailError) {
      console.error("[AUTH/LOGIN] Failed to send OTP email:", emailError);
      // Still return success to prevent email enumeration
    }

    return NextResponse.json(
      { message: "If this email is registered, you will receive a login code" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AUTH/LOGIN] Error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
