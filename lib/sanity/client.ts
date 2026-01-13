import { createClient } from "@sanity/client";

// Read client - disable CDN to always get fresh data
// CDN caching causes stale content issues after publishing in Sanity
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false, // Disable CDN to avoid stale data
  perspective: "published", // Only fetch published documents
});

// Write client for mutations (server-side only)
export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// Preview client for draft content
export const sanityPreviewClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2024-01-01",
  useCdn: false,
  perspective: "previewDrafts",
  token: process.env.SANITY_API_TOKEN,
});
