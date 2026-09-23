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

let browserClient: typeof import("posthog-js").default | undefined;
async function getBrowserClient() {
  if (!POSTHOG_KEY || typeof window === "undefined") return undefined;
  if (!browserClient) {
    const posthog = (await import("posthog-js")).default;
    posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST, person_profiles: "identified_only" });
    browserClient = posthog;
  }
  return browserClient;
}

// TRD.md §6.5's MVP event set (Implementation-Plan.md §3.4). Server-side
// (route handlers, Server Actions) goes through posthog-node -- pass the
// user's id as `distinctId`. Client-side (components) goes through a
// lazily-initialized posthog-js, which assigns its own anonymous id;
// `distinctId` is a no-op there since there's no identify() flow yet.
// No-ops entirely when NEXT_PUBLIC_POSTHOG_KEY isn't set (local dev,
// tests), so call sites never need to guard on it themselves.
export async function capture(
  event: string,
  properties?: Record<string, unknown> & { distinctId?: string },
): Promise<void> {
  if (!POSTHOG_KEY) return;
  const { distinctId, ...rest } = properties ?? {};

  if (typeof window === "undefined") {
    if (!distinctId) return;
    getServerClient()?.capture({ distinctId, event, properties: rest });
    return;
  }

  const client = await getBrowserClient();
  client?.capture(event, rest);
}
