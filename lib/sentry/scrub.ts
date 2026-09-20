import type { ErrorEvent } from "@sentry/nextjs";

// Security.md §4.2: never send emails, auth tokens, or billing details to
// Sentry. `sendDefaultPii: false` (set in every Sentry.init() call) already
// withholds IP addresses and similar by default; this covers what our own
// code might still attach — user context, cookies, auth headers.
export function scrubSensitiveData(event: ErrorEvent): ErrorEvent {
  if (event.user) {
    delete event.user.email;
    delete event.user.username;
    delete event.user.ip_address;
  }

  if (event.request) {
    delete event.request.cookies;
    if (event.request.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
  }

  return event;
}
