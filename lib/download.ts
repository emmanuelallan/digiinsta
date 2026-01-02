import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "./storage";
import { logger } from "./logger";

export interface DownloadVerification {
  isValid: boolean;
  reason?: string;
}

/**
 * Generate a signed URL for secure file download
 * Server-only, edge-safe
 *
 * @param fileKey - The S3 key/path to the file
 * @param expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns Signed URL or null if generation fails
 */
export async function generateSignedDownloadUrl(
  fileKey: string,
  expiresIn: number = 3600,
): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn,
    });

    return signedUrl;
  } catch (error) {
    logger.error({ error, fileKey }, "Failed to generate signed download URL");
    return null;
  }
}

/**
 * Verify download eligibility
 * Checks ownership, expiration, and download limits
 *
 * @param _orderId - The order ID (unused for now)
 * @param _productId - The product ID (unused for now)
 * @param _email - Customer email (unused for now)
 * @returns Verification result
 */
export async function verifyDownloadEligibility(
  _orderId: string,
  _productId: string,
  _email: string,
): Promise<DownloadVerification> {
  // This will be implemented with actual database checks
  // For now, return a placeholder structure
  // TODO: Query orders collection to verify:
  // 1. Order exists and belongs to email
  // 2. Order contains productId
  // 3. Order hasn't expired
  // 4. Download count hasn't exceeded maxDownloads

  return {
    isValid: false,
    reason: "Not implemented - requires order verification",
  };
}
