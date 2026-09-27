import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// CLAUDE.md §4.2 / Design-System.md: never inline colours. Every colour in
// the discovery UI (cards, score badges, trend arrows, charts, chips) comes
// from a design token -- accent for brand emphasis, success/error for
// up/down -- so a brand change to the tokens reaches all of it.
const ROOTS = [
  "components/features/niche-finder",
  "app/(app)/niches",
  "app/(admin)/admin/discovery",
];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx|css)$/.test(name) && !name.includes(".stories.") ? [full] : [];
  });
}

const RAW_COLOUR = [
  /#[0-9a-f]{3,8}\b/i,
  /\b(rgba?|hsla?|oklch)\(/i,
  /\b(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
];

const files = ROOTS.flatMap((root) => sourceFiles(path.join(process.cwd(), root)));

describe("discovery UI uses design tokens only", () => {
  it("finds the discovery UI files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(files.map((f) => [path.relative(process.cwd(), f), f]))(
    "%s has no hard-coded colour",
    (_label, file) => {
      const offending = readFileSync(file, "utf8")
        .split("\n")
        .map((line, i) => ({ line: i + 1, text: line.trim() }))
        .filter(({ text }) => !text.startsWith("//") && RAW_COLOUR.some((re) => re.test(text)));
      expect(offending).toEqual([]);
    },
  );

  it("inline chart colours are CSS token variables", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/\b(?:stroke|fill|background|color)[=:]\s*"([^"]+)"/g)) {
        const value = match[1] ?? "";
        if (value === "none" || value === "currentColor") continue;
        expect(value, `${path.relative(process.cwd(), file)}: ${match[0]}`).toMatch(
          /var\(--color-[a-z0-9-]+\)/,
        );
      }
    }
  });
});
