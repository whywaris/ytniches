import { getRequestContext } from "@/lib/context";
import { getWorkspace, listMyWorkspaceMemberships } from "@/lib/services/workspace";
import { WorkspaceClient } from "@/app/(app)/workspace/workspace-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace — YTNiches",
};

// PRD.md §8.1. D-044: no UI-UX-Flow.md screen spec exists for this route —
// built from existing primitives following this codebase's established
// list/detail patterns (see that decision for the follow-up doc task).
// A user belongs to at most one workspace (lib/services/workspace.ts's
// listMyWorkspaceMemberships comment) — the first membership found is
// "the" workspace, no switcher needed.
export default async function WorkspacePage() {
  const ctx = await getRequestContext();
  const memberships = await listMyWorkspaceMemberships(ctx);
  const membership = memberships[0] ?? null;

  if (!membership) {
    return <WorkspaceClient isTeamTier={ctx.tier === "team"} workspace={null} myRole={null} />;
  }

  const result = await getWorkspace(ctx, membership.workspaceId);
  return (
    <WorkspaceClient
      isTeamTier={ctx.tier === "team"}
      workspace={result.ok ? result.value : null}
      myRole={membership.role}
    />
  );
}
