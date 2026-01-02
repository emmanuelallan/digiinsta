import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Neon Postgres database client
 * Server-only, edge-safe
 */
export const db = neon(process.env.DATABASE_URL);
