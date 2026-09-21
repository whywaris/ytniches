import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
const set = vi.fn();

vi.mock("@/lib/cache/redis", () => ({
  getRedis: () => ({ get, set }),
}));

const {
  getCachedChannel,
  setCachedChannel,
  getCachedChannelVideos,
  setCachedChannelVideos,
  getCachedSearchResult,
  setCachedSearchResult,
  hashFilters,
} = await import("@/lib/youtube/cache");

const SIX_HOURS_SECONDS = 6 * 60 * 60;

beforeEach(() => {
  get.mockReset();
  set.mockReset();
});

describe("channel cache", () => {
  it("returns the parsed channel on a cache hit", async () => {
    const channel = { id: "UC1", snippet: { title: "x" } };
    get.mockResolvedValueOnce(channel);

    expect(await getCachedChannel("UC1")).toBe(channel);
    expect(get).toHaveBeenCalledWith("youtube:channel:UC1");
  });

  it("returns null on a cache miss", async () => {
    get.mockResolvedValueOnce(null);
    expect(await getCachedChannel("UC1")).toBeNull();
  });

  it("sets the channel with a 6h TTL under the correct key", async () => {
    const channel = { id: "UC1" } as never;
    await setCachedChannel("UC1", channel);

    expect(set).toHaveBeenCalledWith("youtube:channel:UC1", channel, { ex: SIX_HOURS_SECONDS });
  });
});

describe("channel videos cache", () => {
  it("returns parsed videos on a cache hit", async () => {
    const videos = [{ id: "vid1" }];
    get.mockResolvedValueOnce(videos);

    expect(await getCachedChannelVideos("UC1")).toBe(videos);
    expect(get).toHaveBeenCalledWith("youtube:channel:UC1:videos");
  });

  it("returns null on a cache miss", async () => {
    get.mockResolvedValueOnce(null);
    expect(await getCachedChannelVideos("UC1")).toBeNull();
  });

  it("sets videos with a 6h TTL under the correct key", async () => {
    const videos = [{ id: "vid1" }] as never;
    await setCachedChannelVideos("UC1", videos);

    expect(set).toHaveBeenCalledWith("youtube:channel:UC1:videos", videos, {
      ex: SIX_HOURS_SECONDS,
    });
  });
});

describe("search result cache", () => {
  const filters = { keyword: "sleep music", subscribersMin: 1000 };

  it("returns parsed channel IDs on a cache hit", async () => {
    get.mockResolvedValueOnce(["UC1", "UC2"]);

    const result = await getCachedSearchResult(filters);

    expect(result).toEqual(["UC1", "UC2"]);
    expect(get).toHaveBeenCalledWith(`youtube:search:${hashFilters(filters)}`);
  });

  it("returns null on a cache miss", async () => {
    get.mockResolvedValueOnce(null);
    expect(await getCachedSearchResult(filters)).toBeNull();
  });

  it("sets the search result with a 6h TTL under the hashed key", async () => {
    await setCachedSearchResult(filters, ["UC1"]);

    expect(set).toHaveBeenCalledWith(`youtube:search:${hashFilters(filters)}`, ["UC1"], {
      ex: SIX_HOURS_SECONDS,
    });
  });
});

describe("hashFilters", () => {
  it("produces the same hash regardless of key insertion order", () => {
    const a = hashFilters({ keyword: "sleep music", subscribersMin: 1000, country: "US" });
    const b = hashFilters({ country: "US", keyword: "sleep music", subscribersMin: 1000 });

    expect(a).toBe(b);
  });

  it("produces a different hash for different filter values", () => {
    const a = hashFilters({ keyword: "sleep music" });
    const b = hashFilters({ keyword: "history facts" });

    expect(a).not.toBe(b);
  });

  it("ignores undefined values so an omitted filter doesn't change the hash", () => {
    const a = hashFilters({ keyword: "sleep music", country: undefined });
    const b = hashFilters({ keyword: "sleep music" });

    expect(a).toBe(b);
  });

  it("produces a URL-safe string (no '+' or '/')", () => {
    const hash = hashFilters({ keyword: "a".repeat(50), languages: ["en", "es", "fr"] });
    expect(hash).not.toMatch(/[+/]/);
  });
});
