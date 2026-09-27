// PRD.md §8.3's "color-coded by channel" -- channels have no color column
// (Backend-Schema.md has none, and adding one is out of scope here), so
// this hashes channelId into a small fixed palette instead. Same color
// every time for a given channel, no state to keep in sync.
//
// Entry labels are near-black (text-inverse) on these, so every colour must
// clear 4.5:1 against #0a0a0b (tests/lib/calendar/colors.test.ts).
export const PALETTE = [
  "#ff5a2e", // brand orange, the accent (D-068)
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#a78bfa",
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
