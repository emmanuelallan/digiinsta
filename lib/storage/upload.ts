/**
 * R2 Upload Service
 *
 * Generates presigned URLs for uploading files to Cloudflare R2.
 * Supports files up to 100MB.
 *
 * Requirements: 3.4, 12.1
 */

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "../storage";

/** Maximum file size: 100MB */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Presigned URL expiration: 10 minutes */
export const UPLOAD_URL_EXPIRATION_SECONDS = 600;

/** Allowed MIME types for product files */
export const ALLOWED_UPLOAD_MIME_TYPES = [
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
  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Presentations
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Documents
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type AllowedMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

export interface UploadUrlResult {
  /** Presigned PUT URL for uploading */
  presignedUrl: string;
  /** Unique file key in R2 */
  fileKey: string;
  /** Expiration time of the presigned URL */
  expiresAt: Date;
}

export interface UploadUrlOptions {
  /** Original filename */
  filename: string;
  /** MIME type of the file */
  contentType: string;
  /** File size in bytes (for validation) */
  fileSize?: number;
}

/**
 * Generate a unique file key to prevent collisions
 * Format: products/{timestamp}-{random}-{sanitized-filename}
 */
export function generateFileKey(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalFilename.split(".").pop() || "";
  const baseName = originalFilename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .substring(0, 50); // Limit base name length
  return `products/${timestamp}-${random}-${baseName}.${ext}`;
}

/**
 * Validate upload parameters
 */
export function validateUploadParams(options: UploadUrlOptions): {
  valid: boolean;
  error?: string;
} {
  const { filename, contentType, fileSize } = options;

  if (!filename || typeof filename !== "string") {
    return { valid: false, error: "Filename is required" };
  }

  if (!contentType || typeof contentType !== "string") {
    return { valid: false, error: "Content type is required" };
  }

  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(contentType as AllowedMimeType)) {
    return { valid: false, error: `File type not allowed: ${contentType}` };
  }

  if (fileSize !== undefined) {
    if (typeof fileSize !== "number" || fileSize <= 0) {
      return { valid: false, error: "Invalid file size" };
    }
    if (fileSize > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }
  }

  return { valid: true };
}

/**
 * Calculate presigned URL expiration time
 */
export function calculateUploadExpiration(
  expirationSeconds: number = UPLOAD_URL_EXPIRATION_SECONDS
): Date {
  return new Date(Date.now() + expirationSeconds * 1000);
}

/**
 * Generate a presigned URL for uploading a file to R2
 *
 * @param options - Upload options including filename and content type
 * @returns Presigned URL result or throws an error
 */
export async function generateUploadUrl(options: UploadUrlOptions): Promise<UploadUrlResult> {
  // Validate parameters
  const validation = validateUploadParams(options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { filename, contentType } = options;

  // Generate unique file key
  const fileKey = generateFileKey(filename);

  // Create presigned URL for PUT operation
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: UPLOAD_URL_EXPIRATION_SECONDS,
  });

  const expiresAt = calculateUploadExpiration();

  return {
    presignedUrl,
    fileKey,
    expiresAt,
  };
}
