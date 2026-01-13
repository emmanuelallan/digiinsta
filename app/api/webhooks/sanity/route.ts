/**
 * Sanity Webhook Handler
 *
 * Handles webhooks from Sanity CMS to trigger cache revalidation
 * when content is created, updated, or deleted.
 *
 * Setup in Sanity:
 * 1. Go to sanity.io/manage -> Your Project -> API -> Webhooks
 * 2. Create a new webhook with:
 *    - URL: https://your-domain.com/api/webhooks/sanity
 *    - Secret: Set SANITY_WEBHOOK_SECRET in your environment
 *    - Trigger on: Create, Update, Delete
 *    - Filter: _type in ["product", "category", "subcategory", "bundle", "post"]
 */

import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { COLLECTION_TAGS } from "@/lib/revalidation/tags";

// Webhook secret for authentication
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

/**
 * Sanity webhook payload structure
 */
interface SanityWebhookPayload {
  _id: string;
  _type: string;
  _rev?: string;
  slug?: { current: string };
  subcategory?: { _ref: string };
  category?: { _ref: string };
}

/**
 * Verify webhook signature (if secret is configured)
 */
function verifyWebhookSignature(request: NextRequest): boolean {
  if (!SANITY_WEBHOOK_SECRET) {
    // No secret configured, allow all requests (not recommended for production)
    console.warn("[Sanity Webhook] No SANITY_WEBHOOK_SECRET configured");
    return true;
  }

  const signature = request.headers.get("sanity-webhook-signature");
  if (!signature) {
    return false;
  }

  // Simple signature check - in production, use proper HMAC verification
  return signature === SANITY_WEBHOOK_SECRET;
}

/**
 * Get tags to revalidate based on document type
 */
function getTagsToRevalidate(doc: SanityWebhookPayload): string[] {
  const tags: string[] = [];

  switch (doc._type) {
    case "product":
      tags.push(COLLECTION_TAGS.allProducts);
      tags.push(COLLECTION_TAGS.newArrivals);
      tags.push(COLLECTION_TAGS.bestSellers);
      tags.push(COLLECTION_TAGS.editorsPicks);
      tags.push(COLLECTION_TAGS.onSale);
      if (doc.slug?.current) {
        tags.push(`product:${doc.slug.current}`);
      }
      break;

    case "category":
      tags.push(COLLECTION_TAGS.allCategories);
      if (doc.slug?.current) {
        tags.push(`category:${doc.slug.current}`);
      }
      break;

    case "subcategory":
      tags.push(COLLECTION_TAGS.allCategories);
      if (doc.slug?.current) {
        tags.push(`subcategory:${doc.slug.current}`);
      }
      break;

    case "bundle":
      tags.push(COLLECTION_TAGS.allBundles);
      if (doc.slug?.current) {
        tags.push(`bundle:${doc.slug.current}`);
      }
      break;

    case "post":
      tags.push(COLLECTION_TAGS.allPosts);
      if (doc.slug?.current) {
        tags.push(`post:${doc.slug.current}`);
      }
      break;

    case "heroSlide":
      tags.push(COLLECTION_TAGS.homepage);
      break;

    default:
      // Unknown type, revalidate homepage as fallback
      tags.push(COLLECTION_TAGS.homepage);
  }

  return tags;
}

/**
 * Get paths to revalidate based on document type
 */
function getPathsToRevalidate(doc: SanityWebhookPayload): string[] {
  const paths: string[] = [];

  switch (doc._type) {
    case "product":
      paths.push("/"); // Homepage (new arrivals, best sellers, etc.)
      paths.push("/products");
      paths.push("/new-arrivals");
      paths.push("/best-sellers");
      paths.push("/sale");
      if (doc.slug?.current) {
        paths.push(`/products/${doc.slug.current}`);
      }
      break;

    case "category":
      paths.push("/");
      paths.push("/categories");
      if (doc.slug?.current) {
        paths.push(`/categories/${doc.slug.current}`);
      }
      break;

    case "subcategory":
      paths.push("/categories");
      if (doc.slug?.current) {
        paths.push(`/subcategories/${doc.slug.current}`);
      }
      break;

    case "bundle":
      paths.push("/");
      paths.push("/bundles");
      if (doc.slug?.current) {
        paths.push(`/bundles/${doc.slug.current}`);
      }
      break;

    case "post":
      paths.push("/blog");
      if (doc.slug?.current) {
        paths.push(`/blog/${doc.slug.current}`);
      }
      break;

    case "heroSlide":
      paths.push("/");
      break;
  }

  return paths;
}

/**
 * POST handler for Sanity webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    if (!verifyWebhookSignature(request)) {
      console.error("[Sanity Webhook] Invalid signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the webhook payload
    const payload: SanityWebhookPayload = await request.json();

    console.log(`[Sanity Webhook] Received: ${payload._type} (${payload._id})`);

    // Get tags and paths to revalidate
    const tags = getTagsToRevalidate(payload);
    const paths = getPathsToRevalidate(payload);

    // Revalidate tags (using expire: 0 for immediate expiration in webhooks)
    for (const tag of tags) {
      try {
        revalidateTag(tag, { expire: 0 });
        console.log(`[Sanity Webhook] Revalidated tag: ${tag}`);
      } catch (error) {
        console.error(`[Sanity Webhook] Failed to revalidate tag ${tag}:`, error);
      }
    }

    // Revalidate paths
    for (const path of paths) {
      try {
        revalidatePath(path);
        console.log(`[Sanity Webhook] Revalidated path: ${path}`);
      } catch (error) {
        console.error(`[Sanity Webhook] Failed to revalidate path ${path}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      type: payload._type,
      id: payload._id,
      revalidatedTags: tags,
      revalidatedPaths: paths,
    });
  } catch (error) {
    console.error("[Sanity Webhook] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook processing failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Sanity webhook endpoint is active",
    setup: {
      step1: "Go to sanity.io/manage -> Your Project -> API -> Webhooks",
      step2: "Create a new webhook",
      step3: "Set URL to: https://your-domain.com/api/webhooks/sanity",
      step4: "Set secret to match SANITY_WEBHOOK_SECRET env variable",
      step5:
        'Set filter to: _type in ["product", "category", "subcategory", "bundle", "post", "heroSlide"]',
      step6: "Enable triggers: Create, Update, Delete",
    },
  });
}
