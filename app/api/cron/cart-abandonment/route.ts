/**
 * Cart Abandonment Email Cron Job
 * Sends reminder emails for abandoned checkouts
 *
 * Scheduled via QStash - configure in Upstash console:
 * Schedule: "0 0/2 * * *" (every 2 hours)
 * URL: https://digiinsta.store/api/cron/cart-abandonment
 */

import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { getPayload } from "payload";
import config from "@payload-config";
import { sendEmail, emailTemplates } from "@/lib/email";
import { logger } from "@/lib/logger";

async function handler() {
  try {
    const payload = await getPayload({ config });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store";

    // Find abandoned checkouts from 1-24 hours ago
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let sentCount = 0;

    const abandonedCheckouts = await payload.find({
      collection: "checkouts",
      where: {
        and: [
          { createdAt: { greater_than: twentyFourHoursAgo.toISOString() } },
          { createdAt: { less_than: oneHourAgo.toISOString() } },
          { completed: { equals: false } },
          { abandonmentEmailSent: { not_equals: true } },
          { email: { exists: true } },
        ],
      },
      limit: 100,
    });

    logger.info(
      { checkoutCount: abandonedCheckouts.docs.length },
      "Processing abandoned checkouts"
    );

    for (const checkout of abandonedCheckouts.docs) {
      try {
        if (!checkout.email) continue;

        const items = checkout.items as Array<{ title: string }> | undefined;
        const itemTitles = items?.map((item) => item.title) ?? ["Your items"];
        const cartUrl = checkout.checkoutUrl ?? `${appUrl}/cart`;

        const template = emailTemplates.cartAbandonment(itemTitles, cartUrl);

        await sendEmail({
          to: checkout.email,
          subject: template.subject,
          html: template.html,
          from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`,
        });

        await payload.update({
          collection: "checkouts",
          id: checkout.id,
          data: { abandonmentEmailSent: true },
        });

        sentCount++;
        logger.info(
          { checkoutId: checkout.id, email: checkout.email },
          "Cart abandonment email sent"
        );
      } catch (error) {
        logger.error({ error, checkoutId: checkout.id }, "Failed to send abandonment email");
      }
    }

    logger.info({ sentCount }, "Cart abandonment emails sent");

    return NextResponse.json({
      success: true,
      sentCount,
      processed: abandonedCheckouts.docs.length,
    });
  } catch (error) {
    logger.error({ error }, "Cart abandonment cron error");
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

// Verify QStash signature for security
export const POST = verifySignatureAppRouter(handler);
