import pino from "pino";

/**
 * Structured logger using pino
 * Server-only, edge-safe
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(process.env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }),
});
