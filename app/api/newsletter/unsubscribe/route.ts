import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/client";
import { logger } from "@/lib/logger";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";

/**
 * Newsletter unsubscription endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitResponse = await checkRateLimit(rateLimiters.newsletter, ip);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email, token } = body;

    if (!email && !token) {
      return NextResponse.json({ error: "Email or token is required" }, { status: 400 });
    }

    if (email) {
      await sql`
        DELETE FROM newsletter_subscribers WHERE email = ${email}
      `;
    }

    logger.info({ email }, "Newsletter unsubscription");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, "Newsletter unsubscription failed");
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
