import { beforeEach, describe, expect, it, vi } from "vitest";

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

const captureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => captureException(...args),
}));

const { purgeStaleYouTubeData, reportRetentionGaveUp, YouTubeRetentionError } =
  await import("@/workers/youtube-retention");

beforeEach(() => captureException.mockClear());

describe("purgeStaleYouTubeData", () => {
  it("purges with the 30-day limit from YouTube's Developer Policies (III.E.4.d)", async () => {
    expect(YOUTUBE_DATA_MAX_AGE_DAYS).toBe(30);
    expect(await purgeStaleYouTubeData()).toEqual({ events_deleted: 2, videos_deleted: 1 });
    expect(rpc).toHaveBeenCalledWith("purge_stale_youtube_data", {
      p_max_age_days: 30,
      p_snapshot_days: 30,
      p_view_snapshot_days: 30,
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

  it("a successful purge reports nothing to Sentry", async () => {
    await purgeStaleYouTubeData();
    expect(captureException).not.toHaveBeenCalled();
  });
});

describe("purge failure alerts (D-073)", () => {
  it("reports a blocked delete to Sentry with the Postgres context, then rethrows", async () => {
    rpc.mockResolvedValueOnce({
      data: null,
      error: {
        code: "23503",
        message:
          'update or delete on table "videos" violates foreign key constraint "prompts_source_video_id_fkey" on table "prompts"',
        details: 'Key (id)=(v1) is still referenced from table "prompts".',
        hint: null,
      },
    });

    const failure = purgeStaleYouTubeData();

    await expect(failure).rejects.toBeInstanceOf(YouTubeRetentionError);
    await expect(failure).rejects.toThrow(/user row's foreign key blocked a delete/);
    expect(captureException).toHaveBeenCalledTimes(1);
    const [error, context] = captureException.mock.calls[0] ?? [];
    expect(error).toMatchObject({ pgCode: "23503" });
    expect(context).toMatchObject({
      level: "error",
      tags: { job: "youtube-retention-cron", pg_code: "23503" },
      extra: {
        details: expect.stringContaining("prompts"),
        maxAgeDays: 30,
        snapshotDays: 30,
      },
      fingerprint: ["youtube-retention", "23503"],
    });
  });

  it("reports at fatal once Inngest gives up", () => {
    reportRetentionGaveUp({ error: new Error("step timed out"), runId: "run_123" });

    expect(captureException).toHaveBeenCalledWith(expect.any(Error), {
      level: "fatal",
      tags: { job: "youtube-retention-cron", run_id: "run_123" },
      extra: expect.objectContaining({ rule: expect.stringContaining("III.E.4.d") }),
      fingerprint: ["youtube-retention", "gave-up"],
    });
  });

  it("the cron is wired to that final alert", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync(`${process.cwd()}/workers/youtube-retention.ts`, "utf8");
    expect(source).toMatch(/onFailure: \(\{ error, event \}\) =>\s+reportRetentionGaveUp\(/);
  });
});
