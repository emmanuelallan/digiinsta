/**
 * Payload CMS Hook Factories for Revalidation
 *
 * Creates afterChange and afterDelete hooks that trigger on-demand cache revalidation.
 * Hooks are non-blocking (fire and forget) to ensure CMS save operations complete
 * regardless of revalidation status.
 *
 * Validates: Requirements 1.1, 1.4, 1.5
 */

import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { logger } from "@/lib/logger";
import {
  triggerRevalidationAsync,
  type CollectionType,
  type OperationType,
  type RevalidationDocument,
} from "./service";

/**
 * Extract document data for revalidation context
 * Handles the nested relationship structure from Payload
 */
function extractDocumentData(
  doc: Record<string, unknown>,
  previousDoc?: Record<string, unknown>
): RevalidationDocument {
  const subcategory = doc.subcategory as
    | {
        id?: number;
        slug?: string;
        category?: { id?: number; slug?: string } | null;
      }
    | number
    | null
    | undefined;

  const category = doc.category as
    | {
        id?: number;
        slug?: string;
      }
    | number
    | null
    | undefined;

  // Handle subcategory - could be populated object or just ID
  let subcategoryData: RevalidationDocument["subcategory"] = null;
  if (subcategory && typeof subcategory === "object" && "slug" in subcategory) {
    subcategoryData = {
      id: subcategory.id ?? 0,
      slug: subcategory.slug ?? "",
      category:
        subcategory.category && typeof subcategory.category === "object"
          ? {
              id: subcategory.category.id ?? 0,
              slug: subcategory.category.slug ?? "",
            }
          : null,
    };
  }

  // Handle category - could be populated object or just ID
  let categoryData: RevalidationDocument["category"] = null;
  if (category && typeof category === "object" && "slug" in category) {
    categoryData = {
      id: category.id ?? 0,
      slug: category.slug ?? "",
    };
  }

  // Extract tags array
  const tags = doc.tags as Array<{ tag?: string | null }> | null | undefined;

  // Get previous status for status change detection
  const previousStatus = previousDoc?.status as string | null | undefined;

  return {
    id: (doc.id as number) ?? 0,
    slug: (doc.slug as string) ?? "",
    status: (doc.status as string) ?? null,
    previousStatus: previousStatus ?? null,
    tags: tags ?? null,
    subcategory: subcategoryData,
    category: categoryData,
  };
}

/**
 * Determine the operation type based on hook context
 */
function determineOperation(
  operation: "create" | "update",
  doc: RevalidationDocument
): OperationType {
  // If status changed from draft to active, treat as creation for revalidation purposes
  if (operation === "update" && doc.previousStatus === "draft" && doc.status === "active") {
    return "create";
  }
  return operation;
}

/**
 * Create an afterChange hook for a Payload collection
 *
 * This hook triggers revalidation when documents are created or updated.
 * It's non-blocking - the CMS save completes regardless of revalidation status.
 *
 * @param collection - The collection type for revalidation context
 * @returns Payload afterChange hook function
 */
export function createRevalidationAfterChangeHook(
  collection: CollectionType
): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, operation }) => {
    try {
      // Extract document data with previous status for change detection
      const documentData = extractDocumentData(
        doc as Record<string, unknown>,
        previousDoc as Record<string, unknown> | undefined
      );

      // Determine effective operation (draft→active treated as create)
      const effectiveOperation = determineOperation(operation, documentData);

      logger.info(
        {
          collection,
          operation: effectiveOperation,
          slug: documentData.slug,
          statusChange:
            documentData.previousStatus !== documentData.status
              ? `${documentData.previousStatus} → ${documentData.status}`
              : null,
        },
        "Revalidation hook triggered"
      );

      // Fire and forget - don't await, don't block CMS save
      triggerRevalidationAsync({
        collection,
        operation: effectiveOperation,
        doc: documentData,
      });
    } catch (error) {
      // Log error but don't throw - never block CMS save operation
      logger.error(
        {
          collection,
          operation,
          slug: (doc as Record<string, unknown>)?.slug,
          error: error instanceof Error ? error.message : String(error),
        },
        "Revalidation hook error (non-blocking)"
      );
    }

    // Always return the doc to continue the Payload pipeline
    return doc;
  };
}

/**
 * Create an afterDelete hook for a Payload collection
 *
 * This hook triggers revalidation when documents are deleted.
 * It's non-blocking - the CMS delete completes regardless of revalidation status.
 *
 * @param collection - The collection type for revalidation context
 * @returns Payload afterDelete hook function
 */
export function createRevalidationAfterDeleteHook(
  collection: CollectionType
): CollectionAfterDeleteHook {
  return async ({ doc }) => {
    try {
      // Extract document data
      const documentData = extractDocumentData(doc as Record<string, unknown>);

      logger.info(
        {
          collection,
          operation: "delete",
          slug: documentData.slug,
        },
        "Revalidation delete hook triggered"
      );

      // Fire and forget - don't await, don't block CMS delete
      triggerRevalidationAsync({
        collection,
        operation: "delete",
        doc: documentData,
      });
    } catch (error) {
      // Log error but don't throw - never block CMS delete operation
      logger.error(
        {
          collection,
          operation: "delete",
          slug: (doc as Record<string, unknown>)?.slug,
          error: error instanceof Error ? error.message : String(error),
        },
        "Revalidation delete hook error (non-blocking)"
      );
    }

    // Always return the doc to continue the Payload pipeline
    return doc;
  };
}

/**
 * Check if a document's status has changed in a way that affects listings
 *
 * @param doc - Document with current and previous status
 * @returns True if status changed to/from active or archived
 */
export function hasListingAffectingStatusChange(doc: RevalidationDocument): boolean {
  if (!doc.previousStatus || !doc.status) {
    return false;
  }

  if (doc.previousStatus === doc.status) {
    return false;
  }

  // Status changes that affect listings:
  // - draft → active (item now visible)
  // - active → archived (item no longer visible)
  // - archived → active (item visible again)
  // - active → draft (item no longer visible)
  const visibilityChangingStatuses = ["active", "archived", "draft"];
  return (
    visibilityChangingStatuses.includes(doc.previousStatus) &&
    visibilityChangingStatuses.includes(doc.status)
  );
}
