import { z } from "zod/v4";

/**
 * Environment variable validation schema
 * Validates all required environment variables at startup
 * Fails fast if any required variables are missing or invalid
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),

  // Cloudflare R2 Storage
  R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
  R2_PUBLIC_URL: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().startsWith("re_", "RESEND_API_KEY must start with 're_'"),

  // Polar.sh Payments
  POLAR_WEBHOOK_SECRET: z.string().min(1, "POLAR_WEBHOOK_SECRET is required"),

  // QStash (for scheduled jobs)
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),

  // Upstash Redis (for rate limiting)
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Optional
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * Throws at startup if validation fails
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    throw new Error("Invalid environment variables");
  }

  return result.data;
}

export const env = validateEnv();
