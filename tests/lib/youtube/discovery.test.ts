import { beforeEach, describe, expect, it, vi } from "vitest";

const hasJobBudget = vi.fn();
const checkAndIncrement = vi.fn();
const searchRecentVideos = vi.fn();
const fetchChannelsByIds = vi.fn();
const fetchPlaylistItemVideoIds = vi.fn();
const fetchVideosByIds = vi.fn();
const setCachedChannel = vi.fn();

vi.mock("@/lib/youtube/quota", () => ({
  hasJobBudget: (...args: unknown[]) => hasJobBudget(...args),
  checkAndIncrement: (...args: unknown[]) => checkAndIncrement(...args),
}));
vi.mock("@/lib/youtube/client", () => ({
  BATCH_SIZE: 50,
  searchRecentVideos: (...args: unknown[]) => searchRecentVideos(...args),
  fetchChannelsByIds: (...args: unknown[]) => fetchChannelsByIds(...args),
  fetchPlaylistItemVideoIds: (...args: unknown[]) => fetchPlaylistItemVideoIds(...args),
  fetchVideosByIds: (...args: unknown[]) => fetchVideosByIds(...args),
}));
vi.mock("@/lib/youtube/cache", () => ({
  setCachedChannel: (...args: unknown[]) => setCachedChannel(...args),
}));

const { discoverChannelIdsForKeyword, fetchChannelsFresh, fetchVideosFresh } =
  await import("@/lib/youtube/discovery");

beforeEach(() => {
  vi.clearAllMocks();
  hasJobBudget.mockResolvedValue(true);
  checkAndIncrement.mockResolvedValue({ allowed: true, used: 100 });
});

describe("job budget guard", () => {
  it("stops before spending anything when the budget is gone", async () => {
    hasJobBudget.mockResolvedValue(false);

    const result = await discoverChannelIdsForKeyword("mafia history", "2026-09-19T00:00:00Z");

    expect(result).toEqual({ ok: false, error: { type: "budget_exhausted" } });
    expect(checkAndIncrement).not.toHaveBeenCalled();
    expect(searchRecentVideos).not.toHaveBeenCalled();
  });

  it("charges 100 for a search and dedupes the channels it found", async () => {
    searchRecentVideos.mockResolvedValue({
      ok: true,
      value: [
        { videoId: "v1", channelId: "UC1" },
        { videoId: "v2", channelId: "UC1" },
        { videoId: "v3", channelId: "UC2" },
      ],
    });

    const result = await discoverChannelIdsForKeyword("mafia history", "2026-09-19T00:00:00Z");

    expect(hasJobBudget).toHaveBeenCalledWith(100);
    expect(checkAndIncrement).toHaveBeenCalledWith(100);
    expect(result).toEqual({ ok: true, value: ["UC1", "UC2"] });
  });

  it("charges one unit per 50 ids and writes channels through to the cache", async () => {
    const ids = Array.from({ length: 51 }, (_, i) => `UC${i}`);
    fetchChannelsByIds.mockResolvedValue({ ok: true, value: [{ id: "UC0" }] });

    await fetchChannelsFresh(ids);

    expect(checkAndIncrement).toHaveBeenCalledWith(2);
    expect(setCachedChannel).toHaveBeenCalledWith("UC0", { id: "UC0" });
  });

  it("maps a hard quota refusal to quota_exceeded", async () => {
    checkAndIncrement.mockResolvedValue({ allowed: false, used: 10_001 });

    const result = await fetchVideosFresh(["v1"]);

    expect(result).toEqual({ ok: false, error: { type: "quota_exceeded" } });
    expect(fetchVideosByIds).not.toHaveBeenCalled();
  });

  it("spends nothing for an empty batch", async () => {
    await fetchVideosFresh([]);
    expect(hasJobBudget).not.toHaveBeenCalled();
  });
});
