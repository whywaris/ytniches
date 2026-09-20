import { Compass, Radar, Settings, Video } from "lucide-react";

import { CommandPalette } from "@/components/ui/command-palette";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof CommandPalette> = {
  title: "ui/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof CommandPalette>;

const GROUPS = [
  {
    heading: "Recent",
    items: [{ id: "recent-1", label: "AI Prompts", icon: <Video />, onSelect: () => {} }],
  },
  {
    heading: "Navigation",
    items: [
      {
        id: "niche-finder",
        label: "Niche Finder",
        icon: <Compass />,
        shortcut: "G N",
        onSelect: () => {},
      },
      { id: "tracking", label: "Competitor Tracking", icon: <Radar />, onSelect: () => {} },
      { id: "settings", label: "Settings", icon: <Settings />, onSelect: () => {} },
    ],
  },
];

export const OpenByDefault: Story = {
  render: () => <CommandPalette groups={GROUPS} open onOpenChange={() => {}} />,
};

export const TriggeredByShortcut: Story = {
  render: () => (
    <div className="text-body-sm text-text-secondary">
      Press <kbd>Cmd/Ctrl+K</kbd> to open.
      <CommandPalette groups={GROUPS} />
    </div>
  ),
};
