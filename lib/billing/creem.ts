import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import { getProductId, type BillingFrequency, type Tier } from "@/lib/billing/products";

// Monetization.md §4.6 / TRD.md §4.6: test key used in dev + preview,
// production key only in production. Base URL includes /v1 (verified
// against Creem's own docs, not guessed) -- every path below is relative
// to it, no leading /v1.
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.creem.io/v1"
    : "https://test-api.creem.io/v1";

function apiKey(): string {
  const key =
    process.env.NODE_ENV === "production"
      ? process.env.CREEM_API_KEY_PROD
      : process.env.CREEM_API_KEY_TEST;
  if (!key) {
    throw new Error(
      `Missing ${process.env.NODE_ENV === "production" ? "CREEM_API_KEY_PROD" : "CREEM_API_KEY_TEST"}`,
    );
  }
  return key;
}

async function creemFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "x-api-key": apiKey(),
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Creem API ${init.method ?? "GET"} ${path} failed (${response.status}): ${body}`,
    );
  }

  return (await response.json()) as T;
}

export interface CheckoutInput {
  userId: string;
  tier: Tier;
  billingFrequency: BillingFrequency;
  customerEmail: string;
  successUrl: string;
}

export interface CheckoutSession {
  id: string;
  checkoutUrl: string;
}

// Monetization.md §4.4 step 2: product ID + user email + metadata
// (user_id, tier) -- metadata round-trips onto the resulting subscription
// (verified against Creem's own checkout.completed webhook example) so
// the webhook handler can map a Creem subscription back to our user
// without us having to look anything up first.
export async function createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession> {
  const body = {
    product_id: getProductId(input.tier, input.billingFrequency),
    customer: { email: input.customerEmail },
    success_url: input.successUrl,
    metadata: { userId: input.userId, tier: input.tier },
  };

  const result = await creemFetch<{ id: string; checkout_url: string }>("/checkouts", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return { id: result.id, checkoutUrl: result.checkout_url };
}

// Creem's real endpoint takes a Creem customer id, not our user id --
// despite TRD.md §6.3's documented `createCustomerPortalUrl(userId)`
// interface shape, resolving userId -> Creem customer id needs our own
// subscriptions table (lib/services/billing.ts's job, via getSubscription
// below), so this wrapper stays a pure API client with no DB access of
// its own. Callers pass the already-resolved Creem customer id.
export async function createCustomerPortalUrl(customerId: string): Promise<string> {
  const result = await creemFetch<{ customer_portal_link: string }>("/customers/billing", {
    method: "POST",
    body: JSON.stringify({ customer_id: customerId }),
  });
  return result.customer_portal_link;
}

const SUBSCRIPTION_STATUSES = [
  "active",
  "canceled",
  "unpaid",
  "paused",
  "trialing",
  "scheduled_cancel",
  "past_due",
] as const;
export type ProviderSubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export interface ProviderSubscription {
  id: string;
  status: ProviderSubscriptionStatus;
  customerId: string;
  productId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  metadata: Record<string, unknown>;
}

function idOf(value: string | { id: string }): string {
  return typeof value === "string" ? value : value.id;
}

const ProviderSubscriptionResponseSchema = z.object({
  id: z.string(),
  status: z.enum(SUBSCRIPTION_STATUSES),
  customer: z.union([z.string(), z.object({ id: z.string() })]),
  product: z.union([z.string(), z.object({ id: z.string() })]),
  current_period_start_date: z.string(),
  current_period_end_date: z.string(),
  canceled_at: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function toProviderSubscription(
  raw: z.infer<typeof ProviderSubscriptionResponseSchema>,
): ProviderSubscription {
  return {
    id: raw.id,
    status: raw.status,
    customerId: idOf(raw.customer),
    productId: idOf(raw.product),
    currentPeriodStart: raw.current_period_start_date,
    currentPeriodEnd: raw.current_period_end_date,
    canceledAt: raw.canceled_at ?? null,
    metadata: raw.metadata ?? {},
  };
}

export async function getSubscription(
  providerSubscriptionId: string,
): Promise<ProviderSubscription> {
  const result = await creemFetch<unknown>(
    `/subscriptions?subscription_id=${encodeURIComponent(providerSubscriptionId)}`,
  );
  return toProviderSubscription(ProviderSubscriptionResponseSchema.parse(result));
}

// Monetization.md §6.1: cancellation is at period end, not immediate --
// atPeriodEnd=true maps to Creem's "scheduled" cancel mode.
export async function cancelSubscription(
  providerSubscriptionId: string,
  atPeriodEnd: boolean,
): Promise<void> {
  await creemFetch(`/subscriptions/${encodeURIComponent(providerSubscriptionId)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ mode: atPeriodEnd ? "scheduled" : "immediate" }),
  });
}

