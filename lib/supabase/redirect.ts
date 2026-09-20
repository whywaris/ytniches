// The `?redirect=` param round-trips through the OAuth flow (login page ->
// Google -> our callback route) and is attacker-influenceable — a crafted
// link to /login?redirect=https://evil.com or //evil.com (protocol-relative,
// which browsers treat as same-protocol to a different host) must never be
// followed. Only same-origin relative paths are allowed; anything else
// falls back to the default.
export function getSafeRedirect(target: string | null | undefined, fallback = "/dashboard") {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback;
  }
  return target;
}
