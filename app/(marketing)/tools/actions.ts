"use server";

import { z } from "zod";

import { getClientIp } from "@/lib/request-ip";
import {
  checkOutlier,
  extractTags,
  lookupChannel,
  type ChannelLookup,
  type FreeToolError,
  type OutlierCheck,
  type TagExtraction,
} from "@/lib/services/free-tools";

// D-014: open tools, no auth, no credits. The honeypot field ("company")
// is hidden from people; anything filling it gets a quiet invalid_input.
const InputSchema = z.object({
  query: z.string().trim().min(1).max(500),
  company: z.string().max(0).optional(),
});

export type ToolActionResult<T> =
  { ok: true; value: T } | { ok: false; error: FreeToolError["type"] };

async function run<T>(
  raw: unknown,
  fn: (
    query: string,
    ip: string,
  ) => Promise<{ ok: true; value: T } | { ok: false; error: FreeToolError }>,
): Promise<ToolActionResult<T>> {
  const input = InputSchema.safeParse(raw);
  if (!input.success) return { ok: false, error: "invalid_input" };
  const result = await fn(input.data.query, await getClientIp());
  return result.ok ? result : { ok: false, error: result.error.type };
}

export async function lookupChannelAction(raw: unknown): Promise<ToolActionResult<ChannelLookup>> {
  return run(raw, lookupChannel);
}

export async function checkOutlierAction(raw: unknown): Promise<ToolActionResult<OutlierCheck>> {
  return run(raw, checkOutlier);
}

export async function extractTagsAction(raw: unknown): Promise<ToolActionResult<TagExtraction>> {
  return run(raw, extractTags);
}
