import { redirect } from "next/navigation";

import { getRequestContext } from "@/lib/context";
import { getWorkspace, listMyWorkspaceMemberships } from "@/lib/services/workspace";
import { listEntries } from "@/lib/services/calendar";
import { CalendarClient } from "@/app/(app)/calendar/calendar-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Calendar — YTNiches",
};

// Application-Flow.md §2.3: /calendar is already a top-level route (its
// own entry predates this build, "Phase 3, redirects to /dashboard in
// Phase 1"). Unlike /workspace/tasks (D-045), calendar_entries.workspace_id
// is nullable for a future personal-calendar case, so the top-level path
// matches the data model too -- this build's UI only exercises the
// workspace-scoped path (Phase 3 kickoff's own constraint).
export default async function CalendarPage() {
  const ctx = await getRequestContext();
  const memberships = await listMyWorkspaceMemberships(ctx);
  const membership = memberships[0] ?? null;
  if (!membership) {
    redirect("/workspace");
  }

  const workspaceResult = await getWorkspace(ctx, membership.workspaceId);
  if (!workspaceResult.ok) {
    redirect("/workspace");
  }

  const initialEntries = await listEntries(membership.workspaceId, {});

  // WorkspaceMember.id is the workspace_members row id, not the user's id
  // -- CalendarClient/EntryForm need the latter (see the same fix in
  // app/(app)/workspace/tasks/page.tsx).
  const members = workspaceResult.value.members.map((m) => ({ id: m.userId, name: m.name }));

  return (
    <CalendarClient
      workspaceId={membership.workspaceId}
      members={members}
      isContributor={membership.role === "admin" || membership.role === "editor"}
      initialEntries={initialEntries}
    />
  );
}
