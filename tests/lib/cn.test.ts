import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

// Regression test for the tailwind-merge fix found via Storybook's a11y
// addon during Batch A (Primary button lost its text color because
// tailwind-merge treated our custom text-size and text-color tokens as
// the same conflict group). If this ever breaks silently in a dependency
// update, this test should fail before it becomes a visual regression.
describe("cn()", () => {
  it("preserves both a text-size and a text-color token on the same element", () => {
    const result = cn("text-caption", "text-text-secondary");
    expect(result).toContain("text-caption");
    expect(result).toContain("text-text-secondary");
  });

  it("preserves a custom text-size token alongside a single-word custom text-color token", () => {
    const result = cn("text-body", "text-error");
    expect(result).toContain("text-body");
    expect(result).toContain("text-error");
  });

  it("still deduplicates genuine Tailwind conflicts", () => {
    const result = cn("p-2", "p-4");
    expect(result).not.toContain("p-2");
    expect(result).toContain("p-4");
  });

  it("still deduplicates conflicting text-size tokens", () => {
    const result = cn("text-caption", "text-h1");
    expect(result).not.toContain("text-caption");
    expect(result).toContain("text-h1");
  });

  it("still deduplicates conflicting text-color tokens", () => {
    const result = cn("text-text-primary", "text-text-inverse");
    expect(result).not.toContain("text-text-primary");
    expect(result).toContain("text-text-inverse");
  });
});
