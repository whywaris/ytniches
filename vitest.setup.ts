import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { afterEach, expect } from "vitest";

expect.extend(toHaveNoViolations);

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
});
