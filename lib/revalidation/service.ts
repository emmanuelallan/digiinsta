/**
 * Revalidation Service
 *
 * Central service that handles all revalidation logic for on-demand cache invalidation.
 * Triggered from Payload CMS hooks when content changes.
 *
 * Validates: Requirements 1.1, 1.5, 2.4, 2.5
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { logger } from "@/lib/logger";
import {
  getProductPaths,
  getCategoryPaths,
  getSubcategoryPaths,
  getBundlePaths,
  getPostPaths,
  getCollectionListingPaths,
} from "./paths";
import {
  getProductTags,
  getCategoryTags,
  getSubcategoryTags,
  getBundleTags,
  getPostTags,
  getCollectionTagsForProduct,
  COLLECTION_TAGS,
} from "./tags";

/**
 * Revalidation event listener type for admin notifications
 */
export type RevalidationEventListener = (event: {
  type: "success" | "warning" | "error";
  message: string;
  details?: {
    collection?: string;
    slug?: string;
    paths?: string[];
    tags?: string[];
    errors?: string[];
    duration?: number;
  };
}) => void;

// Event listeners for admin notifications
const eventListeners: Set<RevalidationEventListener> = new Set();

/**
 * Subscribe to revalidation events
 */
export function onRevalidationEvent(listener: RevalidationEventListener): () => void {
  eventListeners.add(listener);
  return () => eventListeners.delete(listener);
}

/**
 * Emit a revalidation event to all listeners
 */
function emitEvent(
  type: "success" | "warning" | "error",
  message: string,
  details?: {
    collection?: string;
    slug?: string;
    paths?: string[];
    tags?: string[];
    errors?: string[];
    duration?: number;
  }
): void {
  eventListeners.forEach((listener) => {
    try {
      listener({ type, message, details });
    } catch (error) {
      // Don't let listener errors affect the main flow
      logger.error({ error }, "Revalidation event listener error");
    }
  });
}

/**
 * Supported collection types for revalidation
 */
export type CollectionType = "products" | "categories" | "subcategories" | "bundles" | "posts";

/**
 * Supported operations that trigger revalidation
 */
export type OperationType = "create" | "update" | "delete";

/**
 * Document structure for revalidation context
 */
export interface RevalidationDocument {
  id: number;
  slug: string;
  status?: string | null;
  previousStatus?: string | null;
  tags?: Array<{ tag?: string | null }> | null;
  subcategory?: {
    id: number;
    slug: string;
    category?: {
      id: number;
      slug: string;
    } | null;
  } | null;
  category?: {
    id: number;
    slug: string;
  } | null;
}

/**
 * Context for revalidation operations
 */
export interface RevalidationContext {
  collection: CollectionType;
  operation: OperationType;
  doc: RevalidationDocument;
}

/**
 * Result of a revalidation operation
 */
export interface RevalidationResult {
  success: boolean;
  paths: string[];
  tags: string[];
  errors?: string[];
  duration?: number;
}

/**
 * Compute all paths that need to be revalidated based on the context
 *
 * @param context - Revalidation context with collection, operation, and document info
 * @returns Array of paths to revalidate
 */
export function computePathsToRevalidate(context: RevalidationContext): string[] {
  const { collection, operation, doc } = context;
  const paths: string[] = [];

  switch (collection) {
    case "products": {
      const subcategoryInfo = doc.subcategory
        ? {
            slug: doc.subcategory.slug,
            category: doc.subcategory.category || null,
          }
        : null;
      paths.push(...getProductPaths(doc.slug, subcategoryInfo));

      // For status changes or deletions, ensure all listing pages are revalidated
      if (operation === "delete" || hasStatusChanged(doc)) {
        paths.push(...getCollectionListingPaths());
      }
      break;
    }

    case "categories":
      paths.push(...getCategoryPaths(doc.slug));
      break;

    case "subcategories": {
      const categorySlug = doc.category?.slug || null;
      paths.push(...getSubcategoryPaths(doc.slug, categorySlug));
      break;
    }

    case "bundles":
      paths.push(...getBundlePaths(doc.slug));
      break;

    case "posts":
      paths.push(...getPostPaths(doc.slug));
      break;
  }

  // Remove duplicates
  return [...new Set(paths)];
}

/**
 * Compute all tags that need to be invalidated based on the context
 *
 * @param context - Revalidation context with collection, operation, and document info
 * @returns Array of tags to invalidate
 */
