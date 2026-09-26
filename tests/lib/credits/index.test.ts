import { beforeEach, describe, expect, it, vi } from "vitest";

// The ledger rows the credit_balance RPC sums (mocked here as a plain sum,
// the real function is SQL). .insert() resolves directly, matching how
// lib/credits/index.ts awaits it without a trailing .select().
let selectResult: { data: { amount: number }[] | null; error: { message: string } | null } = {
  data: [],
  error: null,
};
let insertResult: { error: { message: string; code?: string } | null } = { error: null };
const insertSpy = vi.fn(() => Promise.resolve(insertResult));
const rpcSpy = vi.fn(() =>
  Promise.resolve(
    selectResult.error
      ? { data: null, error: selectResult.error }
      : { data: (selectResult.data ?? []).reduce((sum, row) => sum + row.amount, 0), error: null },
  ),
);

let refundInsertResult: { error: { message: string; code?: string } | null } = { error: null };
const refundInsertSpy = vi.fn(() => Promise.resolve(refundInsertResult));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    rpc: rpcSpy,
    from: vi.fn(() => ({ insert: insertSpy })),
  })),
}));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: refundInsertSpy })),
  })),
}));

const { getBalance, consume, refund } = await import("@/lib/credits");
const ctx = { userId: "user-1", workspaceId: null, tier: null };

beforeEach(() => {
  selectResult = { data: [], error: null };
  insertResult = { error: null };
  insertSpy.mockClear();
  rpcSpy.mockClear();
  refundInsertResult = { error: null };
  refundInsertSpy.mockClear();
});

describe("getBalance", () => {
  it("sums allocation and consumption rows into a net balance", async () => {
    selectResult = { data: [{ amount: 50 }, { amount: -1 }, { amount: -5 }], error: null };
    expect(await getBalance(ctx)).toBe(44);
  });

  it("sums the whole ledger through the credit_balance RPC", async () => {
    await getBalance(ctx);
    expect(rpcSpy).toHaveBeenCalledWith("credit_balance", { p_user_id: "user-1" });
  });

  it("returns 0 when the ledger is empty", async () => {
    selectResult = { data: [], error: null };
    expect(await getBalance(ctx)).toBe(0);
  });

  it("throws on a query error rather than silently returning 0", async () => {
    selectResult = { data: null, error: { message: "connection reset" } };
    await expect(getBalance(ctx)).rejects.toThrow("connection reset");
  });
});

describe("consume", () => {
  it("returns insufficient_credits and does not insert when balance is too low", async () => {
    selectResult = { data: [{ amount: 0 }], error: null };
    const result = await consume(ctx, 1, "Niche search", "key-1");

    expect(result).toEqual({
      ok: false,
      error: { type: "insufficient_credits", balance: 0, required: 1 },
    });
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it("inserts a negative consumption row when balance is sufficient", async () => {
    selectResult = { data: [{ amount: 50 }], error: null };
    const result = await consume(ctx, 1, "Niche search", "key-1");

    expect(result).toEqual({ ok: true, value: undefined });
    expect(insertSpy).toHaveBeenCalledWith({
      user_id: "user-1",
      event_type: "consumption",
      amount: -1,
      reason: "Niche search",
      idempotency_key: "key-1",
    });
  });

  it("treats a duplicate idempotency key as an already-succeeded replay", async () => {
    selectResult = { data: [{ amount: 50 }], error: null };
    insertResult = {
      error: { message: "duplicate key value violates unique constraint", code: "23505" },
    };

    const result = await consume(ctx, 1, "Niche search", "key-1");

    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("throws on a non-idempotency insert error", async () => {
    selectResult = { data: [{ amount: 50 }], error: null };
    insertResult = { error: { message: "connection reset", code: "08000" } };

    await expect(consume(ctx, 1, "Niche search", "key-1")).rejects.toThrow("connection reset");
  });
});

describe("refund", () => {
  it("inserts a positive refund row keyed off the original idempotency key", async () => {
    await refund(ctx, 5, "Prompt generation failed", "gen-key-1");

    expect(refundInsertSpy).toHaveBeenCalledWith({
      user_id: "user-1",
      event_type: "refund",
      amount: 5,
      reason: "Prompt generation failed",
      idempotency_key: "gen-key-1:refund",
    });
  });

  it("treats a duplicate refund idempotency key as an already-succeeded replay", async () => {
    refundInsertResult = {
      error: { message: "duplicate key value violates unique constraint", code: "23505" },
    };

    await expect(refund(ctx, 5, "Prompt generation failed", "gen-key-1")).resolves.toBeUndefined();
  });

  it("throws on a non-idempotency insert error", async () => {
    refundInsertResult = { error: { message: "connection reset", code: "08000" } };

    await expect(refund(ctx, 5, "Prompt generation failed", "gen-key-1")).rejects.toThrow(
      "connection reset",
    );
  });
});
