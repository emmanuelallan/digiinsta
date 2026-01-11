/**
 * Admin Authorization
 *
 * Handles admin authorization checks for the platform.
 * Only specific hardcoded emails are allowed to access admin features.
 *
 * Requirements: 8.1, 8.5
 */

/**
 * List of authorized admin emails
 * Only these emails can log in to the admin panel
 */
export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  "imma.allan@gmail.com",
  "mburuhildah2@gmail.com",
] as const;

/**
 * Check if an email is authorized to access admin features
 * @param email - The email to check
 * @returns True if the email is authorized
 */
export function isAuthorizedAdmin(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  const normalizedEmail = email.toLowerCase().trim();
  return AUTHORIZED_ADMIN_EMAILS.includes(
    normalizedEmail as (typeof AUTHORIZED_ADMIN_EMAILS)[number]
  );
}
