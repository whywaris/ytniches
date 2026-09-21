// Deliberately its own plain module, not defined in filter-panel.tsx
// (a "use client" file): when server code (url-filters.ts -> page.tsx)
// imports a *value* export from a "use client" module, Next.js replaces it
// with a client-reference proxy rather than the real object — so
// JSON.stringify(DEFAULT_FILTER_VALUES) on the server never matches the
// real default shape. filter-panel.tsx re-exports these for client-side
// consumers; server code must import straight from here.
export interface NicheFilterValues {
  keyword: string;
  subscribersMin: string;
  subscribersMax: string;
  avgViewsMin: string;
  avgViewsMax: string;
  uploadFrequency: "any" | "weekly" | "2-4-week" | "daily-plus";
  monetized: "any" | "yes" | "no";
  languages: string[];
  countries: string[];
  createdAfter: string;
}

export const DEFAULT_FILTER_VALUES: NicheFilterValues = {
  keyword: "",
  subscribersMin: "",
  subscribersMax: "",
  avgViewsMin: "",
  avgViewsMax: "",
  uploadFrequency: "any",
  monetized: "any",
  languages: [],
  countries: [],
  createdAfter: "",
};
