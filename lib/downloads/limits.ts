/**
 * Download Limit Logic (Pure Functions)
 *
 * Pure functions for download limit checking and tracking.
 * These functions have no database dependencies and can be tested in isolation.
 *
 * Requirements: 6.3, 12.3, 12.4 - Download tracking and limits
 */

/**
 * Default maximum downloads per order item
 */
export const DEFAULT_MAX_DOWNLOADS = 5;

/**
 * Download eligibility result
 */
export interface DownloadEligibility {
  /** Whether the download is allowed */
  canDownload: boolean;
  /** Current download count */
  downloadsUsed: number;
  /** Maximum allowed downloads */
  maxDownloads: number;
  /** Remaining downloads */
  remainingDownloads: number;
  /** Reason if download is not allowed */
  reason?: string;
}

/**
 * Check download eligibility based on current state
 *
 * @param downloadsUsed - Current download count
 * @param maxDownloads - Maximum allowed downloads
 * @returns Download eligibility information
 */
export function checkDownloadEligibility(
  downloadsUsed: number,
  maxDownloads: number
): DownloadEligibility {
  const canDownloadNow = downloadsUsed < maxDownloads;
  const remainingDownloads = Math.max(0, maxDownloads - downloadsUsed);

  return {
    canDownload: canDownloadNow,
    downloadsUsed,
    maxDownloads,
    remainingDownloads,
    reason: canDownloadNow ? undefined : "Download limit reached",
  };
}

/**
 * Simulate tracking a download (increment count)
 *
 * @param downloadsUsed - Current download count
 * @param maxDownloads - Maximum allowed downloads
 * @returns Updated download eligibility after tracking
 */
export function simulateTrackDownload(
  downloadsUsed: number,
  maxDownloads: number
): DownloadEligibility {
  // If already at or over limit, don't increment
  if (downloadsUsed >= maxDownloads) {
    return {
      canDownload: false,
      downloadsUsed,
      maxDownloads,
      remainingDownloads: 0,
      reason: "Download limit reached",
    };
  }

  // Increment download count
  const newDownloadsUsed = downloadsUsed + 1;
  const remainingDownloads = Math.max(0, maxDownloads - newDownloadsUsed);

  return {
    canDownload: remainingDownloads > 0,
    downloadsUsed: newDownloadsUsed,
    maxDownloads,
    remainingDownloads,
    reason: remainingDownloads > 0 ? undefined : "Download limit reached",
  };
}

/**
 * Validate download state invariants
 *
 * @param eligibility - Download eligibility to validate
 * @returns True if state is valid
 */
export function validateDownloadState(eligibility: DownloadEligibility): boolean {
  // remainingDownloads should equal max(0, maxDownloads - downloadsUsed)
  const expectedRemaining = Math.max(0, eligibility.maxDownloads - eligibility.downloadsUsed);
  if (eligibility.remainingDownloads !== expectedRemaining) {
    return false;
  }

  // canDownload should be true iff downloadsUsed < maxDownloads
  const expectedCanDownload = eligibility.downloadsUsed < eligibility.maxDownloads;
  if (eligibility.canDownload !== expectedCanDownload) {
    return false;
  }

  // If can't download, should have a reason
  if (!eligibility.canDownload && !eligibility.reason) {
    return false;
  }

  return true;
}
