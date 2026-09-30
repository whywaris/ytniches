// D-055: old-site tool URLs we don't rebuild. 301 (not Next's default
// 308 for `permanent`) so search engines move any ranking to /tools.
// Read by next.config.ts, and checked by tests/lib/tools/legacy-urls.test.ts.
export const LEGACY_TOOL_REDIRECTS = [
  "/youtube-word-counter",
  "/dislike-viewer",
  "/random-comment-picker",
  "/youtube-automation-tools",
].map((source) => ({ source, destination: "/tools", statusCode: 301 as const }));

// Short legal URLs (the audit form, the old site's footer and people typing
// them) go to the real pages. 308 = permanent, keeps the method.
export const LEGAL_REDIRECTS = [
  { source: "/privacy", destination: "/legal/privacy", permanent: true as const },
  { source: "/terms", destination: "/legal/terms", permanent: true as const },
];
