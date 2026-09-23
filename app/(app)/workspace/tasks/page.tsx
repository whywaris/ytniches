import { redirect } from "next/navigation";

import { getRequestContext } from "@/lib/context";
import { getWorkspace, listMyWorkspaceMemberships } from "@/lib/services/workspace";
import { listTasks } from "@/lib/services/tasks";
import { TasksClient } from "@/app/(app)/workspace/tasks/tasks-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks — YTNiches",
};

// DECISIONS.md D-045: /workspace/tasks, not a top-level /tasks.
export default async function TasksPage() {
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

  const initialTasks = await listTasks(ctx, membership.workspaceId, { view: "all" });

  // WorkspaceMember.id is the workspace_members row id, not the user's id
  // -- TasksClient/TaskForm need the latter (it's what assignee_id and
  // isWorkspaceMember's lookup actually compare against).
  const members = workspaceResult.value.members.map((m) => ({ id: m.userId, name: m.name }));

  return (
    <TasksClient
      workspaceId={membership.workspaceId}
      members={members}
      myUserId={ctx.userId}
      isContributor={membership.role === "admin" || membership.role === "editor"}
      initialTasks={initialTasks}
    />
  );
}
