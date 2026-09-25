// Pure YouTube URL parsing -- no I/O, safe in client components. The
// server wrappers in lib/youtube/index.ts (resolveChannelUrl,
// resolveVideoUrl) and the free tools share these, so "what counts as a
// channel / video link" has exactly one definition.

export type ChannelInput = { kind: "id"; id: string } | { kind: "handle"; handle: string };

// A bare channel ID pasted on its own must look like a real one; inside a
// /channel/ URL any segment is accepted (the API will say if it's wrong).
const BARE_CHANNEL_ID = /^UC[\w-]{22}$/;
const BARE_VIDEO_ID = /^[\w-]{11}$/;

export function normalizeYoutubeUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.|m\.)/i, "")
    .replace(/\/+$/, "");
}

function pathSegments(normalized: string): string[] {
  return normalized
    .replace(/^youtube\.com\//i, "")
    .split(/[?#]/)[0]
    .split("/")
    .filter(Boolean);
}

// Accepts youtube.com/channel/<id>, youtube.com/@handle (plus any trailing
// tab like /videos), a bare @handle, or a bare UC… channel ID. Legacy
// /c/<name> and /user/<name> links aren't supported: they need a
// different, costlier lookup.
export function parseChannelInput(input: string): ChannelInput | null {
  const trimmed = input.trim();
  if (BARE_CHANNEL_ID.test(trimmed)) return { kind: "id", id: trimmed };

  if (trimmed.startsWith("@")) {
    const handle = trimmed.slice(1);
    return /^[^\s/?#@]+$/.test(handle) ? { kind: "handle", handle } : null;
  }

  const normalized = normalizeYoutubeUrl(trimmed);
  if (!/^youtube\.com\//i.test(normalized)) return null;

  const [first, second] = pathSegments(normalized);
  if (first === "channel" && second) return { kind: "id", id: second };
  if (first?.startsWith("@") && first.length > 1) {
    return { kind: "handle", handle: decodeURIComponent(first.slice(1)) };
  }
  return null;
}

export interface VideoInput {
  id: string;
  // Seconds, from a t= / start= parameter when the link carries one.
  start?: number;
}

// "90", "90s", "1m30s", "1h2m3s" or "1:30" / "1:02:03" -> seconds.
export function parseStartTime(value: string): number | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (/^\d+(:\d{1,2}){1,2}$/.test(trimmed)) {
    return trimmed.split(":").reduce((total, part) => total * 60 + Number(part), 0);
  }
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(trimmed);
  if (!match) return null;
  const [, h = "0", m = "0", s = "0"] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

export function parseVideoInput(input: string): VideoInput | null {
  const trimmed = input.trim();
  if (BARE_VIDEO_ID.test(trimmed)) return { id: trimmed };

  const normalized = normalizeYoutubeUrl(trimmed);
  const query = new URLSearchParams(normalized.split("?")[1]?.split("#")[0] ?? "");
  const startParam = query.get("t") ?? query.get("start");
  const start = startParam ? (parseStartTime(startParam) ?? undefined) : undefined;
  const withStart = (id: string): VideoInput => (start ? { id, start } : { id });

  if (/^youtu\.be\//i.test(normalized)) {
    const id = normalized.slice("youtu.be/".length).split(/[?#/]/)[0];
    return id ? withStart(id) : null;
  }
  if (!/^youtube(-nocookie)?\.com\//i.test(normalized)) return null;

  const [first, second] = pathSegments(
    normalized.replace(/^youtube-nocookie\.com\//i, "youtube.com/"),
  );
  if (first === "watch") {
    const id = query.get("v");
    return id ? withStart(id) : null;
  }
  if (["shorts", "live", "embed"].includes(first ?? "") && second) return withStart(second);
  return null;
}

// Any YouTube link carrying ?list=… (playlist page or a watch link inside
// a playlist), or a bare playlist ID. Used by the RSS feed generator.
export function parsePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (/^(PL|UU|LL|FL|OL)[\w-]{10,}$/.test(trimmed)) return trimmed;
  const normalized = normalizeYoutubeUrl(trimmed);
  if (!/^(youtube\.com|youtu\.be)\//i.test(normalized)) return null;
  const list = new URLSearchParams(normalized.split("?")[1]?.split("#")[0] ?? "").get("list");
  return list && /^[\w-]+$/.test(list) ? list : null;
}
