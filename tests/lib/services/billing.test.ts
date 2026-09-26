import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFrom = vi.fn();
const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom, auth: { getUser } }),
}));

const serviceFrom = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

const getBalance = vi.fn();
vi.mock("@/lib/credits", () => ({
  getBalance: (...args: unknown[]) => getBalance(...args),
}));

const invalidateTierCache = vi.fn();
vi.mock("@/lib/billing/tier-cache", () => ({
  invalidateTierCache: (...args: unknown[]) => invalidateTierCache(...args),
}));

const createCheckoutSession = vi.fn();
const createCustomerPortalUrl = vi.fn();
const getSubscription = vi.fn();
const cancelSubscriptionApi = vi.fn();
vi.mock("@/lib/billing", () => ({
  createCheckoutSession: (...args: unknown[]) => createCheckoutSession(...args),
  createCustomerPortalUrl: (...args: unknown[]) => createCustomerPortalUrl(...args),
  getSubscription: (...args: unknown[]) => getSubscription(...args),
  cancelSubscription: (...args: unknown[]) => cancelSubscriptionApi(...args),
}));

// Effective plans (D-059) are resolved by effective-plan.ts (own tests);
// here each test says who is affected and what their plan is now.
type Plan = { tier: string | null; status: string | null; teamWorkspaceId: string | null };
let plansByUser: Record<string, Plan> = {};
let affectedUsers: string[] | null = null;
vi.mock("@/lib/billing/effective-plan", () => ({
  getEffectivePlans: async (ids: string[]) =>
    new Map(
      ids.map((id) => [id, plansByUser[id] ?? { tier: null, status: null, teamWorkspaceId: null }]),
    ),
  usersAffectedByPlanOf: async (id: string) => affectedUsers ?? [id],
}));
const own = (tier: string, status: string): Plan => ({ tier, status, teamWorkspaceId: null });

const {
  getSubscriptionStatus,
  createCheckout,
  getBillingPortalUrl,
  cancelSubscription,
  upsertSubscriptionFromProvider,
  allocateCycleCredits,
  handleRefund,
  TRIAL_CREDITS,
} = await import("@/lib/services/billing");

const ctx = { userId: "user-1", workspaceId: null, tier: null };

function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    is: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    range: vi.fn(() => Promise.resolve(result)),
    update: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    insert: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TRIAL_CREDITS", () => {
  it("is 50 per Monetization.md §3.2", () => {
    expect(TRIAL_CREDITS).toBe(50);
  });
});

describe("getSubscriptionStatus", () => {
  it("returns null when the user has no current subscription", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    expect(await getSubscriptionStatus(ctx)).toBeNull();
  });

  it("computes accountState=trialing for an in-progress trial", async () => {
    const future = new Date(Date.now() + 5 * 86_400_000).toISOString();
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          tier: "pro",
          status: "trialing",
          current_period_start: new Date().toISOString(),
          current_period_end: future,
          trial_ends_at: future,
          cancelled_at: null,
          provider_subscription_id: null,
        },
        error: null,
      }),
    );

    const result = await getSubscriptionStatus(ctx);
    expect(result?.accountState).toBe("trialing");
  });

  it("computes accountState=expired_trial once trial_ends_at has passed", async () => {
    const past = new Date(Date.now() - 1000).toISOString();
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          tier: "pro",
          status: "trialing",
          current_period_start: new Date(Date.now() - 2000).toISOString(),
          current_period_end: new Date(Date.now() + 86_400_000).toISOString(),
          trial_ends_at: past,
          cancelled_at: null,
          provider_subscription_id: null,
        },
        error: null,
      }),
    );

    const result = await getSubscriptionStatus(ctx);
    expect(result?.accountState).toBe("expired_trial");
  });

  it("computes accountState=cancelling when cancelled_at is set but the period hasn't ended", async () => {
    const future = new Date(Date.now() + 5 * 86_400_000).toISOString();
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          tier: "pro",
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: future,
          trial_ends_at: null,
          cancelled_at: new Date().toISOString(),
          provider_subscription_id: "sub_1",
        },
        error: null,
      }),
    );

    const result = await getSubscriptionStatus(ctx);
    expect(result?.accountState).toBe("cancelling");
  });

  it("computes accountState=expired for a cancelled row", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          tier: "pro",
          status: "cancelled",
          current_period_start: new Date(Date.now() - 2_000_000).toISOString(),
          current_period_end: new Date(Date.now() - 1_000_000).toISOString(),
          trial_ends_at: null,
          cancelled_at: new Date(Date.now() - 1_500_000).toISOString(),
          provider_subscription_id: "sub_1",
        },
        error: null,
      }),
    );

    const result = await getSubscriptionStatus(ctx);
    expect(result?.accountState).toBe("expired");
  });

  it("passes through past_due and paused as their own accountState", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          tier: "pro",
          status: "past_due",
          current_period_start: new Date().toISOString(),
          current_period_end: future,
          trial_ends_at: null,
          cancelled_at: null,
          provider_subscription_id: "sub_1",
        },
        error: null,
      }),
    );

    expect((await getSubscriptionStatus(ctx))?.accountState).toBe("past_due");
  });
});

