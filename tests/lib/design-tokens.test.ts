import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// D-068. jest-axe runs in jsdom, which doesn't apply our CSS variables, so
// its colour-contrast rule never sees these tokens. This checks the accent
// pairings straight from globals.css against WCAG 2.1 AA, in both themes:
// 4.5:1 for text, 3:1 for UI parts (borders, rings, checkbox fills).
const css = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]),
  );
}

const dark = block(":root");
const light = { ...dark, ...block(':root[data-theme="light"]') };

function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe.each([
  ["dark", dark],
  ["light", light],
] as const)("accent tokens (%s theme)", (_theme, t) => {
  it("is the brand orange", () => {
    expect(t.accent.toLowerCase()).toBe("#ff5a2e");
  });

  it.each(["bg-base", "bg-surface-1", "bg-surface-2"])("accent-text on %s passes 4.5:1", (bg) => {
    expect(contrast(t["accent-text"], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["accent", "accent-hover"])("text-inverse on %s (buttons) passes 4.5:1", (fill) => {
    expect(contrast(t["text-inverse"], t[fill])).toBeGreaterThanOrEqual(4.5);
  });

  it("accent as a UI part (borders, rings, fills) passes 3:1 on the page", () => {
    expect(contrast(t.accent, t["bg-base"])).toBeGreaterThanOrEqual(3);
  });

  it("niches aren't orange (they'd read as the accent)", () => {
    expect(t["object-niches"].toLowerCase()).not.toBe(t.accent.toLowerCase());
    expect(contrast(t["object-niches"], t["bg-base"])).toBeGreaterThanOrEqual(3);
  });
});
