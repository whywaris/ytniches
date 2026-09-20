import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CLAUDE.md is our real, human-reviewed spec-pointer doc (see repo root).
  // Next's auto-generated agent-rules block would otherwise get appended to
  // it (or create a competing AGENTS.md) on every `next dev`/`next build`.
  agentRules: false,
};

export default nextConfig;
