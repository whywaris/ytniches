"use client";

import * as React from "react";

import Link from "next/link";

import {
  createWorkspaceAction,
  setActiveWorkspaceCookieAction,
} from "@/app/(app)/workspace/actions";
import type { Workspace, WorkspaceRole } from "@/lib/services/workspace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextInput } from "@/components/ui/text-input";
import { useToast } from "@/components/ui/toast-provider";
import { UpgradeModal } from "@/components/features/billing/upgrade-modal";

export interface WorkspaceClientProps {
  isTeamTier: boolean;
  workspace: Workspace | null;
  myRole: WorkspaceRole | null;
}

// D-044: no UI-UX-Flow.md spec for this screen — built from existing
// primitives (Card, Badge, Button, TextInput, UpgradeModal) following the
// same paid-tier gating pattern already used on /settings/notifications
// (visible with a badge + upsell, not hidden like an unbuilt feature).
function WorkspaceClient({ isTeamTier, workspace, myRole }: WorkspaceClientProps) {
  const { showToast } = useToast();
  const [name, setName] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  const [created, setCreated] = React.useState(workspace);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    const result = await createWorkspaceAction({ name });
    setCreating(false);
    if (!result.ok) {
      showToast({
        title:
          result.error.type === "not_team_tier"
            ? "Upgrade to Team required"
            : "Couldn't create workspace",
        variant: "error",
      });
      if (result.error.type === "not_team_tier") setShowUpgrade(true);
      return;
    }
    await setActiveWorkspaceCookieAction(result.value.id);
    setCreated(result.value);
    showToast({ title: "Workspace created", variant: "success" });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <h1 className="text-h2 text-text-primary">Workspace</h1>
        {isTeamTier ? null : (
          <span className="rounded-xs bg-accent-subtle px-1.5 py-0.5 text-caption font-medium text-accent">
            Team
          </span>
        )}
      </div>

      {!isTeamTier ? (
        <Card padding="lg" className="flex flex-col gap-3">
          <p className="text-body text-text-secondary">
            Workspaces let your team share tracked channels, prompts, and the content calendar.
            Available on the Team plan.
          </p>
          <Button className="self-start" onClick={() => setShowUpgrade(true)}>
            Upgrade to Team
          </Button>
        </Card>
      ) : created ? (
        <Card padding="lg" className="flex flex-col gap-3">
          <p className="text-h4 text-text-primary">{created.name}</p>
          <p className="text-body-sm text-text-secondary">/{created.slug}</p>
          <Link href="/workspace/members">
            <Button variant="secondary" className="self-start">
              Manage members
            </Button>
          </Link>
        </Card>
      ) : (
        <Card padding="lg" className="flex flex-col gap-3">
          <p className="text-body text-text-secondary">
            Create a workspace to start collaborating with your team.
          </p>
          <form onSubmit={(event) => void handleCreate(event)} className="flex flex-col gap-3">
            <TextInput
              label="Workspace name"
              placeholder="Acme Creators"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button type="submit" loading={creating} disabled={!name.trim()} className="self-start">
              Create workspace
            </Button>
          </form>
        </Card>
      )}

      {myRole ? <p className="text-caption text-text-tertiary">Your role: {myRole}</p> : null}

      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        reason="Workspaces are available on the Team plan."
      />
    </div>
  );
}

export { WorkspaceClient };
