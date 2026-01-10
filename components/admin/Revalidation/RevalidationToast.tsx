"use client";

/**
 * RevalidationToast - Toast notification component for Payload admin
 * Shows success/warning messages after cache revalidation operations
 *
 * Requirements: 4.1, 4.2
 */

import { useEffect, useCallback } from "react";
import { toast } from "@payloadcms/ui";

export interface RevalidationEvent {
  type: "success" | "warning" | "error";
  message: string;
  details?: {
    collection?: string;
    slug?: string;
    paths?: string[];
    tags?: string[];
    errors?: string[];
    duration?: number;
  };
}

// Global event emitter for revalidation events
type RevalidationListener = (event: RevalidationEvent) => void;
const listeners: Set<RevalidationListener> = new Set();

/**
 * Emit a revalidation event to all listeners
 * Called from the revalidation hooks
 */
export function emitRevalidationEvent(event: RevalidationEvent): void {
  listeners.forEach((listener) => listener(event));
}

/**
 * Subscribe to revalidation events
 */
export function subscribeToRevalidationEvents(listener: RevalidationListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * RevalidationToastProvider - Listens for revalidation events and shows toasts
 * Should be mounted once in the admin layout
 */
export function RevalidationToastProvider() {
  const handleRevalidationEvent = useCallback((event: RevalidationEvent) => {
    const { type, message, details } = event;

    // Build detailed message
    let fullMessage = message;
    if (details?.slug) {
      fullMessage = `${message} (${details.slug})`;
    }

    switch (type) {
      case "success":
        toast.success(fullMessage);
        break;
      case "warning":
        toast.info(fullMessage);
        break;
      case "error":
        toast.error(fullMessage);
        break;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRevalidationEvents(handleRevalidationEvent);
    return () => {
      unsubscribe();
    };
  }, [handleRevalidationEvent]);

  // This component doesn't render anything visible
  // It just listens for events and shows toasts
  return null;
}

export default RevalidationToastProvider;
