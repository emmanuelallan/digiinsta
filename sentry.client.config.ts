import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: isProduction ? 1.0 : 0,
  debug: false,
  replaysOnErrorSampleRate: isProduction ? 1.0 : 0,
  replaysSessionSampleRate: isProduction ? 0.1 : 0,
  integrations: isProduction
    ? [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ]
    : [],
  enabled: isProduction,
});
