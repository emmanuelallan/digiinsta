/**
 * Analytics API Route
 * Provides dashboard data for client-side period switching
 */

import { type NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/analytics";
import type { TimePeriod } from "@/lib/analytics/types";

const VALID_PERIODS: TimePeriod[] = [
  "this-month",
  "last-month",
  "last-7-days",
  "last-30-days",
  "this-year",
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") as TimePeriod;

    // Validate period parameter
    if (!period || !VALID_PERIODS.includes(period)) {
      return NextResponse.json(
        { error: "Invalid period parameter" },
        { status: 400 },
      );
    }

    const data = await getDashboardData(period);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
