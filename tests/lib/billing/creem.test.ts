import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    text: async () => JSON.stringify(body),
    json: async () => body,
  } as unknown as Response;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("CREEM_API_KEY_TEST", "test-key");
  vi.stubEnv("CREEM_API_KEY_PROD", "prod-key");
  vi.stubEnv("CREEM_WEBHOOK_SECRET", "whsec_test");
  vi.stubEnv("CREEM_PRODUCT_ID_PRO_MONTHLY", "prod_pro_monthly");
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("createCheckoutSession", () => {
  it("posts to /checkouts with the resolved product id, email, and metadata", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { id: "ch_1", checkout_url: "https://creem.io/pay/ch_1" }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { createCheckoutSession } = await import("@/lib/billing/creem");

    const result = await createCheckoutSession({
      userId: "user-1",
      tier: "pro",
      billingFrequency: "monthly",
      customerEmail: "ada@example.com",
      successUrl: "https://ytniches.com/billing/success",
    });

    expect(result).toEqual({ id: "ch_1", checkoutUrl: "https://creem.io/pay/ch_1" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://test-api.creem.io/v1/checkouts");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      product_id: "prod_pro_monthly",
      customer: { email: "ada@example.com" },
      success_url: "https://ytniches.com/billing/success",
      metadata: { userId: "user-1", tier: "pro" },
    });
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("test-key");
  });

  it("uses the production base URL and key when NODE_ENV=production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { id: "ch_1", checkout_url: "https://creem.io/pay/ch_1" }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { createCheckoutSession } = await import("@/lib/billing/creem");

    await createCheckoutSession({
      userId: "user-1",
      tier: "pro",
      billingFrequency: "monthly",
      customerEmail: "ada@example.com",
      successUrl: "https://ytniches.com/billing/success",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.creem.io/v1/checkouts");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("prod-key");
  });

  it("throws with the response body on a non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(400, { error: "invalid product" })),
    );
    const { createCheckoutSession } = await import("@/lib/billing/creem");

    await expect(
      createCheckoutSession({
        userId: "user-1",
        tier: "pro",
        billingFrequency: "monthly",
        customerEmail: "ada@example.com",
        successUrl: "https://ytniches.com/billing/success",
      }),
    ).rejects.toThrow(/400/);
  });
});

describe("createCustomerPortalUrl", () => {
  it("posts the Creem customer id and returns the portal link", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, { customer_portal_link: "https://creem.io/my-orders/login/xyz" }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { createCustomerPortalUrl } = await import("@/lib/billing/creem");

    const url = await createCustomerPortalUrl("cust_1");

    expect(url).toBe("https://creem.io/my-orders/login/xyz");
    const [requestUrl, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(requestUrl).toBe("https://test-api.creem.io/v1/customers/billing");
    expect(JSON.parse(init.body as string)).toEqual({ customer_id: "cust_1" });
  });
});

