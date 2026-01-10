/**
 * Presigned URL API for Direct R2 Uploads
 *
 * Generates presigned URLs for client-side direct uploads to Cloudflare R2.
 * This bypasses Vercel's 10s timeout limit on Hobby tier by having the
 * browser upload directly to R2.
 *
 * Flow:
 * 1. Client requests presigned URL with filename and content type
 * 2. Server generates short-lived presigned URL (valid for 10 minutes)
 * 3. Client uploads directly to R2 using the presigned URL
 * 4. Client notifies server to create Payload media record
 */

import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "@/lib/storage";
import { getPayload } from "payload";
import config from "@payload-config";

// Allowed MIME types for upload
const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  // Documents
  "application/pdf",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
];

// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Generate a unique filename to prevent collisions
 */
function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalFilename.split(".").pop() || "";
  const baseName = originalFilename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
  return `${baseName}-${timestamp}-${random}.${ext}`;
}

export async function POST(request: Request) {
  try {
    // Check authentication - only admins can upload
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: request.headers });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, contentType, fileSize } = body;

    // Validate required fields
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Missing required fields: filename, contentType" },
        { status: 400 }
      );
    }

    // Validate content type
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json({ error: `File type not allowed: ${contentType}` }, { status: 400 });
    }

    // Validate file size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(filename);

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueFilename,
      ContentType: contentType,
    });

    // URL valid for 10 minutes
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });

    return NextResponse.json({
      presignedUrl,
      filename: uniqueFilename,
      publicUrl: `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`,
    });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 });
  }
}
