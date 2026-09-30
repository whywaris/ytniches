import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    // Default `isolate: true` spawns a fresh worker + jsdom environment
    // per test file, which OOM'd this machine once the suite hit ~7
    // files. Sharing environments across files within a worker is
    // Vitest's own recommended fix (printed as a perf hint) and only
    // gets more necessary as Batch B adds more component tests.
    isolate: false,
    // With shared workers a vi.stubEnv left in place leaks into later files
    // (the auth tests' NEXT_PUBLIC_SITE_URL broke the digest URLs in CI);
    // reset stubbed env vars before each test (imports still see a stub left by
    // the previous file, so read env at call time, not module load).
    unstubEnvs: true,
    // Default 5000ms. FullCalendar's month-grid render (Phase 3 Tasks
    // 2+3's Content Calendar) is CPU-heavy enough that a sibling worker
    // running it can starve an unrelated file's userEvent-timer-based
    // interaction test past 5s on this machine's core count -- caught as
    // a different, unrelated test file timing out on each of several
    // consecutive full-suite runs, never the same one twice, and never a
    // wrong-assertion failure (that pattern is contention, not a logic
    // bug -- D-039's mock-binding recurrence would look like the latter).
    // 10s absorbs that contention without hiding a genuinely hung test.
    testTimeout: 10_000,
  },
  resolve: {
    alias: {
      "@": import.meta.dirname,
    },
  },
});
