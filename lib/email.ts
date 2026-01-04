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
    const defaultFrom = `DigiInsta <noreply@${process.env.RESEND_DOMAIN ?? "digiinsta.store"}>`;
    await resend.emails.send({
      from: options.from ?? defaultFrom,
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
 * Base email layout wrapper
 */
function emailLayout(content: string, previewText?: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store";
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>DigiInsta</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
    a { color: #18181b; text-decoration: none; }
    .button { display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .button:hover { background-color: #27272a; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .content { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${previewText}</div>` : ""}
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${appUrl}" style="display: inline-block;">
                <span style="font-size: 28px; font-weight: 700; color: #18181b; letter-spacing: -0.5px;">DigiInsta</span>
              </a>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <tr>
                  <td class="content" style="padding: 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
                © ${year} DigiInsta. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                <a href="${appUrl}/privacy" style="color: #71717a;">Privacy Policy</a>
                <span style="margin: 0 8px;">•</span>
                <a href="${appUrl}/terms" style="color: #71717a;">Terms of Service</a>
                <span style="margin: 0 8px;">•</span>
                <a href="${appUrl}/unsubscribe" style="color: #71717a;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Email templates
 */
export const emailTemplates = {
  purchaseReceipt: (orderId: string, items: string[], total: string) => ({
    subject: `Order Confirmed #${orderId} - DigiInsta`,
    html: emailLayout(
      `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; line-height: 64px; margin-bottom: 16px;">
          <span style="font-size: 32px;">✓</span>
        </div>
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">Thank you for your purchase!</h1>
        <p style="margin: 0; font-size: 16px; color: #71717a;">Order #${orderId}</p>
      </div>
      
      <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Order Summary</h2>
        ${items
          .map(
            (item) => `
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
            <span style="font-size: 15px; color: #18181b;">${item}</span>
          </div>
        `
          )
          .join("")}
        <div style="display: flex; justify-content: space-between; padding-top: 16px; margin-top: 8px;">
          <span style="font-size: 16px; font-weight: 600; color: #18181b;">Total</span>
          <span style="font-size: 16px; font-weight: 700; color: #18181b;">${total}</span>
        </div>
      </div>
      
      <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6;">
        You'll receive a separate email with download links for your digital products shortly. Your downloads are available for 30 days.
      </p>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store"}/help/faq" class="button" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Need Help?
        </a>
      </div>
      `,
      `Your order #${orderId} has been confirmed. Total: ${total}`
    ),
  }),

  downloadEmail: (productName: string, downloadUrl: string, expiresIn: string) => ({
    subject: `Your Download: ${productName}`,
    html: emailLayout(
      `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: #dbeafe; border-radius: 50%; line-height: 64px; margin-bottom: 16px;">
          <span style="font-size: 32px;">📦</span>
        </div>
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">Your download is ready!</h1>
        <p style="margin: 0; font-size: 16px; color: #71717a;">${productName}</p>
      </div>
      
      <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0 0 20px; font-size: 15px; color: #52525b;">
          Click the button below to download your file. This link expires in <strong>${expiresIn}</strong>.
        </p>
        <a href="${downloadUrl}" class="button" style="display: inline-block; padding: 16px 40px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Download Now
        </a>
      </div>
      
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          <strong>⚠️ Important:</strong> You have a limited number of downloads. Please save your file to a safe location after downloading.
        </p>
      </div>
      
      <p style="margin: 0; font-size: 14px; color: #71717a; text-align: center;">
        Having trouble? <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store"}/contact" style="color: #18181b; text-decoration: underline;">Contact support</a>
      </p>
      `,
      `Your download for ${productName} is ready. Click to download.`
    ),
  }),

  failedPayment: (orderId: string, retryUrl: string) => ({
    subject: `Payment Failed - Action Required`,
    html: emailLayout(
      `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: #fee2e2; border-radius: 50%; line-height: 64px; margin-bottom: 16px;">
          <span style="font-size: 32px;">⚠️</span>
        </div>
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">Payment unsuccessful</h1>
        <p style="margin: 0; font-size: 16px; color: #71717a;">Order #${orderId}</p>
      </div>
      
      <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6; text-align: center;">
        We weren't able to process your payment. This can happen for several reasons, including insufficient funds or an expired card.
      </p>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${retryUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Try Again
        </a>
      </div>
      
      <p style="margin: 0; font-size: 14px; color: #71717a; text-align: center;">
        If you continue to experience issues, please <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store"}/contact" style="color: #18181b; text-decoration: underline;">contact our support team</a>.
      </p>
      `,
      `Your payment for order #${orderId} was unsuccessful. Please try again.`
    ),
  }),

  cartAbandonment: (items: string[], cartUrl: string) => ({
    subject: `You left something behind 👀`,
    html: emailLayout(
      `
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">Still thinking it over?</h1>
        <p style="margin: 0; font-size: 16px; color: #71717a;">Your cart is waiting for you</p>
      </div>
      
      <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Items in your cart</h2>
        ${items
          .map(
            (item) => `
          <div style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
            <span style="font-size: 15px; color: #18181b;">• ${item}</span>
          </div>
        `
          )
          .join("")}
      </div>
      
      <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6; text-align: center;">
        Complete your purchase now and get instant access to your digital products.
      </p>
      
      <div style="text-align: center;">
        <a href="${cartUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Complete Purchase
        </a>
      </div>
      `,
      `You left items in your cart. Complete your purchase now!`
    ),
  }),

  upsell: (productName: string, productUrl: string) => ({
    subject: `You might love this: ${productName}`,
    html: emailLayout(
      `
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">Recommended for you</h1>
        <p style="margin: 0; font-size: 16px; color: #71717a;">Based on your recent purchase</p>
      </div>
      
      <div style="background-color: #fafafa; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
        <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #18181b;">${productName}</h2>
        <p style="margin: 0 0 20px; font-size: 15px; color: #52525b;">
          Customers who bought your items also loved this product.
        </p>
        <a href="${productUrl}" class="button" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Product
        </a>
      </div>
      
      <p style="margin: 0; font-size: 14px; color: #71717a; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store"}/products" style="color: #18181b; text-decoration: underline;">Browse all products</a>
      </p>
      `,
      `Based on your purchase, we think you'll love ${productName}`
    ),
  }),

  newProduct: (productName: string, productUrl: string, description?: string) => ({
    subject: `New: ${productName} just dropped! 🎉`,
    html: emailLayout(
      `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 8px 16px; background-color: #dcfce7; border-radius: 20px; margin-bottom: 16px;">
          <span style="font-size: 14px; font-weight: 600; color: #166534;">NEW RELEASE</span>
        </div>
        <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 700; color: #18181b;">${productName}</h1>
        ${description ? `<p style="margin: 0; font-size: 16px; color: #52525b; line-height: 1.6;">${description}</p>` : ""}
      </div>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${productUrl}" class="button" style="display: inline-block; padding: 16px 40px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Check It Out
        </a>
      </div>
      
      <p style="margin: 0; font-size: 14px; color: #71717a; text-align: center;">
        Be one of the first to get your hands on this new release!
      </p>
      `,
      `${productName} is now available! Check out our latest release.`
    ),
  }),

  refundProcessed: (orderId: string | number) => ({
    subject: `Refund Processed - Order #${orderId}`,
    html: emailLayout(
      `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 64px; height: 64px; background-color: #dbeafe; border-radius: 50%; line-height: 64px; margin-bottom: 16px;">
          <span style="font-size: 32px;">💰</span>
        </div>
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">Refund Processed</h1>
        <p style="margin: 0; font-size: 16px; color: #71717a;">Order #${orderId}</p>
      </div>
      
      <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6; text-align: center;">
        Your refund has been processed successfully. The funds should appear in your account within <strong>5-10 business days</strong>, depending on your bank.
      </p>
      
      <div style="background-color: #fafafa; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #52525b; text-align: center;">
          If you have any questions about this refund, please don't hesitate to reach out.
        </p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store"}/contact" class="button" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Contact Support
        </a>
      </div>
      `,
      `Your refund for order #${orderId} has been processed.`
    ),
  }),

  welcomeNewsletter: (email: string) => ({
    subject: `Welcome to DigiInsta! 🎉`,
    html: emailLayout(
      `
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">Welcome aboard!</h1>
        <p style="margin: 0; font-size: 16px; color: #71717a;">You're now subscribed to our newsletter</p>
      </div>
      
      <p style="margin: 0 0 24px; font-size: 15px; color: #52525b; line-height: 1.6; text-align: center;">
        Thanks for subscribing! You'll be the first to know about new products, exclusive deals, and helpful resources.
      </p>
      
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://digiinsta.store"}/products" class="button" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Browse Products
        </a>
      </div>
      
      <p style="margin: 0; font-size: 13px; color: #a1a1aa; text-align: center;">
        Subscribed as: ${email}
      </p>
      `,
      `Welcome to DigiInsta! Thanks for subscribing to our newsletter.`
    ),
  }),
};
