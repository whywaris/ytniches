// Compact counts for cards and tiles ("37.6K", "1.2M"). Same output as the
// per-file copies elsewhere in the app, shared by the discovery UI.
export function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

// Outlier multiples as competitors show them: "4.7x".
export function formatMultiple(value: number): string {
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)}x`;
}
