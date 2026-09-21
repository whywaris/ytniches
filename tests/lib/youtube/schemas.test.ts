import { describe, expect, it } from "vitest";

import {
  YouTubeChannelResponseSchema,
  YouTubePlaylistItemsResponseSchema,
  YouTubeSearchResponseSchema,
  YouTubeVideoResponseSchema,
} from "@/lib/youtube/schemas";

describe("YouTubeSearchResponseSchema", () => {
  it("parses a valid search.list response", () => {
    const result = YouTubeSearchResponseSchema.parse({
      items: [{ id: { channelId: "UC123" } }, { id: { channelId: "UC456" } }],
    });
    expect(result.items.map((item) => item.id.channelId)).toEqual(["UC123", "UC456"]);
  });

  it("passes through unknown top-level and nested fields instead of failing", () => {
    const result = YouTubeSearchResponseSchema.parse({
      kind: "youtube#searchListResponse",
      nextPageToken: "abc",
      items: [
        {
          kind: "youtube#searchResult",
          etag: "xyz",
          id: { kind: "youtube#channel", channelId: "UC123" },
        },
      ],
    });
    expect(result.items[0].id.channelId).toBe("UC123");
  });

  it("rejects an item missing channelId", () => {
    expect(() => YouTubeSearchResponseSchema.parse({ items: [{ id: {} }] })).toThrow();
  });
});

describe("YouTubeChannelResponseSchema", () => {
  const validItem = {
    id: "UC123",
    snippet: {
      title: "Sleep Sounds Daily",
      publishedAt: "2020-01-01T00:00:00Z",
    },
    statistics: {
      viewCount: "912000",
      subscriberCount: "482000",
      videoCount: "310",
    },
  };

  it("coerces stringified statistics into numbers", () => {
    const result = YouTubeChannelResponseSchema.parse({ items: [validItem] });
    const stats = result.items[0].statistics;
    expect(stats.viewCount).toBe(912000);
    expect(stats.subscriberCount).toBe(482000);
    expect(stats.videoCount).toBe(310);
    expect(typeof stats.viewCount).toBe("number");
  });

  it("defaults hiddenSubscriberCount to false and description to empty string when absent", () => {
    const result = YouTubeChannelResponseSchema.parse({ items: [validItem] });
    expect(result.items[0].statistics.hiddenSubscriberCount).toBe(false);
    expect(result.items[0].snippet.description).toBe("");
  });

  it("accepts optional brandingSettings and thumbnails without requiring them", () => {
    const result = YouTubeChannelResponseSchema.parse({
      items: [
        {
          ...validItem,
          snippet: {
            ...validItem.snippet,
            thumbnails: { high: { url: "https://example.com/avatar.jpg" } },
          },
          brandingSettings: { image: { bannerExternalUrl: "https://example.com/banner.jpg" } },
        },
      ],
    });
    expect(result.items[0].snippet.thumbnails?.high?.url).toBe("https://example.com/avatar.jpg");
    expect(result.items[0].brandingSettings?.image?.bannerExternalUrl).toBe(
      "https://example.com/banner.jpg",
    );
  });

  it("rejects an item missing required snippet.title", () => {
    expect(() =>
      YouTubeChannelResponseSchema.parse({
        items: [{ id: "UC123", snippet: { publishedAt: "2020-01-01T00:00:00Z" }, statistics: {} }],
      }),
    ).toThrow();
  });

  it("passes through unknown fields like topicDetails, status, etc.", () => {
    const result = YouTubeChannelResponseSchema.parse({
      items: [
        {
          ...validItem,
          topicDetails: { topicCategories: ["x"] },
          status: { privacyStatus: "public" },
        },
      ],
    });
    expect(result.items[0].id).toBe("UC123");
  });

  it("parses the uploads playlist ID from contentDetails when present", () => {
    const result = YouTubeChannelResponseSchema.parse({
      items: [{ ...validItem, contentDetails: { relatedPlaylists: { uploads: "UU123" } } }],
    });
    expect(result.items[0].contentDetails?.relatedPlaylists.uploads).toBe("UU123");
  });

  it("allows contentDetails to be absent (older callers, other part combinations)", () => {
    const result = YouTubeChannelResponseSchema.parse({ items: [validItem] });
    expect(result.items[0].contentDetails).toBeUndefined();
  });
});

describe("YouTubeVideoResponseSchema", () => {
  const validItem = {
    id: "vid123",
    snippet: {
      title: "How to pick a faceless niche",
      publishedAt: "2024-05-01T00:00:00Z",
    },
    contentDetails: { duration: "PT12M34S" },
  };

  it("parses a valid videos.list response", () => {
    const result = YouTubeVideoResponseSchema.parse({ items: [validItem] });
    expect(result.items[0].id).toBe("vid123");
    expect(result.items[0].contentDetails.duration).toBe("PT12M34S");
  });

  it("defaults tags to an empty array and description to empty string when absent", () => {
    const result = YouTubeVideoResponseSchema.parse({ items: [validItem] });
    expect(result.items[0].snippet.tags).toEqual([]);
    expect(result.items[0].snippet.description).toBe("");
  });

  it("coerces statistics counts to numbers when present", () => {
    const result = YouTubeVideoResponseSchema.parse({
      items: [
        {
          ...validItem,
          statistics: { viewCount: "91200", likeCount: "4300", commentCount: "120" },
        },
      ],
    });
    expect(result.items[0].statistics).toEqual({
      viewCount: 91200,
      likeCount: 4300,
      commentCount: 120,
    });
  });

  it("allows statistics to be entirely absent (rare, view count hidden)", () => {
    const result = YouTubeVideoResponseSchema.parse({ items: [validItem] });
    expect(result.items[0].statistics).toBeUndefined();
  });

  it("rejects an item missing contentDetails.duration", () => {
    expect(() =>
      YouTubeVideoResponseSchema.parse({
        items: [{ id: "vid123", snippet: validItem.snippet, contentDetails: {} }],
      }),
    ).toThrow();
  });
});

describe("YouTubePlaylistItemsResponseSchema", () => {
  it("parses a valid playlistItems.list response into video IDs", () => {
    const result = YouTubePlaylistItemsResponseSchema.parse({
      items: [{ contentDetails: { videoId: "vid1" } }, { contentDetails: { videoId: "vid2" } }],
    });
    expect(result.items.map((item) => item.contentDetails.videoId)).toEqual(["vid1", "vid2"]);
  });

  it("passes through unknown fields", () => {
    const result = YouTubePlaylistItemsResponseSchema.parse({
      kind: "youtube#playlistItemListResponse",
      items: [
        {
          snippet: { title: "x" },
          contentDetails: { videoId: "vid1", videoPublishedAt: "2024-01-01" },
        },
      ],
    });
    expect(result.items[0].contentDetails.videoId).toBe("vid1");
  });

  it("rejects an item missing contentDetails.videoId", () => {
    expect(() =>
      YouTubePlaylistItemsResponseSchema.parse({ items: [{ contentDetails: {} }] }),
    ).toThrow();
  });
});
