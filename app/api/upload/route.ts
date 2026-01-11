/**
 * File Upload API Route
 *
 * Generates presigned URLs for uploading product files to R2.
 * Requires admin authentication.
 *
 * Requirements: 3.4
 */

import { type NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/auth/validate-admin";
import {
  generateUploadUrl,
  validateUploadParams,
  MAX_FILE_SIZE,
  ALLOWED_UPLOAD_MIME_TYPES,
} from "@/lib/storage/upload";

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await validateAdminSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { filename, contentType, fileSize } = body;

    // Validate parameters
    const validation = validateUploadParams({ filename, contentType, fileSize });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate presigned URL
    const result = await generateUploadUrl({ filename, contentType, fileSize });

    return NextResponse.json({
      presignedUrl: result.presignedUrl,
      fileKey: result.fileKey,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate upload URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET endpoint to retrieve upload configuration
 */
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
    allowedMimeTypes: ALLOWED_UPLOAD_MIME_TYPES,
  });
}
