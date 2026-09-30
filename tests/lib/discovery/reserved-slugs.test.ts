import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { isValidNicheSlug, RESERVED_NICHE_SLUGS } from "@/lib/discovery/config";
import { slugify } from "@/lib/services/discovery/classify";

// /niches/[slug] sits next to static routes such as /niches/channels/[id].
// Every static folder under app/(app)/niches must be a reserved slug, and
// the database must refuse it too.
const NICHES_DIR = path.join(process.cwd(), "app", "(app)", "niches");

function staticRouteSegments(): string[] {
  return (
    readdirSync(NICHES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      // Dynamic ([slug]), route groups ((group)) and private (_x) folders
      // don't claim a URL segment.
      .filter((name) => !/^[[(_]/.test(name))
  );
}

describe("reserved niche slugs", () => {
  it("covers every static route folder under /niches", () => {
    const segments = staticRouteSegments();
    expect(segments).toContain("channels");
    for (const segment of segments) {
      expect(RESERVED_NICHE_SLUGS).toContain(segment);
    }
  });

  it("are refused by the niches.slug check in SQL", () => {
    const sql = readFileSync(
      path.join(
        process.cwd(),
        "supabase",
        "migrations",
        "20260928100002_create_discovery_tables.sql",
      ),
      "utf8",
    );
    for (const slug of RESERVED_NICHE_SLUGS) {
      expect(sql).toContain(`slug <> '${slug}'`);
    }
  });

  it("are never produced by the classifier's slugify", () => {
    for (const slug of RESERVED_NICHE_SLUGS) {
      expect(slugify(slug)).not.toBe(slug);
      expect(isValidNicheSlug(slugify(slug))).toBe(true);
    }
  });

  it("the page guard rejects reserved and malformed slugs", () => {
    expect(isValidNicheSlug("mafia-history")).toBe(true);
    expect(isValidNicheSlug("channels")).toBe(false);
    expect(isValidNicheSlug("Mafia History")).toBe(false);
    expect(isValidNicheSlug("../admin")).toBe(false);
    expect(isValidNicheSlug("a".repeat(81))).toBe(false);
  });
});
