import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterEach, expect } from "vitest";

expect.extend(toHaveNoViolations);

// Explicit rather than relying on @testing-library/react's implicit
// auto-cleanup-on-first-import: with vitest.config.ts's `isolate: false`,
// multiple test files share a worker and its module cache, so the
// implicit registration only binds to whichever file's context was
// active on first import — other files in that worker leak DOM state
// between tests. setupFiles run per test file regardless of isolation,
// so this always rebinds correctly.
afterEach(() => {
  cleanup();
});
