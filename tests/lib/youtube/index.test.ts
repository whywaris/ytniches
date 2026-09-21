import { beforeEach, describe, expect, it, vi } from "vitest";

const getCachedChannel = vi.fn();
const getCachedChannelVideos = vi.fn();
const getCachedSearchResult = vi.fn();
const setCachedChannel = vi.fn();
const setCachedChannelVideos = vi.fn();
const setCachedSearchResult = vi.fn();

const searchChannels = vi.fn();
const fetchChannelsByIds = vi.fn();
const fetchVideosByIds = vi.fn();
const fetchPlaylistItemVideoIds = vi.fn();

const checkAndIncrement = vi.fn();

vi.mock("@/lib/youtube/cache", () => ({
  getCachedChannel: (...args: unknown[]) => getCachedChannel(...args),
  getCachedChannelVideos: (...args: unknown[]) => getCachedChannelVideos(...args),
  getCachedSearchResult: (...args: unknown[]) => getCachedSearchResult(...args),
  setCachedChannel: (...args: unknown[]) => setCachedChannel(...args),
  setCachedChannelVideos: (...args: unknown[]) => setCachedChannelVideos(...args),
  setCachedSearchResult: (...args: unknown[]) => setCachedSearchResult(...args),
}));

vi.mock("@/lib/youtube/client", () => ({
  searchChannels: (...args: unknown[]) => searchChannels(...args),
  fetchChannelsByIds: (...args: unknown[]) => fetchChannelsByIds(...args),
  fetchVideosByIds: (...args: unknown[]) => fetchVideosByIds(...args),
  fetchPlaylistItemVideoIds: (...args: unknown[]) => fetchPlaylistItemVideoIds(...args),
}));

vi.mock("@/lib/youtube/quota", () => ({
  checkAndIncrement: (...args: unknown[]) => checkAndIncrement(...args),
}));

const { searchChannelIds, getChannelById, getChannelVideos } = await import("@/lib/youtube");

beforeEach(() => {
  vi.clearAllMocks();
  checkAndIncrement.mockResolvedValue({ allowed: true, used: 1 });
});

describe("searchChannelIds", () => {
  it("returns the cached result without touching quota or the API", async () => {
    getCachedSearchResult.mockResolvedValueOnce(["UC1"]);

    const result = await searchChannelIds({ keyword: "sleep music" });

    expect(result).toEqual({ ok: true, value: ["UC1"] });
    expect(checkAndIncrement).not.toHaveBeenCalled();
    expect(searchChannels).not.toHaveBeenCalled();
  });

  it("on a cache miss, spends quota, searches, and writes through to the cache", async () => {
    getCachedSearchResult.mockResolvedValueOnce(null);
    searchChannels.mockResolvedValueOnce({ ok: true, value: ["UC1", "UC2"] });

    const filters = { keyword: "sleep music" };
    const result = await searchChannelIds(filters);

    expect(result).toEqual({ ok: true, value: ["UC1", "UC2"] });
    expect(checkAndIncrement).toHaveBeenCalledWith(100);
    expect(searchChannels).toHaveBeenCalledWith("sleep music");
    expect(setCachedSearchResult).toHaveBeenCalledWith(filters, ["UC1", "UC2"]);
  });

  it("returns quota_exceeded and never calls the API when quota is exhausted", async () => {
    getCachedSearchResult.mockResolvedValueOnce(null);
    checkAndIncrement.mockResolvedValueOnce({ allowed: false, used: 10001 });

    const result = await searchChannelIds({ keyword: "x" });

    expect(result).toEqual({ ok: false, error: { type: "quota_exceeded" } });
    expect(searchChannels).not.toHaveBeenCalled();
  });
});

