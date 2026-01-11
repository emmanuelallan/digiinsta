/**
 * Analytics Event Tracker
 * Tracks user events (view, add_to_cart, purchase) in Neon PostgreSQL
 */

import { sql } from "@/lib/db/client";

/**
 * Supported analytics event types
 */
export type AnalyticsEventType = "view" | "add_to_cart" | "purchase";

/**
 * Item types that can be tracked
 */
export type AnalyticsItemType = "product" | "bundle";

/**
 * Parameters for tracking an analytics event
 */
export interface TrackEventParams {
  eventType: AnalyticsEventType;
  sanityId: string;
  itemType: AnalyticsItemType;
  sessionId?: string;
}

/**
 * Result of tracking an event
 */
export interface TrackEventResult {
  success: boolean;
  eventId?: number;
  error?: string;
}

/**
 * Track an analytics event in the database
 *
 * @param params - Event parameters
 * @returns Result indicating success or failure
 */
export async function trackEvent(params: TrackEventParams): Promise<TrackEventResult> {
  const { eventType, sanityId, itemType, sessionId } = params;

  // Validate required fields
  if (!eventType || !sanityId || !itemType) {
    return {
      success: false,
      error: "Missing required fields: eventType, sanityId, and itemType are required",
    };
  }

  // Validate event type
  const validEventTypes: AnalyticsEventType[] = ["view", "add_to_cart", "purchase"];
  if (!validEventTypes.includes(eventType)) {
    return {
      success: false,
      error: `Invalid event type: ${eventType}. Must be one of: ${validEventTypes.join(", ")}`,
    };
  }

  // Validate item type
  const validItemTypes: AnalyticsItemType[] = ["product", "bundle"];
  if (!validItemTypes.includes(itemType)) {
    return {
      success: false,
      error: `Invalid item type: ${itemType}. Must be one of: ${validItemTypes.join(", ")}`,
    };
  }

  try {
    const result = await sql`
      INSERT INTO analytics_events (event_type, sanity_id, item_type, session_id)
      VALUES (${eventType}, ${sanityId}, ${itemType}, ${sessionId ?? null})
      RETURNING id
    `;

    return {
      success: true,
      eventId: result[0]?.id,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to track event: ${errorMessage}`,
    };
  }
}

/**
 * Track a product or bundle view
 */
export async function trackView(
  sanityId: string,
  itemType: AnalyticsItemType,
  sessionId?: string
): Promise<TrackEventResult> {
  return trackEvent({ eventType: "view", sanityId, itemType, sessionId });
}

/**
 * Track an add to cart event
 */
export async function trackAddToCart(
  sanityId: string,
  itemType: AnalyticsItemType,
  sessionId?: string
): Promise<TrackEventResult> {
  return trackEvent({ eventType: "add_to_cart", sanityId, itemType, sessionId });
}

/**
 * Track a purchase event
 */
export async function trackPurchase(
  sanityId: string,
  itemType: AnalyticsItemType,
  sessionId?: string
): Promise<TrackEventResult> {
  return trackEvent({ eventType: "purchase", sanityId, itemType, sessionId });
}

/**
 * Get event counts for a specific item
 */
export async function getEventCounts(
  sanityId: string
): Promise<{ views: number; addToCarts: number; purchases: number }> {
  const result = await sql`
    SELECT 
      event_type,
      COUNT(*) as count
    FROM analytics_events
    WHERE sanity_id = ${sanityId}
    GROUP BY event_type
  `;

  const counts = { views: 0, addToCarts: 0, purchases: 0 };
  for (const row of result) {
    switch (row.event_type) {
      case "view":
        counts.views = Number(row.count);
        break;
      case "add_to_cart":
        counts.addToCarts = Number(row.count);
        break;
      case "purchase":
        counts.purchases = Number(row.count);
        break;
    }
  }

  return counts;
}
