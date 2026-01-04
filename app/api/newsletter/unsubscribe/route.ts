/**
 * Newsletter Unsubscribe API
 * Handles unsubscribe requests from email links
 */

import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { logger } from "@/lib/logger";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 3 requests per hour per IP (uses newsletter limiter)
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(rateLimiters.newsletter, ip);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const payload = await getPayload({ config });

    // Find the subscriber
    const subscribers = await payload.find({
      collection: "newsletter-subscribers",
      where: { email: { equals: normalizedEmail } },
      limit: 1,
    });

    if (subscribers.docs.length === 0) {
      // Don't reveal if email exists or not for privacy
      return NextResponse.json({ success: true });
    }

    const subscriber = subscribers.docs[0];
    if (!subscriber) {
      return NextResponse.json({ success: true });
    }

    // Update status to unsubscribed
    await payload.update({
      collection: "newsletter-subscribers",
      id: subscriber.id,
      data: {
        status: "unsubscribed",
        unsubscribedAt: new Date().toISOString(),
      },
    });

    logger.info({ email: normalizedEmail }, "Newsletter unsubscribe");

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, "Unsubscribe error");
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
