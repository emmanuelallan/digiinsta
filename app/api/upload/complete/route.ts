/**
 * Upload Complete API
 *
 * Called after a successful direct upload to R2.
 * Creates the Payload media record with the uploaded file's metadata.
 */

import { NextResponse } from "next/server";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/storage";
import { getPayload } from "payload";
import config from "@payload-config";

export async function POST(request: Request) {
  try {
    // Check authentication - only admins can create media
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: request.headers });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, alt, mimeType } = body;

    // Validate required fields
    if (!filename) {
      return NextResponse.json({ error: "Missing required field: filename" }, { status: 400 });
    }

    // Verify the file exists in R2
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filename,
      });
      const headResult = await r2Client.send(headCommand);

      // Determine content type
      const contentType = mimeType || headResult.ContentType || "application/octet-stream";

      // Build the public URL
      const publicUrl = `${R2_PUBLIC_URL}/${filename}`;

      // Clean alt text from filename
      const cleanAlt =
        alt ||
        filename
          .replace(/\.[^/.]+$/, "")
          .replace(/-\d+-[a-z0-9]+$/, "")
          .replace(/-/g, " ");

      // Create media record using Payload's create with overrideAccess
      // We pass the file metadata directly since the file is already uploaded to R2
      const media = await payload.create({
        collection: "media",
        data: {
          alt: cleanAlt,
        },
        overrideAccess: true,
        context: {
          // Signal to skip file upload - file already in R2
          skipFileUpload: true,
          directUpload: {
            filename,
            mimeType: contentType,
            filesize: headResult.ContentLength || 0,
            url: publicUrl,
          },
        },
      });

      return NextResponse.json({
        success: true,
        media: {
          id: media.id,
          filename: media.filename,
          url: media.url,
        },
      });
    } catch (headError) {
      console.error("File verification error:", headError);
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
    }
  } catch (error) {
    console.error("Upload complete error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create media record: ${message}` },
      { status: 500 }
    );
  }
}
