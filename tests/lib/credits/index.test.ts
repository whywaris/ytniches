import { beforeEach, describe, expect, it, vi } from "vitest";

// Chainable query-builder mock: .select().eq().gte() resolves like the real
// (thenable) Supabase builder. .insert() resolves directly, matching how
// lib/credits/index.ts awaits it without a trailing .select().
let selectResult: { data: { amount: number }[] | null; error: { message: string } | null } = {
  data: [],
  error: null,
};
let insertResult: { error: { message: string; code?: string } | null } = { error: null };
const insertSpy = vi.fn(() => Promise.resolve(insertResult));

function makeSelectBuilder() {
  const builder = {
    eq: vi.fn(() => builder),
    gte: vi.fn(() => Promise.resolve(selectResult)),
  };
  return builder;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => makeSelectBuilder()),
      insert: insertSpy,
    })),
  })),
}));

const { getBalance, consume } = await import("@/lib/credits");
const ctx = { userId: "user-1" };

beforeEach(() => {
  selectResult = { data: [], error: null };
  insertResult = { error: null };
  insertSpy.mockClear();
});

describe("getBalance", () => {
  it("sums allocation and consumption rows into a net balance", async () => {
    selectResult = { data: [{ amount: 50 }, { amount: -1 }, { amount: -5 }], error: null };
    expect(await getBalance(ctx)).toBe(44);
  });

  it("returns 0 when no events exist in the current cycle", async () => {
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
