/**
 * Admin Session Validation Helper
 *
 * Validates admin sessions from request cookies.
 *
 * Requirements: 8.3, 8.5
 */

import { cookies } from "next/headers";
import { validateSession, type AdminSession } from "./session";

/** Cookie name for admin sessions */
export const ADMIN_SESSION_COOKIE = "admin-session";

/**
 * Validate admin session from request cookies
 *
 * @returns The admin session if valid, null otherwise
 */
export async function validateAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (!sessionToken) {
      return null;
    }

    return await validateSession(sessionToken);
  } catch (error) {
    console.error("Error validating admin session:", error);
    return null;
  }
}

/**
 * Check if the current request is from an authenticated admin
 *
 * @returns True if the request is from an authenticated admin
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await validateAdminSession();
  return session !== null;
}

/**
 * Get the admin email from the current session
 *
 * @returns The admin email if authenticated, null otherwise
 */
export async function getAdminEmail(): Promise<string | null> {
  const session = await validateAdminSession();
  return session?.email ?? null;
}
