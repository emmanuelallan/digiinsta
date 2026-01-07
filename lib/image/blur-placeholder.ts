/**
 * Blur Placeholder Generation
 *
 * Generates base64-encoded blur data URLs for product images.
 * These are used as placeholders while the full image loads,
 * improving perceived performance and preventing layout shifts.
 *
 * @module lib/image/blur-placeholder
 */

/**
 * Default blur placeholder - a tiny transparent image
 * Used as fallback when blur generation fails
 */
export const DEFAULT_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * Validates if a string is a valid base64 data URL
 *
 * @param dataUrl - The string to validate
 * @returns True if the string is a valid base64 data URL
 */
export function isValidBase64DataURL(dataUrl: string): boolean {
  if (!dataUrl || typeof dataUrl !== "string") {
    return false;
  }

  // Check for data URL prefix
  const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/;
  if (!dataUrlPattern.test(dataUrl)) {
    return false;
  }

  // Extract the base64 part
  const base64Part = dataUrl.split(",")[1];
  if (!base64Part) {
    return false;
  }

  // Validate base64 characters (A-Z, a-z, 0-9, +, /, =)
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Pattern.test(base64Part);
}

/**
 * Generates a blur data URL from an image URL
 *
 * This function fetches a small version of the image and converts it
 * to a base64-encoded data URL suitable for use as a blur placeholder.
 *
 * @param imageUrl - The URL of the image to generate a blur placeholder for
 * @param options - Configuration options
 * @returns A base64-encoded data URL or the default placeholder on error
 *
 * @example
 * const blurDataURL = await generateBlurDataURL("https://example.com/image.jpg");
 * // Returns: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 */
export async function generateBlurDataURL(
  imageUrl: string,
  options: {
    /** Width of the blur image (default: 10) */
    width?: number;
    /** Quality of the blur image 1-100 (default: 10) */
    quality?: number;
  } = {}
): Promise<string> {
  const { width = 10, quality = 10 } = options;

  // Validate input
  if (!imageUrl || typeof imageUrl !== "string") {
    console.warn("[blur-placeholder] Invalid image URL provided");
    return DEFAULT_BLUR_DATA_URL;
  }

  try {
    // For Next.js Image Optimization, we can use the built-in image loader
    // to get a small, optimized version of the image
    const optimizedUrl = getOptimizedImageUrl(imageUrl, width, quality);

    // Fetch the small image
    const response = await fetch(optimizedUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      console.warn(
        `[blur-placeholder] Failed to fetch image: ${response.status} ${response.statusText}`
      );
      return DEFAULT_BLUR_DATA_URL;
    }

    // Get the image as an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64
    const base64 = buffer.toString("base64");

    // Determine content type from response headers or URL
    const contentType = response.headers.get("content-type") || getMimeType(imageUrl);

    // Construct the data URL
    const dataUrl = `data:${contentType};base64,${base64}`;

    // Validate the generated data URL
    if (!isValidBase64DataURL(dataUrl)) {
      console.warn("[blur-placeholder] Generated invalid data URL");
      return DEFAULT_BLUR_DATA_URL;
    }

    return dataUrl;
  } catch (error) {
    console.warn("[blur-placeholder] Error generating blur data URL:", error);
    return DEFAULT_BLUR_DATA_URL;
  }
}

/**
 * Gets an optimized image URL using Next.js Image Optimization
 *
 * @param imageUrl - Original image URL
 * @param width - Desired width
 * @param quality - Desired quality (1-100)
 * @returns Optimized image URL
 */
function getOptimizedImageUrl(imageUrl: string, width: number, quality: number): string {
  // If it's already a relative URL or from our domain, use Next.js image optimization
  if (imageUrl.startsWith("/") || imageUrl.includes("digiinsta.store")) {
    // Use Next.js image optimization API
    const params = new URLSearchParams({
      url: imageUrl,
      w: width.toString(),
      q: quality.toString(),
    });
    return `/_next/image?${params.toString()}`;
  }

  // For external URLs, return as-is (will be fetched directly)
  return imageUrl;
}

/**
 * Gets the MIME type from a URL based on file extension
 *
 * @param url - The URL to extract MIME type from
 * @returns The MIME type string
 */
function getMimeType(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase().split("?")[0];

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    avif: "image/avif",
  };

  return mimeTypes[extension || ""] || "image/jpeg";
}

/**
 * Generates blur data URLs for multiple images in parallel
 *
 * @param imageUrls - Array of image URLs
 * @param options - Configuration options
 * @returns Array of blur data URLs in the same order as input
 *
 * @example
 * const blurDataURLs = await generateBlurDataURLs([
 *   "https://example.com/image1.jpg",
 *   "https://example.com/image2.jpg",
 * ]);
 */
export async function generateBlurDataURLs(
  imageUrls: string[],
  options: {
    width?: number;
    quality?: number;
    /** Maximum concurrent requests (default: 5) */
    concurrency?: number;
  } = {}
): Promise<string[]> {
  const { concurrency = 5, ...blurOptions } = options;

  // Process in batches to avoid overwhelming the server
  const results: string[] = [];

  for (let i = 0; i < imageUrls.length; i += concurrency) {
    const batch = imageUrls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((url) => generateBlurDataURL(url, blurOptions))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Creates a simple colored blur placeholder
 *
 * This is a lightweight alternative that doesn't require fetching the image.
 * Useful for generating placeholders at build time or when the image URL
 * is not yet available.
 *
 * @param color - Hex color code (e.g., "#f0f0f0")
 * @returns A base64-encoded SVG data URL
 *
 * @example
 * const placeholder = createColoredPlaceholder("#e5e7eb");
 * // Returns: "data:image/svg+xml;base64,..."
 */
export function createColoredPlaceholder(color: string = "#e5e7eb"): string {
  // Validate hex color
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const safeColor = hexPattern.test(color) ? color : "#e5e7eb";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="${safeColor}" width="1" height="1"/></svg>`;
  const base64 = Buffer.from(svg).toString("base64");

  return `data:image/svg+xml;base64,${base64}`;
}
