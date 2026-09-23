// Backend-Schema.md §4.4: quiet_hours_start/end are `time` columns (email
// only), "local to user's time_zone" (profiles.time_zone, IANA). Native
// Intl.DateTimeFormat, not a date library (gap 5) -- it already resolves
// arbitrary IANA zones correctly without a dependency.

function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// hour12: false at exactly midnight returns "24" on some JS engines
// instead of "00" -- normalized below rather than trusted as-is.
function currentMinutesInTimeZone(timeZone: string, now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

// Handles the overnight wraparound case (e.g. 22:00–07:00 crosses
// midnight) -- start > end means "quiet from start until end the next
// day," not an inverted/invalid range.
export function isInQuietHours(
  quietHoursStart: string | null,
  quietHoursEnd: string | null,
  timeZone: string,
  now: Date = new Date(),
): boolean {
  if (!quietHoursStart || !quietHoursEnd) return false;

  const startMinutes = timeStringToMinutes(quietHoursStart);
  const endMinutes = timeStringToMinutes(quietHoursEnd);
  if (startMinutes === endMinutes) return false;

  const nowMinutes = currentMinutesInTimeZone(timeZone, now);

  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}
