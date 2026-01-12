// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry in production to avoid HMR issues in development
// See: https://github.com/vercel/next.js/issues/70424
if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://828a91a3cf3363911f4dd54a8b848c79@o4510640892739584.ingest.de.sentry.io/4510650365378640",

    // Add optional integrations for additional features
    integrations: [Sentry.replayIntegration()],

    // Define how likely traces are sampled
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Enable sending user PII
    sendDefaultPii: true,
  });
}

// This export will instrument router navigations
export const onRouterTransitionStart =
  process.env.NODE_ENV === "production" ? Sentry.captureRouterTransitionStart : undefined;
