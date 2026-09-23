import type { CalendarEntry } from "@/lib/services/calendar";

// PRD.md §8.3's "Export to Google Calendar / ICS" -- hand-rolled per the
// Phase 3 kickoff's own note (~20 lines, not worth ical.js for one-off,
// non-recurring events). RFC 5545 §3.3.11 escaping: backslash, comma,
// semicolon get backslash-escaped; newlines become literal "\n".
function escapeICSText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

function toICSDate(iso: string): string {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function entryToVEvent(entry: CalendarEntry, dtstamp: string): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${entry.id}@ytniches.com`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${escapeICSText(entry.title)}`,
  ];
  if (entry.scheduledFor) {
    lines.push(`DTSTART:${toICSDate(entry.scheduledFor)}`);
  }
  if (entry.description) {
    lines.push(`DESCRIPTION:${escapeICSText(entry.description)}`);
  }
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

export function buildICS(entries: CalendarEntry[]): string {
  const dtstamp = toICSDate(new Date().toISOString());
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YTNiches//Content Calendar//EN",
    ...entries.map((entry) => entryToVEvent(entry, dtstamp)),
    "END:VCALENDAR",
  ].join("\r\n");
}

// Google's documented "render" endpoint for adding a single event --
// no OAuth/API needed, just a URL the browser opens in a new tab.
export function buildGoogleCalendarUrl(entry: CalendarEntry): string {
  const params = new URLSearchParams({ action: "TEMPLATE", text: entry.title });
  if (entry.scheduledFor) {
    const start = toICSDate(entry.scheduledFor);
    params.set("dates", `${start}/${start}`);
  }
  if (entry.description) {
    params.set("details", entry.description);
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
