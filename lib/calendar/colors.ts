// PRD.md §8.3's "color-coded by channel" -- channels have no color column
// (Backend-Schema.md has none, and adding one is out of scope here), so
// this hashes channelId into a small fixed palette instead. Same color
// every time for a given channel, no state to keep in sync.
const PALETTE = [
  "#10b981", // accent (matches Design-System.md's own accent green)
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#ef4444",
  "#06b6d4",
];

export function channelColor(channelId: string | null): string {
  if (!channelId) return "#6e6e73"; // text-tertiary gray for "no channel"
  let hash = 0;
  for (let i = 0; i < channelId.length; i++) {
    hash = (hash * 31 + channelId.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
