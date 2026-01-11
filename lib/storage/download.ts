/**
 * R2 Download Service
 *
 * Generates presigned URLs for downloading files from Cloudflare R2.
 * URLs are valid for 1 hour.
 *
 * Requirements: 12.2
 */

import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "../storage";

/** Download URL expiration: 1 hour (3600 seconds) */
export const DOWNLOAD_URL_EXPIRATION_SECONDS = 3600;

export interface DownloadUrlResult {
  /** Presigned GET URL for downloading */
  presignedUrl: string;
  /** File key in R2 */
  fileKey: string;
  /** Expiration time of the presigned URL */
  expiresAt: Date;
}

export interface FileMetadata {
  /** File size in bytes */
  size: number;
  /** Content type */
  contentType: string;
  /** Last modified date */
  lastModified: Date | null;
}

/**
 * Calculate presigned URL expiration time
 *
 * @param expirationSeconds - Expiration time in seconds (default: 1 hour)
 * @returns Date when the URL expires
 */
export function calculateDownloadExpiration(
  expirationSeconds: number = DOWNLOAD_URL_EXPIRATION_SECONDS
): Date {
  return new Date(Date.now() + expirationSeconds * 1000);
}

/**
 * Check if a presigned URL has expired
 *
 * @param expiresAt - The expiration timestamp
 * @returns True if the URL has expired
 */
export function isDownloadUrlExpired(expiresAt: Date | string): boolean {
  const expiration = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return Date.now() > expiration.getTime();
}

/**
 * Calculate remaining time until URL expiration
 *
 * @param expiresAt - The expiration timestamp
 * @returns Remaining time in milliseconds (0 if expired)
 */
export function getRemainingDownloadTime(expiresAt: Date | string): number {
  const expiration = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const remaining = expiration.getTime() - Date.now();
  return Math.max(0, remaining);
}

/**
 * Generate a presigned URL for downloading a file from R2
 *
 * @param fileKey - The R2 file key
 * @param expirationSeconds - URL expiration in seconds (default: 1 hour)
 * @returns Presigned URL result
 */
export async function generateDownloadUrl(
  fileKey: string,
  expirationSeconds: number = DOWNLOAD_URL_EXPIRATION_SECONDS
): Promise<DownloadUrlResult> {
  if (!fileKey || typeof fileKey !== "string") {
    throw new Error("File key is required");
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: expirationSeconds,
  });

  const expiresAt = calculateDownloadExpiration(expirationSeconds);

  return {
    presignedUrl,
    fileKey,
    expiresAt,
  };
}

/**
 * Check if a file exists in R2
 *
 * @param fileKey - The R2 file key
 * @returns True if the file exists
 */
export async function fileExists(fileKey: string): Promise<boolean> {
  if (!fileKey || typeof fileKey !== "string") {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });
    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file metadata from R2
 *
 * @param fileKey - The R2 file key
 * @returns File metadata or null if not found
 */
export async function getFileMetadata(fileKey: string): Promise<FileMetadata | null> {
  if (!fileKey || typeof fileKey !== "string") {
    return null;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });
    const response = await r2Client.send(command);

    return {
      size: response.ContentLength ?? 0,
      contentType: response.ContentType ?? "application/octet-stream",
      lastModified: response.LastModified ?? null,
    };
  } catch {
    return null;
  }
}
