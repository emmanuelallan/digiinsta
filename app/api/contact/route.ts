import { type NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";

/**
 * Contact form submission handler
 * Sends email notification for contact form submissions
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rateLimitResponse = await checkRateLimit(rateLimiters.contact, ip);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    // Send notification email to admin
    await sendEmail({
      to: process.env.CONTACT_EMAIL || "support@digiinsta.store",
      subject: `Contact Form: ${subject || "New Message"}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
