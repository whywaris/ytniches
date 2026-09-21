"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";

import { removeChannelFromTrackingAction } from "@/app/(app)/tracking/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-provider";

export function RemoveButton({
  channelId,
  channelName,
}: {
  channelId: string;
  channelName: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleConfirm() {
    setPending(true);
    const result = await removeChannelFromTrackingAction(channelId);
    setPending(false);
    setOpen(false);
    if (result.ok) {
      showToast({ title: `Removed ${channelName} from tracking`, variant: "info" });
      router.push("/tracking");
    } else {
      showToast({ title: "This channel wasn't tracked", variant: "warning" });
    }
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 aria-hidden="true" />
        Remove from tracking
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Remove ${channelName} from tracking?`}
        description="You can add it back to tracking at any time."
        confirmLabel="Remove"
        destructive
        loading={pending}
        onConfirm={() => void handleConfirm()}
      />
    </>
  );
}
