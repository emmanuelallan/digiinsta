import { type NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/storefront/search-suggestions";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { getCacheHeaders, cachePresets } from "@/lib/api-cache";

export async function GET(request: NextRequest) {
  // Rate limit: 60 requests per minute per IP (higher for suggestions)
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(rateLimiters.search, ip);
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      { suggestions: [] },
      { headers: getCacheHeaders(cachePresets.search) }
    );
  }

  try {
    const suggestions = await getSearchSuggestions(query, {
      productLimit: 4,
      categoryLimit: 2,
      includeRecentQueries: true,
    });

    return NextResponse.json({ suggestions }, { headers: getCacheHeaders(cachePresets.search) });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