describe("getChannelById", () => {
  it("returns the cached channel without touching quota or the API", async () => {
    const channel = { id: "UC1" };
    getCachedChannel.mockResolvedValueOnce(channel);

    const result = await getChannelById("UC1");

    expect(result).toEqual({ ok: true, value: channel });
    expect(checkAndIncrement).not.toHaveBeenCalled();
  });

  it("on a cache miss, fetches, caches, and returns the channel", async () => {
    getCachedChannel.mockResolvedValueOnce(null);
    const channel = { id: "UC1" };
    fetchChannelsByIds.mockResolvedValueOnce({ ok: true, value: [channel] });

    const result = await getChannelById("UC1");

    expect(result).toEqual({ ok: true, value: channel });
    expect(setCachedChannel).toHaveBeenCalledWith("UC1", channel);
  });

  it("returns a 404 api_error when the channel doesn't exist", async () => {
    getCachedChannel.mockResolvedValueOnce(null);
    fetchChannelsByIds.mockResolvedValueOnce({ ok: true, value: [] });

    const result = await getChannelById("UC-missing");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        type: "api_error",
        status: 404,
        message: "channel UC-missing not found",
      });
    }
  });

  it("returns quota_exceeded without calling the API when quota is exhausted", async () => {
    getCachedChannel.mockResolvedValueOnce(null);
    checkAndIncrement.mockResolvedValueOnce({ allowed: false, used: 10001 });

    const result = await getChannelById("UC1");

    expect(result).toEqual({ ok: false, error: { type: "quota_exceeded" } });
    expect(fetchChannelsByIds).not.toHaveBeenCalled();
  });
});

describe("getChannelVideos", () => {
  it("returns cached videos without touching quota or the API", async () => {
    const videos = [{ id: "vid1" }];
    getCachedChannelVideos.mockResolvedValueOnce(videos);

    const result = await getChannelVideos("UC1");

    expect(result).toEqual({ ok: true, value: videos });
    expect(checkAndIncrement).not.toHaveBeenCalled();
  });

  it("on a cache miss, resolves the uploads playlist, fetches video IDs, then full video details", async () => {
    getCachedChannelVideos.mockResolvedValueOnce(null);
    getCachedChannel.mockResolvedValueOnce({
      id: "UC1",
      contentDetails: { relatedPlaylists: { uploads: "UU1" } },
    });
    fetchPlaylistItemVideoIds.mockResolvedValueOnce({ ok: true, value: ["vid1", "vid2"] });
    const videos = [{ id: "vid1" }, { id: "vid2" }];
    fetchVideosByIds.mockResolvedValueOnce({ ok: true, value: videos });

    const result = await getChannelVideos("UC1");

    expect(result).toEqual({ ok: true, value: videos });
    expect(fetchPlaylistItemVideoIds).toHaveBeenCalledWith("UU1");
    expect(fetchVideosByIds).toHaveBeenCalledWith(["vid1", "vid2"]);
    expect(setCachedChannelVideos).toHaveBeenCalledWith("UC1", videos);
  });

  it("returns [] without calling fetchVideosByIds when the uploads playlist is empty", async () => {
    getCachedChannelVideos.mockResolvedValueOnce(null);
    getCachedChannel.mockResolvedValueOnce({
      id: "UC1",
      contentDetails: { relatedPlaylists: { uploads: "UU1" } },
    });
    fetchPlaylistItemVideoIds.mockResolvedValueOnce({ ok: true, value: [] });

    const result = await getChannelVideos("UC1");

    expect(result).toEqual({ ok: true, value: [] });
    expect(fetchVideosByIds).not.toHaveBeenCalled();
    expect(setCachedChannelVideos).toHaveBeenCalledWith("UC1", []);
  });

  it("returns an api_error when the channel has no uploads playlist", async () => {
    getCachedChannelVideos.mockResolvedValueOnce(null);
    getCachedChannel.mockResolvedValueOnce({ id: "UC1" });

    const result = await getChannelVideos("UC1");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        type: "api_error",
        status: 404,
        message: "channel UC1 has no uploads playlist",
      });
    }
  });
});
