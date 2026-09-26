"use server";

import { redirect } from "next/navigation";

import { getRequestContext } from "@/lib/context";
import { saveDetectedTimeZone } from "@/lib/services/profile";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// D-064: the app shell sends the browser's zone once, while the profile
// still has the default. The service ignores it after that.
export async function saveDetectedTimeZoneAction(timeZone: string): Promise<void> {
  const ctx = await getRequestContext();
  await saveDetectedTimeZone(ctx, timeZone);
}
