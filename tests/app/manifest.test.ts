import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import manifest, { MANIFEST_BACKGROUND } from "@/app/manifest";

describe("web app manifest", () => {
  it("uses --bg-base for background and theme colour", () => {
    const css = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
    const bgBase = /:root \{[^}]*--bg-base:\s*(#[0-9a-f]{6})/i.exec(css)?.[1];
    expect(MANIFEST_BACKGROUND).toBe(bgBase);
    expect(manifest().theme_color).toBe(bgBase);
  });

  it("points at icons that exist", () => {
    for (const icon of manifest().icons ?? []) {
      expect(existsSync(path.join(process.cwd(), "public", icon.src)), icon.src).toBe(true);
    }
  });
});
