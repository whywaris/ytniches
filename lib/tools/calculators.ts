// Pure logic for the old-site tools rebuilt at their original URLs
// (D-055). No I/O; the pages run these in the browser.

// ---------- Thumbnail downloader (zero API calls) ----------

export interface ThumbnailOption {
  key: string;
  label: string;
  width: number;
  height: number;
  url: string;
}

// YouTube serves every video's thumbnails at fixed URLs. maxresdefault
// only exists when the uploader provided a large enough image; YouTube
// answers with a 120×90 placeholder otherwise, which the page detects.
export function thumbnailOptions(videoId: string): ThumbnailOption[] {
  const url = (name: string) => `https://i.ytimg.com/vi/${videoId}/${name}.jpg`;
  return [
    {
      key: "maxres",
      label: "Max resolution (HD)",
      width: 1280,
      height: 720,
      url: url("maxresdefault"),
    },
    { key: "sd", label: "Standard", width: 640, height: 480, url: url("sddefault") },
    { key: "hq", label: "High quality", width: 480, height: 360, url: url("hqdefault") },
    { key: "mq", label: "Medium", width: 320, height: 180, url: url("mqdefault") },
    { key: "default", label: "Small", width: 120, height: 90, url: url("default") },
  ];
}

// ---------- Watch time calculator ----------

// YouTube Partner Program's long-form route: 4,000 valid public watch
// hours in the last 12 months.
export const WATCH_HOURS_GOAL = 4_000;

export interface WatchTimeResult {
  hours: number;
  percentOfGoal: number;
  hoursRemaining: number;
}

export function watchTime(views: number, averageViewSeconds: number): WatchTimeResult {
  const hours = (views * averageViewSeconds) / 3600;
  return {
    hours,
    percentOfGoal: Math.min(100, (hours / WATCH_HOURS_GOAL) * 100),
    hoursRemaining: Math.max(0, WATCH_HOURS_GOAL - hours),
  };
}

// Views still needed to reach the goal at the same average view duration.
export function viewsToGoal(currentHours: number, averageViewSeconds: number): number | null {
  if (averageViewSeconds <= 0) return null;
  const remaining = Math.max(0, WATCH_HOURS_GOAL - currentHours);
  return Math.ceil((remaining * 3600) / averageViewSeconds);
}

// ---------- Revenue calculator (the creator's OWN RPM, never ours) ----------

// Wide on purpose: we don't publish "typical" RPMs, we only reject typos.
export const RPM_RANGE = { min: 0.01, max: 100 } as const;

export function isValidRpm(rpm: number): boolean {
  return Number.isFinite(rpm) && rpm >= RPM_RANGE.min && rpm <= RPM_RANGE.max;
}

// RPM is already what the creator earns per 1,000 views, after YouTube's
// share, so revenue is just views / 1000 × RPM.
export function estimateRevenue(views: number, rpm: number): number {
  return (views / 1000) * rpm;
}

// ---------- Timestamp (chapters) generator ----------

export interface Chapter {
  start: number;
  title: string;
}

const TIME = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})/;

function toSeconds(match: RegExpExecArray): number {
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m) * 60 + Number(s);
}

// One chapter per line, time first or last: "1:30 Intro", "Intro - 1:30".
export function parseChapterLines(text: string): { chapters: Chapter[]; unreadable: string[] } {
  const chapters: Chapter[] = [];
  const unreadable: string[] = [];
  for (const line of text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)) {
    const match = TIME.exec(line);
    const title = match
      ? line
          .replace(match[0], "")
          .replace(/^[\s\-–—:|.)\]]+|[\s\-–—:|.(\[]+$/g, "")
          .trim()
      : "";
    if (!match || !title || Number(match[3]) > 59) {
      unreadable.push(line);
      continue;
    }
    chapters.push({ start: toSeconds(match), title });
  }
  return { chapters: chapters.sort((a, b) => a.start - b.start), unreadable };
}

// YouTube only shows chapters when all of these hold.
export function chapterProblems(chapters: Chapter[]): string[] {
  const problems: string[] = [];
  if (chapters.length < 3) problems.push("YouTube needs at least 3 chapters.");
  if (chapters.length > 0 && chapters[0].start !== 0) {
    problems.push("The first chapter must start at 0:00.");
  }
  chapters.slice(1).forEach((chapter, index) => {
    const previous = chapters[index];
    if (chapter.start - previous.start < 10) {
      problems.push(
        `"${previous.title}" is shorter than 10 seconds. Each chapter needs at least 10.`,
      );
    }
  });
  return problems;
}

export function formatTimestamp(seconds: number, withHours: boolean): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return withHours ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

// Per chapter: m:ss under an hour, h:mm:ss after. YouTube's help says the
// first timestamp must be 0:00/00:00, so it never becomes 0:00:00.
export function formatChapters(chapters: Chapter[]): string {
  return chapters.map((c) => `${formatTimestamp(c.start, c.start >= 3600)} ${c.title}`).join("\n");
}

// ---------- QR code ----------

// Only YouTube links: this is the YouTube QR generator, and it keeps the
// page from becoming a free QR service for any URL.
export function normalizeYoutubeLink(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    const host = url.hostname.replace(/^(www\.|m\.)/, "");
    if (host !== "youtube.com" && host !== "youtu.be") return null;
    url.protocol = "https:";
    return url.toString();
  } catch {
    return null;
  }
}
