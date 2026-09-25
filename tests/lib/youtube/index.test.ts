import { beforeEach, describe, expect, it, vi } from "vitest";

const getCachedChannel = vi.fn();
const getCachedChannelVideos = vi.fn();
const getCachedSearchResult = vi.fn();
const getCachedVideo = vi.fn();
const setCachedChannel = vi.fn();
const setCachedChannelVideos = vi.fn();
const setCachedSearchResult = vi.fn();
const setCachedVideo = vi.fn();
const getCachedHandle = vi.fn();
const setCachedHandle = vi.fn();

const searchChannels = vi.fn();
const fetchChannelsByIds = vi.fn();
const fetchVideosByIds = vi.fn();
const fetchPlaylistItemVideoIds = vi.fn();
const fetchChannelByHandle = vi.fn();

const checkAndIncrement = vi.fn();

vi.mock("@/lib/youtube/cache", () => ({
  getCachedChannel: (...args: unknown[]) => getCachedChannel(...args),
  getCachedChannelVideos: (...args: unknown[]) => getCachedChannelVideos(...args),
  getCachedSearchResult: (...args: unknown[]) => getCachedSearchResult(...args),
  getCachedVideo: (...args: unknown[]) => getCachedVideo(...args),
  setCachedChannel: (...args: unknown[]) => setCachedChannel(...args),
  setCachedChannelVideos: (...args: unknown[]) => setCachedChannelVideos(...args),
  setCachedSearchResult: (...args: unknown[]) => setCachedSearchResult(...args),
  setCachedVideo: (...args: unknown[]) => setCachedVideo(...args),
  getCachedHandle: (...args: unknown[]) => getCachedHandle(...args),
  setCachedHandle: (...args: unknown[]) => setCachedHandle(...args),
}));

vi.mock("@/lib/youtube/client", () => ({
  BATCH_SIZE: 50,
  searchChannels: (...args: unknown[]) => searchChannels(...args),
  fetchChannelsByIds: (...args: unknown[]) => fetchChannelsByIds(...args),
  fetchVideosByIds: (...args: unknown[]) => fetchVideosByIds(...args),
  fetchPlaylistItemVideoIds: (...args: unknown[]) => fetchPlaylistItemVideoIds(...args),
  fetchChannelByHandle: (...args: unknown[]) => fetchChannelByHandle(...args),
}));

vi.mock("@/lib/youtube/quota", () => ({
  checkAndIncrement: (...args: unknown[]) => checkAndIncrement(...args),
}));

const {
  searchChannelIds,
  getChannelById,
  getChannelVideos,
  getChannelsByIds,
  resolveChannelUrl,
  getVideoById,
  resolveVideoUrl,
} = await import("@/lib/youtube");

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

