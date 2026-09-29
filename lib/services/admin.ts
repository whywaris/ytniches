import { randomUUID } from "node:crypto";

import {
  churnRate,
  mrrByTierCents,
  mrrCentsAt,
  mrrSeries,
  trialConversionRate,
  type SubscriptionFact,
} from "@/lib/admin-metrics";
import * as billing from "@/lib/billing";
import { invalidateTierCache } from "@/lib/billing/tier-cache";
import { computeBalance } from "@/lib/credits";
import { err, ok, type Result } from "@/lib/result";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  DAILY_QUOTA_LIMIT,
  SOFT_LIMIT,
  getQuotaByCategory,
  getQuotaBySource,
  getQuotaHistory,
  type QuotaDay,
} from "@/lib/youtube/quota";
import type { NicheCategory } from "@/lib/discovery/config";
import { MANUAL_EVENTS, type ManualJob } from "@/lib/discovery/events";
import { inngest } from "@/lib/inngest/client";
import {
  addManualSeed,
  deleteSeed,
  listSeeds,
  normalizeKeyword,
  type DiscoverySeed,
} from "@/lib/services/discovery/seeds";
import type { Json } from "@/lib/supabase/database.types";

// Security.md §3.3: the ONLY place admin data access happens, via the
// service role. Every exported mutation re-checks super_admin itself
// (defense in depth over middleware's /admin/* gate) and writes an
// admin_actions row (Backend-Schema.md §6.3).

export type ForbiddenError = { type: "forbidden" };
export type NotFoundError = { type: "not_found" };

// Resolves the caller from their own session, then reads role with the
// service client. A suspended admin is not an admin.
export async function requireSuperAdmin(): Promise<Result<{ adminId: string }, ForbiddenError>> {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) return err({ type: "forbidden" });

  const { data, error } = await createServiceClient()
    .from("profiles")
    .select("role, suspended_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(`requireSuperAdmin query failed: ${error.message}`);
  if (data?.role !== "super_admin" || data.suspended_at !== null) return err({ type: "forbidden" });
  return ok({ adminId: user.id });
}

async function logAdminAction(entry: {
  adminId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
}): Promise<void> {
  const { error } = await createServiceClient()
    .from("admin_actions")
    .insert({
      admin_id: entry.adminId,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      metadata: entry.metadata as Json,
    });
  if (error) throw new Error(`logAdminAction insert failed: ${error.message}`);
}

async function loadSubscriptionFacts(): Promise<SubscriptionFact[]> {
  const { data, error } = await createServiceClient()
    .from("subscriptions")
    .select(
      "user_id, tier, status, provider_subscription_id, amount_cents, billing_interval, created_at, cancelled_at",
    );
  if (error) throw new Error(`loadSubscriptionFacts query failed: ${error.message}`);
  return data.map((row) => ({
    userId: row.user_id,
    tier: row.tier,
    status: row.status,
    providerSubscriptionId: row.provider_subscription_id,
    amountCents: row.amount_cents,
    billingInterval: row.billing_interval,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at,
  }));
}

// ---------- Dashboard ----------

export interface AdminKpis {
  /** D-083: verified accounts only (Google accounts arrive verified). */
  totalSignups: number;
  signupsLast30d: number;
  /** Email sign-ups that haven't clicked their verification link yet. */
  pendingVerification: number;
  activeLast7d: number;
  activeLast30d: number;
  mrrCents: number;
  trialConversion: number | null;
  churn30d: number | null;
  quotaToday: QuotaDay;
  quotaLimit: number;
  recentWebhookErrors: { eventType: string; error: string; createdAt: string }[];
}

