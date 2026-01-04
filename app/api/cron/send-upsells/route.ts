/**
 * Automated Upsell Email Cron Job
 * Sends upsell emails 24-48 hours after purchase
 *
 * Scheduled via QStash - configure in Upstash console:
 * Schedule: "0 0/6 * * *" (every 6 hours)
 * URL: https://digiinsta.store/api/cron/send-upsells
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

    // Find orders from 24-48 hours ago that haven't received upsell emails
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const orders = await payload.find({
      collection: "orders",
      where: {
        and: [
          { createdAt: { greater_than: fortyEightHoursAgo.toISOString() } },
          { createdAt: { less_than: twentyFourHoursAgo.toISOString() } },
          { status: { equals: "completed" } },
          { upsellSent: { not_equals: true } },
        ],
      },
      limit: 100,
    });

    logger.info({ orderCount: orders.docs.length }, "Processing upsell emails");

    let sentCount = 0;

    for (const order of orders.docs) {
      try {
        // Get purchased product IDs
        const items = order.items as Array<{ productId?: number; type: string }> | undefined;
        const purchasedProductIds =
          items
            ?.filter((item) => item.type === "product" && item.productId)
            .map((item) => item.productId) ?? [];

        if (purchasedProductIds.length === 0) continue;

        // Find related products (same category, not purchased)
        const purchasedProduct = await payload.findByID({
          collection: "products",
          id: purchasedProductIds[0]!,
          depth: 1,
        });

        if (!purchasedProduct) continue;

        // Get category - use type assertion since we know the schema
        const productWithCategory = purchasedProduct as unknown as {
          category?: { id: number } | number | null;
        };
        const categoryId =
          typeof productWithCategory.category === "object" && productWithCategory.category
            ? productWithCategory.category.id
            : productWithCategory.category;

        if (!categoryId) continue;

        // Find other products in same category
        const relatedProducts = await payload.find({
          collection: "products",
          where: {
            and: [
              { category: { equals: categoryId } },
              { id: { not_in: purchasedProductIds as number[] } },
              { status: { equals: "active" } },
            ],
          },
          limit: 3,
        });

        if (relatedProducts.docs.length === 0) {
          // No related products, try bundles
          const bundles = await payload.find({
            collection: "bundles",
            where: { status: { equals: "active" } },
            limit: 1,
          });

          const bundle = bundles.docs[0];
          if (bundle) {
            const upsellTemplate = emailTemplates.upsell(
              bundle.title,
              `${appUrl}/bundles/${bundle.slug}`
            );

            await sendEmail({
              to: order.email,
              subject: upsellTemplate.subject,
              html: upsellTemplate.html,
              from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`,
            });

            sentCount++;
          }
        } else {
          // Send upsell for first related product
          const product = relatedProducts.docs[0];
          if (product) {
            const upsellTemplate = emailTemplates.upsell(
              product.title,
              `${appUrl}/products/${product.slug}`
            );

            await sendEmail({
              to: order.email,
              subject: upsellTemplate.subject,
              html: upsellTemplate.html,
              from: `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`,
            });

            sentCount++;
          }
        }

        // Mark order as having received upsell
        await payload.update({
          collection: "orders",
          id: order.id,
          data: { upsellSent: true },
        });
      } catch (error) {
        logger.error({ error, orderId: order.id }, "Failed to send upsell email");
      }
    }

    logger.info({ sentCount }, "Upsell emails sent");

    return NextResponse.json({ success: true, sentCount });
  } catch (error) {
    logger.error({ error }, "Upsell cron error");
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

// Verify QStash signature for security
export const POST = verifySignatureAppRouter(handler);
