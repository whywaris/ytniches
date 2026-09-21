import * as React from "react";

import { TrackedChannelsPanel } from "@/components/features/tracking/tracked-channels-panel";
import type { TrackedChannelSummary } from "@/components/features/tracking/types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof TrackedChannelsPanel> = {
  title: "features/tracking/TrackedChannelsPanel",
  component: TrackedChannelsPanel,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof TrackedChannelsPanel>;

const CHANNELS: TrackedChannelSummary[] = [
  {
    id: "chan-1",
    name: "Sleep Sounds Daily",
    avatarUrl: null,
    lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "chan-2",
    name: "Tiny Tech Reviews",
    avatarUrl: null,
    lastActivityAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  { id: "chan-3", name: "Home Cook Weekly", avatarUrl: null, lastActivityAt: null },
];

export const Default: Story = {
  render: () => <TrackedChannelsPanel channels={CHANNELS} className="w-72" />,
};

export const WithActiveChannel: Story = {
  render: () => (
    <TrackedChannelsPanel channels={CHANNELS} activeChannelId="chan-2" className="w-72" />
  ),
};

export const Empty: Story = {
  render: () => <TrackedChannelsPanel channels={[]} className="w-72" />,
};

export const Interactive: Story = {
  render: () => {
    function Demo() {
      const [active, setActive] = React.useState<string | null>(null);
      return (
        <TrackedChannelsPanel
          channels={CHANNELS}
          activeChannelId={active}
          onSelectChannel={setActive}
          className="w-72"
        />
      );
    }
    return <Demo />;
  },
};
