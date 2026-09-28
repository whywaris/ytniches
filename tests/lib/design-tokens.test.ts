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

// D-082: marketing glass. Text sits on translucent glass over the warm
// page background, sometimes over a soft orange glow. Composite each
// layer (source-over) and check the text tokens on the result.
describe("marketing glass tokens (D-082)", () => {
  const start = css.indexOf(".marketing {");
  const body = css.slice(start, css.indexOf("}", start));
  const token = (name: string) => {
    const match = new RegExp(`--${name}:\s*([^;]+);`).exec(body);
    if (!match) throw new Error(`--${name} missing from .marketing`);
    return match[1]!.trim();
  };

  type Rgb = [number, number, number];
  const hexRgb = (hex: string): Rgb =>
    [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
  const toHex = (rgb: Rgb) =>
    `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
  // rgba(r, g, b, a) or color-mix(in srgb, var(--accent) N%, transparent).
  function layer(value: string): { rgb: Rgb; alpha: number } {
    const rgba = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/.exec(value);
    if (rgba) return { rgb: [+rgba[1]!, +rgba[2]!, +rgba[3]!], alpha: +rgba[4]! };
    const mix = /color-mix\(in srgb, var\(--accent\) (\d+)%, transparent\)/.exec(value);
    if (mix) return { rgb: hexRgb(dark.accent!), alpha: +mix[1]! / 100 };
    throw new Error(`unparsed layer ${value}`);
  }
  const over = (base: Rgb, value: string): Rgb => {
    const { rgb, alpha } = layer(value);
    return base.map((c, i) => c * (1 - alpha) + rgb[i]! * alpha) as Rgb;
  };

  const pageBg = hexRgb(token("mk-bg"));
  const surfaces = {
    "glass on the page": toHex(over(pageBg, token("glass-bg"))),
    "strong glass on the page": toHex(over(pageBg, token("glass-bg-strong"))),
    "strong glass on the soft glow": toHex(
      over(over(pageBg, token("glow-accent-soft")), token("glass-bg-strong")),
    ),
  };

  it.each(Object.entries(surfaces))("text passes 4.5:1 on %s", (_name, surface) => {
    for (const text of ["text-primary", "text-secondary", "accent-text"]) {
      expect(contrast(dark[text]!, surface), text).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("CTA text on the orange button still passes on the warm page", () => {
    expect(contrast(dark["text-inverse"]!, dark.accent!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(dark.accent!, toHex(pageBg))).toBeGreaterThanOrEqual(3);
  });
});
