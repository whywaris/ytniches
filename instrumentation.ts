import * as Sentry from "@sentry/nextjs";

// Next.js instrumentation hook (stable since Next 15, no experimental
// flag needed). Loads the runtime-appropriate Sentry config — Node.js
// APIs aren't available in the edge runtime, so these must stay separate
// files rather than one config with a branch.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
