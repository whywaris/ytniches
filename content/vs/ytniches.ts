import type { Cell, FeatureKey } from "@/content/vs/types";

// Our side of every comparison, from what's actually shipped (not the
// roadmap). One definition so the three pages can't disagree about us.
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  nicheResearch: "Niche research",
  channelDatabase: "Pre-built channel database",
  outliers: "Outlier video detection",
  competitorTracking: "Competitor channel tracking",
  rpm: "RPM / revenue estimates",
  keywordResearch: "Keyword research (volume, difficulty)",
  aiScripts: "AI scripts from winning videos",
  thumbnailImages: "AI thumbnail image generation",
  calendar: "Content calendar",
  teamWorkspace: "Team workspace with tasks",
  chromeExtension: "Chrome extension",
  api: "API / MCP access",
  rankTracker: "Rank tracker",
  course: "Course / community",
  lifetimePlan: "Lifetime (one-time) plan",
  freeTrial: "Free trial",
};

export const YTNICHES: Record<FeatureKey, Cell> = {
  nicheResearch: { status: "yes", note: "Searches live YouTube data" },
  channelDatabase: { status: "no" },
  outliers: { status: "yes", note: "3× a channel's recent average" },
  competitorTracking: { status: "yes", note: "10–100 channels by plan" },
  rpm: { status: "no" },
  keywordResearch: { status: "no" },
  aiScripts: {
    status: "yes",
    note: "Titles, hooks, script outline and thumbnail concepts",
  },
  thumbnailImages: { status: "no", note: "Text thumbnail concepts only" },
  calendar: { status: "yes", note: "Team plan" },
  teamWorkspace: { status: "yes", note: "Team plan: members, roles, tasks" },
  chromeExtension: { status: "no" },
  api: { status: "no" },
  rankTracker: { status: "no" },
  course: { status: "no" },
  lifetimePlan: { status: "no" },
  freeTrial: { status: "yes", note: "14 days of Pro, no card" },
};
