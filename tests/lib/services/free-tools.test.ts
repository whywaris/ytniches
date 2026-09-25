import { beforeEach, describe, expect, it, vi } from "vitest";

const hourLimit = vi.fn();
const dayLimit = vi.fn();
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    class {
      limit: typeof hourLimit;
      constructor(options: { prefix: string }) {
        this.limit = options.prefix.endsWith(":hour") ? hourLimit : dayLimit;
      }
    },
    { slidingWindow: vi.fn() },
  ),
}));
vi.mock("@/lib/cache/redis", () => ({ getRedis: vi.fn() }));

const getQuotaUsedToday = vi.fn();
vi.mock("@/lib/youtube/quota", () => ({
  FREE_TOOLS_QUOTA_CUTOFF: 7_000,
  getQuotaUsedToday: () => getQuotaUsedToday(),
}));

const resolveChannelUrl = vi.fn();
const getChannelById = vi.fn();
const getVideoById = vi.fn();
const getChannelVideos = vi.fn();
vi.mock("@/lib/youtube", () => ({
  resolveChannelUrl: (...args: unknown[]) => resolveChannelUrl(...args),
  getChannelById: (...args: unknown[]) => getChannelById(...args),
  getVideoById: (...args: unknown[]) => getVideoById(...args),
  getChannelVideos: (...args: unknown[]) => getChannelVideos(...args),
}));

// Real scoring module, wrapped in a spy: proves the checker uses the
// shared rule rather than its own copy.
const evaluateSpy = vi.fn();
vi.mock("@/lib/outliers/scoring", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/outliers/scoring")>();
  return {
    ...actual,
    evaluateAgainstChannel: (...args: Parameters<typeof actual.evaluateAgainstChannel>) => {
      evaluateSpy(...args);
      return actual.evaluateAgainstChannel(...args);
    },
  };
});

const { guardFreeTool, lookupChannel, checkOutlier } = await import("@/lib/services/free-tools");

const CHANNEL_ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw";
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const video = (id: string, views: number, days: number) => ({
  id,
  snippet: {
    title: `Video ${id}`,
    channelId: CHANNEL_ID,
    channelTitle: "Chan",
    publishedAt: daysAgo(days),
  },
  statistics: { viewCount: views },
});

beforeEach(() => {
  vi.clearAllMocks();
  getQuotaUsedToday.mockResolvedValue(0);
  hourLimit.mockResolvedValue({ success: true });
  dayLimit.mockResolvedValue({ success: true });
});

describe("guardFreeTool", () => {
  it("says busy at the 70% cutoff without spending the visitor's allowance", async () => {
    getQuotaUsedToday.mockResolvedValue(7_000);
    expect(await guardFreeTool("1.1.1.1")).toEqual({ ok: false, error: { type: "busy" } });
    expect(hourLimit).not.toHaveBeenCalled();
    expect(dayLimit).not.toHaveBeenCalled();
  });

  it("lets requests through just under the cutoff", async () => {
    getQuotaUsedToday.mockResolvedValue(6_999);
    expect((await guardFreeTool("1.1.1.1")).ok).toBe(true);
  });

  it("rate-limits per IP on the hourly or the daily window", async () => {
    hourLimit.mockResolvedValueOnce({ success: false });
    expect(await guardFreeTool("1.1.1.1")).toEqual({ ok: false, error: { type: "rate_limited" } });
    dayLimit.mockResolvedValueOnce({ success: false });
    expect(await guardFreeTool("1.1.1.1")).toEqual({ ok: false, error: { type: "rate_limited" } });
    expect(hourLimit).toHaveBeenCalledWith("1.1.1.1");
  });
});

describe("lookupChannel", () => {
  it("returns a channel ID input with no guard, no API call", async () => {
    expect(await lookupChannel(`https://youtube.com/channel/${CHANNEL_ID}`, "ip")).toEqual({
      ok: true,
      value: { channelId: CHANNEL_ID },
    });
    expect(getQuotaUsedToday).not.toHaveBeenCalled();
    expect(resolveChannelUrl).not.toHaveBeenCalled();
  });

  it("resolves a handle through the guard and the cached wrapper", async () => {
    resolveChannelUrl.mockResolvedValue({ ok: true, value: CHANNEL_ID });
    getChannelById.mockResolvedValue({
      ok: true,
      value: { snippet: { title: "Google for Developers" } },
    });

    const result = await lookupChannel("@GoogleDevelopers", "ip");

    expect(result).toEqual({
      ok: true,
      value: { channelId: CHANNEL_ID, title: "Google for Developers" },
    });
    expect(resolveChannelUrl).toHaveBeenCalledWith("@GoogleDevelopers");
    expect(hourLimit).toHaveBeenCalledWith("ip");
  });

  it("maps YouTube quota exhaustion to busy", async () => {
    resolveChannelUrl.mockResolvedValue({ ok: false, error: { type: "quota_exceeded" } });
    expect(await lookupChannel("@someone", "ip")).toEqual({ ok: false, error: { type: "busy" } });
  });

  it("rejects bad input before spending anything", async () => {
    expect(await lookupChannel("https://youtube.com/c/Legacy", "ip")).toEqual({
      ok: false,
      error: { type: "invalid_input" },
    });
    expect(hourLimit).not.toHaveBeenCalled();
  });
});

describe("checkOutlier", () => {
  const priors = Array.from({ length: 10 }, (_, i) => video(`p${i}`, 1_000, 30 - i));

  it("scores the video with the shared rule against its channel's earlier uploads", async () => {
    const target = video("target", 4_000, 1);
    getVideoById.mockResolvedValue({ ok: true, value: target });
    getChannelVideos.mockResolvedValue({ ok: true, value: [...priors, target] });

    const result = await checkOutlier("https://youtu.be/target12345", "ip");

    expect(evaluateSpy).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      ok: true,
      value: { views: 4_000, baseline: 1_000, multiplier: 4, isOutlier: true, threshold: 3 },
    });
    expect(getChannelVideos).toHaveBeenCalledWith(CHANNEL_ID);
  });

  it("says too old when the channel has more history than the 50 uploads we see", async () => {
    const newer = Array.from({ length: 50 }, (_, i) => video(`n${i}`, 1_000, 10 + i));
    const old = video("old", 5_000, 3_000);
    getVideoById.mockResolvedValue({ ok: true, value: old });
    getChannelVideos.mockResolvedValue({ ok: true, value: newer });

    expect(await checkOutlier("https://youtu.be/old12345678", "ip")).toEqual({
      ok: false,
      error: { type: "too_old" },
    });
  });

  it("says not enough history for a young channel", async () => {
    const target = video("target", 9_000, 1);
    getVideoById.mockResolvedValue({ ok: true, value: target });
    getChannelVideos.mockResolvedValue({ ok: true, value: [...priors.slice(0, 3), target] });

    expect(await checkOutlier("https://youtu.be/target12345", "ip")).toEqual({
      ok: false,
      error: { type: "not_enough_history" },
    });
  });

  it("stops at the guard before any YouTube call", async () => {
    getQuotaUsedToday.mockResolvedValue(9_000);
    expect(await checkOutlier("https://youtu.be/target12345", "ip")).toEqual({
      ok: false,
      error: { type: "busy" },
    });
    expect(getVideoById).not.toHaveBeenCalled();
  });
});
