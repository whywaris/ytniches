import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchChannelByHandle,
  fetchChannelsByIds,
  fetchPlaylistItemVideoIds,
  fetchVideosByIds,
  searchChannels,
  searchRecentVideos,
} from "@/lib/youtube/client";

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    text: async () => JSON.stringify(body),
    json: async () => body,
  } as unknown as Response;
}

function urlOf(mockCall: unknown[]): URL {
  return new URL(String(mockCall[0]));
}

beforeEach(() => {
  vi.stubEnv("YOUTUBE_API_KEY", "test-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("searchChannels", () => {
  it("returns parsed channel IDs on 200", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { items: [{ id: { channelId: "UC1" } }, { id: { channelId: "UC2" } }] }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchChannels("sleep music");

    expect(result).toEqual({ ok: true, value: ["UC1", "UC2"] });
    const url = urlOf(fetchMock.mock.calls[0]);
    expect(url.pathname).toBe("/youtube/v3/search");
    expect(url.searchParams.get("q")).toBe("sleep music");
    expect(url.searchParams.get("type")).toBe("channel");
    expect(url.searchParams.get("part")).toBe("id");
  });

  it("surfaces a Zod validation failure as a typed invalid_response error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(200, { items: [{ id: {} }] })),
    );

    const result = await searchChannels("sleep music");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("invalid_response");
    }
  });
});

describe("searchRecentVideos (D-079 variants)", () => {
  const body = { items: [{ id: { videoId: "v1" }, snippet: { channelId: "UC1" } }] };

  it("adds relevanceLanguage and videoDuration when the variant sets them", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, body));
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchRecentVideos("mafia history", "2026-09-21T00:00:00Z", {
      relevanceLanguage: "en",
      videoDuration: "long",
    });

    expect(result).toEqual({ ok: true, value: [{ videoId: "v1", channelId: "UC1" }] });
    const params = urlOf(fetchMock.mock.calls[0]!).searchParams;
    expect(params.get("relevanceLanguage")).toBe("en");
    expect(params.get("videoDuration")).toBe("long");
    expect(params.get("order")).toBe("viewCount");
  });

  it("sends neither parameter for the plain variant", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, body));
    vi.stubGlobal("fetch", fetchMock);

    await searchRecentVideos("mafia history", "2026-09-21T00:00:00Z");

    const params = urlOf(fetchMock.mock.calls[0]!).searchParams;
    expect(params.has("relevanceLanguage")).toBe(false);
    expect(params.has("videoDuration")).toBe(false);
  });
});

describe("fetchChannelsByIds", () => {
  it("returns parsed channels on 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        jsonResponse(200, {
          items: [
            {
              id: "UC1",
              snippet: { title: "Sleep Sounds Daily", publishedAt: "2020-01-01T00:00:00Z" },
              statistics: { viewCount: "1000", subscriberCount: "2000", videoCount: "30" },
            },
          ],
        }),
      ),
    );

    const result = await fetchChannelsByIds(["UC1"]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(1);
      expect(result.value[0].snippet.title).toBe("Sleep Sounds Daily");
    }
  });

  it("batches 51 IDs into two calls (50 + 1), not 51 calls", async () => {
    const ids = Array.from({ length: 51 }, (_, i) => `UC${i}`);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { items: [] }))
      .mockResolvedValueOnce(jsonResponse(200, { items: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchChannelsByIds(ids);

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstBatchIds = urlOf(fetchMock.mock.calls[0]).searchParams.get("id")?.split(",");
    const secondBatchIds = urlOf(fetchMock.mock.calls[1]).searchParams.get("id")?.split(",");
    expect(firstBatchIds).toHaveLength(50);
    expect(secondBatchIds).toHaveLength(1);
  });

  it("does not batch when 50 or fewer IDs are given", async () => {
    const ids = Array.from({ length: 50 }, (_, i) => `UC${i}`);
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(200, { items: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchChannelsByIds(ids);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("fetchChannelByHandle", () => {
  it("queries forHandle= (not id=) and returns the parsed channel on 200", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        items: [
          {
            id: "UC1",
            snippet: { title: "Sleep Sounds Daily", publishedAt: "2020-01-01T00:00:00Z" },
            statistics: { viewCount: "1000", subscriberCount: "2000", videoCount: "30" },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchChannelByHandle("SleepSoundsDaily");

    expect(result).toEqual({ ok: true, value: expect.objectContaining({ id: "UC1" }) });
    const url = urlOf(fetchMock.mock.calls[0]);
    expect(url.searchParams.get("forHandle")).toBe("SleepSoundsDaily");
    expect(url.searchParams.has("id")).toBe(false);
  });

  it("returns null (not an error) when no channel matches the handle", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(jsonResponse(200, { items: [] })));

    const result = await fetchChannelByHandle("doesnotexist");

    expect(result).toEqual({ ok: true, value: null });
  });
});

describe("fetchVideosByIds", () => {
  it("returns parsed videos on 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        jsonResponse(200, {
          items: [
            {
              id: "vid1",
              snippet: {
                title: "How to pick a niche",
                publishedAt: "2024-01-01T00:00:00Z",
                channelId: "UC1",
              },
              contentDetails: { duration: "PT10M" },
            },
          ],
        }),
      ),
    );

    const result = await fetchVideosByIds(["vid1"]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0].id).toBe("vid1");
      expect(result.value[0].contentDetails.duration).toBe("PT10M");
    }
  });
});

