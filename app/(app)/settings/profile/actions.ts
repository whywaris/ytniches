"use server";

import { getRequestContext } from "@/lib/context";
import { setTimeZone, type InvalidTimeZoneError } from "@/lib/services/profile";
import type { Result } from "@/lib/result";

export async function setTimeZoneAction(
  timeZone: string,
): Promise<Result<void, InvalidTimeZoneError>> {
  const ctx = await getRequestContext();
  return setTimeZone(ctx, timeZone);
}
