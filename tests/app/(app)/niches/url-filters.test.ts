import { describe, expect, it } from "vitest";

import { DEFAULT_FILTER_VALUES } from "@/components/features/niche-finder/filter-values";
import {
  buildSearchUrl,
  hasAnyFilterParam,
  parseFiltersFromSearchParams,
  parsePage,
  parseSort,
  toSearchInput,
} from "@/app/(app)/niches/url-filters";

describe("parseFiltersFromSearchParams", () => {
  it("returns all-default values for an empty URLSearchParams", () => {
    expect(parseFiltersFromSearchParams(new URLSearchParams())).toEqual(DEFAULT_FILTER_VALUES);
  });

  it("parses a keyword", () => {
    const params = new URLSearchParams("q=sleep+music");
    expect(parseFiltersFromSearchParams(params).keyword).toBe("sleep music");
  });

  it("parses a subscriber range into min/max", () => {
    const params = new URLSearchParams("subs=1000-100000");
    const values = parseFiltersFromSearchParams(params);
    expect(values.subscribersMin).toBe("1000");
    expect(values.subscribersMax).toBe("100000");
  });

  it("parses a half-open range (min only)", () => {
    const params = new URLSearchParams("subs=1000-");
    const values = parseFiltersFromSearchParams(params);
    expect(values.subscribersMin).toBe("1000");
    expect(values.subscribersMax).toBe("");
  });

  it("falls back to 'any' for an unrecognized uploadFrequency value", () => {
    const params = new URLSearchParams("freq=hourly");
    expect(parseFiltersFromSearchParams(params).uploadFrequency).toBe("any");
  });

  it("falls back to 'any' for an unrecognized monetized value", () => {
    const params = new URLSearchParams("monetized=maybe");
    expect(parseFiltersFromSearchParams(params).monetized).toBe("any");
  });

  it("parses comma-joined language and country lists", () => {
    const params = new URLSearchParams("lang=en,es&country=US,CA");
    const values = parseFiltersFromSearchParams(params);
    expect(values.languages).toEqual(["en", "es"]);
    expect(values.countries).toEqual(["US", "CA"]);
  });

  it("also accepts a plain Record (Next.js server-side searchParams shape)", () => {
    const values = parseFiltersFromSearchParams({ q: "history facts", lang: "en" });
    expect(values.keyword).toBe("history facts");
    expect(values.languages).toEqual(["en"]);
  });

  it("takes the first value when a Record key is an array", () => {
    const values = parseFiltersFromSearchParams({ q: ["first", "second"] });
    expect(values.keyword).toBe("first");
  });
});

describe("parseSort / parsePage", () => {
  it("defaults sort to relevance and page to 1 when absent", () => {
    const params = new URLSearchParams();
    expect(parseSort(params)).toBe("relevance");
    expect(parsePage(params)).toBe(1);
  });

  it("parses a valid sort and page", () => {
    const params = new URLSearchParams("sort=avg_views&page=3");
    expect(parseSort(params)).toBe("avg_views");
    expect(parsePage(params)).toBe(3);
  });

  it("falls back to relevance for an invalid sort value", () => {
    expect(parseSort(new URLSearchParams("sort=nonsense"))).toBe("relevance");
  });

  it("falls back to 1 for a non-positive or non-integer page", () => {
    expect(parsePage(new URLSearchParams("page=0"))).toBe(1);
    expect(parsePage(new URLSearchParams("page=-3"))).toBe(1);
    expect(parsePage(new URLSearchParams("page=2.5"))).toBe(1);
    expect(parsePage(new URLSearchParams("page=notanumber"))).toBe(1);
  });
});

describe("buildSearchUrl + parseFiltersFromSearchParams round-trip", () => {
  it("round-trips a full set of filters, sort, and page through the URL", () => {
    const values = {
      ...DEFAULT_FILTER_VALUES,
      keyword: "sleep music",
      subscribersMin: "1000",
      subscribersMax: "100000",
      avgViewsMin: "500",
      avgViewsMax: "",
      uploadFrequency: "2-4-week" as const,
      monetized: "yes" as const,
      languages: ["en", "es"],
      countries: ["US"],
      createdAfter: "2020-01-01",
    };

    const url = buildSearchUrl("/niches", values, "avg_views", 3);
    const [, query] = url.split("?");
    const roundTripped = parseFiltersFromSearchParams(new URLSearchParams(query));

    expect(roundTripped).toEqual(values);
    expect(parseSort(new URLSearchParams(query))).toBe("avg_views");
    expect(parsePage(new URLSearchParams(query))).toBe(3);
  });

  it("omits sort and page from the URL when they're at their defaults", () => {
    const url = buildSearchUrl(
      "/niches",
      { ...DEFAULT_FILTER_VALUES, keyword: "x" },
      "relevance",
      1,
    );
    expect(url).not.toMatch(/sort=/);
    expect(url).not.toMatch(/page=/);
  });

  it("returns the bare pathname when every filter is at its default", () => {
    expect(buildSearchUrl("/niches", DEFAULT_FILTER_VALUES, "relevance", 1)).toBe("/niches");
  });
});

describe("hasAnyFilterParam", () => {
  it("is false for an empty URL", () => {
    expect(hasAnyFilterParam(new URLSearchParams())).toBe(false);
  });

  it("is true when any single filter is set", () => {
    expect(hasAnyFilterParam(new URLSearchParams("q=x"))).toBe(true);
    expect(hasAnyFilterParam(new URLSearchParams("monetized=yes"))).toBe(true);
    expect(hasAnyFilterParam(new URLSearchParams("lang=en"))).toBe(true);
  });
});

describe("toSearchInput", () => {
  it("converts empty numeric strings to undefined, not 0", () => {
    const input = toSearchInput(DEFAULT_FILTER_VALUES, "relevance", 1);
    expect(input.subscribersMin).toBeUndefined();
    expect(input.subscribersMax).toBeUndefined();
  });

  it("converts populated numeric strings to numbers", () => {
    const input = toSearchInput(
      { ...DEFAULT_FILTER_VALUES, subscribersMin: "1000", avgViewsMax: "50000" },
      "relevance",
      1,
    );
    expect(input.subscribersMin).toBe(1000);
    expect(input.avgViewsMax).toBe(50000);
  });

  it("converts an empty keyword to undefined rather than an empty string", () => {
    expect(toSearchInput(DEFAULT_FILTER_VALUES, "relevance", 1).keyword).toBeUndefined();
  });

  it("converts empty language/country arrays to undefined", () => {
    const input = toSearchInput(DEFAULT_FILTER_VALUES, "relevance", 1);
    expect(input.languages).toBeUndefined();
    expect(input.countries).toBeUndefined();
  });

  it("converts a plain date into a full ISO datetime with no milliseconds", () => {
    const input = toSearchInput(
      { ...DEFAULT_FILTER_VALUES, createdAfter: "2020-01-01" },
      "relevance",
      1,
    );
    expect(input.createdAfter).toBe("2020-01-01T00:00:00Z");
  });

  it("passes sort and page through unchanged", () => {
    const input = toSearchInput(DEFAULT_FILTER_VALUES, "upload_freq", 4);
    expect(input.sort).toBe("upload_freq");
    expect(input.page).toBe(4);
  });
});
