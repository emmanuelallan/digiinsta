"use client";

import Script from "next/script";

const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID;

/**
 * Analytics component
 * Supports Plausible or Datafast
 */
export function Analytics() {
  if (!ANALYTICS_ID) {
    return null;
  }

  // Determine if it's Plausible or Datafast based on domain
  const isPlausible = ANALYTICS_ID.includes("plausible") || ANALYTICS_ID.includes("js");

  if (isPlausible) {
    return <Script defer data-domain={ANALYTICS_ID} src="https://plausible.io/js/script.js" />;
  }

  // Datafast
  return (
    <Script
      data-website-id={ANALYTICS_ID}
      data-domain="digiinsta.store"
      src="https://datafa.st/js/script.js"
      strategy="afterInteractive"
    />
  );
}

/**
 * Track custom events
 */
export function trackEvent(eventName: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || !ANALYTICS_ID) {
    return;
  }

  // Plausible
  if (window.plausible) {
    window.plausible(eventName, { props: props as Record<string, string | number | boolean> });
    return;
  }

  // Datafast
  if (window.datafast) {
    window.datafast("track", eventName, props as Record<string, string | number | boolean>);
    return;
  }

  // Fallback: use fetch for custom tracking
  const isPlausible = ANALYTICS_ID.includes("plausible");
  if (isPlausible) {
    fetch("https://plausible.io/api/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: eventName,
        url: window.location.href,
        domain: ANALYTICS_ID,
        props,
      }),
    }).catch(() => {
      // Silently fail
    });
  }
}

// TypeScript declarations
declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
    datafast?: (
      action: string,
      eventName: string,
      props?: Record<string, string | number | boolean>
    ) => void;
  }
}
