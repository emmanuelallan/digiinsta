import { NextRequest, NextResponse } from "next/server";
import { search } from "@/lib/storefront/search";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({
      products: [],
      categories: [],
      bundles: [],
      totalResults: 0,
    });
  }

  try {
    const results = await search(query, {
      productLimit: 6,
      categoryLimit: 3,
      bundleLimit: 3,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
