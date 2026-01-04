/**
 * Send Email Campaign API
 * Admin-only endpoint to send email campaigns
 */

import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // Check authentication (must be admin)
    const { user } = await payload.auth({ headers: request.headers });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
    }

    // Get the campaign
    const campaign = await payload.findByID({
      collection: "email-campaigns",
      id: campaignId,
      depth: 2,
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status === "sent") {
      return NextResponse.json({ error: "Campaign already sent" }, { status: 400 });
    }

    // Update status to sending
    await payload.update({
      collection: "email-campaigns",
      id: campaignId,
      data: { status: "sending" },
    });

    // Get recipients based on audience
    const recipients = await getRecipients(payload, campaign);

    if (recipients.length === 0) {
      await payload.update({
        collection: "email-campaigns",
        id: campaignId,
        data: { status: "failed", errorMessage: "No recipients found" },
      });
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    // Build email HTML
    const emailHtml = buildCampaignHtml(campaign);

    // Send emails (in batches to avoid rate limits)
    let sentCount = 0;
    const batchSize = 50;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (email) => {
          try {
            await sendEmail({
              to: email,
              subject: campaign.subject,
              html: emailHtml,
              from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`,
            });
            sentCount++;
          } catch (error) {
            logger.error({ error, email }, "Failed to send campaign email");
            errors.push(email);
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status
    await payload.update({
      collection: "email-campaigns",
      id: campaignId,
      data: {
        status: errors.length === recipients.length ? "failed" : "sent",
        sentAt: new Date().toISOString(),
        recipientCount: sentCount,
        errorMessage: errors.length > 0 ? `Failed to send to ${errors.length} recipients` : null,
      },
    });

    logger.info({ campaignId, sentCount, errorCount: errors.length }, "Campaign sent");

    return NextResponse.json({
      success: true,
      sentCount,
      errorCount: errors.length,
    });
  } catch (error) {
    logger.error({ error }, "Campaign send error");
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}

/**
 * Get recipients based on campaign audience settings
 */
async function getRecipients(
  payload: Awaited<ReturnType<typeof getPayload>>,
  campaign: {
    audience?: string | null;
    interests?: string[] | null;
    customEmails?: string | null;
    excludePurchasers?: boolean | null;
    linkedProduct?: { id: number } | number | null;
  }
): Promise<string[]> {
  const audience = campaign.audience as string;
  const emails: Set<string> = new Set();

  switch (audience) {
    case "all-subscribers": {
      const subscribers = await payload.find({
        collection: "newsletter-subscribers",
        where: { status: { equals: "subscribed" } },
        limit: 10000,
      });
      subscribers.docs.forEach((sub) => emails.add(sub.email));
      break;
    }

    case "recent-customers": {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orders = await payload.find({
        collection: "orders",
        where: {
          createdAt: { greater_than: thirtyDaysAgo.toISOString() },
          status: { equals: "completed" },
        },
        limit: 10000,
      });
      orders.docs.forEach((order) => {
        if (order.email) emails.add(order.email);
      });
      break;
    }

    case "all-customers": {
      const orders = await payload.find({
        collection: "orders",
        where: { status: { equals: "completed" } },
        limit: 10000,
      });
      orders.docs.forEach((order) => {
        if (order.email) emails.add(order.email);
      });
      break;
    }

    case "by-interest": {
      const interests = campaign.interests;
      if (interests && interests.length > 0) {
        const subscribers = await payload.find({
          collection: "newsletter-subscribers",
          where: {
            status: { equals: "subscribed" },
            interests: { in: interests },
          },
          limit: 10000,
        });
        subscribers.docs.forEach((sub) => emails.add(sub.email));
      }
      break;
    }

    case "custom": {
      const customEmails = campaign.customEmails;
      if (customEmails) {
        customEmails
          .split("\n")
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.includes("@"))
          .forEach((e) => emails.add(e));
      }
      break;
    }
  }

  // Exclude purchasers if needed
  if (campaign.excludePurchasers && campaign.linkedProduct) {
    const productId =
      typeof campaign.linkedProduct === "object"
        ? campaign.linkedProduct.id
        : campaign.linkedProduct;

    const orders = await payload.find({
      collection: "orders",
      where: { status: { equals: "completed" } },
      limit: 10000,
    });

    orders.docs.forEach((order) => {
      const items = order.items as Array<{ productId?: number }> | undefined;
      if (items?.some((item) => item.productId === productId)) {
        if (order.email) emails.delete(order.email);
      }
    });
  }

  return Array.from(emails);
}

/**
 * Build HTML email from campaign content
 */
function buildCampaignHtml(campaign: {
  content?: { root?: { children?: unknown[] } } | null;
  previewText?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store";
  const content = campaign.content;
  const previewText = campaign.previewText;
  const ctaText = campaign.ctaText;
  const ctaUrl = campaign.ctaUrl;

  // Convert rich text to HTML (simplified)
  const bodyHtml = content?.root?.children
    ? richTextToHtml(content.root.children)
    : "<p>No content</p>";

  const ctaButton =
    ctaText && ctaUrl
      ? `<p style="text-align: center; margin: 30px 0;">
        <a href="${ctaUrl}" style="display: inline-block; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">
          ${ctaText}
        </a>
      </p>`
      : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${previewText ? `<meta name="x-apple-disable-message-reformatting">` : ""}
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ""}
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; margin: 0;">DigiInsta</h1>
      </div>
      
      <div style="background: #fff; padding: 30px; border-radius: 8px;">
        ${bodyHtml}
        ${ctaButton}
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>© ${new Date().getFullYear()} DigiInsta. All rights reserved.</p>
        <p>
          <a href="${appUrl}/unsubscribe" style="color: #666;">Unsubscribe</a> | 
          <a href="${appUrl}/privacy" style="color: #666;">Privacy Policy</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Convert Lexical rich text to HTML (simplified)
 */
function richTextToHtml(children: unknown[]): string {
  return children
    .map((node: unknown) => {
      const n = node as Record<string, unknown>;
      const type = n.type as string;
      const text = n.text as string | undefined;
      const children = n.children as unknown[] | undefined;

      if (type === "paragraph") {
        return `<p>${children ? richTextToHtml(children) : ""}</p>`;
      }
      if (type === "heading") {
        const tag = (n.tag as string) || "h2";
        return `<${tag}>${children ? richTextToHtml(children) : ""}</${tag}>`;
      }
      if (type === "list") {
        const listType = n.listType as string;
        const tag = listType === "number" ? "ol" : "ul";
        return `<${tag}>${children ? richTextToHtml(children) : ""}</${tag}>`;
      }
      if (type === "listitem") {
        return `<li>${children ? richTextToHtml(children) : ""}</li>`;
      }
      if (type === "link") {
        const url = ((n.fields as Record<string, unknown>)?.url as string) || "#";
        return `<a href="${url}">${children ? richTextToHtml(children) : ""}</a>`;
      }
      if (text) {
        let result = text;
        if (n.format) {
          const format = n.format as number;
          if (format & 1) result = `<strong>${result}</strong>`;
          if (format & 2) result = `<em>${result}</em>`;
          if (format & 8) result = `<u>${result}</u>`;
        }
        return result;
      }
      return "";
    })
    .join("");
}
