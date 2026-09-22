import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyWebhook = vi.fn();
const parseWebhookEvent = vi.fn();
const getSubscription = vi.fn();
const getTierForProductId = vi.fn();
vi.mock("@/lib/billing", () => ({
  verifyWebhook: (...args: unknown[]) => verifyWebhook(...args),
  parseWebhookEvent: (...args: unknown[]) => parseWebhookEvent(...args),
  getSubscription: (...args: unknown[]) => getSubscription(...args),
  getTierForProductId: (...args: unknown[]) => getTierForProductId(...args),
}));

const upsertSubscriptionFromProvider = vi.fn();
const allocateCycleCredits = vi.fn();
const handleRefund = vi.fn();
const lookupUserIdByProviderSubscriptionId = vi.fn();
const lookupTierByProviderSubscriptionId = vi.fn();
vi.mock("@/lib/services/billing", () => ({
  upsertSubscriptionFromProvider: (...args: unknown[]) => upsertSubscriptionFromProvider(...args),
  allocateCycleCredits: (...args: unknown[]) => allocateCycleCredits(...args),
  handleRefund: (...args: unknown[]) => handleRefund(...args),
  lookupUserIdByProviderSubscriptionId: (...args: unknown[]) =>
    lookupUserIdByProviderSubscriptionId(...args),
  lookupTierByProviderSubscriptionId: (...args: unknown[]) =>
    lookupTierByProviderSubscriptionId(...args),
}));

const serviceFrom = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

const { POST } = await import("@/app/api/webhooks/creem/route");

function makeRequest(body: string, signature = "valid-sig"): Request {
  return new Request("https://ytniches.com/api/webhooks/creem", {
    method: "POST",
    headers: { "creem-signature": signature },
    body,
  });
}

function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    update: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

const CHECKOUT_EVENT = {
  id: "evt_1",
  eventType: "checkout.completed",
  createdAt: new Date(),
  raw: { id: "evt_1" },
  checkout: {
    id: "ch_1",
    customerId: "cust_1",
    productId: "prod_pro_monthly",
    subscriptionId: "sub_1",
    metadata: { userId: "user-1", tier: "pro" },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  verifyWebhook.mockReturnValue(true);
});

