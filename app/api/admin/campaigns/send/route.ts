import { type NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

/**
 * Campaign send endpoint
 * Sends email campaigns to subscribers
 *
 * TODO: Implement campaign management with Sanity
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, subject, content, recipients } = body;

    if (!subject || !content || !recipients) {
      return NextResponse.json(
        { error: "Subject, content, and recipients are required" },
        { status: 400 }
      );
    }

    let sent = 0;
    for (const email of recipients) {
      try {
        await sendEmail({
          to: email,
          subject,
          html: content,
        });
        sent++;
      } catch (error) {
        logger.error({ error, email }, "Failed to send campaign email");
      }
    }

    logger.info({ campaignId, sent, total: recipients.length }, "Campaign sent");

    return NextResponse.json({
      success: true,
      sent,
      total: recipients.length,
    });
  } catch (error) {
    logger.error({ error }, "Campaign send failed");
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