function daysAgoIso(days: number, now: Date): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function getAdminKpis(now: Date = new Date()): Promise<AdminKpis> {
  const supabase = createServiceClient();
  const countProfiles = (column: "created_at" | "last_active_at", sinceDays?: number) => {
    let query = supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    if (sinceDays !== undefined) query = query.gte(column, daysAgoIso(sinceDays, now));
    return query;
  };

  const [signups, active7, active30, webhookErrors, subs, quota] = await Promise.all([
    supabase.rpc("admin_signup_counts", { p_since: daysAgoIso(30, now) }).single(),
    countProfiles("last_active_at", 7),
    countProfiles("last_active_at", 30),
    supabase
      .from("webhook_events")
      .select("event_type, error, created_at")
      .not("error", "is", null)
      .order("created_at", { ascending: false })
      .limit(10),
    loadSubscriptionFacts(),
    getQuotaHistory(1, now),
  ]);
  for (const result of [signups, active7, active30, webhookErrors]) {
    if (result.error) throw new Error(`getAdminKpis query failed: ${result.error.message}`);
  }

  return {
    totalSignups: Number(signups.data?.verified ?? 0),
    signupsLast30d: Number(signups.data?.verified_since ?? 0),
    pendingVerification: Number(signups.data?.pending ?? 0),
    activeLast7d: active7.count ?? 0,
    activeLast30d: active30.count ?? 0,
    mrrCents: mrrCentsAt(subs, now),
    trialConversion: trialConversionRate(subs),
    churn30d: churnRate(subs, 30, now),
    quotaToday: quota[0],
    quotaLimit: DAILY_QUOTA_LIMIT,
    recentWebhookErrors: (webhookErrors.data ?? []).map((row) => ({
      eventType: row.event_type,
      error: row.error ?? "",
      createdAt: row.created_at,
    })),
  };
}

// ---------- Users ----------

export interface AdminUserFilters {
  search?: string;
  tier?: string;
  status?: "active" | "suspended";
  signedUpFrom?: string;
  signedUpTo?: string;
  page: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  lastActiveAt: string | null;
  suspendedAt: string | null;
  tier: string | null;
  subscriptionStatus: string | null;
}

export const ADMIN_USERS_PAGE_SIZE = 25;

export async function listUsers(
  filters: AdminUserFilters,
): Promise<{ users: AdminUserRow[]; total: number }> {
  const { data, error } = await createServiceClient().rpc("admin_list_users", {
    p_search: filters.search?.trim() || null,
    p_tier: filters.tier || null,
    p_status: filters.status ?? null,
    p_from: filters.signedUpFrom || null,
    p_to: filters.signedUpTo || null,
    p_limit: ADMIN_USERS_PAGE_SIZE,
    p_offset: (Math.max(1, filters.page) - 1) * ADMIN_USERS_PAGE_SIZE,
  });
  if (error) throw new Error(`listUsers rpc failed: ${error.message}`);
  const rows = data ?? [];
  return {
    total: rows[0]?.total_count ?? 0,
    users: rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.created_at,
      lastActiveAt: row.last_active_at,
      suspendedAt: row.suspended_at,
      tier: row.tier,
      subscriptionStatus: row.subscription_status,
    })),
  };
}

export interface AdminUserDetail {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  createdAt: string;
  lastActiveAt: string | null;
  suspendedAt: string | null;
  suspendedReason: string | null;
  subscription: {
    tier: string;
    status: string;
    amountCents: number | null;
    billingInterval: string | null;
    currentPeriodEnd: string;
    providerSubscriptionId: string | null;
  } | null;
  creditBalance: number;
  recentCreditEvents: {
    id: string;
    eventType: string;
    amount: number;
    reason: string;
    createdAt: string;
  }[];
  trackedChannels: { channelId: string; name: string; trackedSince: string }[];
  recentAdminActions: { id: string; action: string; status: string; createdAt: string }[];
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const supabase = createServiceClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, role, created_at, last_active_at, suspended_at, suspended_reason")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw new Error(`getUserDetail profile failed: ${profileError.message}`);
  if (!profile) return null;

  const [authUser, subscription, creditEvents, tracked, actions, balance] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase
      .from("subscriptions")
      .select(
        "tier, status, amount_cents, billing_interval, current_period_end, provider_subscription_id",
      )
      .eq("user_id", userId)
      .eq("is_current", true)
      .maybeSingle(),
    supabase
      .from("credit_events")
      .select("id, event_type, amount, reason, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("tracked_channels")
      .select("channel_id, tracked_since, channels(name)")
      .eq("user_id", userId)
      .order("tracked_since", { ascending: false }),
    supabase
      .from("admin_actions")
      .select("id, action, status, created_at")
      .eq("target_type", "user")
      .eq("target_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    computeBalance(supabase, userId),
  ]);
  for (const result of [subscription, creditEvents, tracked, actions]) {
    if (result.error) throw new Error(`getUserDetail query failed: ${result.error.message}`);
  }