describe("POST /api/webhooks/creem", () => {
  it("returns 401 without processing when the signature is invalid", async () => {
    verifyWebhook.mockReturnValue(false);

    const response = await POST(makeRequest("{}", "bad-sig"));

    expect(response.status).toBe(401);
    expect(parseWebhookEvent).not.toHaveBeenCalled();
    expect(serviceFrom).not.toHaveBeenCalled();
  });

  it("returns 400 when the body isn't valid JSON for the event envelope", async () => {
    parseWebhookEvent.mockImplementationOnce(() => {
      throw new Error("invalid JSON");
    });

    const response = await POST(makeRequest("not json"));

    expect(response.status).toBe(400);
  });

  it("returns 400 for an event older than 5 minutes", async () => {
    parseWebhookEvent.mockReturnValueOnce({
      ...CHECKOUT_EVENT,
      createdAt: new Date(Date.now() - 6 * 60 * 1000),
    });

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(400);
    expect(serviceFrom).not.toHaveBeenCalled();
  });

  it("processes a fresh checkout.completed event and marks it processed", async () => {
    parseWebhookEvent.mockReturnValueOnce(CHECKOUT_EVENT);
    const findBuilder = makeQueryBuilder({ data: null, error: null }); // no existing row
    const insertBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(findBuilder)
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(updateBuilder);
    getSubscription.mockResolvedValueOnce({
      id: "sub_1",
      status: "active",
      customerId: "cust_1",
      productId: "prod_pro_monthly",
      currentPeriodStart: "2026-09-01T00:00:00.000Z",
      currentPeriodEnd: "2026-10-01T00:00:00.000Z",
      canceledAt: null,
      metadata: {},
    });

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(upsertSubscriptionFromProvider).toHaveBeenCalledWith(
      "user-1",
      "pro",
      expect.objectContaining({ id: "sub_1" }),
    );
    expect(allocateCycleCredits).toHaveBeenCalledWith(
      "user-1",
      "pro",
      "sub_1:2026-09-01T00:00:00.000Z",
    );
    expect(updateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ processed_at: expect.any(String) }),
    );
  });

  it("returns 200 no-op for a duplicate of an already-processed event, without reprocessing", async () => {
    parseWebhookEvent.mockReturnValueOnce(CHECKOUT_EVENT);
    serviceFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: { id: "row-1", processed_at: "2026-09-22T00:00:00.000Z" },
        error: null,
      }),
    );

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(upsertSubscriptionFromProvider).not.toHaveBeenCalled();
    expect(getSubscription).not.toHaveBeenCalled();
  });

  it("retries a previously-failed event (row exists but processed_at is null)", async () => {
    parseWebhookEvent.mockReturnValueOnce(CHECKOUT_EVENT);
    const findBuilder = makeQueryBuilder({
      data: { id: "row-1", processed_at: null },
      error: null,
    });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom.mockReturnValueOnce(findBuilder).mockReturnValueOnce(updateBuilder);
    getSubscription.mockResolvedValueOnce({
      id: "sub_1",
      status: "active",
      customerId: "cust_1",
      productId: "prod_pro_monthly",
      currentPeriodStart: "2026-09-01T00:00:00.000Z",
      currentPeriodEnd: "2026-10-01T00:00:00.000Z",
      canceledAt: null,
      metadata: {},
    });

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(upsertSubscriptionFromProvider).toHaveBeenCalledOnce(); // reprocessed, not skipped
  });

  it("returns 500 and records the error when processing throws, leaving processed_at unset for a future retry", async () => {
    parseWebhookEvent.mockReturnValueOnce(CHECKOUT_EVENT);
    const findBuilder = makeQueryBuilder({ data: null, error: null });
    const insertBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const errorUpdateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(findBuilder)
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(errorUpdateBuilder);
    getSubscription.mockRejectedValueOnce(new Error("Creem API down"));

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(500);
    expect(errorUpdateBuilder.update).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Creem API down" }),
    );
  });

  it("processes a subscription.paid event, allocating a fresh cycle's credits", async () => {
    parseWebhookEvent.mockReturnValueOnce({
      id: "evt_2",
      eventType: "subscription.paid",
      createdAt: new Date(),
      raw: {},
      subscription: {
        id: "sub_1",
        status: "active",
        customerId: "cust_1",
        productId: "prod_pro_monthly",
        currentPeriodStart: "2026-10-01T00:00:00.000Z",
        currentPeriodEnd: "2026-11-01T00:00:00.000Z",
        canceledAt: null,
        metadata: { userId: "user-1", tier: "pro" },
      },
    });
    const findBuilder = makeQueryBuilder({ data: null, error: null });
    const insertBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(findBuilder)
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(updateBuilder);

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(upsertSubscriptionFromProvider).toHaveBeenCalledWith("user-1", "pro", expect.anything());
    expect(allocateCycleCredits).toHaveBeenCalledWith(
      "user-1",
      "pro",
      "sub_1:2026-10-01T00:00:00.000Z",
    );
  });

  it("does not allocate credits for a subscription.active status ping", async () => {
    parseWebhookEvent.mockReturnValueOnce({
      id: "evt_3",
      eventType: "subscription.active",
      createdAt: new Date(),
      raw: {},
      subscription: {
        id: "sub_1",
        status: "active",
        customerId: "cust_1",
        productId: "prod_pro_monthly",
        currentPeriodStart: "2026-10-01T00:00:00.000Z",
        currentPeriodEnd: "2026-11-01T00:00:00.000Z",
        canceledAt: null,
        metadata: { userId: "user-1", tier: "pro" },
      },
    });
    const findBuilder = makeQueryBuilder({ data: null, error: null });
    const insertBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(findBuilder)
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(updateBuilder);

    await POST(makeRequest("{}"));

    expect(allocateCycleCredits).not.toHaveBeenCalled();
  });

  it("falls back to lookupUserIdByProviderSubscriptionId when metadata is missing userId", async () => {
    parseWebhookEvent.mockReturnValueOnce({
      id: "evt_4",
      eventType: "subscription.paid",
      createdAt: new Date(),
      raw: {},
      subscription: {
        id: "sub_1",
        status: "active",
        customerId: "cust_1",
        productId: "prod_unknown",
        currentPeriodStart: "2026-10-01T00:00:00.000Z",
        currentPeriodEnd: "2026-11-01T00:00:00.000Z",
        canceledAt: null,
        metadata: {},
      },
    });
    const findBuilder = makeQueryBuilder({ data: null, error: null });
    const insertBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(findBuilder)
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(updateBuilder);
    lookupUserIdByProviderSubscriptionId.mockResolvedValueOnce("user-1");
    getTierForProductId.mockReturnValueOnce(null);
    lookupTierByProviderSubscriptionId.mockResolvedValueOnce("pro");

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(upsertSubscriptionFromProvider).toHaveBeenCalledWith("user-1", "pro", expect.anything());
  });

  it("processes a refund.created event by delegating to handleRefund", async () => {
    parseWebhookEvent.mockReturnValueOnce({
      id: "evt_5",
      eventType: "refund.created",
      createdAt: new Date(),
      raw: {},
      refund: { id: "ref_1", subscriptionId: "sub_1", amount: 4900 },
    });
    const findBuilder = makeQueryBuilder({ data: null, error: null });
    const insertBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(findBuilder)
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(updateBuilder);

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(handleRefund).toHaveBeenCalledWith("sub_1", "evt_5");
  });

  it("acknowledges an unhandled event type without erroring", async () => {
    parseWebhookEvent.mockReturnValueOnce({
      id: "evt_6",
      eventType: "dispute.created",
      createdAt: new Date(),
      raw: {},
    });
    const findBuilder = makeQueryBuilder({ data: null, error: null });
    const insertBuilder = makeQueryBuilder({ data: { id: "row-1" }, error: null });
    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(findBuilder)
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(updateBuilder);

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(upsertSubscriptionFromProvider).not.toHaveBeenCalled();
    expect(handleRefund).not.toHaveBeenCalled();
  });
});
