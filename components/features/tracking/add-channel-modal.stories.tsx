import * as React from "react";

import {
  AddChannelModal,
  type AddChannelErrorReason,
  type ChannelPreview,
  type ChannelSearchResultItem,
  type ValidateUrlError,
} from "@/components/features/tracking/add-channel-modal";
import { err, ok, type Result } from "@/lib/result";
import { Button } from "@/components/ui/button";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof AddChannelModal> = {
  title: "features/tracking/AddChannelModal",
  component: AddChannelModal,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof AddChannelModal>;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PREVIEW: ChannelPreview = {
  channelId: "chan-1",
  name: "Sleep Sounds Daily",
  avatarUrl: null,
  subscriberCount: 482_000,
  videoCount: 310,
};

const SEARCH_RESULTS: ChannelSearchResultItem[] = [
  { channelId: "chan-1", name: "Sleep Sounds Daily", avatarUrl: null, subscriberCount: 482_000 },
  { channelId: "chan-2", name: "Tiny Tech Reviews", avatarUrl: null, subscriberCount: 44_900 },
];

async function mockValidateUrl(url: string): Promise<Result<ChannelPreview, ValidateUrlError>> {
  await delay(500);
  if (url.includes("notfound")) return err({ type: "not_found" });
  if (!url.includes("youtube.com")) return err({ type: "invalid_url" });
  return ok(PREVIEW);
}

async function mockAddChannelOk(): Promise<Result<void, AddChannelErrorReason>> {
  await delay(500);
  return ok(undefined);
}

async function mockAddChannelTierLimit(): Promise<Result<void, AddChannelErrorReason>> {
  await delay(500);
  return err({ type: "tier_limit", limit: 10, current: 10 });
}

async function mockSearch(query: string): Promise<ChannelSearchResultItem[]> {
  await delay(500);
  return query ? SEARCH_RESULTS : [];
}

function Demo({
  onAddChannel = mockAddChannelOk,
}: {
  onAddChannel?: (channelId: string) => Promise<Result<void, AddChannelErrorReason>>;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Add channel</Button>
      <AddChannelModal
        open={open}
        onOpenChange={setOpen}
        onValidateUrl={mockValidateUrl}
        onAddChannel={onAddChannel}
        onSearch={mockSearch}
      />
    </>
  );
}

// Default (closed) — click through: paste "https://youtube.com/@sleep",
// Validate, then confirm the preview to add. Try "notfound" or a
// non-YouTube URL to see the invalid states, and the Search tab separately.
export const Default: Story = {
  render: () => <Demo />,
};

export const TierLimitReached: Story = {
  name: "Confirm fails (tier limit)",
  render: () => <Demo onAddChannel={mockAddChannelTierLimit} />,
};

// Always open, for the a11y addon to scan the dialog + tabs directly
// without needing an interaction step first.
export const OpenOnUrlTab: Story = {
  render: () => (
    <AddChannelModal
      open
      onOpenChange={() => {}}
      onValidateUrl={mockValidateUrl}
      onAddChannel={mockAddChannelOk}
      onSearch={mockSearch}
    />
  ),
};
