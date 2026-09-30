import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import nextConfig from "@/next.config";
import { LEGACY_TOOL_REDIRECTS, LEGAL_REDIRECTS } from "@/lib/tools/legacy-redirects";

// Every tool URL the old site (ytniches5) had. None may 404 after the
// switch: each must either be a page here or a 301 to a page (D-054, D-055).
const OLD_TOOL_URLS = [
  "/youtube-subscribe-link-generator",
  "/rss-feed-generator",
  "/youtube-embed-code-generator",
  "/thumbnail-resizer",
  "/youtube-thumbnail-download",
  "/watch-time-calculator",
  "/youtube-revenue-calculator",
  "/youtube-timestamp-generator",
  "/tag-extractor",
  "/youtube-qr-code-generator",
  "/youtube-word-counter",
  "/dislike-viewer",
  "/random-comment-picker",
  "/youtube-automation-tools",
  "/tools",
];

const pageExists = (url: string) =>
  existsSync(path.join(process.cwd(), "app", "(marketing)", url.slice(1), "page.tsx"));

describe("old site tool URLs", () => {
  it.each(OLD_TOOL_URLS)("%s is a page or a 301 to a page", (url) => {
    const redirect = LEGACY_TOOL_REDIRECTS.find((entry) => entry.source === url);
    if (redirect) {
      expect(redirect.statusCode).toBe(301);
      expect(pageExists(redirect.destination), redirect.destination).toBe(true);
      expect(pageExists(url), `${url} is both a page and a redirect`).toBe(false);
    } else {
      expect(pageExists(url), `${url} would 404`).toBe(true);
    }
  });

  it("next.config actually serves the 301s and the legal redirects", async () => {
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toEqual([...LEGACY_TOOL_REDIRECTS, ...LEGAL_REDIRECTS]);
  });
});

describe("short legal URLs (D-084)", () => {
  it.each([
    ["/privacy", "/legal/privacy"],
    ["/terms", "/legal/terms"],
  ])("%s redirects permanently to %s, a real page", (source, destination) => {
    expect(LEGAL_REDIRECTS).toContainEqual({ source, destination, permanent: true });
    const slug = destination.split("/").pop()!;
    expect(existsSync(path.join(process.cwd(), "content", "legal", `${slug}.mdx`))).toBe(true);
    expect(pageExists(source), `${source} is both a page and a redirect`).toBe(false);
  });
});
