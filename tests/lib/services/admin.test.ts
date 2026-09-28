import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

type QueryResult = { data: unknown; error: unknown };
const EMPTY: QueryResult = { data: null, error: null };
// One chainable builder per table; terminals resolve from `results`.
const results: Record<
  string,
  { maybeSingle?: QueryResult; single?: QueryResult; then?: QueryResult }
> = {};
const builders: Record<string, ReturnType<typeof makeBuilder>> = {};
function makeBuilder(table: string) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    is: vi.fn(() => builder),
    not: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(results[table]?.maybeSingle ?? EMPTY)),
    single: vi.fn(() => Promise.resolve(results[table]?.single ?? EMPTY)),
    then: (resolve: (value: QueryResult) => void) => resolve(results[table]?.then ?? EMPTY),
  };
  return builder;
}
const updateUserById = vi.fn<(id: string, attrs: unknown) => Promise<{ error: null }>>(() =>
  Promise.resolve({ error: null }),
);
const rpc = vi.fn<(fn: string, args: unknown) => Promise<{ error: null }>>(() =>
  Promise.resolve({ error: null }),
);
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: (table: string) => (builders[table] ??= makeBuilder(table)),
    auth: { admin: { updateUserById } },
    rpc,
  }),
}));

const getSubscription = vi.fn();
const refundTransaction = vi.fn();
vi.mock("@/lib/billing", () => ({
  getSubscription: (...args: unknown[]) => getSubscription(...args),
  refundTransaction: (...args: unknown[]) => refundTransaction(...args),
}));
vi.mock("@/lib/billing/tier-cache", () => ({ invalidateTierCache: vi.fn() }));
vi.mock("@/lib/credits", () => ({ computeBalance: vi.fn() }));
vi.mock("@/lib/youtube/quota", () => ({
  DAILY_QUOTA_LIMIT: 10_000,
  SOFT_LIMIT: 9_500,
  getQuotaHistory: vi.fn(async () => [{ date: "2026-09-27", used: 4_200 }]),
  getQuotaBySource: vi.fn(async () => ({ discovery: 3_000 })),
  getQuotaByCategory: vi.fn(async () => ({
    live: { used: 1_000, budget: 3_500 },
    sync: { used: 200, budget: 2_000 },
    free_tools: { used: 0, budget: 1_500 },
    discovery: { used: 3_000, budget: 3_000 },
  })),
}));

const inngestSend = vi.fn();
vi.mock("@/lib/inngest/client", () => ({
  inngest: { send: (...args: unknown[]) => inngestSend(...args) },
}));
const addManualSeed = vi.fn();
vi.mock("@/lib/services/discovery/seeds", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/services/discovery/seeds")>()),
  addManualSeed: (...args: unknown[]) => addManualSeed(...args),
}));

const {
  requireSuperAdmin,
  refundLastPayment,
  suspendUser,
  triggerDiscoveryJob,
  addDiscoverySeed,
  approveNicheSuggestion,
  rejectNicheSuggestion,
  getQuotaReport,
} = await import("@/lib/services/admin");

function signedInAs(profile: { role: string; suspended_at: string | null }) {
  getUser.mockResolvedValue({ data: { user: { id: "admin-1" } } });
  results.profiles = { maybeSingle: { data: profile, error: null } };
}

beforeEach(() => {
  for (const key of Object.keys(results)) delete results[key];
  for (const key of Object.keys(builders)) delete builders[key];
  vi.clearAllMocks();
  signedInAs({ role: "super_admin", suspended_at: null });
  results.subscriptions = {
    maybeSingle: { data: { provider_subscription_id: "sub_1" }, error: null },
  };
  getSubscription.mockResolvedValue({
    lastTransaction: { id: "tran_1", amountCents: 4900, createdAt: "2026-09-01T00:00:00Z" },
  });
});