describe("fetchVideosByIds: one malformed item (D-078)", () => {
  it("skips and logs the bad item and returns the rest", async () => {
    const good = (id: string) => ({
      id,
      snippet: { title: id, publishedAt: "2026-09-20T00:00:00Z", channelId: "UC1" },
      statistics: { viewCount: "10" },
      contentDetails: { duration: "PT5M" },
    });
    // e.g. an upcoming premiere without a duration
    const bad = { id: "premiere", snippet: good("premiere").snippet, contentDetails: {} };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(200, { items: [good("a"), bad, good("b")] })),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await fetchVideosByIds(["a", "premiere", "b"]);

    expect(result.ok && result.value.map((video) => video.id)).toEqual(["a", "b"]);
    expect(warn).toHaveBeenCalledWith(
      "videos.list: skipped malformed item",
      "premiere",
      "contentDetails.duration",
    );
    warn.mockRestore();
  });

  it("still fails on a malformed envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, { nope: true })));
    const result = await fetchVideosByIds(["a"]);
    expect(result).toMatchObject({ ok: false, error: { type: "invalid_response" } });
  });
});

describe("fetchPlaylistItemVideoIds", () => {
  it("returns parsed video IDs on 200", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        items: [{ contentDetails: { videoId: "vid1" } }, { contentDetails: { videoId: "vid2" } }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPlaylistItemVideoIds("UU123");

    expect(result).toEqual({ ok: true, value: ["vid1", "vid2"] });
    const url = urlOf(fetchMock.mock.calls[0]);
    expect(url.pathname).toBe("/youtube/v3/playlistItems");
    expect(url.searchParams.get("playlistId")).toBe("UU123");
    expect(url.searchParams.get("part")).toBe("contentDetails");
  });

  it("surfaces a Zod validation failure as a typed invalid_response error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(200, { items: [{ contentDetails: {} }] })),
    );

    const result = await fetchPlaylistItemVideoIds("UU123");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("invalid_response");
    }
  });
});

describe("HTTP error mapping", () => {
  it("maps 403 to a typed quota_exceeded error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(403, { error: "quotaExceeded" })),
    );

    const result = await searchChannels("x");

    expect(result).toEqual({ ok: false, error: { type: "quota_exceeded" } });
  });

  it("maps 400 to a typed invalid_request error with the response body as message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(400, { error: "invalid part parameter" })),
    );

    const result = await searchChannels("x");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("invalid_request");
    }
  });

  it("maps a rejected fetch (network failure) to a typed network_error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new TypeError("fetch failed")));

    const result = await searchChannels("x");

    expect(result).toEqual({
      ok: false,
      error: { type: "network_error", message: "fetch failed" },
    });
  });

  it("maps any other non-OK status to a typed api_error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(jsonResponse(500, { error: "internal" })));

    const result = await searchChannels("x");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        type: "api_error",
        status: 500,
        message: JSON.stringify({ error: "internal" }),
      });
    }
  });
});
