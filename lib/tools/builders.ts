// Pure builders for the client-side free tools (D-014). No I/O.

export function subscribeLink(channelId: string): string {
  return `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`;
}

export type FeedSource = { kind: "channel"; id: string } | { kind: "playlist"; id: string };

export function rssFeedUrl(source: FeedSource): string {
  const param = source.kind === "channel" ? "channel_id" : "playlist_id";
  return `https://www.youtube.com/feeds/videos.xml?${param}=${source.id}`;
}

export interface EmbedOptions {
  videoId: string;
  start?: number;
  autoplay: boolean;
  controls: boolean;
  privacyEnhanced: boolean;
  responsive: boolean;
}

export function embedSrc(options: EmbedOptions): string {
  const host = options.privacyEnhanced ? "www.youtube-nocookie.com" : "www.youtube.com";
  const params = new URLSearchParams();
  if (options.start) params.set("start", String(Math.floor(options.start)));
  // Browsers block autoplay with sound, so autoplay only works muted.
  if (options.autoplay) {
    params.set("autoplay", "1");
    params.set("mute", "1");
  }
  if (!options.controls) params.set("controls", "0");
  const query = params.toString();
  return `https://${host}/embed/${options.videoId}${query ? `?${query}` : ""}`;
}

export function embedCode(options: EmbedOptions): string {
  const iframe = [
    "<iframe",
    options.responsive
      ? '  style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"'
      : '  width="560" height="315" style="border:0"',
    `  src="${embedSrc(options)}"`,
    '  title="YouTube video player"',
    '  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"',
    '  referrerpolicy="strict-origin-when-cross-origin"',
    "  allowfullscreen></iframe>",
  ].join("\n");
  if (!options.responsive) return iframe;
  return `<div style="position:relative;width:100%;aspect-ratio:16/9">\n${iframe}\n</div>`;
}
