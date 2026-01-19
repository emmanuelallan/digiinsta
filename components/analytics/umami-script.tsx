"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * Umami Analytics Script Component
 * 
 * Loads the Umami analytics script based on environment variables.
 * Only loads in production or when explicitly enabled.
 */
export function UmamiScript() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;

  // Don't load if website ID or script URL is not configured
  if (!websiteId || !scriptUrl) {
    return null;
  }

  return (
    <Script
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
