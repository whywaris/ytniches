import { z } from "zod";

// Trust boundary (CLAUDE.md §2.2): every YouTube Data API v3 response is
// validated here before anything downstream touches it. `.passthrough()`
// (not `.strict()`) deliberately — the real API has 40+ fields per resource
// and adds more over time; we only assert the shape of what we read, and
// let everything else through unvalidated rather than breaking on a
// YouTube-side addition.

const youtubeThumbnailSchema = z.object({ url: z.string() }).passthrough();

const youtubeThumbnailsSchema = z
  .object({
    default: youtubeThumbnailSchema.optional(),
    medium: youtubeThumbnailSchema.optional(),
    high: youtubeThumbnailSchema.optional(),
  })
  .passthrough();

// search.list?part=id&type=channel — 100 units regardless of `part`, so we
// only ask for `id` (TRD.md §5.3: never pay for fields we don't use).
export const YouTubeSearchResponseSchema = z
  .object({
    items: z.array(
      z
        .object({
          id: z
            .object({
              channelId: z.string(),
            })
            .passthrough(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export type YouTubeSearchResponse = z.infer<typeof YouTubeSearchResponseSchema>;

// channels.list?part=snippet,statistics,brandingSettings,contentDetails — 1
// unit. `contentDetails.relatedPlaylists.uploads` is the channel's uploads
// playlist ID — the cheap (1-unit, via playlistItems.list) way to enumerate
// a channel's videos, vs. search.list?type=video at 100 units.
export const YouTubeChannelResponseSchema = z
  .object({
    items: z.array(
      z
        .object({
          id: z.string(),
          snippet: z
            .object({
              title: z.string(),
              description: z.string().default(""),
              customUrl: z.string().optional(),
              publishedAt: z.string(),
              thumbnails: youtubeThumbnailsSchema.optional(),
              country: z.string().optional(),
              defaultLanguage: z.string().optional(),
            })
            .passthrough(),
          statistics: z
            .object({
              // YouTube returns these as strings; coerce to number here so
              // every downstream consumer gets a real number, not "12345".
              viewCount: z.coerce.number().default(0),
              subscriberCount: z.coerce.number().default(0),
              hiddenSubscriberCount: z.boolean().default(false),
              videoCount: z.coerce.number().default(0),
            })
            .passthrough(),
          brandingSettings: z
            .object({
              image: z
                .object({
                  bannerExternalUrl: z.string().optional(),
                })
                .passthrough()
                .optional(),
            })
            .passthrough()
            .optional(),
          contentDetails: z
            .object({
              relatedPlaylists: z
                .object({
                  uploads: z.string(),
                })
                .passthrough(),
            })
            .passthrough()
            .optional(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export type YouTubeChannelResponse = z.infer<typeof YouTubeChannelResponseSchema>;
export type YouTubeChannelItem = YouTubeChannelResponse["items"][number];

// videos.list?part=snippet,statistics,contentDetails — 1 unit, batched up
// to 50 IDs per call (TRD.md §5.3).
export const YouTubeVideoResponseSchema = z
  .object({
    items: z.array(
      z
        .object({
          id: z.string(),
          snippet: z
            .object({
              title: z.string(),
              description: z.string().default(""),
              publishedAt: z.string(),
              thumbnails: youtubeThumbnailsSchema.optional(),
              tags: z.array(z.string()).default([]),
              defaultLanguage: z.string().optional(),
              // Not needed by workers/channel-sync.ts (the channel is
              // already known from context there), but AI Prompts' "From
              // URL" entry path (Phase 1 Task 3) discovers a standalone
              // video with no prior channel context, so it needs this to
              // upsert the video's channel before the video itself
              // (videos.channel_id is a NOT NULL FK).
              channelId: z.string(),
              channelTitle: z.string().optional(),
            })
            .passthrough(),
          statistics: z
            .object({
              viewCount: z.coerce.number().default(0),
              likeCount: z.coerce.number().optional(),
              commentCount: z.coerce.number().optional(),
            })
            .passthrough()
            .optional(),
          contentDetails: z
            .object({
              // ISO 8601 duration ("PT12M34S") — parsed to seconds in
              // client.ts, not here; this schema only asserts the shape.
              duration: z.string(),
            })
            .passthrough(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export type YouTubeVideoResponse = z.infer<typeof YouTubeVideoResponseSchema>;
export type YouTubeVideoItem = YouTubeVideoResponse["items"][number];

// playlistItems.list?part=contentDetails&playlistId={uploads} — 1 unit.
// Cheap way to enumerate a channel's videos (see YouTubeChannelResponseSchema
// above) — this only gives video IDs; full details still come from
// videos.list (fetchVideosByIds).
export const YouTubePlaylistItemsResponseSchema = z
  .object({
    items: z.array(
      z
        .object({
          contentDetails: z
            .object({
              videoId: z.string(),
            })
            .passthrough(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export type YouTubePlaylistItemsResponse = z.infer<typeof YouTubePlaylistItemsResponseSchema>;