describe("requireSuperAdmin", () => {
  it("rejects a normal user", async () => {
    signedInAs({ role: "user", suspended_at: null });
    expect(await requireSuperAdmin()).toEqual({ ok: false, error: { type: "forbidden" } });
  });

  it("rejects a suspended super_admin", async () => {
    signedInAs({ role: "super_admin", suspended_at: "2026-09-24T00:00:00Z" });
    expect((await requireSuperAdmin()).ok).toBe(false);
  });

  it("rejects an anonymous caller", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect((await requireSuperAdmin()).ok).toBe(false);
  });
});

describe("refundLastPayment", () => {
  it("refuses a non-admin before touching Creem", async () => {
    signedInAs({ role: "user", suspended_at: null });
    const result = await refundLastPayment("user-1", "tran_1");
    expect(result.ok).toBe(false);
    expect(getSubscription).not.toHaveBeenCalled();
    expect(refundTransaction).not.toHaveBeenCalled();
  });

  it("locks on refund:<transaction_id>, then refunds through Creem, not the DB", async () => {
    results.admin_actions = { single: { data: { id: "action-1" }, error: null } };
    refundTransaction.mockResolvedValue({ id: "ref_1", status: "pending" });

    const result = await refundLastPayment("user-1", "tran_1");

    expect(result).toEqual({ ok: true, value: { id: "ref_1", status: "pending" } });
    expect(builders.admin_actions.insert).toHaveBeenCalledWith(
      expect.objectContaining({ idempotency_key: "refund:tran_1", status: "pending" }),
    );
    expect(refundTransaction).toHaveBeenCalledWith("tran_1", "refund:tran_1");
    expect(builders.subscriptions.update).not.toHaveBeenCalled();
  });

  it("returns already_requested on a duplicate key and never calls Creem", async () => {
    results.admin_actions = { single: { data: null, error: { code: "23505", message: "dup" } } };

    const result = await refundLastPayment("user-1", "tran_1");

    expect(result).toEqual({ ok: false, error: { type: "already_requested" } });
    expect(refundTransaction).not.toHaveBeenCalled();
  });

  it("releases the key when Creem fails, so it can be retried", async () => {
    results.admin_actions = { single: { data: { id: "action-1" }, error: null } };
    refundTransaction.mockRejectedValue(new Error("Creem refund failed (400)"));

    await expect(refundLastPayment("user-1", "tran_1")).rejects.toThrow("(400)");
    expect(builders.admin_actions.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", idempotency_key: null }),
    );
  });

  it("refuses when a newer payment appeared after the preview", async () => {
    const result = await refundLastPayment("user-1", "tran_old");
    expect(result).toEqual({ ok: false, error: { type: "transaction_changed" } });
    expect(refundTransaction).not.toHaveBeenCalled();
  });
});

describe("suspendUser", () => {
  it("bans the user and revokes every session", async () => {
    results.profiles.then = { data: [{ id: "user-1" }], error: null };

    const result = await suspendUser("user-1", "Chargeback fraud");

    expect(result.ok).toBe(true);
    expect(updateUserById).toHaveBeenCalledWith("user-1", { ban_duration: "876000h" });
    expect(rpc).toHaveBeenCalledWith("admin_revoke_sessions", { target_user_id: "user-1" });
    expect(builders.admin_actions.insert).toHaveBeenCalledWith(
      expect.objectContaining({ action: "user_suspend", target_id: "user-1" }),
    );
  });

  it("won't let an admin suspend themselves", async () => {
    const result = await suspendUser("admin-1", "oops");
    expect(result).toEqual({ ok: false, error: { type: "cannot_suspend_self" } });
    expect(updateUserById).not.toHaveBeenCalled();
  });
});

