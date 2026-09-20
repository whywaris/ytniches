import { Avatar } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Avatar> = {
  title: "ui/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar size="xs" fallback="AB" />
      <Avatar size="sm" fallback="AB" />
      <Avatar size="md" fallback="AB" />
      <Avatar size="lg" fallback="AB" />
      <Avatar size="xl" fallback="AB" />
    </div>
  ),
};

export const Group: StoryObj<typeof AvatarGroup> = {
  render: () => (
    <AvatarGroup
      max={3}
      avatars={[
        { fallback: "AA" },
        { fallback: "BB" },
        { fallback: "CC" },
        { fallback: "DD" },
        { fallback: "EE" },
      ]}
    />
  ),
};
