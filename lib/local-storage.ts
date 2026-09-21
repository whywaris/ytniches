// Small shared wrapper for per-viewer preference persistence (TRD.md §2.3:
// "Persisted user prefs — localStorage via a small wrapper"). Sidebar
// (Phase 0) inlines the same try/catch pattern directly — left as-is, not
// refactored onto this, since it already shipped and there's no reason to
// churn tested code for a ~10-line pattern. This is for new call sites
// (Niche Finder's view + table density preferences) going forward.
export function readLocalStorage<T>(key: string, fallback: T, parse: (raw: string) => T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : parse(stored);
  } catch {
    return fallback;
  }
}

export function writeLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private browsing / disabled storage — degrade to session-only state.
  }
}
