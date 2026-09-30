import { SITE_URL } from "@/lib/site";

import type { MetadataRoute } from "next";

// Crawl the public site; keep crawlers out of the signed-in app, admin,
// auth callbacks and the API. tests/app/robots.test.ts checks this list
// against the app/(app) and app/(admin) route folders.
export const PRIVATE_PATHS = [
  "/admin",
  "/api/",
  "/auth/",
  "/calendar",
  "/dashboard",
  "/invite",
  "/niches",
  "/onboarding",
  "/outliers",
  "/prompts",
  "/settings",
  "/suspended",
  "/tracking",
  "/workspace",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
