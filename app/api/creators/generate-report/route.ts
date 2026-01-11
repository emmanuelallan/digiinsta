/**
 * Creator Report Link Generation API
 *
 * Generates a secure, expiring report link for a creator.
 * Requires admin authentication.
 *
 * Requirements: 4.4
 */

import { type NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/auth/validate-admin";
import { generateReportToken } from "@/lib/creators/reports";

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await validateAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { creatorSanityId, expirationDays } = body;

    if (!creatorSanityId || typeof creatorSanityId !== "string") {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
    }

    // Calculate expiration (default 7 days)
    const days = typeof expirationDays === "number" && expirationDays > 0 ? expirationDays : 7;
    const expirationMs = days * 24 * 60 * 60 * 1000;

    // Generate token
    const tokenData = await generateReportToken(creatorSanityId, expirationMs);

    // Build report URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const reportUrl = `${baseUrl}/creator-report/${tokenData.token}`;

    return NextResponse.json({
      token: tokenData.token,
      reportUrl,
      expiresAt: tokenData.expiresAt.toISOString(),
      creatorSanityId: tokenData.creatorSanityId,
    });
  } catch (error) {
    console.error("Generate report error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate report link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
