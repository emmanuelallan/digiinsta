/**
 * Newsletter Subscribe API
 * Handles newsletter subscription requests
 */

import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { logger } from "@/lib/logger";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 3 requests per hour per IP
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(rateLimiters.newsletter, ip);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { email, firstName, source = "footer", interests } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const payload = await getPayload({ config });

    // Check if already subscribed
    const existing = await payload.find({
      collection: "newsletter-subscribers",
      where: { email: { equals: normalizedEmail } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      const subscriber = existing.docs[0];
      if (!subscriber) {
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }

      // If previously unsubscribed, re-subscribe
      if (subscriber.status === "unsubscribed") {
        await payload.update({
          collection: "newsletter-subscribers",
          id: subscriber.id,
          data: {
            status: "subscribed",
            subscribedAt: new Date().toISOString(),
            unsubscribedAt: null,
            ...(firstName && { firstName }),
            ...(interests && { interests }),
          },
        });

        logger.info({ email: normalizedEmail }, "Newsletter re-subscribe");
        return NextResponse.json({ success: true, resubscribed: true });
      }

      // Already subscribed
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    // Get IP and user agent for tracking
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create new subscriber
    await payload.create({
      collection: "newsletter-subscribers",
      data: {
        email: normalizedEmail,
        firstName: firstName || null,
        status: "subscribed",
        source,
        interests: interests || [],
        subscribedAt: new Date().toISOString(),
        ipAddress: ip,
        userAgent,
      },
    });

    logger.info({ email: normalizedEmail, source }, "Newsletter subscribe");

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, "Subscribe error");

    // Handle unique constraint violation
    if ((error as Error).message?.includes("unique")) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