describe("createCheckout", () => {
  it("creates a checkout session using the caller's own email", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { email: "ada@example.com" } } });
    createCheckoutSession.mockResolvedValueOnce({
      id: "ch_1",
      checkoutUrl: "https://creem.io/pay/ch_1",
    });

    const result = await createCheckout(ctx, "pro", "monthly");

    expect(result).toEqual({ ok: true, value: { checkoutUrl: "https://creem.io/pay/ch_1" } });
    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        tier: "pro",
        billingFrequency: "monthly",
        customerEmail: "ada@example.com",
      }),
    );
  });

  it("returns no_email if the session has no email on file", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } });

    const result = await createCheckout(ctx, "pro", "monthly");

    expect(result).toEqual({ ok: false, error: { type: "no_email" } });
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });
});

describe("getBillingPortalUrl", () => {
  it("resolves the Creem customer id via getSubscription, then the portal link", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: { provider_subscription_id: "sub_1" }, error: null }),
    );
    getSubscription.mockResolvedValueOnce({ customerId: "cust_1" });
    createCustomerPortalUrl.mockResolvedValueOnce("https://creem.io/my-orders/login/xyz");

    const result = await getBillingPortalUrl(ctx);

    expect(getSubscription).toHaveBeenCalledWith("sub_1");
    expect(createCustomerPortalUrl).toHaveBeenCalledWith("cust_1");
    expect(result).toEqual({ ok: true, value: "https://creem.io/my-orders/login/xyz" });
  });

  it("returns no_subscription when there's no provider subscription id", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    const result = await getBillingPortalUrl(ctx);

    expect(result).toEqual({ ok: false, error: { type: "no_subscription" } });
  });
});

describe("cancelSubscription", () => {
  it("cancels at period end (atPeriodEnd=true)", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: { provider_subscription_id: "sub_1" }, error: null }),
    );

    const result = await cancelSubscription(ctx);

    expect(cancelSubscriptionApi).toHaveBeenCalledWith("sub_1", true);
    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("returns no_subscription when there's nothing to cancel", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    const result = await cancelSubscription(ctx);

    expect(result).toEqual({ ok: false, error: { type: "no_subscription" } });
    expect(cancelSubscriptionApi).not.toHaveBeenCalled();
  });
});

