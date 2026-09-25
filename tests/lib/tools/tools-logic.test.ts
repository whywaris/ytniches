import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { embedCode, embedSrc, rssFeedUrl, subscribeLink } from "@/lib/tools/builders";
import { TOOLS } from "@/lib/tools/registry";
import {
  coverCrop,
  encodeUnderLimit,
  MAX_OUTPUT_BYTES,
  type OutputType,
} from "@/lib/tools/thumbnail";
import {
  parseChannelInput,
  parsePlaylistId,
  parseStartTime,
  parseVideoInput,
} from "@/lib/youtube/urls";

const ID = "UC_x5XG1OV2P6uZZ5FSM9Ttw";

describe("parseChannelInput", () => {
  it.each([
    [`https://www.youtube.com/channel/${ID}`, { kind: "id", id: ID }],
    [`youtube.com/channel/${ID}/videos?view=0`, { kind: "id", id: ID }],
    [ID, { kind: "id", id: ID }],
    ["@SleepSounds", { kind: "handle", handle: "SleepSounds" }],
    ["https://m.youtube.com/@SleepSounds/videos", { kind: "handle", handle: "SleepSounds" }],
    ["http://youtube.com/@SleepSounds?si=abc", { kind: "handle", handle: "SleepSounds" }],
  ])("parses %s", (input, expected) => {
    expect(parseChannelInput(input)).toEqual(expected);
  });

  it.each([
    "https://youtube.com/c/Legacy",
    "https://youtube.com/user/Legacy",
    "https://example.com/@someone",
    "UCtooShort",
    "@has space",
    "",
  ])("rejects %s", (input) => {
    expect(parseChannelInput(input)).toBeNull();
  });
});

describe("parseVideoInput / parseStartTime", () => {
  it.each([
    ["https://youtu.be/4oxA9o_OmWo?t=90", { id: "4oxA9o_OmWo", start: 90 }],
    ["https://www.youtube.com/watch?v=4oxA9o_OmWo&t=1m30s", { id: "4oxA9o_OmWo", start: 90 }],
    ["youtube.com/shorts/4oxA9o_OmWo", { id: "4oxA9o_OmWo" }],
    ["https://www.youtube.com/live/4oxA9o_OmWo", { id: "4oxA9o_OmWo" }],
    ["https://www.youtube-nocookie.com/embed/4oxA9o_OmWo?start=5", { id: "4oxA9o_OmWo", start: 5 }],
    ["4oxA9o_OmWo", { id: "4oxA9o_OmWo" }],
  ])("parses %s", (input, expected) => {
    expect(parseVideoInput(input)).toEqual(expected);
  });

  it("rejects channel links and other sites", () => {
    expect(parseVideoInput(`https://youtube.com/channel/${ID}`)).toBeNull();
    expect(parseVideoInput("https://vimeo.com/123")).toBeNull();
  });

  it.each([
    ["90", 90],
    ["90s", 90],
    ["1m30s", 90],
    ["1:30", 90],
    ["1:02:03", 3723],
    ["1h", 3600],
    ["abc", null],
    ["", null],
  ])("start %s -> %s", (input, expected) => {
    expect(parseStartTime(input)).toBe(expected);
  });

  it("finds playlist IDs in playlist and watch links", () => {
    expect(parsePlaylistId("https://www.youtube.com/playlist?list=PLabc123DEF456")).toBe(
      "PLabc123DEF456",
    );
    expect(parsePlaylistId("https://youtube.com/watch?v=4oxA9o_OmWo&list=PLxyz_987654321")).toBe(
      "PLxyz_987654321",
    );
    expect(parsePlaylistId("@someone")).toBeNull();
  });
});

