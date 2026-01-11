/**
 * Creator Report Token Generation and Validation
 *
 * Provides secure token generation for creator reports with configurable expiration.
 * Tokens are stored in Neon PostgreSQL and validated before granting access.
 *
 * Requirements: 4.4 - Creator report generation with expiring links
 */

import { randomBytes } from "crypto";
import { sql } from "../db/client";

/** Default token expiration time in milliseconds (7 days) */
export const DEFAULT_TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

/** Token length in bytes (32 bytes = 64 hex characters) */
export const TOKEN_LENGTH_BYTES = 32;

/**
 * Creator report token data
 */
export interface CreatorReportToken {
  /** Unique token identifier */
  id: number;
  /** Creator's Sanity ID */
  creatorSanityId: string;
  /** The token string */
  token: string;
  /** Token expiration timestamp */
  expiresAt: Date;
  /** Token creation timestamp */
  createdAt: Date;
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  /** Whether the token is valid */
  valid: boolean;
  /** Creator's Sanity ID if valid */
  creatorSanityId?: string;
  /** Error message if invalid */
  error?: string;
}

/**
 * Generate a cryptographically secure token
 * @returns A 64-character hex string
 */
export function generateToken(): string {
  return randomBytes(TOKEN_LENGTH_BYTES).toString("hex");
}

/**
 * Calculate token expiration timestamp
 * @param expirationMs - Expiration time in milliseconds (default: 7 days)
 * @returns Date object representing when the token expires
 */
export function getTokenExpiration(expirationMs: number = DEFAULT_TOKEN_EXPIRATION_MS): Date {
  return new Date(Date.now() + expirationMs);
}

/**
 * Check if a token has expired
 * @param expiresAt - The expiration timestamp
 * @returns True if the token has expired
 */
export function isTokenExpired(expiresAt: Date | string): boolean {
  const expiration = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return Date.now() > expiration.getTime();
}

/**
 * Generate and store a creator report token
 *
 * @param creatorSanityId - The creator's Sanity document ID
 * @param expirationMs - Optional custom expiration time in milliseconds
 * @returns The generated token data
 */
export async function generateReportToken(
  creatorSanityId: string,
  expirationMs: number = DEFAULT_TOKEN_EXPIRATION_MS
): Promise<CreatorReportToken> {
  if (!creatorSanityId || typeof creatorSanityId !== "string") {
    throw new Error("Invalid creator Sanity ID");
  }

  const token = generateToken();
  const expiresAt = getTokenExpiration(expirationMs);

  const result = await sql`
    INSERT INTO creator_report_tokens (creator_sanity_id, token, expires_at)
    VALUES (${creatorSanityId}, ${token}, ${expiresAt.toISOString()})
    RETURNING id, creator_sanity_id, token, expires_at, created_at
  `;

  const row = result[0];
  if (!row) {
    throw new Error("Failed to create report token");
  }

  return {
    id: row.id as number,
    creatorSanityId: row.creator_sanity_id as string,
    token: row.token as string,
    expiresAt: new Date(row.expires_at as string),
    createdAt: new Date(row.created_at as string),
  };
}

/**
 * Validate a creator report token
 *
 * @param token - The token to validate
 * @returns Validation result with creator ID if valid
 */
export async function validateReportToken(token: string): Promise<TokenValidationResult> {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Invalid token format" };
  }

  const result = await sql`
    SELECT creator_sanity_id, expires_at
    FROM creator_report_tokens
    WHERE token = ${token}
    LIMIT 1
  `;

  const row = result[0];
  if (!row) {
    return { valid: false, error: "Token not found" };
  }

  const expiresAt = new Date(row.expires_at as string);

  if (isTokenExpired(expiresAt)) {
    return { valid: false, error: "Token has expired" };
  }

  return {
    valid: true,
    creatorSanityId: row.creator_sanity_id as string,
  };
}

/**
 * Revoke a creator report token
 *
 * @param token - The token to revoke
 * @returns True if the token was revoked
 */
export async function revokeReportToken(token: string): Promise<boolean> {
  if (!token || typeof token !== "string") {
    return false;
  }

  const result = await sql`
    DELETE FROM creator_report_tokens
    WHERE token = ${token}
    RETURNING id
  `;

  return result.length > 0;
}

/**
 * Clean up expired tokens
 *
 * @returns Number of tokens deleted
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await sql`
    DELETE FROM creator_report_tokens
    WHERE expires_at < NOW()
    RETURNING id
  `;

  return result.length;
}

/**
 * Get all active tokens for a creator
 *
 * @param creatorSanityId - The creator's Sanity document ID
 * @returns Array of active tokens
 */
export async function getCreatorTokens(creatorSanityId: string): Promise<CreatorReportToken[]> {
  if (!creatorSanityId || typeof creatorSanityId !== "string") {
    return [];
  }

  const result = await sql`
    SELECT id, creator_sanity_id, token, expires_at, created_at
    FROM creator_report_tokens
    WHERE creator_sanity_id = ${creatorSanityId}
      AND expires_at > NOW()
    ORDER BY created_at DESC
  `;

  return result.map((row) => ({
    id: row.id as number,
    creatorSanityId: row.creator_sanity_id as string,
    token: row.token as string,
    expiresAt: new Date(row.expires_at as string),
    createdAt: new Date(row.created_at as string),
  }));
}
