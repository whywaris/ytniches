import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { OG_COLORS, OG_SIZE } from "@/lib/og/card";

describe("OG card", () => {
  it("is 1200x630 and mirrors the dark-theme tokens", () => {
    expect(OG_SIZE).toEqual({ width: 1200, height: 630 });
    const css = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
    const root = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
    const token = (name: string) =>
      new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i").exec(root)?.[1]?.toLowerCase();
    expect(OG_COLORS.bgBase).toBe(token("bg-base"));
    expect(OG_COLORS.textPrimary).toBe(token("text-primary"));
    expect(OG_COLORS.textSecondary).toBe(token("text-secondary"));
    expect(OG_COLORS.accent).toBe(token("accent-text"));
  });
});
