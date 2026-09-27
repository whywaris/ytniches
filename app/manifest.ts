import type { MetadataRoute } from "next";

// Must equal --bg-base in app/globals.css (the dark default theme);
// tests/app/manifest.test.ts checks. A manifest can't read CSS variables.
export const MANIFEST_BACKGROUND = "#0a0a0b";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YTNiches",
    short_name: "YTNiches",
    description: "Niche research to content for faceless YouTube creators.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: MANIFEST_BACKGROUND,
    theme_color: MANIFEST_BACKGROUND,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
