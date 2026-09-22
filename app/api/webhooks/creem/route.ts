import {
  getSubscription,
  getTierForProductId,
  parseWebhookEvent,
  verifyWebhook,
  type CreemWebhookEvent,
  type Tier,
} from "@/lib/billing";
import {
  allocateCycleCredits,
  handleRefund,
  lookupTierByProviderSubscriptionId,
  lookupUserIdByProviderSubscriptionId,
  upsertSubscriptionFromProvider,
} from "@/lib/services/billing";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/lib/supabase/database.types";

// Security.md §4.8: reject stale events (>5 min old).
const STALE_WINDOW_MS = 5 * 60 * 1000;
const VALID_TIERS: readonly Tier[] = ["starter", "pro", "team"];

function isTier(value: unknown): value is Tier {
  return typeof value === "string" && (VALID_TIERS as readonly string[]).includes(value);
}

async function handleCheckoutCompleted(event: CreemWebhookEvent): Promise<void> {
  if (!event.checkout) {
    throw new Error("checkout.completed missing checkout object");
  }
  const { userId, tier } = event.checkout.metadata;
  if (typeof userId !== "string" || !isTier(tier)) {
    throw new Error("checkout.completed missing userId/tier metadata");
  }
  if (!event.checkout.subscriptionId) {
    throw new Error("checkout.completed missing subscription id");
  }

  // checkout.completed's embedded subscription object only has
  // {id, status, metadata} (verified against Creem's own example payload)
  // -- no period dates, so a follow-up getSubscription call is needed for
  // a correct row rather than waiting on whatever event fires next.
  const providerSub = await getSubscription(event.checkout.subscriptionId);
  await upsertSubscriptionFromProvider(userId, tier, providerSub);
  await allocateCycleCredits(userId, tier, `${providerSub.id}:${providerSub.currentPeriodStart}`);
}

async function handleSubscriptionEvent(event: CreemWebhookEvent): Promise<void> {
  if (!event.subscription) {
    throw new Error(`${event.eventType} missing subscription object`);
  }
  const sub = event.subscription;

  const metaUserId = typeof sub.metadata.userId === "string" ? sub.metadata.userId : null;
  const userId = metaUserId ?? (await lookupUserIdByProviderSubscriptionId(sub.id));
  if (!userId) {
    throw new Error(`Could not resolve userId for subscription ${sub.id}`);
  }

  const metaTier = isTier(sub.metadata.tier) ? sub.metadata.tier : null;
  const tier =
    metaTier ??
    getTierForProductId(sub.productId) ??
    (await lookupTierByProviderSubscriptionId(sub.id));
  if (!tier) {
    throw new Error(`Could not resolve tier for subscription ${sub.id}`);
  }

  await upsertSubscriptionFromProvider(userId, tier, sub);

  // Only an actual successful charge (subscription.paid) allocates a fresh
  // cycle's credits -- other subscription.* events (active/update/
  // trialing/etc) are status confirmations, not new-cycle triggers.
  // Monetization.md §5.5's "new tier's credits allocated immediately" on a
  // mid-cycle plan change (subscription.update) isn't implemented here --
  // deferred, see the Phase 5C report.
  if (event.eventType === "subscription.paid") {
    await allocateCycleCredits(userId, tier, `${sub.id}:${sub.currentPeriodStart}`);
  }
}

async function handleRefundEvent(event: CreemWebhookEvent): Promise<void> {
  if (!event.refund?.subscriptionId) return;
  await handleRefund(event.refund.subscriptionId, event.id);
}

// Monetization.md §4.5's event table names don't match Creem's real
// webhook events (verified against Creem's own docs -- see lib/billing/
// creem.ts's comment on parseWebhookEvent). This dispatch is against the
// real names: subscription.paid/active/update/trialing/canceled/
// scheduled_cancel/expired/past_due/unpaid/paused all share one handler
// since they carry the same subscription entity and only differ in
// whether a fresh cycle allocation fires. Anything else (dispute.created,
// Creem's own native credits.* events, which are unrelated to our own
// credit_events ledger) is acknowledged and ignored.
async function processEvent(event: CreemWebhookEvent): Promise<void> {
  if (event.eventType === "checkout.completed") {
    return handleCheckoutCompleted(event);
  }
  if (event.eventType.startsWith("subscription.")) {
    return handleSubscriptionEvent(event);
  }
  if (event.eventType === "refund.created") {
    return handleRefundEvent(event);
  }
}

// Security.md §4.8: verify signature BEFORE parsing body or doing any
// work. request.text() (not request.json()) preserves the exact raw bytes
// Creem signed -- parsing first and re-serializing could produce a
// byte-for-byte-different string that fails verification even for a
// genuine event.
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("creem-signature") ?? "";

  if (!verifyWebhook(rawBody, signature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: CreemWebhookEvent;
  try {
    event = parseWebhookEvent(rawBody);
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (Date.now() - event.createdAt.getTime() > STALE_WINDOW_MS) {
    return new Response("Stale event", { status: 400 });
  }

  const supabase = createServiceClient();

  // Idempotency: provider_event_id is the anchor. A row with
  // processed_at already set is a genuine duplicate delivery of an
  // already-handled event -- 200, no-op. A row that exists but was never
  // marked processed (a prior attempt crashed or threw) is eligible for
  // retry, same as an event we've never seen -- distinguishing this from
  // "duplicate" is why the row isn't just inserted-and-forgotten.
  const { data: existing, error: findError } = await supabase
    .from("webhook_events")
    .select("id, processed_at")
    .eq("provider_event_id", event.id)
    .maybeSingle();
  if (findError) {
    throw new Error(`webhook_events lookup failed: ${findError.message}`);
  }
  if (existing?.processed_at) {
    return new Response("OK", { status: 200 });
  }

  let rowId = existing?.id;
  if (!rowId) {
    const { data: inserted, error: insertError } = await supabase
      .from("webhook_events")
      .insert({
        provider: "creem",
        event_type: event.eventType,
        provider_event_id: event.id,
        raw_payload: event.raw as Json,
      })
      .select("id")
      .single();
    if (insertError) {
      // A concurrent request for the same event lost the race and its own
      // insert hit the unique index -- the winner is already handling it.
      if (insertError.code === "23505") {
        return new Response("OK", { status: 200 });
      }
      throw new Error(`webhook_events insert failed: ${insertError.message}`);
    }
    rowId = inserted.id;
  }

  try {
    await processEvent(event);
    await supabase
      .from("webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("id", rowId);
    return new Response("OK", { status: 200 });
  } catch (cause) {
    await supabase
      .from("webhook_events")
      .update({ error: cause instanceof Error ? cause.message : "unknown error" })
      .eq("id", rowId);
    // processed_at stays null -- Creem's own retry schedule will redeliver,
    // and that retry re-enters processEvent instead of being swallowed as
    // a duplicate.
    return new Response("Internal Server Error", { status: 500 });
  }
}
