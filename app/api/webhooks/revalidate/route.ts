/**
 * Manual Revalidation Endpoint
 *
 * This endpoint serves as a manual trigger for cache revalidation.
 * The primary revalidation is now handled automatically via Payload CMS hooks
 * (see lib/revalidation/hooks.ts).
 *
 * This endpoint is kept for:
 * - Manual cache refresh from external systems
 * - Debugging and testing purposes
 * - Emergency cache invalidation
 *
 * Note: For normal content updates, revalidation happens automatically
 * when content is saved in Payload CMS.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  triggerRevalidation,
  type CollectionType,
  type OperationType,
  type RevalidationDocument,
} from "@/lib/revalidation/service";

// Webhook secret for authentication (should be set in environment variables)
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

/**
 * Request payload structure for manual revalidation
 */
interface ManualRevalidationPayload {
  collection: CollectionType;
  operation?: OperationType;
  doc: RevalidationDocument;
}

/**
 * POST handler for manual revalidation
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    if (REVALIDATION_SECRET) {
      const authHeader = request.headers.get("authorization");
      const providedSecret = authHeader?.replace("Bearer ", "");

      if (providedSecret !== REVALIDATION_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Parse the request payload
    const payload: ManualRevalidationPayload = await request.json();

    // Validate required fields
    if (!payload.collection || !payload.doc?.slug) {
      return NextResponse.json(
        { error: "Invalid payload: missing collection or doc.slug" },
        { status: 400 }
      );
    }

    // Trigger revalidation using the centralized service
    const result = await triggerRevalidation({
      collection: payload.collection,
      operation: payload.operation ?? "update",
      doc: {
        id: payload.doc.id ?? 0,
        slug: payload.doc.slug,
        status: payload.doc.status,
        previousStatus: payload.doc.previousStatus,
        tags: payload.doc.tags,
        subcategory: payload.doc.subcategory,
        category: payload.doc.category,
      },
    });

    // Return response
    return NextResponse.json({
      success: result.success,
      collection: payload.collection,
      operation: payload.operation ?? "update",
      slug: payload.doc.slug,
      revalidatedPaths: result.paths,
      invalidatedTags: result.tags,
      duration: result.duration,
      errors: result.errors,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Revalidation failed: ${errorMessage}` }, { status: 500 });
  }
}

/**
 * GET handler for health check and documentation
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Manual revalidation endpoint is active",
    note: "Primary revalidation is handled automatically via Payload CMS hooks",
    supportedCollections: ["products", "categories", "subcategories", "bundles", "posts"],
    usage: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer <REVALIDATION_SECRET>",
      },
      body: {
        collection: "products | categories | subcategories | bundles | posts",
        operation: "create | update | delete (optional, defaults to update)",
        doc: {
          id: "number (optional)",
          slug: "string (required)",
          status: "string (optional)",
          previousStatus: "string (optional)",
          tags: "[{ tag: string }] (optional)",
          subcategory: "{ slug, category?: { slug } } (optional)",
          category: "{ slug } (optional)",
        },
      },
    },
  });
}
