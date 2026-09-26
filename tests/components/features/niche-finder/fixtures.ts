import type { FeedChannel, NicheFeedItem } from "@/lib/services/niche-feed";

export const NICHE: NicheFeedItem = {
  id: "n1",
  slug: "mafia-history",
  name: "Mafia History",
  description: "Organised crime families told as documentaries.",
  status: "rising",
  score: 84,
  label: "low",
  trend: 12,
  whyChips: ["62% small channels ranking", "4 new channels breaking out"],
  channelCount: 38,
  newChannels30d: 4,
  medianViews: 18_400,
  thumbnails: [1, 2, 3].map((i) => ({
    videoId: `vid-${i}`,
    channelId: "c1",
    youtubeVideoId: `yt${i}`,
    title: `Breakout video ${i}`,
    thumbnailUrl: `https://i.ytimg.com/vi/yt${i}/hqdefault.jpg`,
  })),
};

export const CHANNEL: FeedChannel = {
  id: "c1",
  youtubeChannelId: "UC1",
  name: "Mafia Tales",
  avatarUrl: null,
  subscriberCount: 8_200,
  videoCount: 41,
  avgViewsRecent: 38_500,
  outlierScore: 4.7,
  youtubeCreatedAt: "2026-03-01T00:00:00Z",
  daysSinceStart: 209,
  isFaceless: true,
  likelyMonetized: true,
  hasShorts: false,
  language: "en",
  niche: { slug: "mafia-history", name: "Mafia History" },
  popularVideos: [1, 2, 3, 4].map((i) => ({
    youtubeVideoId: `pv${i}`,
    title: `The Gambino story part ${i}`,
    thumbnailUrl: `https://i.ytimg.com/vi/pv${i}/hqdefault.jpg`,
    viewCount: 400_000 / i,
    publishedAt: "2026-09-01T00:00:00Z",
  })),
};
