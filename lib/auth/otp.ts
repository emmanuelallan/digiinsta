/**
 * OTP (One-Time Password) Generation and Validation
 *
 * Provides secure OTP generation, hashing, and verification
 * for admin authentication.
 *
 * Requirements: 8.2, 8.3
 */

import { createHash, randomBytes } from "crypto";

/** OTP expiration time in milliseconds (10 minutes) */
export const OTP_EXPIRATION_MS = 10 * 60 * 1000;

/** OTP length (6 digits) */
export const OTP_LENGTH = 6;

/**
 * Generate a cryptographically secure OTP
 * @returns A 6-digit numeric OTP string
 */
export function generateOTP(): string {
  // Generate random bytes and convert to a 6-digit number
  const buffer = randomBytes(4);
  const num = buffer.readUInt32BE(0);
  // Ensure 6 digits by taking modulo and padding
  const otp = (num % 1000000).toString().padStart(OTP_LENGTH, "0");
  return otp;
}

/**
 * Hash an OTP for secure storage
 * Uses SHA-256 for one-way hashing
 * @param otp - The plain text OTP
 * @returns The hashed OTP
 */
export function hashOTP(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

/**
 * Verify an OTP against a stored hash
 * @param otp - The plain text OTP to verify
 * @param hash - The stored hash to compare against
 * @returns True if the OTP matches the hash
 */
export function verifyOTP(otp: string, hash: string): boolean {
  const otpHash = hashOTP(otp);
  // Use timing-safe comparison to prevent timing attacks
  if (otpHash.length !== hash.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < otpHash.length; i++) {
    result |= otpHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Calculate OTP expiration timestamp
 * @returns Date object representing when the OTP expires (10 minutes from now)
 */
export function getOTPExpiration(): Date {
  return new Date(Date.now() + OTP_EXPIRATION_MS);
}

/**
 * Check if an OTP has expired
 * @param expiresAt - The expiration timestamp
 * @returns True if the OTP has expired
 */
export function isOTPExpired(expiresAt: Date | string): boolean {
  const expiration = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return Date.now() > expiration.getTime();
}
