import { withSentryConfig } from "@sentry/nextjs/config";

import { LEGACY_TOOL_REDIRECTS, LEGAL_REDIRECTS } from "./lib/tools/legacy-redirects";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE.md is our real, human-reviewed spec-pointer doc (see repo root).
  // Next's auto-generated agent-rules block would otherwise get appended to
  // it (or create a competing AGENTS.md) on every `next dev`/`next build`.
  agentRules: false,
  // D-055: old-site tool URLs we don't rebuild -> /tools with a 301.
  // D-084: /privacy and /terms -> /legal/*.
  async redirects() {
    return [...LEGACY_TOOL_REDIRECTS, ...LEGAL_REDIRECTS];
  },
};

// Minimal options for now: no org/project/authToken, so no source-map
// upload happens yet (that needs a Sentry auth token, a real secret we
// don't have configured). withSentryConfig degrades gracefully without
// them — error tracking itself doesn't depend on source-map upload.
export default withSentryConfig(nextConfig, {
  silent: true,
});
