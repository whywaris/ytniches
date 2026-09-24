import { describe, expect, it } from "vitest";

import {
  chooseNextStep,
  groupUploadsByChannel,
  type NextStepState,
  type RecentUpload,
} from "@/lib/dashboard";

const BASE: NextStepState = {
  trackedChannelCount: 3,
  promptCount: 2,
  hasWorkspace: false,
  calendarEntryCount: null,
  topOutlier: null,
};
const OUTLIER = { channelId: "chan-1", videoId: "vid-1", videoTitle: "Why Rome fell" };

describe("chooseNextStep", () => {
  it("sends a user with no tracked channels to Niche Finder", () => {
    const step = chooseNextStep({ ...BASE, trackedChannelCount: 0, promptCount: 0 });
    expect(step.id).toBe("find_niche");
    expect(step.href).toBe("/niches");
  });

  it("no tracked channels wins even if prompts exist", () => {
    expect(chooseNextStep({ ...BASE, trackedChannelCount: 0 }).id).toBe("find_niche");
  });

  it("deep-links the top outlier into prompts when tracking but no prompts yet", () => {
    const step = chooseNextStep({ ...BASE, promptCount: 0, topOutlier: OUTLIER });
    expect(step.id).toBe("extract_outlier");
    expect(step.href).toBe("/prompts?channelId=chan-1&videoId=vid-1");
    expect(step.body).toContain("Why Rome fell");
  });

  it("falls back to plain /prompts when there's no outlier to deep-link", () => {
    const step = chooseNextStep({ ...BASE, promptCount: 0, topOutlier: null });
    expect(step.id).toBe("generate_prompt");
    expect(step.href).toBe("/prompts");
  });

  it("sends a workspace user with prompts but no calendar entries to the calendar", () => {
    const step = chooseNextStep({ ...BASE, hasWorkspace: true, calendarEntryCount: 0 });
    expect(step.id).toBe("plan_video");
    expect(step.href).toBe("/calendar");
  });

  it("skips the calendar step for users without a workspace", () => {
    const step = chooseNextStep({ ...BASE, hasWorkspace: false, calendarEntryCount: null });
    expect(step.id).toBe("see_outliers");
  });

  it("defaults to outliers once everything is set up", () => {
    const step = chooseNextStep({ ...BASE, hasWorkspace: true, calendarEntryCount: 4 });
    expect(step.id).toBe("see_outliers");
    expect(step.href).toBe("/outliers");
  });
});

function upload(channelId: string, videoId: string, publishedAt: string): RecentUpload {
  return {
    channelId,
    videoId,
    title: videoId,
    thumbnailUrl: `https://img/${videoId}`,
    publishedAt,
  };
}

const CHANNELS = [
  { id: "a", name: "Alpha", avatarUrl: null },
  { id: "b", name: "Bravo", avatarUrl: "https://img/b" },
  { id: "c", name: "Charlie", avatarUrl: null },
];

describe("groupUploadsByChannel", () => {
  it("collapses a channel's uploads into one row with the right count", () => {
    const groups = groupUploadsByChannel(
      [
        upload("a", "a1", "2026-09-20T00:00:00Z"),
        upload("a", "a2", "2026-09-21T00:00:00Z"),
        upload("b", "b1", "2026-09-19T00:00:00Z"),
      ],
      CHANNELS,
    );
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.channelId === "a")).toMatchObject({
      channelName: "Alpha",
      uploadCount: 2,
    });
    expect(groups.find((g) => g.channelId === "b")).toMatchObject({
      channelName: "Bravo",
      channelAvatarUrl: "https://img/b",
      uploadCount: 1,
    });
  });

  it("keeps the 3 newest thumbnails, newest first, while counting all", () => {
    const [group] = groupUploadsByChannel(
      [
        upload("a", "a1", "2026-09-18T00:00:00Z"),
        upload("a", "a4", "2026-09-21T00:00:00Z"),
        upload("a", "a2", "2026-09-19T00:00:00Z"),
        upload("a", "a3", "2026-09-20T00:00:00Z"),
      ],
      CHANNELS,
    );
    expect(group.uploadCount).toBe(4);
    expect(group.latestUploads.map((u) => u.videoId)).toEqual(["a4", "a3", "a2"]);
    expect(group.latestPublishedAt).toBe("2026-09-21T00:00:00Z");
  });

  it("orders channels by their most recent upload", () => {
    const groups = groupUploadsByChannel(
      [
        upload("a", "a1", "2026-09-18T00:00:00Z"),
        upload("b", "b1", "2026-09-22T00:00:00Z"),
        upload("a", "a2", "2026-09-20T00:00:00Z"),
      ],
      CHANNELS,
    );
    expect(groups.map((g) => g.channelId)).toEqual(["b", "a"]);
  });

  it("omits tracked channels with no uploads in the window", () => {
    const groups = groupUploadsByChannel([upload("a", "a1", "2026-09-20T00:00:00Z")], CHANNELS);
    expect(groups.map((g) => g.channelId)).toEqual(["a"]);
  });

  it("returns nothing when there are no uploads", () => {
    expect(groupUploadsByChannel([], CHANNELS)).toEqual([]);
  });
});
