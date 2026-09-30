"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { NICHE_CATEGORIES } from "@/lib/discovery/config";
import { MANUAL_JOBS } from "@/lib/discovery/events";
import {
  addDiscoverySeed,
  approveNicheSuggestion,
  rejectNicheSuggestion,
  removeDiscoverySeed,
  triggerDiscoveryJob,
} from "@/lib/services/admin";
import { err, type Result } from "@/lib/result";

// Same shape as users/[userId]/actions.ts: Zod at the trust boundary, then
// a lib/services/admin.ts function that re-checks super_admin itself.

type InvalidInput = { type: "invalid_input"; message: string };

function invalid(error: z.ZodError): Result<never, InvalidInput> {
  return err({ type: "invalid_input", message: error.issues[0]?.message ?? "Invalid input." });
}

const AddSeedSchema = z.object({
  keyword: z.string().trim().min(2, "Enter a keyword.").max(80),
  priority: z.coerce.number().int().min(1).max(10),
});

export async function addSeedAction(input: z.input<typeof AddSeedSchema>) {
  const parsed = AddSeedSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const result = await addDiscoverySeed(parsed.data.keyword, parsed.data.priority);
  if (result.ok) revalidatePath("/admin/discovery");
  return result;
}

export async function removeSeedAction(input: { seedId: string }) {
  const parsed = z.object({ seedId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const result = await removeDiscoverySeed(parsed.data.seedId);
  if (result.ok) revalidatePath("/admin/discovery");
  return result;
}

const SuggestionIdSchema = z.object({ suggestionId: z.string().uuid() });

export async function approveSuggestionAction(input: { suggestionId: string; category: string }) {
  const parsed = SuggestionIdSchema.extend({ category: z.enum(NICHE_CATEGORIES) }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const result = await approveNicheSuggestion(parsed.data.suggestionId, parsed.data.category);
  if (result.ok) revalidatePath("/admin/discovery");
  return result;
}

export async function rejectSuggestionAction(input: { suggestionId: string }) {
  const parsed = SuggestionIdSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const result = await rejectNicheSuggestion(parsed.data.suggestionId);
  if (result.ok) revalidatePath("/admin/discovery");
  return result;
}

export async function triggerJobAction(input: { job: string }) {
  const parsed = z.object({ job: z.enum(MANUAL_JOBS) }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  return triggerDiscoveryJob(parsed.data.job);
}
