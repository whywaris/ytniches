import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterEach, expect, vi } from "vitest";

expect.extend(toHaveNoViolations);

// D-039: the actual leak mechanism (diagnosed via 10x isolated runs on
// every D-039-listed file, all clean, plus 5 full-suite runs producing two
// distinct failure signatures whose stack traces showed the WRONG mock
// shape active -- e.g. credits/index.test.ts's own createClient() mock
// swapped for a differently-shaped one). Root cause: under `isolate:
// false`, shared library modules (lib/credits/index.ts, lib/youtube/
// cache.ts, etc.) are only evaluated ONCE per worker -- Node/Vite's SSR
// module cache treats the first test file that `await import()`s them as
// authoritative, and every later file's dynamic import in the same worker
// gets that SAME cached instance, already bound to the FIRST file's
// vi.mock() factories, not its own. This is why it only ever reproduced on
// full-suite runs (multiple files sharing a worker) and never in
// isolation (single file = first and only importer). setupFiles run fresh
// per test file even under isolate:false (see the cleanup() comment
// below) -- resetModules() here, before that file's own vi.mock() +
// `await import()` lines run, forces every file to re-evaluate its
// module graph fresh against its OWN mocks instead of reusing a stale,
// wrongly-bound instance left by whichever file happened to import it
// first.
vi.resetModules();

// jsdom doesn't implement ResizeObserver; Radix Toast (and some other
// Radix primitives) use it internally to measure elements.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom doesn't implement scrollIntoView; cmdk (CommandPalette) calls it
// to keep the keyboard-highlighted item in view while navigating.
if (typeof Element.prototype.scrollIntoView === "undefined") {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// jsdom doesn't implement the Pointer Capture API; Radix Select (and other
// Radix primitives using pointer-based interactions) calls these on click.
if (typeof Element.prototype.hasPointerCapture === "undefined") {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

// Explicit rather than relying on @testing-library/react's implicit
// auto-cleanup-on-first-import: with vitest.config.ts's `isolate: false`,
// multiple test files share a worker and its module cache, so the
// implicit registration only binds to whichever file's context was
// active on first import — other files in that worker leak DOM state
// between tests. setupFiles run per test file regardless of isolation,
// so this always rebinds correctly.
afterEach(() => {
  cleanup();
  // Same isolate:false leak class as D-039, at the localStorage layer
  // instead of the module cache: components/ui/sidebar.tsx's collapse
  // toggle (and this session's theme-provider/recent-routes/streak
  // additions) write real keys to jsdom's one shared localStorage per
  // worker. A test that toggles collapse and never resets it left later
  // tests in the same worker silently rendering a collapsed sidebar
  // (labels/badges hidden) -- found via tests/components/features/shell/
  // app-sidebar.test.tsx flaking only in full-suite runs. Centralized here
  // rather than a per-file localStorage.clear(), so no future localStorage
  // consumer has to remember this.
  localStorage.clear();
});
