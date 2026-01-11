import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";

/**
 * Newsletter subscription endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitResponse = await checkRateLimit(rateLimiters.newsletter, ip);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email, interests } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await sql`
      INSERT INTO newsletter_subscribers (email, interests, subscribed_at)
      VALUES (${email}, ${interests || null}, NOW())
      ON CONFLICT (email) DO UPDATE SET interests = ${interests || null}
    `;

    logger.info({ email }, "Newsletter subscription");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, "Newsletter subscription failed");
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
