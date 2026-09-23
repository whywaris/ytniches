import { redirect } from "next/navigation";

import { getRequestContext } from "@/lib/context";
import { getWorkspace, listMyWorkspaceMemberships } from "@/lib/services/workspace";
import { MembersClient } from "@/app/(app)/workspace/members/members-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace members — YTNiches",
};

export default async function WorkspaceMembersPage() {
  const ctx = await getRequestContext();
  const memberships = await listMyWorkspaceMemberships(ctx);
  const membership = memberships[0] ?? null;

  // No workspace yet — nothing to manage. Sends back to the create form
  // rather than rendering an empty member list.
  if (!membership) {
    redirect("/workspace");
  }

  const result = await getWorkspace(ctx, membership.workspaceId);
  if (!result.ok) {
    redirect("/workspace");
  }

  return <MembersClient workspace={result.value} myUserId={ctx.userId} myRole={membership.role} />;
}
