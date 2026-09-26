import {
  Building2,
  Plus,
  Calendar,
  CheckSquare,
  Flame,
  Home,
  LifeBuoy,
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
  /** Which sidebar count badge (if any) this item shows. */
  count?: "trackedChannels" | "prompts";
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  /** Only rendered for users with a workspace membership (no greyed items). */
  workspaceOnly?: boolean;
}

export const DASHBOARD_NAV: NavItem = { href: "/dashboard", label: "Dashboard", icon: Home };

// Sidebar grouping (dashboard redesign). One nav item per page -- counts
// live as badges on the page's own item, not as duplicate "library" links.
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Research",
    items: [
      { href: "/niches", label: "Niche Finder", icon: Search },
      { href: "/outliers", label: "Outliers", icon: Flame },
      { href: "/tracking", label: "Competitor Tracking", icon: Radar, count: "trackedChannels" },
    ],
  },
  {
    title: "Create",
    items: [{ href: "/prompts", label: "AI Prompts", icon: Sparkles, count: "prompts" }],
  },
  {
    title: "Plan",
    workspaceOnly: true,
    items: [
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/workspace/tasks", label: "Tasks", icon: CheckSquare },
      { href: "/workspace", label: "Workspace", icon: Building2 },
    ],
  },
];

// Flat views of the groups, for the command palette's Navigation group.
export const PRIMARY_NAV: NavItem[] = [
  DASHBOARD_NAV,
  ...NAV_GROUPS.filter((group) => !group.workspaceOnly).flatMap((group) => group.items),
];
export const TEAM_NAV: NavItem[] = NAV_GROUPS.filter((group) => group.workspaceOnly).flatMap(
  (group) => group.items,
);

// The single nav href that owns this pathname: longest prefix wins, so
// /workspace/tasks highlights Tasks only, not Workspace too.
export function activeNavHref(pathname: string, items: NavItem[]): string | null {
  const matches = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.href ?? null;
}

// Shown instead of the Plan group to a Team owner who has no workspace yet.
export const CREATE_WORKSPACE_NAV: NavItem = {
  href: "/workspace",
  label: "Create workspace",
  icon: Plus,
};

// The public help center (PRD.md §10.4), opened in the same tab.
export const HELP_NAV: NavItem = { href: "/help", label: "Help", icon: LifeBuoy };

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
