import { TRIAL_PITCH } from "@/lib/billing/plans";
import type { CompetitorPage } from "@/content/vs/types";

const PRICING = "https://outlierkit.com/pricing";
const HOME = "https://outlierkit.com/";

// Checked 2026-09-25 on OutlierKit's own site (Monthly tab). Current
// prices only, not the struck-through ones. Their page gives two
// different trial sizes, so no number is quoted.
export const OUTLIERKIT: CompetitorPage = {
  id: "outlierkit",
  name: "OutlierKit",
  domain: "outlierkit.com",
  checkedOn: "2026-09-25",
  pricingUrl: PRICING,
  sources: [
    { label: "OutlierKit pricing", url: PRICING },
    { label: "OutlierKit homepage", url: HOME },
  ],
  bestFor: {
    them: "OutlierKit is best for deep outlier and keyword research across a whole niche.",
    us: "YTNiches is best if you want that research to turn into scripts, a content calendar and team tasks.",
  },
  rows: [
    {
      key: "nicheResearch",
      them: { status: "yes", note: "Competitor Studio maps a niche (Pro and up)" },
      source: PRICING,
    },
    {
      key: "outliers",
      them: { status: "yes", note: "On any channel or across a niche" },
      source: HOME,
    },
    {
      key: "competitorTracking",
      them: { status: "partial", note: "Single-channel analysis; ongoing tracking not listed" },
      source: PRICING,
    },
    { key: "rpm", them: { status: "partial", note: "High-RPM keyword finder" }, source: PRICING },
    {
      key: "keywordResearch",
      them: { status: "yes", note: "Search volume and ranking difficulty" },
      source: HOME,
    },
    {
      key: "aiScripts",
      them: { status: "partial", note: "AI script and hook analysis (Pro)" },
      source: PRICING,
    },
    { key: "calendar", them: { status: "not-listed" } },
    {
      key: "teamWorkspace",
      them: { status: "not-listed", note: "Max plan connects 50+ channels" },
    },
    {
      key: "api",
      them: { status: "yes", note: "MCP server and API (Pro and up)" },
      source: PRICING,
    },
    { key: "lifetimePlan", them: { status: "yes" }, source: PRICING },
    { key: "freeTrial", them: { status: "yes", note: "No card required" }, source: PRICING },
  ],
  pricing: {
    kind: "listed",
    tiers: [
      { name: "Hobby", monthly: "$29", annual: "$199/yr", details: ["100 credits/mo"] },
      {
        name: "Pro",
        monthly: "$49",
        annual: "$299/yr",
        details: ["500 credits/mo", "Competitor Studio", "MCP and API"],
      },
      {
        name: "Max",
        monthly: "$199",
        annual: "$999/yr",
        details: ["2,000 credits/mo", "50+ connected channels"],
      },
    ],
    notes: ["Lifetime (one-time) plans are also offered.", "Extra credits: $10 per 100."],
  },
  trial: "Free trial with credits, no card required.",
  chooseThem: [
    "Research is the job: you want keyword volume and difficulty next to outliers.",
    "You want to map a whole niche from a single channel.",
    "You want to pull YouTube research into Claude through MCP.",
    "You'd rather pay once with a lifetime plan.",
  ],
  chooseUs: [
    "You want outliers turned into titles, hooks and script outlines, not just analysed.",
    "You want a content calendar and team tasks next to your research.",
    "A cheaper way in: our Starter plan is $19/month, $10 less than their Hobby plan.",
    `${TRIAL_PITCH}, no card needed.`,
  ],
};