  const sub = subscription.data;
  return {
    id: profile.id,
    email: authUser.data.user?.email ?? null,
    name: profile.name,
    role: profile.role,
    createdAt: profile.created_at,
    lastActiveAt: profile.last_active_at,
    suspendedAt: profile.suspended_at,
    suspendedReason: profile.suspended_reason,
    subscription: sub
      ? {
          tier: sub.tier,
          status: sub.status,
          amountCents: sub.amount_cents,
          billingInterval: sub.billing_interval,
          currentPeriodEnd: sub.current_period_end,
          providerSubscriptionId: sub.provider_subscription_id,
        }
      : null,
    creditBalance: balance,
    recentCreditEvents: (creditEvents.data ?? []).map((row) => ({
      id: row.id,
      eventType: row.event_type,
      amount: row.amount,
      reason: row.reason,
      createdAt: row.created_at,
    })),
    trackedChannels: (tracked.data ?? []).map((row) => ({
      channelId: row.channel_id,
      name: (row.channels as { name: string } | null)?.name ?? "Unknown channel",
      trackedSince: row.tracked_since,
    })),
    recentAdminActions: (actions.data ?? []).map((row) => ({
      id: row.id,
      action: row.action,
      status: row.status,
      createdAt: row.created_at,
    })),
  };
}

// ---------- Actions ----------

export async function grantCredits(
  userId: string,
  amount: number,
  reason: string,
): Promise<Result<void, ForbiddenError | NotFoundError>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;

  const supabase = createServiceClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (!target) return err({ type: "not_found" });

  const { error } = await supabase.from("credit_events").insert({
    user_id: userId,
    event_type: "grant",
    amount,
    reason: `Admin grant: ${reason}`,
    idempotency_key: `admin-grant:${randomUUID()}`,
  });
  if (error) throw new Error(`grantCredits insert failed: ${error.message}`);

  await logAdminAction({
    adminId: admin.value.adminId,
    action: "credit_grant",
    targetType: "user",
    targetId: userId,
    metadata: { amount, reason },
  });
  return ok(undefined);
}

// Immediate: sessions deleted (next getUser() fails), Auth ban (no new
// sign-in or refresh), and suspended_at (PostgREST pre-request hook
// rejects any still-unexpired access token on the Data API).
export async function suspendUser(
  userId: string,
  reason: string,
): Promise<Result<void, ForbiddenError | NotFoundError | { type: "cannot_suspend_self" }>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;
  if (admin.value.adminId === userId) return err({ type: "cannot_suspend_self" });

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ suspended_at: new Date().toISOString(), suspended_reason: reason })
    .eq("id", userId)
    .select("id");
  if (error) throw new Error(`suspendUser update failed: ${error.message}`);
  if (data.length === 0) return err({ type: "not_found" });

  const ban = await supabase.auth.admin.updateUserById(userId, { ban_duration: "876000h" });
  if (ban.error) throw new Error(`suspendUser ban failed: ${ban.error.message}`);
  const revoke = await supabase.rpc("admin_revoke_sessions", { target_user_id: userId });
  if (revoke.error) throw new Error(`suspendUser session revoke failed: ${revoke.error.message}`);

  await logAdminAction({
    adminId: admin.value.adminId,
    action: "user_suspend",
    targetType: "user",
    targetId: userId,
    metadata: { reason },
  });
  return ok(undefined);
}

export async function unsuspendUser(
  userId: string,
): Promise<Result<void, ForbiddenError | NotFoundError>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ suspended_at: null, suspended_reason: null })
    .eq("id", userId)
    .select("id");
  if (error) throw new Error(`unsuspendUser update failed: ${error.message}`);
  if (data.length === 0) return err({ type: "not_found" });

  const unban = await supabase.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (unban.error) throw new Error(`unsuspendUser unban failed: ${unban.error.message}`);

  await logAdminAction({
    adminId: admin.value.adminId,
    action: "user_unsuspend",
    targetType: "user",
    targetId: userId,
    metadata: {},
  });
  return ok(undefined);
}

export interface RefundPreview {
  transactionId: string;
  amountCents: number;
  paidAt: string;
  alreadyRequested: boolean;
}

export type RefundError =
  | ForbiddenError
  | { type: "no_paid_subscription" }
  | { type: "no_transaction" }
  | { type: "already_requested" };

