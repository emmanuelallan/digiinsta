/**
 * Admin Database Operations
 *
 * Handles database operations for admin authentication.
 * Separated from pure authorization logic for testability.
 *
 * Requirements: 8.2, 8.3
 */

import { sql } from "@/lib/db/client";
import { hashOTP, getOTPExpiration } from "./otp";
import { isAuthorizedAdmin } from "./admin";

/**
 * Store OTP for an admin email
 * Creates or updates the admin_sessions record with the OTP hash
 * @param email - The admin's email
 * @param otp - The plain text OTP
 * @returns True if stored successfully
 */
export async function storeAdminOTP(email: string, otp: string): Promise<boolean> {
  if (!isAuthorizedAdmin(email)) {
    return false;
  }

  const otpHash = hashOTP(otp);
  const otpExpiresAt = getOTPExpiration();

  // Upsert: insert or update existing record
  await sql`
    INSERT INTO admin_sessions (email, otp_hash, otp_expires_at)
    VALUES (${email.toLowerCase().trim()}, ${otpHash}, ${otpExpiresAt.toISOString()})
    ON CONFLICT (email) 
    DO UPDATE SET 
      otp_hash = ${otpHash},
      otp_expires_at = ${otpExpiresAt.toISOString()},
      session_token = NULL,
      session_expires_at = NULL
  `;

  return true;
}

/**
 * Verify OTP for an admin email
 * @param email - The admin's email
 * @param otp - The plain text OTP to verify
 * @returns True if OTP is valid and not expired
 */
export async function verifyAdminOTP(email: string, otp: string): Promise<boolean> {
  if (!isAuthorizedAdmin(email)) {
    return false;
  }

  const result = await sql`
    SELECT otp_hash, otp_expires_at
    FROM admin_sessions
    WHERE email = ${email.toLowerCase().trim()}
      AND otp_hash IS NOT NULL
      AND otp_expires_at > NOW()
  `;

  if (result.length === 0) {
    return false;
  }

  const row = result[0];
  if (!row) {
    return false;
  }

  const storedHash = row.otp_hash as string;
  const otpHash = hashOTP(otp);

  // Timing-safe comparison
  if (otpHash.length !== storedHash.length) {
    return false;
  }
  let match = 0;
  for (let i = 0; i < otpHash.length; i++) {
    match |= otpHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }

  return match === 0;
}
