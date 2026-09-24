"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import {
  getRefundPreview,
  grantCredits,
  refundLastPayment,
  suspendUser,
  unsuspendUser,
} from "@/lib/services/admin";
import { err, type Result } from "@/lib/result";

// Every action validates at the trust boundary (Zod) and then calls a
// lib/services/admin.ts function that re-checks super_admin itself --
// middleware's /admin/* gate is never the only check (Security.md §3.3).

type InvalidInput = { type: "invalid_input"; message: string };

const UserId = z.string().uuid();
const Reason = z.string().trim().min(3, "A reason is required.").max(500);

function invalid(error: z.ZodError): Result<never, InvalidInput> {
  return err({ type: "invalid_input", message: error.issues[0]?.message ?? "Invalid input." });
}

function refresh(userId: string) {
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

const GrantSchema = z.object({
  userId: UserId,
  amount: z.coerce.number().int().min(1, "Grant at least 1 credit.").max(100_000),
  reason: Reason,
});

export async function grantCreditsAction(input: z.input<typeof GrantSchema>) {
  const parsed = GrantSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const result = await grantCredits(parsed.data.userId, parsed.data.amount, parsed.data.reason);
  if (result.ok) refresh(parsed.data.userId);
  return result;
}

const SuspendSchema = z.object({ userId: UserId, reason: Reason });

export async function suspendUserAction(input: z.input<typeof SuspendSchema>) {
  const parsed = SuspendSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const result = await suspendUser(parsed.data.userId, parsed.data.reason);
  if (result.ok) refresh(parsed.data.userId);
  return result;
}

export async function unsuspendUserAction(input: { userId: string }) {
  const parsed = z.object({ userId: UserId }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const result = await unsuspendUser(parsed.data.userId);
  if (result.ok) refresh(parsed.data.userId);
  return result;
}

export async function getRefundPreviewAction(input: { userId: string }) {
  const parsed = z.object({ userId: UserId }).safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  return getRefundPreview(parsed.data.userId);
}

const RefundSchema = z.object({ userId: UserId, transactionId: z.string().min(1).max(200) });

export async function refundLastPaymentAction(input: z.input<typeof RefundSchema>) {
  const parsed = RefundSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const result = await refundLastPayment(parsed.data.userId, parsed.data.transactionId);
  if (result.ok) refresh(parsed.data.userId);
  // Return only what the client shows -- never the raw provider response.
  return result.ok ? { ok: true as const, value: { status: result.value.status } } : result;
}
