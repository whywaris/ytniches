import { describe, expect, it } from "vitest";

import { toSearchState } from "@/app/(app)/niches/search-state";
import type { ChannelSearchResult } from "@/lib/services/channels";

function makeChannel(id: string): ChannelSearchResult {
  return {
    id,
    youtubeChannelId: `UC${id}`,
    name: `Channel ${id}`,
    avatarUrl: null,
    subscriberCount: 100,
    videoCount: 10,
    avgViewsLast30Days: 1000,
    avgViewsLifetime: 800,
    uploadFrequencyPerWeek: 1,
    isMonetized: null,
    language: "en",
    country: "US",
    youtubeCreatedAt: "2020-01-01T00:00:00Z",
    viewTrend: [],
  };
}

// Application-Flow.md §4.1: searching -> results | empty | error | rate_limited.
describe("toSearchState", () => {
  it("maps a successful non-empty result to results", () => {
    const channels = [makeChannel("1"), makeChannel("2")];
    expect(toSearchState({ ok: true, value: channels })).toEqual({
      status: "results",
      data: channels,
    });
  });

  it("maps a successful empty result to empty, not results", () => {
    expect(toSearchState({ ok: true, value: [] })).toEqual({ status: "empty" });
  });

  it("maps rate_limited to rate_limited, preserving retryAfterSeconds", () => {
    expect(
      toSearchState({ ok: false, error: { type: "rate_limited", retryAfterSeconds: 42 } }),
    ).toEqual({ status: "rate_limited", retryAfterSeconds: 42 });
  });

  it("maps insufficient_credits, preserving balance and required", () => {
    expect(
      toSearchState({
        ok: false,
        error: { type: "insufficient_credits", balance: 0, required: 1 },
      }),
    ).toEqual({ status: "insufficient_credits", balance: 0, required: 1 });
  });

  it("maps quota_exhausted to quota_exhausted", () => {
    expect(toSearchState({ ok: false, error: { type: "quota_exhausted" } })).toEqual({
      status: "quota_exhausted",
    });
  });

  it("maps youtube_error to error, surfacing the underlying message", () => {
    expect(toSearchState({ ok: false, error: { type: "youtube_error", message: "boom" } })).toEqual(
      { status: "error", message: "boom" },
    );
  });

  it("maps validation_error to a generic error, not the raw field map", () => {
    const state = toSearchState({
      ok: false,
      error: { type: "validation_error", fields: { keyword: "too long" } },
    });
    expect(state).toEqual({
      status: "error",
      message: "Some filters were invalid. Adjust them and try again.",
    });
  });
});