describe("upsertSubscriptionFromProvider", () => {
  const providerSub = {
    id: "sub_1",
    status: "active" as const,
    customerId: "cust_1",
    productId: "prod_pro_monthly",
    currentPeriodStart: "2026-09-01T00:00:00.000Z",
    currentPeriodEnd: "2026-10-01T00:00:00.000Z",
    canceledAt: null,
    metadata: {},
    amountCents: 4900,
    billingInterval: "month" as const,
    lastTransaction: null,
  };

  it("stores Creem's real price and interval on the subscription row", async () => {
    const findBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom.mockReturnValueOnce(findBuilder).mockReturnValueOnce(updateBuilder);

    await upsertSubscriptionFromProvider("user-1", "pro", providerSub);

    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ amount_cents: 4900, billing_interval: "month" }),
    );
  });

  it("never blanks a stored price when the event carries only a product id", async () => {
    const findBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom.mockReturnValueOnce(findBuilder).mockReturnValueOnce(updateBuilder);

    await upsertSubscriptionFromProvider("user-1", "pro", {
      ...providerSub,
      amountCents: null,
      billingInterval: null,
    });

    const fields = (updateBuilder.update.mock.calls as unknown[][])[0][0] as Record<
      string,
      unknown
    >;
    expect(fields).not.toHaveProperty("amount_cents");
    expect(fields).not.toHaveProperty("billing_interval");
  });

  it("inserts a new row and retires the previous current row when the subscription is new", async () => {
    const findBuilder = makeQueryBuilder({ data: null, error: null }); // no existing row
    const retireBuilder = makeQueryBuilder({ data: null, error: null });
    const insertBuilder = makeQueryBuilder({ data: null, error: null });
    const trackedBuilder = makeQueryBuilder({ data: null, error: null });
    plansByUser = { "user-1": own("pro", "active") };
    affectedUsers = null;
    serviceFrom
      .mockReturnValueOnce(findBuilder)
      .mockReturnValueOnce(retireBuilder)
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(trackedBuilder);

    await upsertSubscriptionFromProvider("user-1", "pro", providerSub);

    expect(trackedBuilder.update).toHaveBeenCalledWith({ refresh_cadence_hours: 6 });
    expect(retireBuilder.update).toHaveBeenCalledWith({ is_current: false });
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        tier: "pro",
        status: "active",
        provider: "creem",
        provider_subscription_id: "sub_1",
        is_current: true,
      }),
    );
  });

  it("updates the existing row in place when the subscription already exists", async () => {
    const findBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom.mockReturnValueOnce(findBuilder).mockReturnValueOnce(updateBuilder);

    await upsertSubscriptionFromProvider("user-1", "pro", providerSub);

    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active", provider_subscription_id: "sub_1" }),
    );
    expect(serviceFrom).toHaveBeenCalledTimes(2); // find + update, no retire/insert
  });

  it("maps scheduled_cancel to status=active (cancelled_at carries the pending cancellation)", async () => {
    const findBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom.mockReturnValueOnce(findBuilder).mockReturnValueOnce(updateBuilder);

    await upsertSubscriptionFromProvider("user-1", "pro", {
      ...providerSub,
      status: "scheduled_cancel",
      canceledAt: "2026-09-15T00:00:00.000Z",
    });

    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active", cancelled_at: "2026-09-15T00:00:00.000Z" }),
    );
  });

  it("maps canceled to status=cancelled (spelling)", async () => {
    const findBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom.mockReturnValueOnce(findBuilder).mockReturnValueOnce(updateBuilder);

    await upsertSubscriptionFromProvider("user-1", "pro", { ...providerSub, status: "canceled" });

    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "cancelled" }),
    );
  });
});

describe("allocateCycleCredits", () => {
  // Order: allocation lookup, ledger read, cycle-close insert, allocation insert.
  function mockCycle(
    ledger: unknown[],
    closeError: unknown = null,
    allocationError: unknown = null,
  ) {
    const closeBuilder = makeQueryBuilder({ data: null, error: closeError });
    const insertBuilder = makeQueryBuilder({ data: null, error: allocationError });
    serviceFrom
      .mockReturnValueOnce(makeQueryBuilder({ data: { credits_per_cycle: 1000 }, error: null }))
      .mockReturnValueOnce(makeQueryBuilder({ data: ledger, error: null }))
      .mockReturnValueOnce(closeBuilder)
      .mockReturnValueOnce(insertBuilder);
    return { closeBuilder, insertBuilder };
  }

  it("expires last cycle's unused credits, then allocates with a cycle-scoped key", async () => {
    const { closeBuilder, insertBuilder } = mockCycle([
      { event_type: "allocation", amount: 1000, idempotency_key: "a", metadata: {} },
      { event_type: "consumption", amount: -300, idempotency_key: "b", metadata: {} },
    ]);

    await allocateCycleCredits("user-1", "pro", "sub_1:2026-09-01");

    expect(closeBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "expiration",
        amount: -700,
        idempotency_key: "cycle-close:sub_1:2026-09-01",
      }),
    );
    expect(insertBuilder.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      event_type: "allocation",
      amount: 1000,
      reason: "Monthly pro allocation",
      idempotency_key: "creem:allocation:sub_1:2026-09-01",
      metadata: { tier: "pro", rolloverCap: 0 },
    });
  });

  it("records Team's rollover cap on the allocation", async () => {
    const { insertBuilder } = mockCycle([]);
    await allocateCycleCredits("user-1", "team", "sub_1:2026-09-01");
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { tier: "team", rolloverCap: 500 } }),
    );
  });

  it("no-ops on a retried cycle (both idempotency keys collide)", async () => {
    const duplicate = { message: "duplicate", code: "23505" };
    mockCycle([], duplicate, duplicate);

    await expect(
      allocateCycleCredits("user-1", "pro", "sub_1:2026-09-01"),
    ).resolves.toBeUndefined();
  });

  it("throws when no credit_allocations row exists for the tier", async () => {
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    await expect(allocateCycleCredits("user-1", "pro", "sub_1:2026-09-01")).rejects.toThrow(/pro/);
  });
});

