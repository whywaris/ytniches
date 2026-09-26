// Every word and data row on the landing page (Landing-Copy.md, with the
// D-037-follow-up calls: honest "Soon" tags for unbuilt surfaces, the
// Monetization.md-correct credit line, real shipped changelog entries, and
// Mac's final founder copy). Edit copy here -- components only render it.

import { TRIAL_PITCH } from "@/lib/billing/plans";

export const SEO = {
  title: "YTNiches — Niche research to content for faceless creators",
  description:
    "Find profitable faceless YouTube niches, track competitors, extract winning ideas as AI prompts, and ship 90 days of content. Free trial.",
  url: "https://ytniches.com/",
};

// href: null = page not built yet -> rendered as plain text with a "Soon" tag.
export interface NavLinkItem {
  label: string;
  href: string | null;
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: "Product", href: "/#features" },
  { label: "Tools", href: "/tools" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

// The blog link switches on at build time once at least one post is
// visible (published, or any post in `next dev`); "Soon" until then.
export function withBlogLink<T extends NavLinkItem>(items: T[], blogLive: boolean): T[] {
  return items.map((item) => (item.href === "/blog" && !blogLive ? { ...item, href: null } : item));
}

export const HERO = {
  eyebrow: "For faceless YouTube creators",
  headline: "Every tool helps you find a niche. Then leaves you stranded.",
  subhead:
    "Nexlev, OutlierKit, and TubeLab stop at “here’s a niche.” YTNiches keeps going — from discovery all the way to shipping.",
  primaryCta: "Sign up free — no card",
  secondaryCta: "Watch 2-min demo",
};

export const PROBLEM = {
  eyebrow: "The current stack",
  headline: "Every tool leaves you at the front door.",
  tools: [
    "TubeBuddy Trap",
    "VidIQ Void",
    "Spreadsheet Chaos",
    "Random Notion Notes",
    "AI Prompt Garbage",
    "Half-abandoned Trello",
  ],
  paragraphs: [
    "You want to find a profitable niche. You install a research tool. It shows you channels. Great.",
    "Now what?",
    "How do you know which of that channel’s videos actually took off? What made them work? How do you turn that into your own content, in your voice, on a schedule you’ll actually keep? Silence.",
  ],
  transition: "…until everything you need is in one place.",
};

export interface CreatorType {
  id: string;
  label: string;
  subtitle?: string;
  bullets: string[];
}

export const CREATOR_EXPLORER = {
  eyebrow: "See it for your channel type",
  headline: "Whatever you’re building, YTNiches adapts.",
  types: [
    {
      id: "ai_voice",
      label: "AI-voice explainer",
      subtitle: "history, science, facts, top-10s",
      bullets: [
        "Filters preset for high-view, low-face channels",
        "Prompts tuned for scripted narration style",
        "Outliers ranked by view-per-subscriber ratio",
      ],
    },
    {
      id: "compilation",
      label: "Compilation",
      subtitle: "reddit stories, movie clips, sports plays",
      bullets: [
        "Track channels by upload frequency (compilation formats reward volume)",
        "Prompts extract what makes a viral compilation title",
        "Watch competitor thumbnail patterns evolve",
      ],
    },
    {
      id: "documentary",
      label: "Documentary / history",
      bullets: [
        "Filter for long-form (10min+) channels only",
        "Prompts include narrative structure outlines",
        "Track which historical topics are peaking",
      ],
    },
    {
      id: "sleep",
      label: "Sleep music / ambient",
      bullets: [
        "Filter for ultra-long-form (1hr+) content",
        "Prompts extract title patterns that convert insomniacs",
        "Monitor which sleep sub-niches (rain, cafe, forest) are growing",
      ],
    },
    {
      id: "kids",
      label: "Kids stories",
      bullets: [
        "Filter for family-safe, monetized channels",
        "Prompts tuned for story structure (setup → problem → lesson)",
        "Track which story types (fairy tale, moral, adventure) win",
      ],
    },
  ] satisfies CreatorType[],
};

export const BENTO = {
  eyebrow: "The full loop",
  headline: "Everything from niche to shipped video.",
  discovery: {
    headline: "Find the niche. Spot the winners.",
    description:
      "Filter by every metric that matters. Then see which of their videos are actually breaking out.",
    tags: ["Niche Finder", "Outlier Finder"],
  },
  intelligence: {
    headline: "Watch competitors. Steal what works.",
    description:
      "Track any channel. When one of their videos takes off, get AI prompts trained on why it worked.",
    tags: ["Competitor Spy", "AI Prompts"],
  },
  execution: {
    headline: "Turn ideas into 90 days of content.",
    description: "Every extracted idea drops into a calendar. Your team picks up from there.",
    tags: ["Content Calendar", "Workspace", "Tasks"],
  },
  fills: [
    { id: "cmdk", label: "Command palette", description: "Cmd+K from anywhere" },
    { id: "dark", label: "Dark by default", description: "Long sessions, easy on the eyes" },
    { id: "keyboard", label: "Keyboard-first", description: "Every action a shortcut away" },
    { id: "alerts", label: "Real-time alerts", description: "Know when a competitor pops off" },
  ],
};

export const VIEW_SWITCHER = {
  eyebrow: "Same data, four ways",
  headline: "Your niche results, however you think.",
  views: [
    { id: "grid", label: "Grid", caption: "Cards with thumbnails and key stats. Fastest to scan." },
    { id: "list", label: "List", caption: "Dense table. Sortable columns. Bulk actions." },
    {
      id: "comparison",
      label: "Comparison",
      caption: "Pick 2–3 channels. See them side by side, row by row.",
    },
    { id: "insights", label: "Insights", caption: "What’s growing, what’s not. Coming soon." },
  ],
};

export const TEMPLATES = {
  eyebrow: "Skip the blank page",
  headline: "Start from what already works.",
  subhead:
    "Battle-tested prompt templates and niche starter packs. Steal what fits, tweak the rest.",
  rows: [
    {
      id: "prompts",
      label: "Prompt templates",
      modalLine: "A ready-made prompt you can run against any winning video.",
      items: [
        "Video script prompt",
        "Thumbnail concept prompt",
        "Title A/B prompt",
        "Hook variants (first 30s)",
        "Description template",
        "Reaction video prompt",
        "Explainer script prompt",
        "Compilation script prompt",
        "Kids story prompt",
        "Sleep music title generator",
        "History video prompt",
        "Documentary structure prompt",
      ],
    },
    {
      id: "packs",
      label: "Niche starter packs",
      modalLine: "Preset filters and example channels to start a niche without a blank search.",
      items: [
        "Sleep music",
        "Kids stories",
        "AI history facts",
        "Compilation reddit",
        "Reaction gaming",
        "Documentary shorts",
        "True crime narration",
        "Meditation ambient",
        "Tech explainer",
        "Historical mysteries",
      ],
    },
  ],
  // D-030: pre-built templates aren't built yet -- the modal says so.
  modalStatus: "Coming soon, sign up to get it first.",
  modalCta: "Sign up free",
  bottomLine: "More templates ship every week. What’s missing? Tell us.",
};

export const MODE_TOGGLE = {
  eyebrow: "As simple or as deep as you want",
  headline: "Beginner mode, or full control.",
  modes: [
    {
      id: "beginner",
      label: "Beginner",
      ill: "beginner_mode_ui",
      copy: "Three fields. One button. YTNiches makes the smart defaults so you don’t have to think about filters.",
    },
    {
      id: "power",
      label: "Power",
      ill: "power_mode_ui",
      copy: "Every filter, every metric, every knob. Save presets. Compare cohorts. Nothing hidden.",
    },
  ],
};

export const AI_SECTION = {
  eyebrow: "The AI part, done right",
  headline: "When you know what’s working, AI can finally help.",
  subhead:
    "Most AI writing tools guess. YTNiches feeds AI the actual winning video’s structure, then generates prompts trained on why it worked.",
  demoUrl: "youtube.com/watch?v=…",
  demoCategories: [
    "Title variants",
    "Thumbnail concepts",
    "Hook variants",
    "Script outline",
    "Description",
  ],
  bullets: [
    {
      title: "Title variants",
      body: "5–10 alternatives per video, tuned to what actually gets clicked in your niche",
    },
    {
      title: "Thumbnail concepts",
      body: "3–5 descriptions inspired by patterns from top-performing videos",
    },
    {
      title: "Hook variants",
      body: "first 30 seconds, structured to keep the algorithm happy",
    },
    {
      title: "Script outlines",
      body: "not full scripts (that’s still you), but the structure that made the winner win",
    },
  ],
  // Monetization.md §3.1 / D-012 -- not Landing-Copy §4.1's "one credit".
  creditLine: "5 credits per generation. 3 to regenerate with feedback.",
};

export interface Integration {
  id: string;
  name: string;
  tooltip: string;
  live: boolean;
}

export const INTEGRATIONS = {
  eyebrow: "Plays nice with your stack",
  headline: "Export where you already work.",
  categories: [
    {
      id: "no_sweat",
      label: "No sweat",
      items: [
        {
          id: "youtube",
          name: "YouTube",
          tooltip: "Read-only. We fetch what’s public.",
          live: true,
        },
        {
          id: "sheets",
          name: "Google Sheets",
          tooltip: "Export any result to a sheet in one click.",
          live: false,
        },
        {
          id: "notion",
          name: "Notion",
          tooltip: "Send prompts and calendar entries to a Notion database.",
          live: false,
        },
      ],
    },
    {
      id: "some_sweat",
      label: "Some sweat",
      items: [
        {
          id: "slack",
          name: "Slack",
          tooltip: "Team-tier only. Alerts + digests to your channel.",
          live: false,
        },
        {
          id: "zapier",
          name: "Zapier",
          tooltip: "Trigger anything on new outliers, new prompts, or channel updates.",
          live: false,
        },
      ],
    },
    {
      id: "real_sweat",
      label: "Real sweat",
      items: [
        {
          id: "api",
          name: "API access",
          tooltip: "Direct API endpoints for teams that want to build on top.",
          live: false,
        },
      ],
    },
  ] satisfies { id: string; label: string; items: Integration[] }[],
};

// Mac's final copy (2026-09-24) -- supersedes Landing-Copy.md §4.3's
// [STARTER DRAFT / NEEDS MAC INPUT] version.
export const FOUNDER = {
  eyebrow: "Built by a creator who got tired",
  headline: "I made this because I needed it.",
  paragraphs: [
    "I started a World War 2 faceless YouTube channel. Finding the niche was the easy part.",
    "Then I got stuck. I had no idea which of my competitors’ videos were actually working. No way to find what topics were breaking out. No system for turning what worked into my own scripts.",
    "I dropped the channel.",
    "Then I decided: this tool should exist. Not another niche finder — one that keeps going, from finding the niche all the way to having something to film.",
    "That’s YTNiches.",
  ],
  signature: "— Mac, founder",
};

// Placeholder until a real changelog source exists (Landing-Page-Spec §12)
// -- but only features that actually shipped.
export const CHANGELOG = {
  eyebrow: "Live changelog",
  headline: "We ship every week.",
  subhead: "No roadmap theater. Actual product movement, shown here as it happens.",
  entries: [
    { date: "Sep 2026", summary: "Shipped the Content Calendar, with drag-and-drop scheduling." },
    { date: "Sep 2026", summary: "Launched Team workspaces with shared tasks and roles." },
    { date: "Sep 2026", summary: "Added the Outlier Finder for spotting breakout videos." },
  ],
  bottomLink: "View full changelog →",
};

export const COMPETITORS = [
  {
    id: "nexlev",
    name: "Nexlev",
    framing:
      "Nexlev is strong on niche research: a huge channel database, RPM predictions and a Chrome extension. YTNiches focuses on what comes next: scripts, a content calendar and team tasks.",
  },
  {
    id: "outlierkit",
    name: "OutlierKit",
    framing:
      "OutlierKit is great at outlier and keyword research across a whole niche. If research is all you need, use it. If you want it to turn into scripts, a calendar and team tasks, that’s us.",
  },
  {
    id: "tubelab",
    name: "TubeLab",
    framing:
      "TubeLab covers niche research and scripts well. YTNiches overlaps there, then goes further into planning: a content calendar and team tasks.",
  },
] as const;

export type CompetitorId = (typeof COMPETITORS)[number]["id"];

export const VS = {
  eyebrow: "How we compare",
  headline: "Honest comparisons. No dunking.",
  cardLink: "See full comparison →",
  bottomLine: "Or, honestly, use all four. We won’t judge.",
};

export const FINAL_CTA = {
  headline: "The last niche research tool you’ll switch to.",
  subhead: `${TRIAL_PITCH}. No credit card.`,
  primaryCta: "Sign up free",
  reassurance: "No card. Cancel anytime. Your data is yours.",
};

export const FOOTER = {
  tagline: "The command center for faceless YouTube creators.",
  madeIn: "Made in Multan. Shipped worldwide.",
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Free Tools", href: "/tools" },
        { label: "Changelog", href: null },
        { label: "Roadmap", href: null },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Tutorials", href: null },
        { label: "VS pages", href: "/#compare" },
        { label: "Templates", href: "/#templates" },
        { label: "Help center", href: null },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: null },
        { label: "Contact", href: null },
        { label: "Privacy", href: null },
        { label: "Terms", href: null },
        { label: "Refunds", href: null },
      ],
    },
  ] satisfies { heading: string; links: NavLinkItem[] }[],
  askAiQuery:
    "Tell me about YTNiches — a SaaS tool for faceless YouTube niche research and content planning.",
  copyright: "© 2026 YTNiches. All rights reserved.",
};

export function askAiLinks(query: string) {
  const q = encodeURIComponent(query);
  return [
    { label: "Ask ChatGPT", href: `https://chatgpt.com/?q=${q}` },
    { label: "Ask Claude", href: `https://claude.ai/new?q=${q}` },
    { label: "Ask Perplexity", href: `https://www.perplexity.ai/search?q=${q}` },
  ];
}
