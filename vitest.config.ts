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
  },
  resolve: {
    alias: {
      "@": import.meta.dirname,
    },
  },
});