describe("builders", () => {
  it("builds subscribe and RSS links from a channel ID", () => {
    expect(subscribeLink(ID)).toBe(`https://www.youtube.com/channel/${ID}?sub_confirmation=1`);
    expect(rssFeedUrl({ kind: "channel", id: ID })).toBe(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${ID}`,
    );
    expect(rssFeedUrl({ kind: "playlist", id: "PLabc" })).toBe(
      "https://www.youtube.com/feeds/videos.xml?playlist_id=PLabc",
    );
  });

  const base = {
    videoId: "4oxA9o_OmWo",
    autoplay: false,
    controls: true,
    privacyEnhanced: false,
    responsive: false,
  };

  it("mutes whenever autoplay is on", () => {
    expect(embedSrc({ ...base, autoplay: true })).toBe(
      "https://www.youtube.com/embed/4oxA9o_OmWo?autoplay=1&mute=1",
    );
  });

  it("uses youtube-nocookie in privacy mode, and adds start and controls=0", () => {
    expect(embedSrc({ ...base, privacyEnhanced: true, controls: false, start: 90 })).toBe(
      "https://www.youtube-nocookie.com/embed/4oxA9o_OmWo?start=90&controls=0",
    );
  });

  it("wraps the iframe for responsive embeds, fixed size otherwise", () => {
    expect(embedCode(base)).toContain('width="560" height="315"');
    expect(embedCode({ ...base, responsive: true })).toMatch(
      /^<div style="[^"]*aspect-ratio:16\/9/,
    );
  });
});

describe("thumbnail", () => {
  it("crops wide images from the center to 16:9", () => {
    expect(coverCrop(3000, 1000)).toEqual({ sx: 611, sy: 0, sw: 1778, sh: 1000 });
  });

  it("crops tall images from the center to 16:9", () => {
    expect(coverCrop(1080, 1920)).toEqual({ sx: 0, sy: 656, sw: 1080, sh: 608 });
  });

  it("leaves an exact 16:9 image uncropped", () => {
    expect(coverCrop(1920, 1080)).toEqual({ sx: 0, sy: 0, sw: 1920, sh: 1080 });
  });

  const blobOf = (bytes: number) => new Blob([new Uint8Array(bytes)]);

  it("keeps a PNG when it fits under 2MB", async () => {
    const result = await encodeUnderLimit(async () => blobOf(1000), "image/png");
    expect(result).toMatchObject({ type: "image/png", convertedToJpeg: false });
  });

  it("falls back to JPG when the PNG is over 2MB", async () => {
    const encode = async (type: OutputType) =>
      blobOf(type === "image/png" ? MAX_OUTPUT_BYTES + 1 : 500_000);
    const result = await encodeUnderLimit(encode, "image/png");
    expect(result).toMatchObject({ type: "image/jpeg", quality: 0.92, convertedToJpeg: true });
  });

  it("steps JPG quality down until the file fits", async () => {
    const sizes: Record<string, number> = { "0.92": 3e6, "0.85": 2.5e6, "0.75": 1.9e6 };
    const result = await encodeUnderLimit(
      async (_type, quality) => blobOf(sizes[String(quality)] ?? 1e6),
      "image/jpeg",
    );
    expect(result.quality).toBe(0.75);
    expect(result.blob.size).toBeLessThanOrEqual(MAX_OUTPUT_BYTES);
  });
});

describe("tool registry", () => {
  const OLD_SITE_SLUGS = [
    "youtube-subscribe-link-generator",
    "rss-feed-generator",
    "youtube-embed-code-generator",
    "thumbnail-resizer",
  ];

  it("keeps the old site's exact URLs for the four tools it already had", () => {
    for (const slug of OLD_SITE_SLUGS) expect(TOOLS.map((tool) => tool.slug)).toContain(slug);
  });

  it.each(TOOLS)("$slug has a root route, 4–6 FAQs and valid related tools", (tool) => {
    expect(existsSync(path.join(process.cwd(), "app", "(marketing)", tool.slug, "page.tsx"))).toBe(
      true,
    );
    expect(tool.faq.length).toBeGreaterThanOrEqual(4);
    expect(tool.faq.length).toBeLessThanOrEqual(6);
    for (const related of tool.related) {
      expect(related).not.toBe(tool.slug);
      expect(TOOLS.map((other) => other.slug)).toContain(related);
    }
  });

  it("gives every tool a unique SEO title and description", () => {
    expect(new Set(TOOLS.map((tool) => tool.seoTitle)).size).toBe(TOOLS.length);
    expect(new Set(TOOLS.map((tool) => tool.seoDescription)).size).toBe(TOOLS.length);
  });
});
