import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { callsOf, createFakeSupabase } from "@/tests/helpers/fake-supabase";

const fake = createFakeSupabase();
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fake.client }));

const redisGet = vi.fn();
const redisSet = vi.fn();
vi.mock("@/lib/cache/redis", () => ({ getRedis: () => ({ get: redisGet, set: redisSet }) }));

const getEffectivePlan = vi.fn();
vi.mock("@/lib/billing/effective-plan", () => ({
  getEffectivePlan: (...args: unknown[]) => getEffectivePlan(...args),
}));

// Acceptance criterion (spec §15): browsing makes zero YouTube API calls.
const youtubeCall = vi.fn();
vi.mock("@/lib/youtube", () => new Proxy({}, { get: () => youtubeCall }));
vi.mock("@/lib/youtube/client", () => new Proxy({}, { get: () => youtubeCall }));
vi.mock("@/lib/youtube/discovery", () => new Proxy({}, { get: () => youtubeCall }));

const { listNiches, listFeedChannels, listGlobalOutliers, getNicheBySlug, isNicheBrowseCapped } =
  await import("@/lib/services/niche-feed");

const ctx = { userId: "u1", workspaceId: null, tier: null };

function snapshotRow(id: string, score: number) {
  return {
    niche_id: id,
    opportunity_score: score,
    trend: 4,
    why_chips: ["62% small channels ranking", "4 new channels breaking out"],
    channel_count: 20,
    new_channels_30d: 4,
    median_views: 18_000,
    niches: {
      id,
      slug: `niche-${id}`,
      name: `Niche ${id}`,
      description: null,
      status: "rising",
      created_at: "2026-09-01T00:00:00Z",
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  fake.reset();
  redisGet.mockResolvedValue(null); // cache miss everywhere
  getEffectivePlan.mockResolvedValue({ tier: "pro", status: "active", teamWorkspaceId: null });
});

describe("zero YouTube quota", () => {
  it("niche-feed.ts never imports lib/youtube", () => {
    const source = readFileSync(
      path.join(process.cwd(), "lib", "services", "niche-feed.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/from "@\/lib\/youtube/);
  });

  it("no browse path touches the YouTube wrappers", async () => {
    fake.on("niche_snapshots", { data: { snapshot_date: "2026-09-27" } }, { data: [], count: 0 });
    await listNiches(ctx, { sort: "score", page: 1 });
    await listFeedChannels({ sort: "outlier_score", page: 1 });
    await listGlobalOutliers({ withinDays: 30, page: 1 });
    expect(youtubeCall).not.toHaveBeenCalled();
  });
});

describe("isNicheBrowseCapped (D-072)", () => {
  it.each([
    [{ tier: null, status: null }, true],
    [{ tier: "starter", status: "active" }, true],
    [{ tier: "pro", status: "trialing" }, true],
    [{ tier: "pro", status: "active" }, false],
    [{ tier: "team", status: "active" }, false],
  ])("%o -> capped %s", async (plan, capped) => {
    getEffectivePlan.mockResolvedValue({ ...plan, teamWorkspaceId: null });
    expect(await isNicheBrowseCapped(ctx)).toBe(capped);
  });
});

describe("listNiches", () => {
  it("reads the latest snapshot, maps chips/trend/label and attaches thumbnails", async () => {
    fake.on(
      "niche_snapshots",
      { data: { snapshot_date: "2026-09-27" } },
      { data: [snapshotRow("a", 84)], count: 1 },
    );
    fake.on("outliers_feed", {
      data: [
        {
          niche_id: "a",
          channel_id: "c1",
          outlier_multiple: 9,
          videos: {
            id: "vid-1",
            youtube_video_id: "yt1",
            title: "Big one",
            thumbnail_url: "https://i.ytimg.com/1.jpg",
          },
        },
      ],
    });

    const page = await listNiches(ctx, { sort: "score", page: 1 });

    expect(page.snapshotDate).toBe("2026-09-27");
    expect(page.lockedCount).toBe(0);
    expect(page.items[0]).toMatchObject({
      slug: "niche-a",
      score: 84,
      label: "low",
      trend: 4,
      whyChips: ["62% small channels ranking", "4 new channels breaking out"],
      thumbnails: [
        {
          videoId: "vid-1",
          channelId: "c1",
          youtubeVideoId: "yt1",
          title: "Big one",
          thumbnailUrl: "https://i.ytimg.com/1.jpg",
        },
      ],
    });
    const list = fake.queriesFor("niche_snapshots")[1];
    expect(callsOf(list, "eq")).toContainEqual(["snapshot_date", "2026-09-27"]);
    expect(callsOf(list, "range")).toEqual([[0, 23]]);
  });

  it("limits Starter/Trial to the top 50 and reports how many are locked", async () => {
    getEffectivePlan.mockResolvedValue({
      tier: "starter",
      status: "active",
      teamWorkspaceId: null,
    });
    const top = Array.from({ length: 50 }, (_, i) => ({ niche_id: `n${i}` }));
    fake.on(
      "niche_snapshots",
      { data: { snapshot_date: "2026-09-27" } }, // capped: latest date
      { data: top }, // top 50 ids
      { count: 180 }, // total niches
      { data: { snapshot_date: "2026-09-27" } }, // page: latest date
      { data: [snapshotRow("n0", 90)], count: 50 },
    );

    const page = await listNiches(ctx, { sort: "trend", page: 1 });

    expect(page.lockedCount).toBe(130);
    const pageQuery = fake.queriesFor("niche_snapshots")[4];
    expect(callsOf(pageQuery, "in")).toEqual([["niche_id", top.map((t) => t.niche_id)]]);
  });

  it("returns an empty page before the first snapshot", async () => {
    fake.on("niche_snapshots", { data: null });
    const page = await listNiches(ctx, { sort: "score", page: 1 });
    expect(page).toMatchObject({ items: [], total: 0, snapshotDate: null });
  });

  it("serves a cached page without querying", async () => {
    const cachedPage = {
      items: [],
      total: 0,
      page: 1,
      pageSize: 24,
      snapshotDate: "x",
      lockedCount: 0,
    };
    redisGet.mockResolvedValueOnce("v1").mockResolvedValueOnce(cachedPage);
    expect(await listNiches(ctx, { sort: "score", page: 1 })).toEqual(cachedPage);
    expect(fake.client.from).not.toHaveBeenCalled();
  });
});

describe("listFeedChannels", () => {
  const channelRow = {
    id: "c1",
    youtube_channel_id: "UC1",
    name: "Mafia Tales",
    avatar_url: null,
    subscriber_count: 8_000,
    video_count: 40,
    total_view_count: 2_000_000,
    avg_views_recent: 37_600,
    median_views_recent: 160_000,
    outlier_score: 4.7,
    youtube_created_at: new Date(Date.now() - 100 * 86_400_000).toISOString(),
    first_upload_at: null,
    discovered_at: "2026-09-20T00:00:00Z",
    is_faceless: true,
    likely_monetized: true,
    content_type: "long",
    language: "en",
    country: "US",
    views_last_30d: 90_000,
    tags: [
      { is_primary: false, niches: { slug: "true-crime", name: "True Crime" } },
      { is_primary: true, niches: { slug: "mafia-history", name: "Mafia History" } },
    ],
  };
  const recentVideos = Array.from({ length: 6 }, (_, i) => ({
    id: `vid-${i}`,
    channel_id: "c1",
    youtube_video_id: `v${i}`,
    title: `Video ${i}`,
    thumbnail_url: "t",
    view_count: 1_000 - i * 100,
    like_count: 10,
    comment_count: 1,
    published_at: new Date(Date.now() - (i + 1) * 86_400_000).toISOString(),
    outlier_multiple: i === 0 ? 5 : 1,
  }));

  it("applies filters (niche via channel_niches), hot/warm only, and builds the card data", async () => {
    fake.on("niches", { data: { id: "n1" } });
    fake.on("channels", { data: [channelRow], count: 1 });
    fake.on("videos", { data: recentVideos });
    fake.on("channel_view_snapshots", { data: [] });

    const page = await listFeedChannels({
      niche: "mafia-history",
      faceless: true,
      excludeKids: true,
      minSubs: 1_000,
      country: "US",
      contentType: "long",
      q: "50%_off",
      sort: "avg_views",
      page: 2,
    });

    const query = fake.queriesFor("channels")[0];
    expect(callsOf(query, "in")).toContainEqual(["refresh_tier", ["hot", "warm"]]);
    // A join, not an id list: any of the channel's niches (D-077).
    expect(callsOf(query, "in")).toContainEqual(["match.niche_id", ["n1"]]);
    expect(callsOf(query, "eq")).toContainEqual(["is_faceless", true]);
    expect(callsOf(query, "eq")).toContainEqual(["country", "US"]);
    expect(callsOf(query, "eq")).toContainEqual(["content_type", "long"]);
    expect(callsOf(query, "ilike")).toContainEqual(["name", "%50\\%\\_off%"]);
    expect(callsOf(query, "or")).toContainEqual(["made_for_kids.is.null,made_for_kids.eq.false"]);
    expect(callsOf(query, "gte")).toContainEqual(["subscriber_count", 1_000]);
    expect(callsOf(query, "order")[0]).toEqual([
      "avg_views_recent",
      { ascending: false, nullsFirst: false },
    ]);
    expect(callsOf(query, "range")).toEqual([[24, 47]]);

    const channel = page.items[0]!;
    expect(channel).toMatchObject({
      outlierScore: 4.7,
      daysSinceStart: 100,
      medianViewsRecent: 160_000,
      contentType: "long",
      viewsToSubs: 20,
      views30d: { kind: "uploads", value: 90_000 },
    });
    expect(channel.niches.map((n) => n.slug)).toEqual(["mafia-history", "true-crime"]);
    expect(channel.topVideos.map((v) => v.youtubeVideoId)).toEqual(["v0", "v1", "v2"]);
    expect(channel.topVideos.map((v) => v.isOutlier)).toEqual([true, false, false]);
    expect(channel.insights.map((i) => i.id)).toContain("breakout");
  });

  it("switches to true 30-day views once a month-old reading exists", async () => {
    fake.on("channels", { data: [channelRow], count: 1 });
    fake.on("videos", { data: recentVideos });
    fake.on("channel_view_snapshots", {
      data: [{ channel_id: "c1", snapshot_date: "2026-08-29", total_view_count: 1_600_000 }],
    });
    const page = await listFeedChannels({ sort: "outlier_score", page: 1 });
    expect(page.items[0]?.views30d).toEqual({ kind: "true", value: 400_000 });
  });

  it("returns nothing for an unknown niche slug", async () => {
    fake.on("niches", { data: null });
    const page = await listFeedChannels({ niche: "nope", sort: "newest", page: 1 });
    expect(page.items).toEqual([]);
    expect(fake.queriesFor("channels")).toHaveLength(0);
  });
});

describe("listGlobalOutliers", () => {
  it("maps rows into OutlierCard's shape with the baseline derived from the multiple", async () => {
    fake.on("outliers_feed", {
      data: [
        {
          video_id: "vid-db",
          outlier_multiple: 5,
          detected_at: "2026-09-25T00:00:00Z",
          videos: {
            id: "vid-db",
            youtube_video_id: "yt1",
            title: "Breakout",
            thumbnail_url: "t",
            view_count: 50_000,
            published_at: "2026-09-20T00:00:00Z",
          },
          channels: { id: "c1", name: "Mafia Tales", avatar_url: null },
          niches: { slug: "mafia-history", name: "Mafia History" },
        },
      ],
      count: 1,
    });

    const page = await listGlobalOutliers({ withinDays: 7, page: 1 });

    expect(page.items[0]).toMatchObject({
      videoId: "vid-db",
      youtubeVideoId: "yt1",
      baseline: 10_000,
      outlierScore: 5,
      niche: { slug: "mafia-history", name: "Mafia History" },
    });
    expect(callsOf(fake.queriesFor("outliers_feed")[0], "gte")[0]).toEqual(["outlier_multiple", 3]);
  });
});

describe("getNicheBySlug", () => {
  it("is not_found for an unknown slug", async () => {
    fake.on("niches", { data: null });
    expect(await getNicheBySlug(ctx, "nope")).toEqual({ ok: false, error: { type: "not_found" } });
  });

  it("is locked for a capped plan outside the top 50", async () => {
    getEffectivePlan.mockResolvedValue({
      tier: "starter",
      status: "active",
      teamWorkspaceId: null,
    });
    fake.on("niches", {
      data: { id: "n99", slug: "x", name: "X", description: null, status: "active" },
    });
    fake.on(
      "niche_snapshots",
      { data: { snapshot_date: "2026-09-27" } },
      { data: [{ niche_id: "n1" }] },
    );
    expect(await getNicheBySlug(ctx, "x")).toEqual({ ok: false, error: { type: "locked" } });
  });
});