describe("getSubscription", () => {
  it("maps the Creem response to ProviderSubscription", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        id: "sub_1",
        status: "active",
        customer: { id: "cust_1", email: "ada@example.com" },
        product: "prod_pro_monthly",
        current_period_start_date: "2026-09-01T00:00:00.000Z",
        current_period_end_date: "2026-10-01T00:00:00.000Z",
        canceled_at: null,
        metadata: { userId: "user-1", tier: "pro" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getSubscription } = await import("@/lib/billing/creem");

    const result = await getSubscription("sub_1");

    expect(result).toEqual({
      id: "sub_1",
      status: "active",
      customerId: "cust_1",
      productId: "prod_pro_monthly",
      currentPeriodStart: "2026-09-01T00:00:00.000Z",
      currentPeriodEnd: "2026-10-01T00:00:00.000Z",
      canceledAt: null,
      metadata: { userId: "user-1", tier: "pro" },
      amountCents: null,
      billingInterval: null,
      lastTransaction: null,
    });
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("https://test-api.creem.io/v1/subscriptions?subscription_id=sub_1");
  });

  // Shape taken from our stored subscription.paid payload (real Creem data).
  it("reads price, interval, and last transaction from the expanded product", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        jsonResponse(200, {
          id: "sub_1",
          status: "active",
          customer: "cust_1",
          product: { id: "prod_pro_monthly", price: 4900, recurring_interval: "month" },
          current_period_start_date: "2026-09-22T08:19:14.778Z",
          current_period_end_date: "2026-10-22T08:19:14.778Z",
          last_transaction: { id: "tran_1", amount: 4900, created_at: 1790065156614 },
        }),
      ),
    );
    const { getSubscription } = await import("@/lib/billing/creem");

    const result = await getSubscription("sub_1");

    expect(result.amountCents).toBe(4900);
    expect(result.billingInterval).toBe("month");
    expect(result.lastTransaction).toEqual({
      id: "tran_1",
      amountCents: 4900,
      createdAt: new Date(1790065156614).toISOString(),
    });
  });

  it("ignores an interval that isn't month/year", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        jsonResponse(200, {
          id: "sub_1",
          status: "active",
          customer: "cust_1",
          product: { id: "p", price: 100, recurring_interval: "week" },
          current_period_start_date: "2026-09-22T00:00:00.000Z",
          current_period_end_date: "2026-09-29T00:00:00.000Z",
        }),
      ),
    );
    const { getSubscription } = await import("@/lib/billing/creem");
    expect((await getSubscription("sub_1")).billingInterval).toBeNull();
  });
});

describe("refundTransaction", () => {
  it("POSTs the transaction id to /refunds with an idempotency key", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { id: "ref_1", status: "pending" }));
    vi.stubGlobal("fetch", fetchMock);
    const { refundTransaction } = await import("@/lib/billing/creem");

    const result = await refundTransaction("tran_1", "refund:tran_1");

    expect(result).toEqual({ id: "ref_1", status: "pending" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://test-api.creem.io/v1/refunds");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ transaction_id: "tran_1" });
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe("refund:tran_1");
  });

  it("throws on a non-2xx response instead of failing silently", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(jsonResponse(400, { error: "bad" })));
    const { refundTransaction } = await import("@/lib/billing/creem");
    await expect(refundTransaction("tran_1", "refund:tran_1")).rejects.toThrow("(400)");
  });
});

describe("cancelSubscription", () => {
  it("sends mode=scheduled when atPeriodEnd is true", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(200, { id: "sub_1" }));
    vi.stubGlobal("fetch", fetchMock);
    const { cancelSubscription } = await import("@/lib/billing/creem");

    await cancelSubscription("sub_1", true);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://test-api.creem.io/v1/subscriptions/sub_1/cancel");
    expect(JSON.parse(init.body as string)).toEqual({ mode: "scheduled" });
  });

  it("sends mode=immediate when atPeriodEnd is false", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse(200, { id: "sub_1" }));
    vi.stubGlobal("fetch", fetchMock);
    const { cancelSubscription } = await import("@/lib/billing/creem");

    await cancelSubscription("sub_1", false);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ mode: "immediate" });
  });
});

describe("verifyWebhook", () => {
  it("accepts a correctly signed payload", async () => {
    const { verifyWebhook } = await import("@/lib/billing/creem");
    const payload = JSON.stringify({ id: "evt_1", eventType: "checkout.completed" });

    expect(verifyWebhook(payload, sign(payload, "whsec_test"))).toBe(true);
  });

  it("rejects a payload signed with the wrong secret", async () => {
    const { verifyWebhook } = await import("@/lib/billing/creem");
    const payload = JSON.stringify({ id: "evt_1", eventType: "checkout.completed" });

    expect(verifyWebhook(payload, sign(payload, "wrong-secret"))).toBe(false);
  });

  it("rejects a tampered payload even with a validly-formed signature", async () => {
    const { verifyWebhook } = await import("@/lib/billing/creem");
    const original = JSON.stringify({ id: "evt_1", eventType: "checkout.completed" });
    const tampered = JSON.stringify({ id: "evt_1", eventType: "subscription.canceled" });

    expect(verifyWebhook(tampered, sign(original, "whsec_test"))).toBe(false);
  });

  it("rejects an empty signature without throwing", async () => {
    const { verifyWebhook } = await import("@/lib/billing/creem");

    expect(verifyWebhook("{}", "")).toBe(false);
  });

  it("rejects a malformed (wrong-length) signature without throwing", async () => {
    const { verifyWebhook } = await import("@/lib/billing/creem");

    expect(verifyWebhook("{}", "not-a-real-signature")).toBe(false);
  });
});

