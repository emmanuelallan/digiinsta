import { NextResponse } from "next/server";
import { validateSession } from "@/lib/auth/session";
import { cookies } from "next/headers";

/**
 * Upload completion handler
 * Called after a file has been uploaded to R2
 */
export async function POST(request: Request) {
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
    const { fileKey, fileName, fileSize, contentType } = body;

    if (!fileKey) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 });
    }

    // Return success - file metadata can be stored in Sanity
    return NextResponse.json({
      success: true,
      fileKey,
      fileName,
      fileSize,
      contentType,
    });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json({ error: "Failed to complete upload" }, { status: 500 });
  }
}
