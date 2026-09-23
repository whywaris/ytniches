// Client half of TRD.md §6.5's event capture -- posthog-js only. See
// lib/analytics/index.ts's comment for why this has to be a genuinely
// separate file rather than a branch of that one: it must never mention
// posthog-node anywhere, even dynamically, or a "use client" component
// importing it crashes both bundlers this project has tried. posthog-js
// assigns its own anonymous id; there's no identify() flow yet, so no
// distinctId parameter here (unlike the server half).
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

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

export async function capture(event: string, properties?: Record<string, unknown>): Promise<void> {
  if (!POSTHOG_KEY) return;
  const client = await getBrowserClient();
  client?.capture(event, properties);
}
