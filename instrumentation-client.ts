import * as Sentry from "@sentry/nextjs";

import { scrubSensitiveData } from "@/lib/sentry/scrub";

// Replaces the older standalone sentry.client.config.ts (unused in this
// SDK version — instrumentation-client.ts is the current App Router
// convention). Deliberately no Session Replay / feedback widget
// integrations: Replay records on-screen DOM/interactions, which could
// capture visible emails or form data — directly at odds with Security.md
// §4.2's "no emails... in Sentry payloads." Scope here is basic error
// tracking only, per Implementation-Plan.md §2.5.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: false,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  beforeSend: scrubSensitiveData,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
