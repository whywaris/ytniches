import { createClient } from "@/lib/supabase/server";

// TRD.md §3.1: RequestContext is constructed by middleware, carries user +
// tier + workspace. Tier/workspaceId aren't added yet — subscriptions rows
// don't exist until billing (Phase 1 Task 5) — adding them later is
// additive, not a rewrite.
export interface RequestContext {
  userId: string;
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

  return { userId: user.id };
}
