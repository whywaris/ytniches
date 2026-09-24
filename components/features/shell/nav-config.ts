import {
  Building2,
  Calendar,
  CheckSquare,
  Flame,
  Home,
  Radar,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

// UI-UX-Flow.md §4.1. Single source of truth for the sidebar, the command
// palette's Navigation group, and the top bar's route->title lookup, so
// the three surfaces can't silently drift out of sync with each other.
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/niches", label: "Niche Finder", icon: Search },
  { href: "/tracking", label: "Competitor Tracking", icon: Radar },
  { href: "/prompts", label: "AI Prompts", icon: Sparkles },
  { href: "/outliers", label: "Outliers", icon: Flame },
];

// Only rendered when listMyWorkspaceMemberships() returns at least one
// membership (D-037 proposal, "no greyed items for non-Team users").
export const TEAM_NAV: NavItem[] = [
  { href: "/workspace", label: "Workspace", icon: Building2 },
  { href: "/workspace/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/calendar", label: "Calendar", icon: Calendar },
];

export const SETTINGS_NAV: NavItem = {
  href: "/settings/billing",
  label: "Settings",
  icon: Settings,
};

// Top bar title fallback for routes with no exact match below (dynamic
// segments, /workspace/tasks, etc.) -- longest-prefix match against
// pathname, same idea as middleware.ts's classifyRoute prefix check.
export function labelForPathname(pathname: string): string {
  const allItems = [...PRIMARY_NAV, ...TEAM_NAV, SETTINGS_NAV];
  const exact = allItems.find((item) => item.href === pathname);
  if (exact) return exact.label;

  const byPrefix = allItems
    .filter((item) => pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (byPrefix) return byPrefix.label;

  if (pathname.startsWith("/settings/")) return "Settings";

  const lastSegment = pathname.split("/").filter(Boolean).pop();
  if (!lastSegment) return "Dashboard";
  return lastSegment
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}
