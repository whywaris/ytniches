// Absolute site origin for canonicals, RSS and the sitemap. Falls back to
// production (not localhost) so a build without the env var still emits
// correct public URLs.
// The one support address (help center, emails). Forwards to a real inbox.
export const SUPPORT_EMAIL = "support@ytniches.com";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ytniches.com").replace(
  /\/$/,
  "",
);
