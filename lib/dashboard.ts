// Pure dashboard logic (UI-UX-Flow.md §4.5) -- no I/O, so the branch and
// grouping rules are testable without mocking Supabase.

export interface NextStepState {
  trackedChannelCount: number;
  promptCount: number;
  hasWorkspace: boolean;
  /** null when the user has no workspace (count isn't fetched). */
  calendarEntryCount: number | null;
  /** Top outlier from the last 7 days, else the last 30; null if none. */
  topOutlier: { channelId: string; videoId: string; videoTitle: string } | null;
}

export interface NextStep {
  id: "find_niche" | "extract_outlier" | "generate_prompt" | "plan_video" | "see_outliers";
  title: string;
  body: string;
  cta: string;
  href: string;
}

export function chooseNextStep(state: NextStepState): NextStep {
  if (state.trackedChannelCount === 0) {
    return {
      id: "find_niche",
      title: "Find your niche",
      body: "Search channels by the metrics that matter, then track the ones worth watching.",
      cta: "Open Niche Finder",
      href: "/niches",
    };
  }

  if (state.promptCount === 0) {
    if (state.topOutlier) {
      const { channelId, videoId, videoTitle } = state.topOutlier;
      return {
        id: "extract_outlier",
        title: "Turn your top outlier into ideas",
        body: `“${videoTitle}” is beating its channel’s baseline. Extract titles, hooks, and an outline from it.`,
        cta: "Extract prompts",
        href: `/prompts?channelId=${encodeURIComponent(channelId)}&videoId=${encodeURIComponent(videoId)}`,
      };
    }
    return {
      id: "generate_prompt",
      title: "Generate prompts from any video",
      body: "No outliers yet from your tracked channels. Paste any video URL to get started.",
      cta: "Generate prompts",
      href: "/prompts",
    };
  }

  if (state.hasWorkspace && state.calendarEntryCount === 0) {
    return {
      id: "plan_video",
      title: "Plan your next video",
      body: "You have prompts saved. Put the next video on the calendar so it actually ships.",
      cta: "Open Calendar",
      href: "/calendar",
    };
  }

  return {
    id: "see_outliers",
    title: "See what’s breaking out",
    body: "Check which videos in your tracked channels are beating their baseline right now.",
    cta: "View outliers",
    href: "/outliers",
  };
}

export interface RecentUpload {
  videoId: string;
  channelId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface ChannelSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface ChannelUploadGroup {
  channelId: string;
  channelName: string;
  channelAvatarUrl: string | null;
  uploadCount: number;
  latestUploads: RecentUpload[];
  latestPublishedAt: string;
}

// One row per channel that uploaded in the window: count + newest
// thumbnails, channels ordered by their most recent upload. A tracked
// channel with no uploads in the window simply never appears.
export function groupUploadsByChannel(
  uploads: RecentUpload[],
  channels: ChannelSummary[],
  thumbnailsPerChannel = 3,
): ChannelUploadGroup[] {
  const channelById = new Map(channels.map((channel) => [channel.id, channel]));
  const byChannel = new Map<string, RecentUpload[]>();
  for (const upload of uploads) {
    const list = byChannel.get(upload.channelId) ?? [];
    list.push(upload);
    byChannel.set(upload.channelId, list);
  }

  return [...byChannel.entries()]
    .map(([channelId, list]) => {
      const sorted = [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      const channel = channelById.get(channelId);
      return {
        channelId,
        channelName: channel?.name ?? "Unknown channel",
        channelAvatarUrl: channel?.avatarUrl ?? null,
        uploadCount: sorted.length,
        latestUploads: sorted.slice(0, thumbnailsPerChannel),
        latestPublishedAt: sorted[0].publishedAt,
      };
    })
    .sort((a, b) => b.latestPublishedAt.localeCompare(a.latestPublishedAt));
}