async function resolveLastTransaction(
  userId: string,
): Promise<Result<{ id: string; amountCents: number; createdAt: string }, RefundError>> {
  const { data: sub, error } = await createServiceClient()
    .from("subscriptions")
    .select("provider_subscription_id")
    .eq("user_id", userId)
    .eq("is_current", true)
    .maybeSingle();
  if (error) throw new Error(`resolveLastTransaction query failed: ${error.message}`);
  if (!sub?.provider_subscription_id) return err({ type: "no_paid_subscription" });

  const providerSub = await billing.getSubscription(sub.provider_subscription_id);
  if (!providerSub.lastTransaction) return err({ type: "no_transaction" });
  return ok(providerSub.lastTransaction);
}

function refundKey(transactionId: string): string {
  return `refund:${transactionId}`;
}

// For the confirm dialog: what would be refunded, straight from Creem.
export async function getRefundPreview(
  userId: string,
): Promise<Result<RefundPreview, RefundError>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;

  const transaction = await resolveLastTransaction(userId);
  if (!transaction.ok) return transaction;

  const { data: existing } = await createServiceClient()
    .from("admin_actions")
    .select("id")
    .eq("idempotency_key", refundKey(transaction.value.id))
    .maybeSingle();

  return ok({
    transactionId: transaction.value.id,
    amountCents: transaction.value.amountCents,
    paidAt: transaction.value.createdAt,
    alreadyRequested: existing !== null,
  });
}

// Never edits subscriptions/credit rows directly: Creem does the refund,
// and the refund.created webhook updates our records. The admin_actions
// row keyed refund:<transaction_id> is inserted FIRST -- the unique index
// makes that insert the lock, so a double click or network retry gets
// already_requested and Creem is called exactly once. A definite Creem
// failure releases the key (idempotency_key -> null) so it can be retried.
export async function refundLastPayment(
  userId: string,
  expectedTransactionId: string,
): Promise<Result<billing.RefundResult, RefundError | { type: "transaction_changed" }>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;

  const transaction = await resolveLastTransaction(userId);
  if (!transaction.ok) return transaction;
  // The admin confirmed a specific payment; refuse if a newer one appeared
  // between the preview and the click.
  if (transaction.value.id !== expectedTransactionId) return err({ type: "transaction_changed" });

  const supabase = createServiceClient();
  const key = refundKey(transaction.value.id);
  const { data: lock, error: lockError } = await supabase
    .from("admin_actions")
    .insert({
      admin_id: admin.value.adminId,
      action: "refund",
      target_type: "user",
      target_id: userId,
      status: "pending",
      idempotency_key: key,
      metadata: { transactionId: transaction.value.id, amountCents: transaction.value.amountCents },
    })
    .select("id")
    .single();
  if (lockError) {
    if (lockError.code === "23505") return err({ type: "already_requested" });
    throw new Error(`refundLastPayment lock failed: ${lockError.message}`);
  }

  try {
    const refund = await billing.refundTransaction(transaction.value.id, key);
    await supabase
      .from("admin_actions")
      .update({
        status: "completed",
        metadata: {
          transactionId: transaction.value.id,
          amountCents: transaction.value.amountCents,
          refundId: refund.id,
          refundStatus: refund.status,
        },
      })
      .eq("id", lock.id);
    await invalidateTierCache(userId);
    return ok(refund);
  } catch (error) {
    await supabase
      .from("admin_actions")
      .update({
        status: "failed",
        idempotency_key: null,
        metadata: {
          transactionId: transaction.value.id,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      .eq("id", lock.id);
    throw error;
  }
}

// ---------- Revenue ----------

export interface RevenueReport {
  currentMrrCents: number;
  series: { month: string; mrrCents: number }[];
  byTier: Record<string, number>;
  refunds: { createdAt: string; amountCents: number | null; subscriptionId: string | null }[];
  failedPayments: { createdAt: string; eventType: string; subscriptionId: string | null }[];
  pastDueCount: number;
}

function payloadObject(raw: Json): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const object = (raw as Record<string, unknown>).object;
    if (object && typeof object === "object") return object as Record<string, unknown>;
  }
  return {};
}

function idOf(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
}

