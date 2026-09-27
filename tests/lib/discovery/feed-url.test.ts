import { describe, expect, it } from "vitest";

import {
  billableFilters,
  buildFeedUrl,
  channelFiltersToValues,
  nicheFiltersToValues,
  parseChannelFilters,
  parseNicheFilters,
  parseOutlierFilters,
  parseTab,
  stripProChannelFilters,
  withPage,
} from "@/lib/discovery/feed-url";

describe("feed URL (spec §9.4: filters live in the query string)", () => {
  it("parses the tab, ignoring junk", () => {
    expect(parseTab({ tab: "channels" })).toBe("channels");
    expect(parseTab({ tab: "admin" })).toBeUndefined();
    expect(parseTab({})).toBeUndefined();
  });

  it("drops bad params instead of failing", () => {
    expect(parseNicheFilters({ score: "abc", trend: "sideways", sort: "x", page: "-2" })).toEqual({
      minScore: undefined,
      maxScore: undefined,
      status: undefined,
      sort: "score",
      page: 1,
    });
    expect(
      parseChannelFilters({ niche: "<script>", lang: "english", country: "usa", content: "vlog" }),
    ).toMatchObject({
      niche: undefined,
      language: undefined,
      country: undefined,
      contentType: undefined,
    });
    expect(parseOutlierFilters({ within: "45" }).withinDays).toBe(30);
  });

  it("maps score chips and Trend onto the stored scores and statuses (D-077)", () => {
    expect(parseNicheFilters({ score: "hot", trend: "crowded" })).toMatchObject({
      minScore: 70,
      maxScore: undefined,
      status: "saturated",
    });
    expect(parseNicheFilters({ score: "good", trend: "steady" })).toMatchObject({
      minScore: 50,
      maxScore: 69,
      status: "active",
    });
    expect(nicheFiltersToValues(parseNicheFilters({ score: "good", trend: "cooling" }))).toEqual({
      score: "good",
      trend: "cooling",
      sort: undefined,
    });
  });

  it("round-trips channel filters through the URL", () => {
    const url = buildFeedUrl(
      "channels",
      withPage(
        channelFiltersToValues(
          parseChannelFilters({
            niche: "mafia-history",
            age: "6m",
            country: "US",
            content: "shorts",
            faceless: "1",
            minSubs: "1000",
            sort: "avg_views",
          }),
        ),
        2,
      ),
    );
    expect(url).toBe(
      "/niches?age=6m&country=US&content=shorts&niche=mafia-history&minSubs=1000&faceless=1&sort=avg_views&page=2",
    );
    const params = Object.fromEntries(new URL(url, "http://x").searchParams);
    expect(parseChannelFilters(params)).toMatchObject({
      niche: "mafia-history",
      maxAgeMonths: 6,
      country: "US",
      contentType: "shorts",
      faceless: true,
      minSubs: 1000,
      sort: "avg_views",
      page: 2,
    });
  });

  it("gives the default view (Channels) a clean URL", () => {
    expect(buildFeedUrl("channels", { sort: undefined })).toBe("/niches");
    expect(buildFeedUrl("niches", {})).toBe("/niches?tab=niches");
  });

  it("expands a preset on its own and keeps it free (D-077)", () => {
    const filters = parseChannelFilters({ preset: "small-breakout", minSubs: "5" });
    expect(filters).toMatchObject({ preset: "small-breakout", maxSubs: 10_000, breakout: true });
    expect(filters.minSubs).toBeUndefined();
    const values = channelFiltersToValues(filters);
    expect(values).toEqual({ preset: "small-breakout", sort: undefined });
    expect(billableFilters(values)).toBeNull();
    // A custom filter set still costs a credit.
    expect(billableFilters({ minSubs: "1000" })).toEqual({ minSubs: "1000" });
  });

  it("strips Pro filters for non-Pro users, but never from a preset", () => {
    const custom = parseChannelFilters({ faceless: "1", minOutlier: "3", minSubs: "10" });
    expect(stripProChannelFilters(custom)).toMatchObject({
      faceless: undefined,
      minOutlierScore: undefined,
      minSubs: 10,
    });
    const preset = parseChannelFilters({ preset: "new-faceless" });
    expect(stripProChannelFilters(preset).faceless).toBe(true);
  });
});
