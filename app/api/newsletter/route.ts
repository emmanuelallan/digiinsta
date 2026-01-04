import { type NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, source, interests } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Get IP address and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Check if email already exists
    const existing = await payload.find({
      collection: "newsletter-subscribers",
      where: {
        email: { equals: email.toLowerCase().trim() },
      },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      const subscriber = existing.docs[0];

      // If already subscribed, return success (don't reveal subscription status)
      if (subscriber?.status === "subscribed") {
        return NextResponse.json(
          { success: true, message: "Thank you for subscribing!" },
          { status: 200 }
        );
      }

      // If previously unsubscribed, resubscribe
      if (subscriber) {
        await payload.update({
          collection: "newsletter-subscribers",
          id: subscriber.id,
          data: {
            status: "subscribed",
            subscribedAt: new Date().toISOString(),
            unsubscribedAt: null,
            source: source || "footer",
            interests: interests || undefined,
          },
        });
      }

      return NextResponse.json(
        { success: true, message: "Welcome back! You've been resubscribed." },
        { status: 200 }
      );
    }

    // Create new subscriber
    await payload.create({
      collection: "newsletter-subscribers",
      data: {
        email: email.toLowerCase().trim(),
        firstName: firstName || undefined,
        status: "subscribed",
        source: source || "footer",
        interests: interests || undefined,
        subscribedAt: new Date().toISOString(),
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(
      { success: true, message: "Thank you for subscribing!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

// Unsubscribe endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Find subscriber
    const existing = await payload.find({
      collection: "newsletter-subscribers",
      where: {
        email: { equals: email.toLowerCase().trim() },
      },
      limit: 1,
    });

    if (existing.docs.length === 0) {
      return NextResponse.json(
        { success: true, message: "You have been unsubscribed." },
        { status: 200 }
      );
    }

    const subscriber = existing.docs[0];

    // Update status to unsubscribed
    if (subscriber) {
      await payload.update({
        collection: "newsletter-subscribers",
        id: subscriber.id,
        data: {
          status: "unsubscribed",
          unsubscribedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "You have been unsubscribed." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