export function computeTagsToInvalidate(context: RevalidationContext): string[] {
  const { collection, operation, doc } = context;
  const tags: string[] = [];

  switch (collection) {
    case "products": {
      const subcategorySlug = doc.subcategory?.slug || null;
      const categorySlug = doc.subcategory?.category?.slug || null;
      tags.push(...getProductTags(doc.slug, subcategorySlug, categorySlug));

      // Add collection tags based on product tags
      const collectionTags = getCollectionTagsForProduct(doc.tags);
      tags.push(...collectionTags);

      // For new products, always invalidate new arrivals
      if (operation === "create") {
        tags.push(COLLECTION_TAGS.newArrivals);
      }

      // For status changes, invalidate all relevant collection tags
      if (hasStatusChanged(doc)) {
        tags.push(COLLECTION_TAGS.allProducts);
        tags.push(COLLECTION_TAGS.homepage);
        // Include collection tags for listing pages
        tags.push(...collectionTags);
      }

      // Always include homepage for products (they may appear in featured sections)
      tags.push(COLLECTION_TAGS.homepage);
      break;
    }

    case "categories":
      tags.push(...getCategoryTags(doc.slug));
      tags.push(COLLECTION_TAGS.homepage);
      break;

    case "subcategories": {
      const categorySlug = doc.category?.slug || null;
      tags.push(...getSubcategoryTags(doc.slug, categorySlug));
      break;
    }

    case "bundles":
      tags.push(...getBundleTags(doc.slug));
      tags.push(COLLECTION_TAGS.homepage);
      break;

    case "posts": {
      const categorySlug = doc.category?.slug || null;
      tags.push(...getPostTags(doc.slug, categorySlug));
      tags.push(COLLECTION_TAGS.homepage);
      break;
    }
  }

  // Remove duplicates
  return [...new Set(tags)];
}

/**
 * Check if the document's status has changed
 *
 * @param doc - Document with current and previous status
 * @returns True if status changed to/from active or archived
 */
function hasStatusChanged(doc: RevalidationDocument): boolean {
  if (!doc.previousStatus || !doc.status) {
    return false;
  }
  return doc.previousStatus !== doc.status;
}

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Trigger revalidation for paths and tags with retry logic
 *
 * @param context - Revalidation context
 * @returns Result of the revalidation operation
 */
export async function triggerRevalidation(
  context: RevalidationContext
): Promise<RevalidationResult> {
  const startTime = Date.now();
  const paths = computePathsToRevalidate(context);
  const tags = computeTagsToInvalidate(context);
  const errors: string[] = [];

  const executeRevalidation = async (attempt: number): Promise<boolean> => {
    try {
      // Revalidate all paths
      for (const path of paths) {
        revalidatePath(path, "page");
      }

      // Revalidate all tags (use expire: 0 for immediate invalidation from CMS hooks)
      for (const tag of tags) {
        revalidateTag(tag, { expire: 0 });
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Attempt ${attempt}: ${errorMessage}`);

      logger.error(
        {
          collection: context.collection,
          operation: context.operation,
          slug: context.doc.slug,
          error: errorMessage,
          attempt,
        },
        "Revalidation attempt failed"
      );

      return false;
    }
  };

  // First attempt
  let success = await executeRevalidation(1);

  // Retry once on failure (Requirement 1.5)
  if (!success) {
    await delay(100); // 100ms backoff
    success = await executeRevalidation(2);
  }

  const duration = Date.now() - startTime;

  if (success) {
    logger.info(
      {
        collection: context.collection,
        operation: context.operation,
        slug: context.doc.slug,
        paths,
        tags,
        duration,
      },
      "Revalidation triggered"
    );

    // Emit success event for admin notifications (Requirement 4.1)
    emitEvent("success", "Cache refreshed successfully", {
      collection: context.collection,
      slug: context.doc.slug,
      paths,
      tags,
      duration,
    });
  } else {
    logger.error(
      {
        collection: context.collection,
        operation: context.operation,
        slug: context.doc.slug,
        errors,
        duration,
      },
      "Revalidation failed after retry"
    );

    // Emit error event for admin notifications (Requirement 4.2)
    emitEvent("error", "Cache refresh failed", {
      collection: context.collection,
      slug: context.doc.slug,
      errors,
      duration,
    });
  }

  return {
    success,
    paths,
    tags,
    errors: errors.length > 0 ? errors : undefined,
    duration,
  };
}

/**
 * Fire-and-forget revalidation that never blocks
 * Used by Payload hooks to ensure CMS save operations complete regardless of revalidation status
 *
 * @param context - Revalidation context
 */
export function triggerRevalidationAsync(context: RevalidationContext): void {
  // Fire and forget - don't await
  triggerRevalidation(context).catch((error) => {
    logger.error(
      {
        collection: context.collection,
        operation: context.operation,
        slug: context.doc.slug,
        error: error instanceof Error ? error.message : String(error),
      },
      "Async revalidation failed unexpectedly"
    );
  });
}
