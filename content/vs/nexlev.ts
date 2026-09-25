import type { CompetitorPage } from "@/content/vs/types";

const PRICING = "https://www.nexlev.io/pricing";
const HOME = "https://www.nexlev.io/";

// Checked 2026-09-25 on Nexlev's own site. Nexlev shows prices in the
// visitor's local currency and no USD figure could be confirmed, so no
// price is listed (approved: link to their pricing page instead).
export const NEXLEV: CompetitorPage = {
  id: "nexlev",
  name: "Nexlev",
  domain: "nexlev.io",
  checkedOn: "2026-09-25",
  pricingUrl: PRICING,
  sources: [
    { label: "Nexlev pricing", url: PRICING },
    { label: "Nexlev homepage", url: HOME },
  ],
  bestFor: {
    them: "Nexlev is best if you want a huge channel database, RPM predictions and a Chrome extension packed with research tools.",
    us: "YTNiches is best if you want your research to turn into scripts, a content calendar and team tasks in one place.",
  },
  rows: [
    { key: "nicheResearch", them: { status: "yes", note: "Niche Finder (Pro)" }, source: PRICING },
    {
      key: "channelDatabase",
      them: { status: "yes", note: "157M+ channels analyzed" },
      source: PRICING,
    },
    {
      key: "outliers",
      them: { status: "yes", note: "Faceless outliers (Pro)" },
      source: PRICING,
    },
    {
      key: "competitorTracking",
      them: { status: "yes", note: "Real-time channel tracker" },
      source: PRICING,
    },
    { key: "rpm", them: { status: "yes", note: "RPM predictor (Pro)" }, source: PRICING },
    { key: "aiScripts", them: { status: "not-listed" } },
    {
      key: "thumbnailImages",
      them: { status: "yes", note: "AI Thumbnail Generator" },
      source: PRICING,
    },
    { key: "calendar", them: { status: "not-listed" } },
    { key: "teamWorkspace", them: { status: "not-listed" } },
    {
      key: "chromeExtension",
      them: { status: "yes", note: "35+ tools" },
      source: PRICING,
    },
    { key: "api", them: { status: "yes", note: "API and MCP" }, source: PRICING },
    {
      key: "course",
      them: { status: "yes", note: "YouTube Faceless course" },
      source: PRICING,
    },
    {
      key: "freeTrial",
      them: { status: "not-listed", note: "Full refund within 14 days instead" },
    },
  ],
  pricing: {
    kind: "unlisted",
    reason:
      "Nexlev shows prices in each visitor's local currency, so we don't quote a number here. Check their current prices on their pricing page.",
    plans: [
      {
        name: "Lite",
        details: ["Chrome extension (35+ tools)", "AI thumbnail generator", "Channel tracker"],
      },
      {
        name: "Pro",
        details: ["Everything in Lite", "Niche Finder + RPM predictor", "API (200 requests/mo)"],
      },
      { name: "N8N Pro", details: ["API (5,000 requests/mo) for N8N workflows"] },
    ],
  },
  trial: "No free trial listed. Full refund within 14 days.",
  chooseThem: [
    "You want to browse a very large database of channels before you pick a niche.",
    "RPM predictions matter to you when choosing a niche.",
    "You like research tools inside a Chrome extension while you browse YouTube.",
    "You want AI thumbnail images, a course and a community in the same package.",
  ],
  chooseUs: [
    "You already have a niche and want to know what to make next.",
    "You want outliers turned into titles, hooks and script outlines.",
    "You want a content calendar and team tasks next to your research.",
    "You'd rather try the full Pro plan for 14 days with no card.",
  ],
};
