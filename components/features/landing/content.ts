// Landing page copy (D-082 redesign). Every number comes from a constant,
// never typed; no income, revenue or "profitable" claims anywhere
// (tests/components/features/landing/content.test.ts checks both).

import { BETA_MODE, BETA_NOTICE_DAYS, BETA_PRICE } from "@/lib/billing/beta";
import { TIER_INFO, TRIAL, TRIAL_PITCH } from "@/lib/billing/plans";
import { LEGAL } from "@/lib/legal/policy";
import { SUPPORT_EMAIL } from "@/lib/site";
import { YOUTUBE_DATA_MAX_AGE_DAYS } from "@/lib/youtube/retention";
import { COMPETITOR_PAGES } from "@/content/vs";

export const SEO = {
  title: "YTNiches — Spot rising YouTube channels, plan your content",
  description:
    "Find fast-growing faceless YouTube channels every day, see which videos beat their channel's usual views, and turn it into a content plan.",
  url: "https://ytniches.com/",
};

// href: null = page not built yet -> rendered as plain text with a "Soon" tag.
export interface NavLinkItem {
  label: string;
  href: string | null;
}

export const NAV_LINKS: NavLinkItem[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Tools", href: "/tools" },
];

// The blog link switches on at build time once at least one post is
// visible (published, or any post in `next dev`); "Soon" until then.
export function withBlogLink<T extends NavLinkItem>(items: T[], blogLive: boolean): T[] {
  return items.map((item) => (item.href === "/blog" && !blogLive ? { ...item, href: null } : item));
}

export const PRIMARY_CTA = "Start free";

export const HERO = {
  headline: "Spot rising YouTube channels. Plan what to make next.",
  subhead:
    "YTNiches finds fast-growing faceless channels every day, shows which videos are outperforming their channel, and helps you turn it into a content plan.",
  secondaryCta: "See how it works",
  dataLine: "Built on official YouTube data",
};

export type IllustrationId = "find" | "understand" | "plan";

export const WHAT_IT_DOES = {
  headline: "What YTNiches does",
  items: [
    {
      id: "find",
      title: "Find",
      line: "Discover channels and niches growing right now, updated daily.",
    },
    {
      id: "understand",
      title: "Understand",
      line: "See which videos beat their channel's usual views — and by how much.",
    },
    {
      id: "plan",
      title: "Plan",
      line: "Turn what you learn into video ideas and a content calendar.",
    },
  ] satisfies { id: IllustrationId; title: string; line: string }[],
};

export type StepId = "niche" | "track" | "calendar";

export const HOW_IT_WORKS = {
  id: "how-it-works",
  headline: "How it works",
  steps: [
    {
      id: "niche",
      title: "Pick a niche",
      line: "Browse niches and the channels growing in them.",
    },
    {
      id: "track",
      title: "Track the channels that matter",
      line: "Follow the channels you care about and see their standout videos.",
    },
    {
      id: "calendar",
      title: "Plan your next videos",
      line: "Turn what's working into video ideas on your content calendar.",
    },
  ] satisfies { id: StepId; title: string; line: string }[],
};

export const PRICING_TEASER = {
  headline: BETA_MODE ? "Free during beta" : "Simple plans",
  body: `${TRIAL_PITCH}. No credit card.`,
  link: "See plans and pricing",
};

// Answers are plain text (they feed the FAQPage JSON-LD too); `link`
// renders after the answer on the page.
export interface FaqItem {
  question: string;
  answer: string;
  link?: { label: string; href: string };
}

export const FAQ: FaqItem[] = [
  {
    question: "Where does the data come from?",
    answer: `From the official YouTube Data API: public channel and video information. We refresh it on a schedule and keep it for no more than ${YOUTUBE_DATA_MAX_AGE_DAYS} days, as YouTube's terms require.`,
  },
  {
    question: "Is YTNiches part of YouTube?",
    answer:
      "No. YTNiches is an independent tool. It isn't affiliated with, endorsed or sponsored by YouTube or Google.",
  },
  {
    question: "What data do you store about me?",
    answer:
      "Your account details, the channels and niches you track, and what you create in the app. We never ask for your YouTube password.",
    link: { label: "Read the Privacy Policy", href: "/legal/privacy" },
  },
  {
    question: "How much does it cost?",
    answer: BETA_MODE
      ? `$${BETA_PRICE} while we're in beta. You get every ${TIER_INFO[TRIAL.tier].label} feature with ${TRIAL.credits} credits every month, no credit card. We'll email you ${BETA_NOTICE_DAYS} days before any paid plan starts.`
      : `${TRIAL_PITCH}. No credit card.`,
    link: { label: "See plans and pricing", href: "/pricing" },
  },
  {
    question: "How do I cancel or delete my account?",
    answer: `${BETA_MODE ? "There's nothing to cancel during the beta. " : ""}To delete your account and data, email ${SUPPORT_EMAIL} from your account email. We'll do it within ${LEGAL.dataRequestDays} days.`,
  },
  {
    question: "How do I contact you?",
    answer: `Email ${SUPPORT_EMAIL}. A person reads every message.`,
  },
];

// Also the /vs/* pages' closing CTA (components/features/vs/vs-comparison.tsx).
export const FINAL_CTA = {
  headline: "Find your next video idea today.",
  subhead: `${TRIAL_PITCH}. No credit card.`,
};

export const FOOTER = {
  tagline: "Spot rising YouTube channels. Plan what to make next.",
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Pricing", href: "/pricing" },
        { label: "Tools", href: "/tools" },
        { label: "Blog", href: "/blog" },
        { label: "Help", href: "/help" },
      ],
    },
    {
      heading: "Compare",
      links: COMPETITOR_PAGES.map((page) => ({
        label: `YTNiches vs ${page.name}`,
        href: `/vs/${page.id}`,
      })),
    },
    {
      heading: "Legal",
      links: [
        { label: "Terms", href: "/legal/terms" },
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Refunds", href: "/legal/refunds" },
        { label: "Cookies", href: "/legal/cookies" },
      ],
    },
  ] satisfies { heading: string; links: NavLinkItem[] }[],
  email: SUPPORT_EMAIL,
  independence: "Independent tool. Not affiliated with YouTube or Google.",
  copyright: `© ${new Date().getFullYear()} YTNiches. All rights reserved.`,
};
