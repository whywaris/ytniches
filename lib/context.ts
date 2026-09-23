import { createClient, getCookie } from "@/lib/supabase/server";
import { resolveTier } from "@/lib/billing/tier-cache";
import type { Tier } from "@/lib/billing";

// TRD.md §3.1: RequestContext is constructed by middleware, carries user +
// tier + workspace.
//
// workspaceId comes from a client-set cookie (workspace-id), not a DB
// lookup -- Phase 3 kickoff's explicit constraint: resolving "which
// workspaces does this user belong to" on every authenticated request
// would be a DB hit on every server action just to populate a field most
// actions never read. The client sets this cookie once, on workspace
// selection (the workspace switcher, once built). It's treated as a
// hint, not a trust boundary: nothing reads workspace-scoped data off
// ctx.workspaceId alone -- every service that needs real workspace access
// validates membership itself (RLS on the query, or an explicit
// is_workspace_member-backed check), the same way ctx.userId is never
// trusted for row ownership without RLS backing it. Read via
// lib/supabase/server.ts's getCookie(), not a direct next/headers import
// here -- see that function's own comment for the Turbopack panic that
// drove this.
//
// tier is different -- multiple services gate on it per request
// (email eligibility, workspace features, credit limits), so it's
// resolved once here via a short-lived Redis cache
// (session:tier:{userId}, 60s TTL) instead of a raw subscriptions query
// every time. The cache itself (resolveTier/invalidateTierCache) lives in
// lib/billing/tier-cache.ts, not here, for the same reason.
export interface RequestContext {
  userId: string;
  workspaceId: string | null;
  tier: Tier | null;
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("getRequestContext() called with no active session");
    this.name = "UnauthenticatedError";
  }
}

// Throws rather than returning null: middleware already blocks
// unauthenticated requests from reaching any (app)/* route, so every
// caller of this function runs in an already-authenticated context and
// shouldn't have to handle the unauthenticated case itself.
export async function getRequestContext(): Promise<RequestContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthenticatedError();
  }

  const workspaceId = await getCookie("workspace-id");
  const tier = await resolveTier(user.id);

  return { userId: user.id, workspaceId, tier };
}
