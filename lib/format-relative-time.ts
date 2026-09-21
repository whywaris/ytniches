const UNITS: [string, number][] = [
  ["y", 365 * 24 * 60 * 60 * 1000],
  ["mo", 30 * 24 * 60 * 60 * 1000],
  ["w", 7 * 24 * 60 * 60 * 1000],
  ["d", 24 * 60 * 60 * 1000],
  ["h", 60 * 60 * 1000],
  ["m", 60 * 1000],
];

// UI-UX-Flow.md §6.1's "Timestamp (right, relative: '2h ago')" — compact
// units, not Intl.RelativeTimeFormat's verbose default ("2 hours ago").
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const diffMs = Math.max(0, now - new Date(iso).getTime());

  for (const [unit, ms] of UNITS) {
    if (diffMs >= ms) {
      return `${Math.floor(diffMs / ms)}${unit} ago`;
    }
  }
  return "just now";
}