describe("handleRefund", () => {
  it("reduces the balance by min(balance, cycle allocation)", async () => {
    const subBuilder = makeQueryBuilder({
      data: { user_id: "user-1", tier: "pro" },
      error: null,
    });
    const allocationBuilder = makeQueryBuilder({ data: { credits_per_cycle: 1000 }, error: null });
    const insertBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(subBuilder)
      .mockReturnValueOnce(allocationBuilder)
      .mockReturnValueOnce(insertBuilder);
    getBalance.mockResolvedValueOnce(300);

    await handleRefund("sub_1", "evt_refund_1");

    expect(insertBuilder.insert).toHaveBeenCalledWith({
      user_id: "user-1",
      event_type: "expiration",
      amount: -300,
      reason: "Refund issued",
      idempotency_key: "creem:refund:evt_refund_1",
    });
  });

  it("caps the reduction at the cycle allocation, never exceeding it", async () => {
    const subBuilder = makeQueryBuilder({ data: { user_id: "user-1", tier: "pro" }, error: null });
    const allocationBuilder = makeQueryBuilder({ data: { credits_per_cycle: 1000 }, error: null });
    const insertBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(subBuilder)
      .mockReturnValueOnce(allocationBuilder)
      .mockReturnValueOnce(insertBuilder);
    getBalance.mockResolvedValueOnce(5000); // e.g. rollover/top-up inflated balance

    await handleRefund("sub_1", "evt_refund_2");

    expect(insertBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ amount: -1000 }));
  });

  it("does nothing when the balance is already zero", async () => {
    const subBuilder = makeQueryBuilder({ data: { user_id: "user-1", tier: "pro" }, error: null });
    const allocationBuilder = makeQueryBuilder({ data: { credits_per_cycle: 1000 }, error: null });
    serviceFrom.mockReturnValueOnce(subBuilder).mockReturnValueOnce(allocationBuilder);
    getBalance.mockResolvedValueOnce(0);

    await handleRefund("sub_1", "evt_refund_3");

    expect(serviceFrom).toHaveBeenCalledTimes(2); // no insert call
  });

  it("does nothing when the subscription can't be found", async () => {
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    await handleRefund("sub_unknown", "evt_refund_4");

    expect(getBalance).not.toHaveBeenCalled();
  });
});

