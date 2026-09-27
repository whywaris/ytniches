import { describe, expect, it, vi } from "vitest";

import { YOUTUBE_DATA_MAX_AGE_DAYS, YOUTUBE_RETENTION_EVENT } from "@/lib/youtube/retention";

const rpc = vi.fn<(name: string, args: Record<string, unknown>) => Promise<unknown>>(async () => ({
  data: [{ events_deleted: 2, videos_deleted: 1 }],
  error: null,
}));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    rpc: (name: string, args: Record<string, unknown>) => rpc(name, args),
  }),
}));

const { purgeStaleYouTubeData } = await import("@/workers/youtube-retention");

describe("purgeStaleYouTubeData", () => {
  it("purges with the 30-day limit from YouTube's Developer Policies (III.E.4.d)", async () => {
    expect(YOUTUBE_DATA_MAX_AGE_DAYS).toBe(30);
    expect(await purgeStaleYouTubeData()).toEqual({ events_deleted: 2, videos_deleted: 1 });
    expect(rpc).toHaveBeenCalledWith("purge_stale_youtube_data", {
      p_max_age_days: 30,
      p_snapshot_days: 90,
    });
  });

  it("also covers the discovery tables -- the only 30-day purge (D-073)", async () => {
    const { readFileSync } = await import("node:fs");
    const discovery = readFileSync(`${process.cwd()}/workers/discovery.ts`, "utf8");
    expect(discovery).not.toMatch(/purge_stale_youtube_data/);
    const { MANUAL_EVENTS } = await import("@/lib/discovery/events");
    expect(MANUAL_EVENTS.purge).toBe(YOUTUBE_RETENTION_EVENT);
  });

  it("fails loudly so Inngest retries", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    await expect(purgeStaleYouTubeData()).rejects.toThrow(/boom/);
  });
});
