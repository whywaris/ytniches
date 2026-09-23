"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { acceptInvitationAndActivateAction } from "@/app/invite/actions";
import type { InvitationPreview } from "@/lib/services/workspace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast-provider";

export interface InviteClientProps {
  token: string;
  preview: InvitationPreview | null;
  isAuthenticated: boolean;
}

// Application-Flow.md §5.2's "invalid token" messaging pattern, reused
// here for an invitation that's missing, expired, already accepted, or
// for the wrong account (getInvitationPreview/acceptInvitation don't
// distinguish these to the caller — same reasoning as a bad password-reset
// link, per that migration's own comment).
function InviteClient({ token, preview, isAuthenticated }: InviteClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [accepting, setAccepting] = React.useState(false);

  async function handleAccept() {
    setAccepting(true);
    const result = await acceptInvitationAndActivateAction(token);
    setAccepting(false);
    if (!result.ok) {
      showToast({ title: "That invitation is no longer valid", variant: "error" });
      return;
    }
    showToast({ title: `Joined ${result.value.name}`, variant: "success" });
    router.push("/workspace");
  }

  if (!preview) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4 p-6 text-center">
        <Card padding="lg">
          <p className="text-body text-text-primary">That invitation link is no longer valid.</p>
        </Card>
      </div>
    );
  }

  const loginUrl = `/login?redirect=${encodeURIComponent(`/invite?token=${token}`)}`;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-6 text-center">
      <Card padding="lg" className="flex flex-col items-center gap-3">
        <p className="text-h4 text-text-primary">
          You&apos;ve been invited to {preview.workspaceName}
        </p>
        <p className="text-body-sm text-text-secondary">Join as {preview.role}</p>
        {isAuthenticated ? (
          <Button loading={accepting} onClick={() => void handleAccept()}>
            Accept invitation
          </Button>
        ) : (
          <Link href={loginUrl}>
            <Button>Log in to accept</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}

export { InviteClient };