describe("discovery admin (D-069)", () => {
  it("refuses a non-admin before sending anything", async () => {
    signedInAs({ role: "user", suspended_at: null });
    expect(await triggerDiscoveryJob("discovery")).toEqual({
      ok: false,
      error: { type: "forbidden" },
    });
    expect(inngestSend).not.toHaveBeenCalled();
  });

  it("sends the manual event flagged admin:true and writes an audit row", async () => {
    expect(await triggerDiscoveryJob("snapshot")).toEqual({ ok: true, value: undefined });
    expect(inngestSend).toHaveBeenCalledWith({
      name: "discovery/snapshot.requested",
      data: { admin: true, adminId: "admin-1" },
    });
    expect(builders.admin_actions?.insert).toHaveBeenCalledWith(
      expect.objectContaining({ action: "discovery_job_trigger", metadata: { job: "snapshot" } }),
    );
  });

  it("normalises a new seed and reports duplicates", async () => {
    addManualSeed.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    expect(await addDiscoverySeed("  Dark   Psychology ", 3)).toEqual({
      ok: true,
      value: undefined,
    });
    expect(addManualSeed).toHaveBeenCalledWith("dark psychology", 3);
    expect(await addDiscoverySeed("dark psychology", 3)).toEqual({
      ok: false,
      error: { type: "duplicate" },
    });
    expect(await addDiscoverySeed("x", 3)).toEqual({
      ok: false,
      error: { type: "invalid_keyword" },
    });
  });
});

describe("getQuotaReport (D-075)", () => {
  it("reports used vs budget per category alongside the per-source detail", async () => {
    const report = await getQuotaReport();
    expect(report.today).toEqual({ date: "2026-09-27", used: 4_200 });
    expect(report.byCategory.discovery).toEqual({ used: 3_000, budget: 3_000 });
    expect(report.byCategory.free_tools).toEqual({ used: 0, budget: 1_500 });
    expect(report.bySource).toEqual({ discovery: 3_000 });
  });
});

describe("niche suggestions (D-080)", () => {
  const pending = {
    id: "s1",
    slug: "knitting-tutorials",
    name: "Knitting Tutorials",
    description: "Learn to knit",
  };

  it("approve adds the niche with its category, seeds it and re-queues unclassified channels", async () => {
    results.niche_suggestions = { maybeSingle: { data: pending, error: null } };

    expect(await approveNicheSuggestion("s1", "Food")).toEqual({ ok: true, value: undefined });

    expect(builders.niches?.insert).toHaveBeenCalledWith({
      slug: "knitting-tutorials",
      name: "Knitting Tutorials",
      description: "Learn to knit",
      category: "Food",
      seed_keywords: ["knitting tutorials"],
    });
    expect(builders.niche_suggestions?.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved", reviewed_by: "admin-1" }),
    );
    expect(addManualSeed).toHaveBeenCalledWith("knitting tutorials", 5);
    expect(builders.channels?.update).toHaveBeenCalledWith({ classified_at: null });
    expect(builders.channels?.is).toHaveBeenCalledWith("niche_id", null);
    expect(builders.admin_actions?.insert).toHaveBeenCalledWith(
      expect.objectContaining({ action: "niche_suggestion_approve" }),
    );
  });

  it("approve reports a slug that already exists and a suggestion already reviewed", async () => {
    results.niche_suggestions = { maybeSingle: { data: pending, error: null } };
    results.niches = { then: { data: null, error: { code: "23505", message: "dupe" } } };
    expect(await approveNicheSuggestion("s1", "Food")).toEqual({
      ok: false,
      error: { type: "duplicate" },
    });

    results.niche_suggestions = { maybeSingle: { data: null, error: null } };
    expect(await approveNicheSuggestion("s1", "Food")).toEqual({
      ok: false,
      error: { type: "not_found" },
    });
  });

  it("reject marks the suggestion and never adds a niche", async () => {
    results.niche_suggestions = { maybeSingle: { data: pending, error: null } };

    expect(await rejectNicheSuggestion("s1")).toEqual({ ok: true, value: undefined });

    expect(builders.niche_suggestions?.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "rejected" }),
    );
    expect(builders.niches).toBeUndefined();
  });

  it("both require a super admin", async () => {
    signedInAs({ role: "user", suspended_at: null });
    expect((await approveNicheSuggestion("s1", "Food")).ok).toBe(false);
    expect((await rejectNicheSuggestion("s1")).ok).toBe(false);
  });
});