describe("upsertSubscriptionFromProvider -> sync cadence (pricing promise)", () => {
  const providerSub = {
    id: "sub_1",
    status: "active" as const,
    customerId: "cust_1",
    productId: "prod_team_monthly",
    currentPeriodStart: "2026-09-01T00:00:00.000Z",
    currentPeriodEnd: "2026-10-01T00:00:00.000Z",
    canceledAt: null,
    metadata: {},
    amountCents: 9900,
    billingInterval: "month" as const,
    lastTransaction: null,
  };

  it("moves every tracked channel to the new plan's cadence on a new subscription", async () => {
    const find = makeQueryBuilder({ data: null, error: null });
    const retire = makeQueryBuilder({ data: null, error: null });
    const insert = makeQueryBuilder({ data: null, error: null });
    const tracked = makeQueryBuilder({ data: null, error: null });
    plansByUser = { "user-1": own("team", "active") };
    affectedUsers = null;
    serviceFrom
      .mockReturnValueOnce(find)
      .mockReturnValueOnce(retire)
      .mockReturnValueOnce(insert)
      .mockReturnValueOnce(tracked);

    await upsertSubscriptionFromProvider("user-1", "team", providerSub);

    expect(serviceFrom).toHaveBeenLastCalledWith("tracked_channels");
    expect(tracked.update).toHaveBeenCalledWith({ refresh_cadence_hours: 1 });
    expect(tracked.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("drops back to the default cadence when the current subscription is cancelled", async () => {
    const find = makeQueryBuilder({ data: { id: "row-1", is_current: true }, error: null });
    const update = makeQueryBuilder({ data: null, error: null });
    const tracked = makeQueryBuilder({ data: null, error: null });
    plansByUser = { "user-1": own("pro", "cancelled") };
    affectedUsers = null;
    serviceFrom.mockReturnValueOnce(find).mockReturnValueOnce(update).mockReturnValueOnce(tracked);

    await upsertSubscriptionFromProvider("user-1", "pro", {
      ...providerSub,
      status: "canceled" as const,
    });

    expect(tracked.update).toHaveBeenCalledWith({ refresh_cadence_hours: 24 });
  });

  it("never lets a retired subscription row change the cadence", async () => {
    const find = makeQueryBuilder({ data: { id: "old-row", is_current: false }, error: null });
    const update = makeQueryBuilder({ data: null, error: null });
    serviceFrom.mockReturnValueOnce(find).mockReturnValueOnce(update);

    await upsertSubscriptionFromProvider("user-1", "pro", providerSub);

    expect(serviceFrom).not.toHaveBeenCalledWith("tracked_channels");
  });
});

describe("upsertSubscriptionFromProvider -> workspace members (D-059)", () => {
  const teamSub = {
    id: "sub_team",
    status: "canceled" as const,
    customerId: "cust_1",
    productId: "prod_team_monthly",
    currentPeriodStart: "2026-09-01T00:00:00.000Z",
    currentPeriodEnd: "2026-10-01T00:00:00.000Z",
    canceledAt: "2026-09-26T00:00:00.000Z",
    metadata: {},
    amountCents: 9900,
    billingInterval: "month" as const,
    lastTransaction: null,
  };

  it("drops every member back to their own plan when the owner's Team lapses", async () => {
    affectedUsers = ["owner", "starter-member", "pro-member"];
    plansByUser = {
      owner: own("team", "cancelled"),
      "starter-member": own("starter", "active"),
      "pro-member": own("pro", "active"),
    };
    const find = makeQueryBuilder({ data: { id: "row-1", is_current: true }, error: null });
    const update = makeQueryBuilder({ data: null, error: null });
    const tracked = [0, 1, 2].map(() => makeQueryBuilder({ data: null, error: null }));
    serviceFrom
      .mockReturnValueOnce(find)
      .mockReturnValueOnce(update)
      .mockReturnValueOnce(tracked[0])
      .mockReturnValueOnce(tracked[1])
      .mockReturnValueOnce(tracked[2]);

    await upsertSubscriptionFromProvider("owner", "team", teamSub);

    expect(tracked[0].update).toHaveBeenCalledWith({ refresh_cadence_hours: 24 });
    expect(tracked[0].eq).toHaveBeenCalledWith("user_id", "owner");
    expect(tracked[1].update).toHaveBeenCalledWith({ refresh_cadence_hours: 24 });
    expect(tracked[1].eq).toHaveBeenCalledWith("user_id", "starter-member");
    expect(tracked[2].update).toHaveBeenCalledWith({ refresh_cadence_hours: 6 });
    expect(tracked[2].eq).toHaveBeenCalledWith("user_id", "pro-member");
    for (const userId of affectedUsers) expect(invalidateTierCache).toHaveBeenCalledWith(userId);
  });

  it("moves members to Team's hourly sync while the owner's Team is live", async () => {
    affectedUsers = ["owner", "member"];
    plansByUser = {
      owner: { tier: "team", status: "active", teamWorkspaceId: "ws-1" },
      member: { tier: "team", status: "active", teamWorkspaceId: "ws-1" },
    };
    const find = makeQueryBuilder({ data: { id: "row-1", is_current: true }, error: null });
    const update = makeQueryBuilder({ data: null, error: null });
    const tracked = [0, 1].map(() => makeQueryBuilder({ data: null, error: null }));
    serviceFrom
      .mockReturnValueOnce(find)
      .mockReturnValueOnce(update)
      .mockReturnValueOnce(tracked[0])
      .mockReturnValueOnce(tracked[1]);

    await upsertSubscriptionFromProvider("owner", "team", {
      ...teamSub,
      status: "active" as const,
      canceledAt: null,
    });

    expect(tracked[1].update).toHaveBeenCalledWith({ refresh_cadence_hours: 1 });
    expect(tracked[1].eq).toHaveBeenCalledWith("user_id", "member");
  });
});
