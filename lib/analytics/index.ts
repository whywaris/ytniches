import { PostHog } from "posthog-node";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

let serverClient: PostHog | undefined;
function getServerClient(): PostHog | undefined {
  if (!POSTHOG_KEY) return undefined;
  // flushAt/flushInterval: a serverless function can freeze before a
  // batched flush fires -- send every event immediately instead.
  serverClient ??= new PostHog(POSTHOG_KEY, { host: POSTHOG_HOST, flushAt: 1, flushInterval: 0 });
  return serverClient;
}

// Server-only half of TRD.md §6.5's event capture (route handlers, Server
// Actions) -- posthog-node, pass the user's id as `distinctId`. The
// client half (lib/analytics/client.ts, posthog-js) is a genuinely
// separate file, not a branch inside this one: posthog-node imports
// node:fs/zlib/async_hooks/etc at its own top level, and a `"use client"`
// component importing ANY file that references posthog-node -- even
// inside a function only ever called server-side, even behind a dynamic
// `import()` -- crashes the dev server. Caught live this session: Turbo-
// pack panicked with a raw `node:fs` chunking error, webpack refused with
// a clearer "node: URIs not handled" error, on every page whose client
// tree rendered UpgradeModal (which calls capture()). Both bundlers trace
// the import graph, not just what a runtime branch would execute -- the
// only fix is that the client-imported file never mentions posthog-node
// at all. No-ops entirely when NEXT_PUBLIC_POSTHOG_KEY isn't set (local
// dev, tests), so call sites never need to guard on it themselves.
export async function capture(
  event: string,
  properties: Record<string, unknown> & { distinctId: string },
): Promise<void> {
  if (!POSTHOG_KEY) return;
  const { distinctId, ...rest } = properties;
  getServerClient()?.capture({ distinctId, event, properties: rest });
}
