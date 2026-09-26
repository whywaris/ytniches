import { createClient } from "@/lib/supabase/server";
import { err, ok, type Result } from "@/lib/result";
import { TimeZoneSchema } from "@/lib/time-zone";
import type { RequestContext } from "@/lib/context";

// D-064: the user's time zone drives the digest hour and quiet hours.

export type InvalidTimeZoneError = { type: "invalid_time_zone" };

// First app load: fill in the browser's zone, but only while the profile
// still has the untouched default -- never over a detected or chosen one.
export async function saveDetectedTimeZone(
  ctx: RequestContext,
  timeZone: string,
): Promise<Result<void, InvalidTimeZoneError>> {
  const parsed = TimeZoneSchema.safeParse(timeZone);
  if (!parsed.success) return err({ type: "invalid_time_zone" });

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ time_zone: parsed.data, time_zone_source: "browser" })
    .eq("id", ctx.userId)
    .eq("time_zone_source", "default");
  if (error) throw new Error(`saveDetectedTimeZone failed: ${error.message}`);
  return ok(undefined);
}

// Settings -> Profile. A choice made here is never auto-replaced.
export async function setTimeZone(
  ctx: RequestContext,
  timeZone: string,
): Promise<Result<void, InvalidTimeZoneError>> {
  const parsed = TimeZoneSchema.safeParse(timeZone);
  if (!parsed.success) return err({ type: "invalid_time_zone" });

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ time_zone: parsed.data, time_zone_source: "user" })
    .eq("id", ctx.userId);
  if (error) throw new Error(`setTimeZone failed: ${error.message}`);
  return ok(undefined);
}
