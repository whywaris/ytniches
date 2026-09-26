import { createServiceClient } from "@/lib/supabase/service";
import type { Tier } from "@/lib/billing/products";

// D-059: a member of a workspace whose owner has a live Team subscription
// gets Team limits (feature gates, sync cadence, the workspace's shared
// tracked-channel pool). Otherwise their own plan applies. When the
// owner's Team lapses, members fall back to their own plan.
//
// Service client on purpose: a member can't read the owner's subscription
// under RLS. Server-only callers: tier resolution, tracking, the sync
// worker and the billing webhook.

const LIVE_STATUSES = new Set(["active", "past_due"]);

export interface EffectivePlan {
  tier: Tier | null;
  status: string | null;
  // The Team workspace whose pool this user's tracked channels count
  // against (owner included), when they belong to one with a live Team plan.
  teamWorkspaceId: string | null;
}

const NONE: EffectivePlan = { tier: null, status: null, teamWorkspaceId: null };

function asTier(value: string | null | undefined): Tier | null {
  return value === "starter" || value === "pro" || value === "team" ? value : null;
}

export async function getEffectivePlans(userIds: string[]): Promise<Map<string, EffectivePlan>> {
  const result = new Map<string, EffectivePlan>(userIds.map((id) => [id, NONE]));
  if (userIds.length === 0) return result;
  const service = createServiceClient();

  const [ownSubs, memberships] = await Promise.all([
    service
      .from("subscriptions")
      .select("user_id, tier, status")
      .in("user_id", userIds)
      .eq("is_current", true),
    service
      .from("workspace_members")
      .select("user_id, workspace_id, joined_at, workspaces(owner_id)")
      .in("user_id", userIds)
      .order("joined_at", { ascending: true }),
  ]);
  if (ownSubs.error)
    throw new Error(`getEffectivePlans subscriptions failed: ${ownSubs.error.message}`);
  if (memberships.error)
    throw new Error(`getEffectivePlans memberships failed: ${memberships.error.message}`);

  for (const sub of ownSubs.data ?? []) {
    result.set(sub.user_id, { tier: asTier(sub.tier), status: sub.status, teamWorkspaceId: null });
  }

  const ownerIds = [
    ...new Set(
      (memberships.data ?? [])
        .map((m) => m.workspaces?.owner_id)
        .filter((id): id is string => !!id),
    ),
  ];
  if (ownerIds.length === 0) return result;

  const ownerSubs = await service
    .from("subscriptions")
    .select("user_id, status")
    .in("user_id", ownerIds)
    .eq("is_current", true)
    .eq("tier", "team");
  if (ownerSubs.error)
    throw new Error(`getEffectivePlans owner plans failed: ${ownerSubs.error.message}`);
  const liveTeamOwners = new Map(
    (ownerSubs.data ?? [])
      .filter((sub) => LIVE_STATUSES.has(sub.status))
      .map((sub) => [sub.user_id, sub.status]),
  );

  // Earliest-joined live Team workspace wins if someone is in several.
  for (const membership of memberships.data ?? []) {
    const current = result.get(membership.user_id)!;
    if (current.teamWorkspaceId) continue;
    const ownerStatus = membership.workspaces
      ? liveTeamOwners.get(membership.workspaces.owner_id)
      : undefined;
    if (!ownerStatus) continue;
    const ownIsLiveTeam =
      current.tier === "team" && current.status !== null && LIVE_STATUSES.has(current.status);
    result.set(membership.user_id, {
      tier: "team",
      status: ownIsLiveTeam ? current.status : ownerStatus,
      teamWorkspaceId: membership.workspace_id,
    });
  }
  return result;
}

export async function getEffectivePlan(userId: string): Promise<EffectivePlan> {
  return (await getEffectivePlans([userId])).get(userId) ?? NONE;
}

// Everyone whose effective plan can change when this user's plan does:
// the user, plus the members of any workspace they own.
export async function usersAffectedByPlanOf(userId: string): Promise<string[]> {
  const service = createServiceClient();
  const { data, error } = await service
    .from("workspace_members")
    .select("user_id, workspaces!inner(owner_id)")
    .eq("workspaces.owner_id", userId);
  if (error) throw new Error(`usersAffectedByPlanOf failed: ${error.message}`);
  return [...new Set([userId, ...(data ?? []).map((row) => row.user_id)])];
}
