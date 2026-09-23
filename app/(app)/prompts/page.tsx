import { getRequestContext } from "@/lib/context";
import { listVideosForChannel } from "@/lib/services/channels";
import { listPrompts } from "@/lib/services/prompts";
import { listTrackedChannelsSummary } from "@/lib/services/tracking";
import { PromptsClient } from "@/app/(app)/prompts/prompts-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompts — YTNiches",
};

const LIBRARY_PAGE_SIZE = 20;

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

// UI-UX-Flow.md §7.1: two-panel landing (library + generator entry). A
// Server Component for the first paint, same split as tracking/page.tsx --
// the interactive layer (search, tabs, generate, discard) lives in
// prompts-client.tsx.
//
// ?channelId=&videoId= is PRD.md §7.1's "one-click extract prompts from
// this outlier" deep link (Phase 2 Task 1) -- the video list is fetched
// here, server-side, same as listTopVideosForChannelAction's own query, so
// the generator form opens with the channel/video already picked instead
// of a client-side round trip after mount.
export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const channelId = getParam(params, "channelId");
  const videoId = getParam(params, "videoId");

  const ctx = await getRequestContext();
  const [prompts, trackedChannels, videos] = await Promise.all([
    listPrompts(ctx, { limit: LIBRARY_PAGE_SIZE }),
    listTrackedChannelsSummary(ctx),
    channelId ? listVideosForChannel(channelId, { sortBy: "views", limit: 10 }) : null,
  ]);

  return (
    <PromptsClient
      initialPrompts={prompts}
      trackedChannels={trackedChannels.map((channel) => ({ id: channel.id, name: channel.name }))}
      preselect={
        channelId && videoId && videos
          ? {
              channelId,
              videoId,
              videos: videos.map((video) => ({
                id: video.id,
                title: video.title,
                viewCount: video.viewCount,
              })),
            }
          : undefined
      }
    />
  );
}
