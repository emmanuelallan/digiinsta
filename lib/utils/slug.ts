/**
 * Slug Generation Utility
 *
 * Generates URL-friendly slugs from titles/strings.
 * Used for products, categories, bundles, and blog posts.
 *
 * Requirements: 1.2 - Auto-generate URL-friendly slug from title
 */

/**
 * Generate a URL-friendly slug from a string
 *
 * Rules:
 * - Contains only lowercase letters, numbers, and hyphens
 * - Does not start or end with a hyphen
 * - Does not contain consecutive hyphens
 * - Is non-empty for non-empty input (returns 'untitled' for empty/whitespace-only input)
 *
 * @param input - The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(input: string): string {
  if (!input || typeof input !== "string") {
    return "untitled";
  }

  const slug = input
    // Convert to lowercase
    .toLowerCase()
    // Normalize unicode characters (e.g., é -> e)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, "-")
    // Remove all characters except lowercase letters, numbers, and hyphens
    .replace(/[^a-z0-9-]/g, "")
    // Replace consecutive hyphens with a single hyphen
    .replace(/-+/g, "-")
    // Remove leading hyphens
    .replace(/^-+/, "")
    // Remove trailing hyphens
    .replace(/-+$/, "");

  // Return 'untitled' if the result is empty
  return slug || "untitled";
}

/**
 * Check if a string is a valid slug
 *
 * @param slug - The string to validate
 * @returns True if the string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") {
    return false;
  }

  // Must contain only lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return false;
  }

  // Must not start or end with a hyphen
  if (slug.startsWith("-") || slug.endsWith("-")) {
    return false;
  }

  // Must not contain consecutive hyphens
  if (/--/.test(slug)) {
    return false;
  }

  return true;
}
