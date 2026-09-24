import { readLocalStorage, writeLocalStorage } from "@/lib/local-storage";

// D-049: command palette "Recent" group + dashboard "Continue where you
// left off" both read this -- localStorage only, per-browser, not
// per-account.
const STORAGE_KEY = "ytniches:recent-routes";
const MAX_ENTRIES = 5;

export interface RecentRoute {
  path: string;
  label: string;
  visitedAt: number;
}

function isRecentRoute(entry: unknown): entry is RecentRoute {
  return (
    typeof entry === "object" &&
    entry !== null &&
    typeof (entry as RecentRoute).path === "string" &&
    typeof (entry as RecentRoute).label === "string" &&
    typeof (entry as RecentRoute).visitedAt === "number"
  );
}

export function readRecentRoutes(): RecentRoute[] {
  return readLocalStorage<RecentRoute[]>(STORAGE_KEY, [], (raw) => {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRecentRoute) : [];
  });
}

export function recordRouteVisit(path: string, label: string): void {
  const existing = readRecentRoutes().filter((route) => route.path !== path);
  const next = [{ path, label, visitedAt: Date.now() }, ...existing].slice(0, MAX_ENTRIES);
  writeLocalStorage(STORAGE_KEY, JSON.stringify(next));
}