// Security.md §4.8: verify BEFORE parsing. Header is `creem-signature`
// (verified against Creem's own docs -- not `x-creem-signature`, despite
// that name appearing in Monetization.md §4.5/§4.6 and Security.md §4.8's
// own text). HMAC-SHA256 of the raw request body, hex-encoded.
export function verifyWebhook(payload: string, signature: string): boolean {
  if (!signature) return false;

  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing CREEM_WEBHOOK_SECRET");
  }

  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  // timingSafeEqual throws on length mismatch rather than returning false --
  // guard explicitly so a malformed/short signature header doesn't crash
  // the request instead of being rejected normally.
  if (expectedBuffer.length !== signatureBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

export interface CreemWebhookEvent {
  id: string;
  eventType: string;
  createdAt: Date;
  raw: unknown;
  checkout?: {
    id: string;
    customerId: string;
    productId: string;
    subscriptionId: string | null;
    metadata: Record<string, unknown>;
  };
  subscription?: ProviderSubscription;
  refund?: {
    id: string;
    subscriptionId: string | null;
    amount: number | null;
  };
}

const WebhookEnvelopeSchema = z.object({
  id: z.string(),
  eventType: z.string(),
  created_at: z.number(),
  object: z.record(z.string(), z.unknown()),
});

const CheckoutObjectSchema = z.object({
  id: z.string(),
  customer: z.union([z.string(), z.object({ id: z.string() })]),
  product: z.union([z.string(), z.object({ id: z.string() })]),
  subscription: z
    .union([z.string(), z.object({ id: z.string() })])
    .nullable()
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const RefundObjectSchema = z.object({
  id: z.string(),
  subscription: z
    .union([z.string(), z.object({ id: z.string() })])
    .nullable()
    .optional(),
  amount: z.number().nullable().optional(),
});

// Every subscription.* event (paid/active/update/trialing/canceled/
// scheduled_cancel/expired/past_due/unpaid/paused) carries the same
// subscription entity shape (verified against 3 separate Creem example
// payloads) -- one parse path covers all of them.
function isSubscriptionEvent(eventType: string): boolean {
  return eventType.startsWith("subscription.");
}

// TRD.md §4.8's documented interface. Real Creem event names differ from
// Monetization.md §4.5's table (verified against Creem's own docs) --
// e.g. no "subscription.renewed" exists (the real equivalent is
// "subscription.paid", which fires on every successful charge including
// renewals), "subscription.cancelled" is spelled "subscription.canceled",
// "refund.issued" is "refund.created". The webhook handler
// (app/api/webhooks/creem/route.ts) maps these real names to
// Monetization.md's described behavior; this function only parses the
// envelope, it doesn't reinterpret event names.
export function parseWebhookEvent(payload: string): CreemWebhookEvent {
  const parsed = JSON.parse(payload) as unknown;
  const envelope = WebhookEnvelopeSchema.parse(parsed);

  const event: CreemWebhookEvent = {
    id: envelope.id,
    eventType: envelope.eventType,
    createdAt: new Date(envelope.created_at),
    raw: parsed,
  };

  if (envelope.eventType === "checkout.completed") {
    const checkout = CheckoutObjectSchema.parse(envelope.object);
    event.checkout = {
      id: checkout.id,
      customerId: idOf(checkout.customer),
      productId: idOf(checkout.product),
      subscriptionId: checkout.subscription ? idOf(checkout.subscription) : null,
      metadata: checkout.metadata ?? {},
    };
    return event;
  }

  if (isSubscriptionEvent(envelope.eventType)) {
    event.subscription = toProviderSubscription(
      ProviderSubscriptionResponseSchema.parse(envelope.object),
    );
    return event;
  }

  if (envelope.eventType === "refund.created") {
    const refund = RefundObjectSchema.parse(envelope.object);
    event.refund = {
      id: refund.id,
      subscriptionId: refund.subscription ? idOf(refund.subscription) : null,
      amount: refund.amount ?? null,
    };
    return event;
  }

  // Unrecognized event (dispute.created, Creem's own native credits
  // events, subscription.trialing which we never trigger since our
  // trial precedes any real Creem checkout, etc.) -- return the envelope
  // as-is; the webhook handler logs + 200s anything it doesn't handle.
  return event;
}
