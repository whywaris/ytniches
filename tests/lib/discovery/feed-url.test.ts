import { describe, expect, it } from "vitest";

import {
  buildFeedUrl,
  channelFiltersToValues,
  parseChannelFilters,
  parseNicheFilters,
  parseOutlierFilters,
  parseTab,
  withPage,
} from "@/lib/discovery/feed-url";

describe("feed URL (spec §9.4: filters live in the query string)", () => {
  it("parses the tab, ignoring junk", () => {
    expect(parseTab({ tab: "channels" })).toBe("channels");
    expect(parseTab({ tab: "admin" })).toBeUndefined();
    expect(parseTab({})).toBeUndefined();
  });

  it("drops bad params instead of failing", () => {
    expect(parseNicheFilters({ minScore: "abc", maxScore: "140", sort: "x", page: "-2" })).toEqual({
      minScore: undefined,
      maxScore: undefined,
      status: undefined,
      sort: "score",
      page: 1,
    });
    expect(parseChannelFilters({ niche: "<script>", lang: "english" })).toMatchObject({
      niche: undefined,
      language: undefined,
    });
    expect(parseOutlierFilters({ within: "45" }).withinDays).toBe(30);
  });

  it("round-trips channel filters through the URL", () => {
    const url = buildFeedUrl(
      "channels",
      withPage(
        channelFiltersToValues(
          parseChannelFilters({
            niche: "mafia-history",
            faceless: "1",
            noKids: "1",
            minSubs: "1000",
            after: "2026-01-01",
            sort: "avg_views",
          }),
        ),
        2,
      ),
    );
    expect(url).toBe(
      "/niches?tab=channels&niche=mafia-history&after=2026-01-01&minSubs=1000&faceless=1&noKids=1&sort=avg_views&page=2",
    );
    const params = Object.fromEntries(new URL(url, "http://x").searchParams);
    expect(parseChannelFilters(params)).toMatchObject({
      niche: "mafia-history",
      faceless: true,
      excludeKids: true,
      minSubs: 1000,
      createdAfter: "2026-01-01",
      sort: "avg_views",
      page: 2,
    });
  });

  it("gives the default view a clean URL", () => {
    expect(buildFeedUrl("niches", { sort: undefined })).toBe("/niches");
  });
});