export async function getRevenueReport(now: Date = new Date()): Promise<RevenueReport> {
  const supabase = createServiceClient();
  const [subs, refunds, failed] = await Promise.all([
    loadSubscriptionFacts(),
    supabase
      .from("webhook_events")
      .select("raw_payload, created_at")
      .eq("event_type", "refund.created")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("webhook_events")
      .select("event_type, raw_payload, created_at")
      .in("event_type", ["subscription.past_due", "subscription.unpaid"])
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  if (refunds.error) throw new Error(`getRevenueReport refunds failed: ${refunds.error.message}`);
  if (failed.error)
    throw new Error(`getRevenueReport failed-payments failed: ${failed.error.message}`);

  return {
    currentMrrCents: mrrCentsAt(subs, now),
    series: mrrSeries(subs, 12, now),
    byTier: mrrByTierCents(subs, now),
    refunds: refunds.data.map((row) => {
      const object = payloadObject(row.raw_payload);
      return {
        createdAt: row.created_at,
        amountCents: typeof object.amount === "number" ? object.amount : null,
        subscriptionId: idOf(object.subscription),
      };
    }),
    failedPayments: failed.data.map((row) => ({
      createdAt: row.created_at,
      eventType: row.event_type,
      subscriptionId: idOf(payloadObject(row.raw_payload).id),
    })),
    pastDueCount: subs.filter((sub) => sub.status === "past_due").length,
  };
}

// ---------- API quotas ----------

export async function getQuotaReport(now: Date = new Date()) {
  const [history, bySource, byCategory] = await Promise.all([
    getQuotaHistory(7, now),
    getQuotaBySource(now),
    getQuotaByCategory(now),
  ]);
  return {
    history,
    today: history[history.length - 1],
    limit: DAILY_QUOTA_LIMIT,
    softLimit: SOFT_LIMIT,
    // D-075: used vs budget per category; per-source detail (D-069).
    byCategory,
    bySource,
  };
}

// ---------- Discovery Engine (D-069) ----------

export interface DiscoveryAdminReport {
  seeds: DiscoverySeed[];
  suggestions: NicheSuggestion[];
  channelsDiscovered: number;
  channelsEnriched: number;
  channelsClassified: number;
  niches: number;
  latestSnapshotDate: string | null;
  outliers: number;
}

async function countRows(table: "niches" | "outliers_feed"): Promise<number> {
  const { count, error } = await createServiceClient()
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(`countRows ${table} failed: ${error.message}`);
  return count ?? 0;
}

export async function getDiscoveryAdminReport(): Promise<DiscoveryAdminReport> {
  const supabase = createServiceClient();
  const countWhere = async (column: "discovered_at" | "enriched_at" | "classified_at") => {
    const { count, error } = await supabase
      .from("channels")
      .select("id", { count: "exact", head: true })
      .not(column, "is", null);
    if (error) throw new Error(`getDiscoveryAdminReport ${column} failed: ${error.message}`);
    return count ?? 0;
  };
  const [seeds, suggestions, discovered, enriched, classified, niches, outliers, latest] =
    await Promise.all([
      listSeeds(),
      listPendingSuggestions(),
      countWhere("discovered_at"),
      countWhere("enriched_at"),
      countWhere("classified_at"),
      countRows("niches"),
      countRows("outliers_feed"),
      supabase
        .from("niche_snapshots")
        .select("snapshot_date")
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
  if (latest.error)
    throw new Error(`getDiscoveryAdminReport snapshot failed: ${latest.error.message}`);
  return {
    seeds,
    suggestions,
    channelsDiscovered: discovered,
    channelsEnriched: enriched,
    channelsClassified: classified,
    niches,
    latestSnapshotDate: latest.data?.snapshot_date ?? null,
    outliers,
  };
}

export type SeedError = ForbiddenError | { type: "invalid_keyword" } | { type: "duplicate" };

export async function addDiscoverySeed(
  keyword: string,
  priority: number,
): Promise<Result<void, SeedError>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;
  const normalized = normalizeKeyword(keyword);
  if (!normalized) return err({ type: "invalid_keyword" });

  const added = await addManualSeed(normalized, priority);
  if (!added) return err({ type: "duplicate" });
  await logAdminAction({
    adminId: admin.value.adminId,
    action: "discovery_seed_add",
    targetType: "discovery_seed",
    targetId: null,
    metadata: { keyword: normalized, priority },
  });
  return ok(undefined);
}

export async function removeDiscoverySeed(seedId: string): Promise<Result<void, ForbiddenError>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;
  await deleteSeed(seedId);
  await logAdminAction({
    adminId: admin.value.adminId,
    action: "discovery_seed_remove",
    targetType: "discovery_seed",
    targetId: seedId,
    metadata: {},
  });
  return ok(undefined);
}

// ---------- Niche suggestions (D-080) ----------

export interface NicheSuggestion {
  id: string;
  slug: string;
  name: string;
  description: string;
  timesSuggested: number;
  exampleChannel: string | null;
}

async function listPendingSuggestions(): Promise<NicheSuggestion[]> {
  const { data, error } = await createServiceClient()
    .from("niche_suggestions")
    .select("id, slug, name, description, times_suggested, example:channels(name)")
    .eq("status", "pending")
    .order("times_suggested", { ascending: false })
    .limit(100);
  if (error) throw new Error(`listPendingSuggestions failed: ${error.message}`);
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    timesSuggested: row.times_suggested,
    exampleChannel: row.example?.name ?? null,
  }));
}

