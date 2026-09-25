// UI-UX-Flow.md §2.2 category pills, in display order.
export const CATEGORIES = [
  {
    slug: "faceless-niches",
    name: "Faceless Niches",
    description: "Finding a faceless niche that still has room, and checking it before you commit.",
  },
  {
    slug: "outlier-analysis",
    name: "Outlier Analysis",
    description:
      "Reading the videos that beat their channel's average, and what to steal from them.",
  },
  {
    slug: "ai-prompts",
    name: "AI Prompts",
    description:
      "Prompts for scripts, titles, hooks and thumbnails that don't sound like everyone else's.",
  },
  {
    slug: "youtube-growth",
    name: "YouTube Growth",
    description: "Publishing habits, packaging and the unglamorous parts of getting views.",
  },
  {
    slug: "case-studies",
    name: "Case Studies",
    description: "Real channels, real numbers, and what actually happened.",
  },
  {
    slug: "tool-guides",
    name: "Tool Guides",
    description: "How to get the most out of YTNiches, step by step.",
  },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategorySlug = Category["slug"];

export const CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug) as [
  CategorySlug,
  ...CategorySlug[],
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}