describe("getChannelsByIds", () => {
  it("returns [] immediately without any cache or API calls for an empty input", async () => {
    const result = await getChannelsByIds([]);

    expect(result).toEqual({ ok: true, value: [] });
    expect(getCachedChannel).not.toHaveBeenCalled();
    expect(checkAndIncrement).not.toHaveBeenCalled();
  });

  it("makes one batched fetch for every cache miss, not one call per miss", async () => {
    getCachedChannel.mockResolvedValue(null);
    fetchChannelsByIds.mockResolvedValueOnce({
      ok: true,
      value: [{ id: "UC1" }, { id: "UC2" }, { id: "UC3" }],
    });

    const result = await getChannelsByIds(["UC1", "UC2", "UC3"]);

    expect(result.ok).toBe(true);
    expect(fetchChannelsByIds).toHaveBeenCalledTimes(1);
    expect(fetchChannelsByIds).toHaveBeenCalledWith(["UC1", "UC2", "UC3"]);
    // 1 batch of misses -> 1 unit, not 3
    expect(checkAndIncrement).toHaveBeenCalledWith(1);
  });

  it("checks quota for ceil(misses / BATCH_SIZE) units when misses span multiple batches", async () => {
    const ids = Array.from({ length: 51 }, (_, i) => `UC${i}`);
    getCachedChannel.mockResolvedValue(null);
    fetchChannelsByIds.mockResolvedValueOnce({
      ok: true,
      value: ids.map((id) => ({ id })),
    });

    await getChannelsByIds(ids);

    expect(checkAndIncrement).toHaveBeenCalledWith(2); // ceil(51 / 50)
  });

  it("skips quota and the API entirely when every ID is already cached", async () => {
    getCachedChannel.mockImplementation((id: string) => Promise.resolve({ id }));

    const result = await getChannelsByIds(["UC1", "UC2"]);

    expect(result).toEqual({ ok: true, value: [{ id: "UC1" }, { id: "UC2" }] });
    expect(checkAndIncrement).not.toHaveBeenCalled();
    expect(fetchChannelsByIds).not.toHaveBeenCalled();
  });

  it("returns quota_exceeded without calling the API when quota is exhausted", async () => {
    getCachedChannel.mockResolvedValue(null);
    checkAndIncrement.mockResolvedValueOnce({ allowed: false, used: 10001 });

    const result = await getChannelsByIds(["UC1"]);

    expect(result).toEqual({ ok: false, error: { type: "quota_exceeded" } });
    expect(fetchChannelsByIds).not.toHaveBeenCalled();
  });

  it("silently omits an ID that comes back missing from the API (deleted channel)", async () => {
    getCachedChannel.mockResolvedValue(null);
    fetchChannelsByIds.mockResolvedValueOnce({ ok: true, value: [{ id: "UC1" }] });

    const result = await getChannelsByIds(["UC1", "UC-deleted"]);

    expect(result).toEqual({ ok: true, value: [{ id: "UC1" }] });
  });

  it("preserves input order regardless of which IDs were cached vs freshly fetched", async () => {
    const cache: Record<string, { id: string } | null> = {
      UC1: { id: "UC1" },
      UC2: null,
      UC3: { id: "UC3" },
      UC4: null,
    };
    getCachedChannel.mockImplementation((id: string) => Promise.resolve(cache[id] ?? null));
    fetchChannelsByIds.mockResolvedValueOnce({
      ok: true,
      value: [{ id: "UC4" }, { id: "UC2" }], // API returns misses in a different order
    });

    const result = await getChannelsByIds(["UC1", "UC2", "UC3", "UC4"]);

    expect(result).toEqual({
      ok: true,
      value: [{ id: "UC1" }, { id: "UC2" }, { id: "UC3" }, { id: "UC4" }],
    });
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

describe("resolveChannelUrl", () => {
  it("extracts the ID directly from a /channel/ URL without any API call", async () => {
    const result = await resolveChannelUrl("https://www.youtube.com/channel/UC12345/");

    expect(result).toEqual({ ok: true, value: "UC12345" });
    expect(checkAndIncrement).not.toHaveBeenCalled();
    expect(fetchChannelByHandle).not.toHaveBeenCalled();
  });

  it("resolves a /@handle URL via channels.list?forHandle=, stripping the @ first", async () => {
    const channel = { id: "UC-from-handle" };
    fetchChannelByHandle.mockResolvedValueOnce({ ok: true, value: channel });

    const result = await resolveChannelUrl("https://www.youtube.com/@SleepSoundsDaily");

    expect(result).toEqual({ ok: true, value: "UC-from-handle" });
    expect(checkAndIncrement).toHaveBeenCalledWith(1);
    // The handle passed to the API must not include the leading "@".
    expect(fetchChannelByHandle).toHaveBeenCalledWith("SleepSoundsDaily");
    expect(setCachedChannel).toHaveBeenCalledWith("UC-from-handle", channel);
  });

  it("normalizes https://, www., and a trailing slash before parsing", async () => {
    const withoutProtocol = await resolveChannelUrl("youtube.com/channel/UC1");
    const withHttp = await resolveChannelUrl("http://youtube.com/channel/UC1");
    const withWww = await resolveChannelUrl("https://www.youtube.com/channel/UC1");
    const withTrailingSlash = await resolveChannelUrl("https://www.youtube.com/channel/UC1/");

    expect(withoutProtocol).toEqual({ ok: true, value: "UC1" });
    expect(withHttp).toEqual({ ok: true, value: "UC1" });
    expect(withWww).toEqual({ ok: true, value: "UC1" });
    expect(withTrailingSlash).toEqual({ ok: true, value: "UC1" });
  });

  it("returns invalid_url for anything that isn't a recognized channel/handle URL", async () => {
    const result = await resolveChannelUrl("https://example.com/not-youtube");

    expect(result).toEqual({ ok: false, error: { type: "invalid_url" } });
    expect(checkAndIncrement).not.toHaveBeenCalled();
  });

  it("returns not_found when the handle doesn't resolve to any channel", async () => {
    fetchChannelByHandle.mockResolvedValueOnce({ ok: true, value: null });

    const result = await resolveChannelUrl("https://youtube.com/@doesnotexist");

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });

  it("propagates a quota_exceeded error without calling the API for a handle URL", async () => {
    checkAndIncrement.mockResolvedValueOnce({ allowed: false, used: 10001 });

    const result = await resolveChannelUrl("https://youtube.com/@someone");

    expect(result).toEqual({ ok: false, error: { type: "quota_exceeded" } });
    expect(fetchChannelByHandle).not.toHaveBeenCalled();
  });

  it("propagates the client error when the handle lookup itself fails", async () => {
    fetchChannelByHandle.mockResolvedValueOnce({
      ok: false,
      error: { type: "network_error", message: "timeout" },
    });

    const result = await resolveChannelUrl("https://youtube.com/@someone");

    expect(result).toEqual({ ok: false, error: { type: "network_error", message: "timeout" } });
  });
});

describe("getVideoById", () => {
  it("returns the cached video without touching quota or the API", async () => {
    const video = { id: "vid1" };
    getCachedVideo.mockResolvedValueOnce(video);

    const result = await getVideoById("vid1");

    expect(result).toEqual({ ok: true, value: video });
    expect(checkAndIncrement).not.toHaveBeenCalled();
  });

  it("on a cache miss, fetches, caches, and returns the video", async () => {
    getCachedVideo.mockResolvedValueOnce(null);
    const video = { id: "vid1" };
    fetchVideosByIds.mockResolvedValueOnce({ ok: true, value: [video] });

    const result = await getVideoById("vid1");

    expect(result).toEqual({ ok: true, value: video });
    expect(setCachedVideo).toHaveBeenCalledWith("vid1", video);
  });

  it("returns a 404 api_error when the video doesn't exist", async () => {
    getCachedVideo.mockResolvedValueOnce(null);
    fetchVideosByIds.mockResolvedValueOnce({ ok: true, value: [] });

    const result = await getVideoById("vid-missing");

    expect(result).toEqual({
      ok: false,
      error: { type: "api_error", status: 404, message: "video vid-missing not found" },
    });
  });

  it("returns quota_exceeded without calling the API when quota is exhausted", async () => {
    getCachedVideo.mockResolvedValueOnce(null);
    checkAndIncrement.mockResolvedValueOnce({ allowed: false, used: 10001 });

    const result = await getVideoById("vid1");

    expect(result).toEqual({ ok: false, error: { type: "quota_exceeded" } });
    expect(fetchVideosByIds).not.toHaveBeenCalled();
  });
});

describe("resolveVideoUrl", () => {
  it("extracts the ID from a youtu.be short link", () => {
    expect(resolveVideoUrl("https://youtu.be/abc123")).toEqual({ ok: true, value: "abc123" });
  });

  it("extracts the ID from a /shorts/ URL", () => {
    expect(resolveVideoUrl("https://www.youtube.com/shorts/abc123")).toEqual({
      ok: true,
      value: "abc123",
    });
  });

  it("extracts the ID from a /watch?v= URL, regardless of other query params", () => {
    expect(resolveVideoUrl("https://www.youtube.com/watch?list=xyz&v=abc123&t=30s")).toEqual({
      ok: true,
      value: "abc123",
    });
  });

  it("normalizes https/www/trailing slash the same as resolveChannelUrl", () => {
    expect(resolveVideoUrl("youtube.com/watch?v=abc123")).toEqual({ ok: true, value: "abc123" });
  });

  it("returns invalid_url for anything that isn't a recognized video URL", () => {
    expect(resolveVideoUrl("https://example.com/not-youtube")).toEqual({
      ok: false,
      error: { type: "invalid_url" },
    });
  });

  it("returns invalid_url for a channel URL (not a video URL)", () => {
    expect(resolveVideoUrl("https://youtube.com/channel/UC123")).toEqual({
      ok: false,
      error: { type: "invalid_url" },
    });
  });
});

describe("resolveChannelUrl handle cache (D-054)", () => {
  it("serves a cached handle without spending quota", async () => {
    getCachedHandle.mockResolvedValueOnce("UC-cached");

    const result = await resolveChannelUrl("@SleepSoundsDaily");

    expect(result).toEqual({ ok: true, value: "UC-cached" });
    expect(getCachedHandle).toHaveBeenCalledWith("SleepSoundsDaily");
    expect(checkAndIncrement).not.toHaveBeenCalled();
    expect(fetchChannelByHandle).not.toHaveBeenCalled();
  });

  it("caches the handle after a successful lookup", async () => {
    getCachedHandle.mockResolvedValueOnce(null);
    checkAndIncrement.mockResolvedValueOnce({ allowed: true, used: 1 });
    fetchChannelByHandle.mockResolvedValueOnce({ ok: true, value: { id: "UC-new" } });

    const result = await resolveChannelUrl("https://m.youtube.com/@NewChannel/videos");

    expect(result).toEqual({ ok: true, value: "UC-new" });
    expect(setCachedHandle).toHaveBeenCalledWith("NewChannel", "UC-new");
  });

  it("still rejects legacy /c/ and /user/ links without spending quota", async () => {
    expect(await resolveChannelUrl("https://youtube.com/c/SomeName")).toEqual({
      ok: false,
      error: { type: "invalid_url" },
    });
    expect(await resolveChannelUrl("https://youtube.com/user/SomeName")).toEqual({
      ok: false,
      error: { type: "invalid_url" },
    });
    expect(checkAndIncrement).not.toHaveBeenCalled();
  });
});