export type SuggestionError = ForbiddenError | { type: "not_found" } | { type: "duplicate" };

async function pendingSuggestion(id: string) {
  const { data, error } = await createServiceClient()
    .from("niche_suggestions")
    .select("id, slug, name, description")
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();
  if (error) throw new Error(`pendingSuggestion failed: ${error.message}`);
  return data;
}

async function markSuggestion(id: string, status: "approved" | "rejected", adminId: string) {
  const { error } = await createServiceClient()
    .from("niche_suggestions")
    .update({ status, reviewed_by: adminId, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`markSuggestion failed: ${error.message}`);
}

// Adds the suggested niche to the curated list, seeds discovery with its
// name, and sends unclassified channels back through classify so they can
// land in it.
export async function approveNicheSuggestion(
  suggestionId: string,
  category: NicheCategory,
): Promise<Result<void, SuggestionError>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;
  const suggestion = await pendingSuggestion(suggestionId);
  if (!suggestion) return err({ type: "not_found" });

  const supabase = createServiceClient();
  const keyword = normalizeKeyword(suggestion.name);
  const { error } = await supabase.from("niches").insert({
    slug: suggestion.slug,
    name: suggestion.name,
    description: suggestion.description,
    category,
    seed_keywords: keyword ? [keyword] : [],
  });
  if (error?.code === "23505") return err({ type: "duplicate" });
  if (error) throw new Error(`approveNicheSuggestion insert failed: ${error.message}`);

  await markSuggestion(suggestionId, "approved", admin.value.adminId);
  if (keyword) await addManualSeed(keyword, 5);
  const { error: resetError } = await supabase
    .from("channels")
    .update({ classified_at: null })
    .is("niche_id", null)
    .not("classified_at", "is", null);
  if (resetError) throw new Error(`approveNicheSuggestion reset failed: ${resetError.message}`);

  await logAdminAction({
    adminId: admin.value.adminId,
    action: "niche_suggestion_approve",
    targetType: "niche_suggestion",
    targetId: suggestionId,
    metadata: { slug: suggestion.slug, category },
  });
  return ok(undefined);
}

export async function rejectNicheSuggestion(
  suggestionId: string,
): Promise<Result<void, SuggestionError>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;
  const suggestion = await pendingSuggestion(suggestionId);
  if (!suggestion) return err({ type: "not_found" });
  await markSuggestion(suggestionId, "rejected", admin.value.adminId);
  await logAdminAction({
    adminId: admin.value.adminId,
    action: "niche_suggestion_reject",
    targetType: "niche_suggestion",
    targetId: suggestionId,
    metadata: { slug: suggestion.slug },
  });
  return ok(undefined);
}

// TRD.md §4.4: manual triggers carry `admin: true` for the audit trail.
export async function triggerDiscoveryJob(job: ManualJob): Promise<Result<void, ForbiddenError>> {
  const admin = await requireSuperAdmin();
  if (!admin.ok) return admin;
  await inngest.send({
    name: MANUAL_EVENTS[job],
    data: { admin: true, adminId: admin.value.adminId },
  });
  await logAdminAction({
    adminId: admin.value.adminId,
    action: "discovery_job_trigger",
    targetType: "job",
    targetId: null,
    metadata: { job },
  });
  return ok(undefined);
}
