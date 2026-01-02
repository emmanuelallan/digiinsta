import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send transactional email via Resend
 * Server-only, async, never blocks
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await resend.emails.send({
      from: options.from || "Digital Products <noreply@yourdomain.com>",
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
  } catch (error) {
    // Log error but don't throw - emails should never block operations
    console.error("Failed to send email:", error);
  }
}

/**
 * Email templates
 */
export const emailTemplates = {
  purchaseReceipt: (orderId: string, items: string[], total: string) => ({
    subject: `Order Confirmation - ${orderId}`,
    html: `
      <h1>Thank you for your purchase!</h1>
      <p>Your order <strong>${orderId}</strong> has been confirmed.</p>
      <h2>Items:</h2>
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <p><strong>Total: ${total}</strong></p>
      <p>You will receive a separate email with download links shortly.</p>
    `,
  }),

  downloadEmail: (
    productName: string,
    downloadUrl: string,
    expiresIn: string,
  ) => ({
    subject: `Download: ${productName}`,
    html: `
      <h1>Your download is ready</h1>
      <p>Click the link below to download <strong>${productName}</strong>:</p>
      <p><a href="${downloadUrl}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Download Now</a></p>
      <p><small>This link expires in ${expiresIn}</small></p>
      <p><small>You have a limited number of downloads. Please save your files.</small></p>
    `,
  }),

  failedPayment: (orderId: string, retryUrl: string) => ({
    subject: `Payment Failed - Order ${orderId}`,
    html: `
      <h1>Payment Failed</h1>
      <p>We were unable to process payment for order <strong>${orderId}</strong>.</p>
      <p><a href="${retryUrl}">Click here to retry payment</a></p>
    `,
  }),

  cartAbandonment: (items: string[], cartUrl: string) => ({
    subject: "Complete your purchase",
    html: `
      <h1>You left items in your cart</h1>
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
      <p><a href="${cartUrl}">Complete your purchase</a></p>
    `,
  }),

  upsell: (productName: string, productUrl: string) => ({
    subject: `You might also like: ${productName}`,
    html: `
      <h1>Recommended for you</h1>
      <p>Based on your recent purchase, you might be interested in:</p>
      <h2>${productName}</h2>
      <p><a href="${productUrl}">View Product</a></p>
    `,
  }),

  newProduct: (productName: string, productUrl: string) => ({
    subject: `New Product: ${productName}`,
    html: `
      <h1>New Product Available</h1>
      <h2>${productName}</h2>
      <p><a href="${productUrl}">Check it out</a></p>
    `,
  }),
};
