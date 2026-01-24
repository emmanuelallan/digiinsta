import slugify from 'slugify';

/**
 * Generate a URL-friendly slug from a title
 * Removes emojis, special characters, and converts to lowercase
 * 
 * @param title - The title to convert to a slug
 * @returns A URL-friendly slug
 * 
 * @example
 * generateSlug("Valentine's Day ❤️") // "valentines-day"
 * generateSlug("Kids & Family 👨‍👩‍👧‍👦") // "kids-and-family"
 * generateSlug("Professional Growth 📈") // "professional-growth"
 */
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,           // Convert to lowercase
    strict: true,          // Strip special characters except replacement
    remove: /[*+~.()'"!:@]/g, // Remove specific characters
    replacement: '-',      // Replace spaces with hyphens
    trim: true,            // Trim leading/trailing replacement chars
  });
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 * 
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 * 
 * @example
 * generateUniqueSlug("valentines-day", ["valentines-day"]) // "valentines-day-2"
 * generateUniqueSlug("valentines-day", ["valentines-day", "valentines-day-2"]) // "valentines-day-3"
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 2;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate if a string is a valid slug format
 * 
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with a hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
