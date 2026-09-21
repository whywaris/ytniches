import {
  DEFAULT_FILTER_VALUES,
  type NicheFilterValues,
} from "@/components/features/niche-finder/filter-values";
import type { NicheSearchInput } from "@/lib/services/channels.schema";

// Application-Flow.md §2.5: "Filters: use query params so state is
// shareable and browser-navigable." This module is the single place that
// translates between the URL's query-param shape and the app's internal
// NicheFilterValues/NicheSearchInput shapes, in both directions — the page
// (Server Component) parses on initial load, the client component
// serializes when the user hits Search.
type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

function getParam(params: SearchParamsInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) {
    return params.get(key) ?? undefined;
  }
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function splitRange(raw: string | undefined): [string, string] {
  if (!raw) return ["", ""];
  const [min = "", max = ""] = raw.split("-");
  return [min, max];
}

const UPLOAD_FREQUENCIES: NicheFilterValues["uploadFrequency"][] = [
  "weekly",
  "2-4-week",
  "daily-plus",
];
const MONETIZED_VALUES: NicheFilterValues["monetized"][] = ["yes", "no"];
const SORT_VALUES: NicheSearchInput["sort"][] = ["subscribers", "avg_views", "upload_freq"];

export function parseFiltersFromSearchParams(params: SearchParamsInput): NicheFilterValues {
  const [subscribersMin, subscribersMax] = splitRange(getParam(params, "subs"));
  const [avgViewsMin, avgViewsMax] = splitRange(getParam(params, "views"));
  const lang = getParam(params, "lang");
  const country = getParam(params, "country");
  const uploadFrequency = getParam(params, "freq");
  const monetized = getParam(params, "monetized");

  return {
    keyword: getParam(params, "q") ?? "",
    subscribersMin,
    subscribersMax,
    avgViewsMin,
    avgViewsMax,
    uploadFrequency: UPLOAD_FREQUENCIES.includes(uploadFrequency as never)
      ? (uploadFrequency as NicheFilterValues["uploadFrequency"])
      : "any",
    monetized: MONETIZED_VALUES.includes(monetized as never)
      ? (monetized as NicheFilterValues["monetized"])
      : "any",
    languages: lang ? lang.split(",").filter(Boolean) : [],
    countries: country ? country.split(",").filter(Boolean) : [],
    createdAfter: getParam(params, "after") ?? "",
  };
}

export function parseSort(params: SearchParamsInput): NicheSearchInput["sort"] {
  const raw = getParam(params, "sort");
  return SORT_VALUES.includes(raw as never) ? (raw as NicheSearchInput["sort"]) : "relevance";
}

export function parsePage(params: SearchParamsInput): number {
  const raw = getParam(params, "page");
  const n = raw ? Number(raw) : 1;
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function filterValuesToSearchParams(values: NicheFilterValues): URLSearchParams {
  const params = new URLSearchParams();
  if (values.keyword.trim()) params.set("q", values.keyword.trim());
  if (values.subscribersMin || values.subscribersMax) {
    params.set("subs", `${values.subscribersMin}-${values.subscribersMax}`);
  }
  if (values.avgViewsMin || values.avgViewsMax) {
    params.set("views", `${values.avgViewsMin}-${values.avgViewsMax}`);
  }
  if (values.uploadFrequency !== "any") params.set("freq", values.uploadFrequency);
  if (values.monetized !== "any") params.set("monetized", values.monetized);
  if (values.languages.length > 0) params.set("lang", values.languages.join(","));
  if (values.countries.length > 0) params.set("country", values.countries.join(","));
  if (values.createdAfter) params.set("after", values.createdAfter);
  return params;
}

// Builds the full ?query string for router.replace, including sort/page
// (kept out of NicheFilterValues — those belong to the results toolbar,
// not the filter panel — but they still live in the shareable URL).
export function buildSearchUrl(
  pathname: string,
  values: NicheFilterValues,
  sort: NicheSearchInput["sort"],
  page: number,
): string {
  const params = filterValuesToSearchParams(values);
  if (sort !== "relevance") params.set("sort", sort);
  if (page !== 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function hasAnyFilterParam(params: SearchParamsInput): boolean {
  const values = parseFiltersFromSearchParams(params);
  return JSON.stringify(values) !== JSON.stringify(DEFAULT_FILTER_VALUES);
}

// Number("") is 0, not undefined — guarded explicitly so an empty filter
// field means "no bound", not "bound at zero".
function toOptionalNumber(raw: string): number | undefined {
  if (raw.trim() === "") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

// NicheSearchInputSchema's createdAfter is z.string().datetime() — a plain
// "YYYY-MM-DD" from the native date input needs a time + Z suffix.
// toISOString() adds milliseconds; stripped so this matches a plain
// second-precision datetime regardless of the schema's precision default.
function toIsoDatetime(dateOnly: string): string {
  return new Date(dateOnly).toISOString().replace(/\.\d{3}Z$/, "Z");
}

// Returns a plain object shaped like NicheSearchInput's *input* (pre-parse)
// — the caller passes this into NicheSearchInputSchema.safeParse via the
// Server Action, which is where actual validation happens (this module
// only serializes, per CLAUDE.md's "Server Actions never contain business
// logic" — that includes not duplicating validation here).
export function toSearchInput(
  values: NicheFilterValues,
  sort: NicheSearchInput["sort"],
  page: number,
): Record<string, unknown> {
  return {
    keyword: values.keyword.trim() === "" ? undefined : values.keyword.trim(),
    subscribersMin: toOptionalNumber(values.subscribersMin),
    subscribersMax: toOptionalNumber(values.subscribersMax),
    avgViewsMin: toOptionalNumber(values.avgViewsMin),
    avgViewsMax: toOptionalNumber(values.avgViewsMax),
    uploadFrequency: values.uploadFrequency,
    monetized: values.monetized,
    languages: values.languages.length > 0 ? values.languages : undefined,
    countries: values.countries.length > 0 ? values.countries : undefined,
    createdAfter: values.createdAfter ? toIsoDatetime(values.createdAfter) : undefined,
    sort,
    page,
  };
}
