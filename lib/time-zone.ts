import { z } from "zod";

// profiles.time_zone feeds SQL `at time zone` (the digest) and Intl (quiet
// hours), where an unknown name is an error -- so only real IANA names get in.
export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export const TimeZoneSchema = z
  .string()
  .min(1)
  .max(64)
  .refine(isValidTimeZone, "Unknown time zone");

// Every zone this runtime knows, for the settings picker. UTC isn't always
// in the list, but it's a valid choice.
export function listTimeZones(): string[] {
  const zones = Intl.supportedValuesOf("timeZone");
  return zones.includes("UTC") ? zones : ["UTC", ...zones];
}
