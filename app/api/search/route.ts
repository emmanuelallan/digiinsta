import { type NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/storefront/search";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders, cachePresets } from "@/lib/api-cache";

export async function GET(request: NextRequest) {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(rateLimiters.search, ip);
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      {
        products: [],
        categories: [],
        bundles: [],
        totalResults: 0,
      },
      { headers: getCacheHeaders(cachePresets.search) }
    );
  }

  try {
    const results = await search(query, {
      productLimit: 6,
      categoryLimit: 3,
      bundleLimit: 3,
    });

    return NextResponse.json(results, {
      headers: getCacheHeaders(cachePresets.search),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
