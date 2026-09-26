// PRD.md §10.4 / UI-UX-Flow.md §4.1: the help center's fixed categories,
// in the order /help lists them.
export const HELP_CATEGORIES = [
  { slug: "getting-started", name: "Getting started" },
  { slug: "niche-finder", name: "Niche Finder" },
  { slug: "competitor-tracking", name: "Competitor Tracking" },
  { slug: "outliers", name: "Outliers" },
  { slug: "ai-prompts", name: "AI Prompts & Thumbnail Ideas" },
  { slug: "notifications", name: "Notifications" },
  { slug: "team", name: "Team (Workspace, Tasks, Calendar)" },
  { slug: "billing", name: "Billing" },
] as const;

export type HelpCategorySlug = (typeof HELP_CATEGORIES)[number]["slug"];

export const HELP_CATEGORY_SLUGS = HELP_CATEGORIES.map((category) => category.slug) as [
  HelpCategorySlug,
  ...HelpCategorySlug[],
];

export function getHelpCategory(slug: HelpCategorySlug) {
  return HELP_CATEGORIES.find((category) => category.slug === slug);
}
