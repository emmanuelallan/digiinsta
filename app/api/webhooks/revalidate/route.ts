/**
 * On-Demand Revalidation Webhook
 *
 * Handles Payload CMS afterChange hooks to trigger ISR revalidation
 * for updated content (products, categories, subcategories, bundles).
 *
 * Requirements: 1.6 - WHEN a product is updated in CMS, THE System SHALL
 * trigger on-demand revalidation via webhook
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Webhook secret for authentication (should be set in environment variables)
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

/**
 * Supported collection types for revalidation
 */
type CollectionType = "products" | "categories" | "subcategories" | "bundles" | "posts";

/**
 * Payload CMS webhook payload structure
 */
interface PayloadWebhookPayload {
  collection: CollectionType;
  operation: "create" | "update" | "delete";
  doc: {
    id: number;
    slug: string;
    status?: string;
    subcategory?: {
      id: number;
      slug: string;
      category?: {
        id: number;
        slug: string;
      };
    };
    category?: {
      id: number;
      slug: string;
    };
  };
}

/**
 * Get paths to revalidate based on collection type and document
 */
function getPathsToRevalidate(payload: PayloadWebhookPayload): string[] {
  const { collection, doc } = payload;
  const paths: string[] = [];

  switch (collection) {
    case "products":
      // Revalidate the product page
      paths.push(`/products/${doc.slug}`);
      // Revalidate the products listing page
      paths.push("/products");
      // Revalidate related category and subcategory pages
      if (doc.subcategory) {
        paths.push(`/subcategories/${doc.subcategory.slug}`);
        if (doc.subcategory.category) {
          paths.push(`/categories/${doc.subcategory.category.slug}`);
        }
      }
      // Revalidate homepage (for new arrivals, best sellers, etc.)
      paths.push("/");
      break;

    case "categories":
      // Revalidate the category page
      paths.push(`/categories/${doc.slug}`);
      // Revalidate the categories listing page
      paths.push("/categories");
      // Revalidate homepage
      paths.push("/");
      break;

    case "subcategories":
      // Revalidate the subcategory page
      paths.push(`/subcategories/${doc.slug}`);
      // Revalidate parent category page
      if (doc.category) {
        paths.push(`/categories/${doc.category.slug}`);
      }
      // Revalidate categories listing
      paths.push("/categories");
      break;

    case "bundles":
      // Revalidate the bundle page
      paths.push(`/bundles/${doc.slug}`);
      // Revalidate the bundles listing page
      paths.push("/bundles");
      // Revalidate homepage (for featured bundles)
      paths.push("/");
      break;

    case "posts":
      // Revalidate the blog post page
      paths.push(`/blog/${doc.slug}`);
      // Revalidate the blog listing page
      paths.push("/blog");
      break;

    default:
      // Unknown collection, revalidate homepage as fallback
      paths.push("/");
  }

  return paths;
}

/**
 * POST handler for revalidation webhook
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

    // Parse the webhook payload
    const payload: PayloadWebhookPayload = await request.json();

    // Validate required fields
    if (!payload.collection || !payload.doc?.slug) {
      return NextResponse.json(
        { error: "Invalid payload: missing collection or doc.slug" },
        { status: 400 }
      );
    }

    // Get paths to revalidate
    const paths = getPathsToRevalidate(payload);

    // Revalidate all paths
    const revalidatedPaths: string[] = [];
    const errors: string[] = [];

    for (const path of paths) {
      try {
        revalidatePath(path);
        revalidatedPaths.push(path);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to revalidate ${path}: ${errorMessage}`);
      }
    }

    // Return response
    return NextResponse.json({
      success: true,
      collection: payload.collection,
      operation: payload.operation,
      slug: payload.doc.slug,
      revalidatedPaths,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Revalidation failed: ${errorMessage}` }, { status: 500 });
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Revalidation webhook is active",
    supportedCollections: ["products", "categories", "subcategories", "bundles", "posts"],
  });
}
