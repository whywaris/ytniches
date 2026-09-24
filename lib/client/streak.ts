import { readLocalStorage, writeLocalStorage } from "@/lib/local-storage";

// UI-UX-Flow.md §4.5's "Days streak (visits)" metric card. No backing
// schema exists for visit tracking (checked: profiles has no
// last_active_at/streak column) -- computed client-side from localStorage,
// same model as D-049's recent-routes. Resets per-browser, not per-account.
const STORAGE_KEY = "ytniches:streak";

interface StreakState {
  count: number;
  lastVisitDate: string; // YYYY-MM-DD, UTC
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(b) - Date.parse(a)) / msPerDay);
}

// Call once per mount of the widget that displays it -- idempotent within
// the same day (repeated calls today don't double-increment).
export function recordVisitAndGetStreak(): number {
  const today = todayUtc();
  const previous = readLocalStorage<StreakState | null>(STORAGE_KEY, null, (raw) =>
    JSON.parse(raw),
  );

  let next: StreakState;
  if (!previous) {
    next = { count: 1, lastVisitDate: today };
  } else {
    const gap = daysBetween(previous.lastVisitDate, today);
    if (gap === 0) {
      next = previous;
    } else if (gap === 1) {
      next = { count: previous.count + 1, lastVisitDate: today };
    } else {
      next = { count: 1, lastVisitDate: today };
    }
  }

  writeLocalStorage(STORAGE_KEY, JSON.stringify(next));
  return next.count;
}
