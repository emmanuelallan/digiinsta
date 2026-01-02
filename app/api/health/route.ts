import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  checks: {
    database: "ok" | "error";
    payload: "ok" | "error";
  };
  version: string;
  uptime: number;
}

const startTime = Date.now();

/**
 * Health check endpoint for monitoring
 * Returns system health status including database connectivity
 */
export async function GET() {
  const checks = {
    database: "error" as "ok" | "error",
    payload: "error" as "ok" | "error",
  };

  try {
    // Check Payload CMS and database connectivity
    const payload = await getPayload({ config });
    checks.payload = "ok";

    // Simple query to verify database connection
    await payload.find({
      collection: "users",
      limit: 1,
    });
    checks.database = "ok";

    const allHealthy = Object.values(checks).every((c) => c === "ok");

    const response: HealthStatus = {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version || "0.1.0",
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };

    return NextResponse.json(response, {
      status: allHealthy ? 200 : 503,
    });
  } catch {
    const response: HealthStatus = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
      version: process.env.npm_package_version || "0.1.0",
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };

    return NextResponse.json(response, { status: 503 });
  }
}
