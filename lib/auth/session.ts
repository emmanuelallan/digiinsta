/**
 * Admin Session Management
 *
 * Handles session creation, validation, and destruction
 * for admin authentication using Neon PostgreSQL.
 *
 * Requirements: 8.3
 */

import { randomBytes } from "crypto";
import { sql } from "@/lib/db/client";

/** Session expiration time in milliseconds (7 days) */
export const SESSION_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Session token length in bytes (32 bytes = 64 hex chars) */
const SESSION_TOKEN_LENGTH = 32;

export interface AdminSession {
  id: number;
  email: string;
  sessionToken: string;
  sessionExpiresAt: Date;
  createdAt: Date;
}

/**
 * Generate a cryptographically secure session token
 * @returns A 64-character hex string
 */
export function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_LENGTH).toString("hex");
}

/**
 * Calculate session expiration timestamp
 * @returns Date object representing when the session expires (7 days from now)
 */
export function getSessionExpiration(): Date {
  return new Date(Date.now() + SESSION_EXPIRATION_MS);
}

/**
 * Create a new admin session
 * @param email - The admin's email address
 * @returns The created session with token
 */
export async function createSession(email: string): Promise<AdminSession> {
  const sessionToken = generateSessionToken();
  const sessionExpiresAt = getSessionExpiration();

  // Update existing session record with new session token
  const result = await sql`
    UPDATE admin_sessions
    SET 
      session_token = ${sessionToken},
      session_expires_at = ${sessionExpiresAt.toISOString()},
      otp_hash = NULL,
      otp_expires_at = NULL
    WHERE email = ${email}
    RETURNING id, email, session_token, session_expires_at, created_at
  `;

  if (result.length === 0) {
    throw new Error("No pending session found for email");
  }

  const row = result[0]!;
  return {
    id: row.id as number,
    email: row.email as string,
    sessionToken: row.session_token as string,
    sessionExpiresAt: new Date(row.session_expires_at as string),
    createdAt: new Date(row.created_at as string),
  };
}

/**
 * Validate a session token
 * @param sessionToken - The session token to validate
 * @returns The session if valid, null otherwise
 */
export async function validateSession(sessionToken: string): Promise<AdminSession | null> {
  if (!sessionToken) {
    return null;
  }

  const result = await sql`
    SELECT id, email, session_token, session_expires_at, created_at
    FROM admin_sessions
    WHERE session_token = ${sessionToken}
      AND session_expires_at > NOW()
  `;

  if (result.length === 0) {
    return null;
  }

  const row = result[0]!;
  return {
    id: row.id as number,
    email: row.email as string,
    sessionToken: row.session_token as string,
    sessionExpiresAt: new Date(row.session_expires_at as string),
    createdAt: new Date(row.created_at as string),
  };
}

/**
 * Destroy a session (logout)
 * @param sessionToken - The session token to destroy
 * @returns True if session was destroyed, false if not found
 */
export async function destroySession(sessionToken: string): Promise<boolean> {
  if (!sessionToken) {
    return false;
  }

  const result = await sql`
    UPDATE admin_sessions
    SET 
      session_token = NULL,
      session_expires_at = NULL
    WHERE session_token = ${sessionToken}
    RETURNING id
  `;

  return result.length > 0;
}

/**
 * Check if a session has expired
 * @param expiresAt - The expiration timestamp
 * @returns True if the session has expired
 */
export function isSessionExpired(expiresAt: Date | string): boolean {
  const expiration = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return Date.now() > expiration.getTime();
}
