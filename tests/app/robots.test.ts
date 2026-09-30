import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import robots, { PRIVATE_PATHS } from "@/app/robots";
import { SITE_URL } from "@/lib/site";

const routeFolders = (group: string) =>
  readdirSync(path.join(process.cwd(), "app", group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `/${entry.name}`);

describe("robots.txt", () => {
  it("keeps crawlers out of every signed-in and admin route", () => {
    for (const route of [...routeFolders("(app)"), ...routeFolders("(admin)")]) {
      expect(PRIVATE_PATHS, route).toContain(route);
    }
  });

  it("allows the public site and points at the sitemap", () => {
    const result = robots();
    expect(result.rules).toMatchObject({ userAgent: "*", allow: "/" });
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});