describe("parseWebhookEvent", () => {
  it("parses a checkout.completed event", async () => {
    const { parseWebhookEvent } = await import("@/lib/billing/creem");
    const payload = JSON.stringify({
      id: "evt_1",
      eventType: "checkout.completed",
      created_at: 1728734325927,
      object: {
        id: "ch_1",
        customer: { id: "cust_1" },
        product: { id: "prod_pro_monthly" },
        subscription: { id: "sub_1" },
        metadata: { userId: "user-1", tier: "pro" },
      },
    });

    const event = parseWebhookEvent(payload);

    expect(event.eventType).toBe("checkout.completed");
    expect(event.id).toBe("evt_1");
    expect(event.createdAt).toEqual(new Date(1728734325927));
    expect(event.checkout).toEqual({
      id: "ch_1",
      customerId: "cust_1",
      productId: "prod_pro_monthly",
      subscriptionId: "sub_1",
      metadata: { userId: "user-1", tier: "pro" },
    });
  });

  it("parses a subscription.paid event", async () => {
    const { parseWebhookEvent } = await import("@/lib/billing/creem");
    const payload = JSON.stringify({
      id: "evt_2",
      eventType: "subscription.paid",
      created_at: 1728734327355,
      object: {
        id: "sub_1",
        status: "active",
        customer: "cust_1",
        product: "prod_pro_monthly",
        current_period_start_date: "2026-09-01T00:00:00.000Z",
        current_period_end_date: "2026-10-01T00:00:00.000Z",
        canceled_at: null,
        metadata: { userId: "user-1", tier: "pro" },
      },
    });

    const event = parseWebhookEvent(payload);

    expect(event.eventType).toBe("subscription.paid");
    expect(event.subscription).toEqual({
      id: "sub_1",
      status: "active",
      customerId: "cust_1",
      productId: "prod_pro_monthly",
      currentPeriodStart: "2026-09-01T00:00:00.000Z",
      currentPeriodEnd: "2026-10-01T00:00:00.000Z",
      canceledAt: null,
      metadata: { userId: "user-1", tier: "pro" },
      amountCents: null,
      billingInterval: null,
      lastTransaction: null,
    });
  });

  it("parses a subscription.past_due event (dunning)", async () => {
    const { parseWebhookEvent } = await import("@/lib/billing/creem");
    const payload = JSON.stringify({
      id: "evt_3",
      eventType: "subscription.past_due",
      created_at: 1728734327355,
      object: {
        id: "sub_1",
        status: "past_due",
        customer: "cust_1",
        product: "prod_pro_monthly",
        current_period_start_date: "2026-09-01T00:00:00.000Z",
        current_period_end_date: "2026-10-01T00:00:00.000Z",
        canceled_at: null,
      },
    });

    const event = parseWebhookEvent(payload);

    expect(event.subscription?.status).toBe("past_due");
  });

  it("parses a refund.created event", async () => {
    const { parseWebhookEvent } = await import("@/lib/billing/creem");
    const payload = JSON.stringify({
      id: "evt_4",
      eventType: "refund.created",
      created_at: 1728734327355,
      object: { id: "ref_1", subscription: "sub_1", amount: 4900 },
    });

    const event = parseWebhookEvent(payload);

    expect(event.refund).toEqual({ id: "ref_1", subscriptionId: "sub_1", amount: 4900 });
  });

  it("returns just the envelope for an unrecognized event type", async () => {
    const { parseWebhookEvent } = await import("@/lib/billing/creem");
    const payload = JSON.stringify({
      id: "evt_5",
      eventType: "dispute.created",
      created_at: 1728734327355,
      object: { id: "dsp_1" },
    });

    const event = parseWebhookEvent(payload);

    expect(event.eventType).toBe("dispute.created");
    expect(event.checkout).toBeUndefined();
    expect(event.subscription).toBeUndefined();
    expect(event.refund).toBeUndefined();
  });
});
