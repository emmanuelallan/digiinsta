import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

/**
 * Neon Postgres database client
 * Server-only, edge-safe
 */
export const sql: NeonQueryFunction<false, false> = neon(process.env.DATABASE_URL);

// Re-export for convenience
export { sql as db };
