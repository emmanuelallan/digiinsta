/**
 * Admin Revalidation API Route
 *
 * Provides a manual cache refresh endpoint for the Payload admin UI.
 * Allows admins to force revalidation of specific content.
 *
 * Requirements: 4.3
 */

import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";
import {
  triggerRevalidation,
  type CollectionType,
  type RevalidationDocument,
} from "@/lib/revalidation/service";
import { logger } from "@/lib/logger";

interface RevalidateRequestBody {
  collection: CollectionType;
  id: number;
  slug: string;
}

/**
 * POST /api/admin/revalidate
 *
 * Manually trigger cache revalidation for a specific document.
 * Requires admin authentication.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const payload = await getPayload({ config });
    const headersList = await headers();
    const { user } = await payload.auth({ headers: headersList });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const userRole = (user as unknown as { role?: string }).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = (await request.json()) as RevalidateRequestBody;
    const { collection, id, slug } = body;

    if (!collection || !id || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: collection, id, slug" },
        { status: 400 }
      );
    }

    // Validate collection type
    const validCollections: CollectionType[] = [
      "products",
      "categories",
      "subcategories",
      "bundles",
      "posts",
    ];
    if (!validCollections.includes(collection)) {
      return NextResponse.json({ error: "Invalid collection type" }, { status: 400 });
    }

    // Fetch the full document to get relationship data
    const doc = await payload.findByID({
      collection,
      id,
      depth: 2, // Get nested relationships
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Cast to a generic record type for flexible property access
    const docData = doc as unknown as Record<string, unknown>;

    // Build revalidation document
    const revalidationDoc: RevalidationDocument = {
      id: docData.id as number,
      slug: (docData.slug as string) ?? slug,
      status: (docData.status as string) ?? null,
      tags: (docData.tags as Array<{ tag?: string | null }>) ?? null,
      subcategory: null,
      category: null,
    };

    // Handle subcategory relationship for products
    if (collection === "products" && docData.subcategory) {
      const subcategory = docData.subcategory as {
        id?: number;
        slug?: string;
        category?: { id?: number; slug?: string } | null;
      };
      if (typeof subcategory === "object" && subcategory.slug) {
        revalidationDoc.subcategory = {
          id: subcategory.id ?? 0,
          slug: subcategory.slug,
          category: subcategory.category
            ? {
                id: subcategory.category.id ?? 0,
                slug: subcategory.category.slug ?? "",
              }
            : null,
        };
      }
    }

    // Handle category relationship for subcategories and posts
    if ((collection === "subcategories" || collection === "posts") && docData.category) {
      const category = docData.category as { id?: number; slug?: string };
      if (typeof category === "object" && category.slug) {
        revalidationDoc.category = {
          id: category.id ?? 0,
          slug: category.slug,
        };
      }
    }

    logger.info(
      {
        collection,
        id,
        slug,
        user: user.email,
      },
      "Manual revalidation triggered"
    );

    // Trigger revalidation
    const result = await triggerRevalidation({
      collection,
      operation: "update",
      doc: revalidationDoc,
    });

    return NextResponse.json({
      success: result.success,
      paths: result.paths,
      tags: result.tags,
      duration: result.duration,
      errors: result.errors,
    });
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      "Manual revalidation error"
    );

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
