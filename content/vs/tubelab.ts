import type { CompetitorPage } from "@/content/vs/types";

const PRICING = "https://tubelab.net/pricing";
const HOME = "https://tubelab.net/";

// Checked 2026-09-25 on TubeLab's own site (Month tab). Pro is shown as a
// 20% discount from $49; the note keeps that honest if it reverts.
export const TUBELAB: CompetitorPage = {
  id: "tubelab",
  name: "TubeLab",
  domain: "tubelab.net",
  checkedOn: "2026-09-25",
  pricingUrl: PRICING,
  sources: [
    { label: "TubeLab pricing", url: PRICING },
    { label: "TubeLab homepage", url: HOME },
  ],
  bestFor: {
    them: "TubeLab is best for scanning a large database of breakout channels and outliers, with RPM filters and its own scriptwriter.",
    us: "YTNiches is best if you also want a content calendar and team tasks for planning what ships.",
  },
  rows: [
    { key: "nicheResearch", them: { status: "yes", note: "Niche Finder" }, source: HOME },
    {
      key: "channelDatabase",
      them: { status: "yes", note: "500K+ breakout channels, updated daily" },
      source: HOME,
    },
    { key: "outliers", them: { status: "yes", note: "5M+ outliers" }, source: HOME },
    { key: "competitorTracking", them: { status: "yes" }, source: HOME },
    {
      key: "rpm",
      them: { status: "yes", note: "RPM and revenue filters, monetization tracker" },
      source: HOME,
    },
    {
      key: "aiScripts",
      them: { status: "yes", note: "AI Scriptwriter (Pro and up)" },
      source: PRICING,
    },
    { key: "calendar", them: { status: "not-listed" } },
    {
      key: "teamWorkspace",
      them: { status: "partial", note: "Team plan: up to 10 members; tasks not listed" },
      source: PRICING,
    },
    {
      key: "chromeExtension",
      them: { status: "yes", note: "Free monetization checker" },
      source: HOME,
    },
    { key: "api", them: { status: "yes", note: "API and MCP" }, source: PRICING },
    { key: "rankTracker", them: { status: "yes" }, source: PRICING },
    { key: "freeTrial", them: { status: "no", note: "Their FAQ: no free trial" }, source: PRICING },
  ],
  pricing: {
    kind: "listed",
    tiers: [
      { name: "Starter", monthly: "$29", details: ["200 credits/mo", "1 YouTube channel"] },
      {
        name: "Pro",
        monthly: "$39",
        details: ["400 credits/mo", "5 YouTube channels", "Scriptwriter", "Listed as 20% off $49"],
      },
      {
        name: "Team",
        monthly: "$100",
        details: ["1,000 credits/mo", "10 YouTube channels", "Up to 10 members"],
      },
    ],
    notes: ["Yearly billing: “Save 3 months when you pay yearly.”"],
  },
  trial: "No free trial (stated in their FAQ).",
  chooseThem: [
    "You want to scan a big database of breakout channels and outliers.",
    "RPM and revenue filters matter when you pick a niche.",
    "You want rank tracking for your keywords.",
    "You're happy with their scriptwriter and don't need a calendar or tasks.",
  ],
  chooseUs: [
    "You want a content calendar to plan what ships each week.",
    "You work with a team and want to assign tasks in the same tool as your research.",
    "A cheaper way in: our Starter plan is $19/month, $10 less than their Starter.",
    "You want to try first: 14 days of Pro, no card.",
  ],
};
