/**
 * Download Tracking Service
 *
 * Tracks download counts per order item and enforces download limits.
 * Integrates with Neon PostgreSQL order_items table.
 *
 * Requirements: 6.3, 12.3, 12.4 - Download tracking and limits
 */

import { sql } from "../db/client";
import { checkDownloadEligibility as checkEligibilityPure } from "./limits";

// Re-export types and constants from limits module
export { DEFAULT_MAX_DOWNLOADS, type DownloadEligibility } from "./limits";
export { checkDownloadEligibility, simulateTrackDownload } from "./limits";

/**
 * Order item download info from database
 */
interface OrderItemDownloadInfo {
  id: number;
  downloads_used: number;
  max_downloads: number;
  file_key: string | null;
}

/**
 * Check if a download is allowed for an order item (database version)
 *
 * @param orderItemId - The order item ID
 * @returns Download eligibility information
 */
export async function canDownload(orderItemId: number) {
  try {
    const result = await sql`
      SELECT id, downloads_used, max_downloads, file_key
      FROM order_items
      WHERE id = ${orderItemId}
    `;

    if (result.length === 0) {
      return {
        canDownload: false,
        downloadsUsed: 0,
        maxDownloads: 0,
        remainingDownloads: 0,
        reason: "Order item not found",
      };
    }

    const item = result[0] as OrderItemDownloadInfo;

    if (!item.file_key) {
      const eligibility = checkEligibilityPure(item.downloads_used, item.max_downloads);
      return {
        ...eligibility,
        reason: "No file associated with this order item",
      };
    }

    return checkEligibilityPure(item.downloads_used, item.max_downloads);
  } catch (error) {
    console.error("Error checking download eligibility:", error);
    return {
      canDownload: false,
      downloadsUsed: 0,
      maxDownloads: 0,
      remainingDownloads: 0,
      reason: "Error checking download eligibility",
    };
  }
}

/**
 * Track a download by incrementing the download count (database version)
 *
 * @param orderItemId - The order item ID
 * @returns Updated download eligibility information
 */
export async function trackDownload(orderItemId: number) {
  try {
    // First check if download is allowed
    const eligibility = await canDownload(orderItemId);

    if (!eligibility.canDownload) {
      return eligibility;
    }

    // Increment download count atomically, but only if under limit
    const result = await sql`
      UPDATE order_items
      SET downloads_used = downloads_used + 1
      WHERE id = ${orderItemId}
        AND downloads_used < max_downloads
      RETURNING id, downloads_used, max_downloads
    `;

    if (result.length === 0) {
      // Race condition - limit was reached between check and update
      return {
        canDownload: false,
        downloadsUsed: eligibility.maxDownloads,
        maxDownloads: eligibility.maxDownloads,
        remainingDownloads: 0,
        reason: "Download limit reached",
      };
    }

    const updated = result[0] as { id: number; downloads_used: number; max_downloads: number };
    return checkEligibilityPure(updated.downloads_used, updated.max_downloads);
  } catch (error) {
    console.error("Error tracking download:", error);
    return {
      canDownload: false,
      downloadsUsed: 0,
      maxDownloads: 0,
      remainingDownloads: 0,
      reason: "Error tracking download",
    };
  }
}

/**
 * Get the file key for an order item
 *
 * @param orderItemId - The order item ID
 * @returns The R2 file key or null if not found
 */
export async function getOrderItemFileKey(orderItemId: number): Promise<string | null> {
  try {
    const result = await sql`
      SELECT file_key
      FROM order_items
      WHERE id = ${orderItemId}
    `;

    if (result.length === 0) {
      return null;
    }

    return (result[0] as { file_key: string | null }).file_key;
  } catch (error) {
    console.error("Error getting file key:", error);
    return null;
  }
}

/**
 * Verify order ownership by email
 *
 * @param orderId - The order ID
 * @param email - The customer email
 * @returns True if the order belongs to the email
 */
export async function verifyOrderOwnership(orderId: number, email: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id
      FROM orders
      WHERE id = ${orderId}
        AND LOWER(email) = LOWER(${email})
    `;

    return result.length > 0;
  } catch (error) {
    console.error("Error verifying order ownership:", error);
    return false;
  }
}

/**
 * Get download info for all items in an order
 *
 * @param orderId - The order ID
 * @returns Array of download info for each item
 */
export async function getOrderDownloadInfo(orderId: number): Promise<
  Array<{
    itemId: number;
    title: string;
    downloadsUsed: number;
    maxDownloads: number;
    fileKey: string | null;
  }>
> {
  try {
    const result = await sql`
      SELECT id, title, downloads_used, max_downloads, file_key
      FROM order_items
      WHERE order_id = ${orderId}
    `;

    return result.map((row) => ({
      itemId: (row as { id: number }).id,
      title: (row as { title: string }).title,
      downloadsUsed: (row as { downloads_used: number }).downloads_used,
      maxDownloads: (row as { max_downloads: number }).max_downloads,
      fileKey: (row as { file_key: string | null }).file_key,
    }));
  } catch (error) {
    console.error("Error getting order download info:", error);
    return [];
  }
}
