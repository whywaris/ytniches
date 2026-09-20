import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

// Security.md §4.2: never send emails, tokens, passwords, or billing
// provider keys to Sentry. `sendDefaultPii: false` (set in every
// Sentry.init() call) already withholds IP addresses and similar by
// default; this covers what our own code might still attach anywhere in
// an event — user context, request data, extra/context data, breadcrumbs.
// Substring match (not exact-key match) so it also catches variants like
// SUPABASE_SERVICE_ROLE_KEY or a cookie literally named sb-access-token.
// username/ip_address go beyond this task's literal list but were in the
// prior approved implementation (defense in depth for PII generally, not
// just the named secret fields) — kept, not regressed.
const SENSITIVE_KEY_PATTERNS = [
  "email",
  "token",
  "password",
  "authorization",
  "cookie",
  "service_role_key",
  "stripe_key",
  "creem_key",
  "username",
  "ip_address",
];

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => lower.includes(pattern));
}

function deepScrub<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepScrub(item)) as T;
  }
  if (value !== null && typeof value === "object") {
    const scrubbed: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) continue;
      scrubbed[key] = deepScrub(entryValue);
    }
    return scrubbed as T;
  }
  return value;
}

export function scrubSensitiveData(event: ErrorEvent): ErrorEvent {
  if (event.user) {
    event.user = deepScrub(event.user);
  }

  if (event.request) {
    // Dropped outright regardless of shape — cookies can be a raw string
    // or a parsed object depending on how the event was captured.
    delete event.request.cookies;
    if (event.request.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
      event.request.headers = deepScrub(event.request.headers);
    }
  }

  if (event.extra) {
    event.extra = deepScrub(event.extra);
  }

  if (event.contexts) {
    event.contexts = deepScrub(event.contexts);
  }

  if (event.tags) {
    event.tags = deepScrub(event.tags);
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb: Breadcrumb) =>
      breadcrumb.data ? { ...breadcrumb, data: deepScrub(breadcrumb.data) } : breadcrumb,
    );
  }

  return event;
}
