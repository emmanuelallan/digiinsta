import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { rateLimiters, getClientIp, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per hour per IP
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(rateLimiters.contact, ip);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { name, email, phone, subject, message, source } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Get IP address for spam prevention
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Create contact submission
    await payload.create({
      collection: "contact-submissions",
      data: {
        name,
        email,
        phone: phone || undefined,
        subject,
        message,
        source: source || "contact-page",
        ipAddress,
        status: "new",
      },
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
