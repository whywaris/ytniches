"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import {
  deleteWorkspaceAction,
  inviteMemberAction,
  leaveWorkspaceAction,
  removeMemberAction,
  updateMemberRoleAction,
} from "@/app/(app)/workspace/actions";
import type { WorkspaceRole, WorkspaceWithMembers } from "@/lib/services/workspace";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { useToast } from "@/components/ui/toast-provider";

export interface MembersClientProps {
  workspace: WorkspaceWithMembers;
  myUserId: string;
  myRole: WorkspaceRole;
}

const ROLE_OPTIONS: { value: WorkspaceRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

// D-044: no UI-UX-Flow.md spec — a single member list + invite form,
// following the same primitive-composition approach as workspace-client.tsx.
function MembersClient({ workspace, myUserId, myRole }: MembersClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isAdmin = myRole === "admin";

  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<WorkspaceRole>("editor");
  const [inviting, setInviting] = React.useState(false);
  const [pendingUserId, setPendingUserId] = React.useState<string | null>(null);

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    setInviting(true);
    const result = await inviteMemberAction(workspace.id, { email: inviteEmail, role: inviteRole });
    setInviting(false);
    if (!result.ok) {
      showToast({
        title:
          result.error.type === "not_admin"
            ? "Only admins can invite"
            : result.error.type === "workspace_full"
              ? `This workspace is full (${result.error.seats} seats, pending invites included). Remove a member or let an invite expire first.`
              : "Couldn't send invite",
        variant: "error",
      });
      return;
    }
    setInviteEmail("");
    showToast({ title: `Invite sent to ${inviteEmail}`, variant: "success" });
  }

  async function handleRoleChange(userId: string, role: WorkspaceRole) {
    setPendingUserId(userId);
    const result = await updateMemberRoleAction(workspace.id, userId, { role });
    setPendingUserId(null);
    if (!result.ok) {
      showToast({ title: "Couldn't update role", variant: "error" });
      return;
    }
    router.refresh();
  }

  async function handleRemove(userId: string) {
    setPendingUserId(userId);
    const result = await removeMemberAction(workspace.id, userId);
    setPendingUserId(null);
    if (!result.ok) {
      showToast({
        title:
          result.error.type === "cannot_remove_owner"
            ? "The workspace owner can't be removed"
            : "Couldn't remove member",
        variant: "error",
      });
      return;
    }
    router.refresh();
  }

  async function handleLeave() {
    const result = await leaveWorkspaceAction(workspace.id);
    if (!result.ok) {
      showToast({
        title: "Transfer ownership or delete the workspace before leaving",
        variant: "error",
      });
      return;
    }
    router.push("/workspace");
  }

  async function handleDelete() {
    const result = await deleteWorkspaceAction(workspace.id);
    if (!result.ok) {
      showToast({ title: "Only admins can delete the workspace", variant: "error" });
      return;
    }
    router.push("/workspace");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-h2 text-text-primary">{workspace.name} — Members</h1>

      <Card padding="lg" className="flex flex-col gap-1">
        {workspace.members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 py-2">
            <Avatar
              size="sm"
              src={member.avatarUrl ?? undefined}
              fallback={(member.name ?? "?").slice(0, 2).toUpperCase()}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm text-text-primary">
                {member.name ?? "Unnamed"}
                {member.userId === myUserId ? " (you)" : ""}
                {member.userId === workspace.ownerId ? " · Owner" : ""}
              </p>
            </div>
            {isAdmin && member.userId !== workspace.ownerId ? (
              <>
                <Select
                  label="Role"
                  options={ROLE_OPTIONS}
                  value={member.role}
                  disabled={pendingUserId === member.userId}
                  onValueChange={(value) =>
                    void handleRoleChange(member.userId, value as WorkspaceRole)
                  }
                  className="w-32"
                />
                <Button
                  size="xs"
                  variant="ghost"
                  loading={pendingUserId === member.userId}
                  onClick={() => void handleRemove(member.userId)}
                >
                  Remove
                </Button>
              </>
            ) : (
              <span className="shrink-0 text-caption text-text-tertiary">{member.role}</span>
            )}
          </div>
        ))}
      </Card>

      {isAdmin ? (
        <Card padding="lg" className="flex flex-col gap-3">
          <p className="text-h4 text-text-primary">Invite a member</p>
          <form
            onSubmit={(event) => void handleInvite(event)}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <TextInput
              label="Email"
              type="email"
              placeholder="teammate@example.com"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              className="flex-1"
            />
            <Select
              label="Role"
              options={ROLE_OPTIONS}
              value={inviteRole}
              onValueChange={(value) => setInviteRole(value as WorkspaceRole)}
              className="w-32"
            />
            <Button
              type="submit"
              loading={inviting}
              disabled={!inviteEmail.trim()}
              className="self-end"
            >
              Send invite
            </Button>
          </form>
        </Card>
      ) : null}

      <div className="flex gap-2">
        {myUserId !== workspace.ownerId ? (
          <Button variant="secondary" onClick={() => void handleLeave()}>
            Leave workspace
          </Button>
        ) : null}
        {isAdmin ? (
          <Button variant="destructive" onClick={() => void handleDelete()}>
            Delete workspace
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export { MembersClient };
