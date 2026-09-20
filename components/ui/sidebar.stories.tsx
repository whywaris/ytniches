import { BarChart3, Compass, Radar, Settings, Video } from "lucide-react";

import { Sidebar, SidebarSection } from "@/components/ui/sidebar";
import { SidebarItem } from "@/components/ui/sidebar-item";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Sidebar> = {
  title: "ui/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  render: () => (
    <div className="h-96">
      <Sidebar>
        <SidebarSection title="Research">
          <SidebarItem icon={<Compass />} label="Niche Finder" active />
          <SidebarItem icon={<Radar />} label="Competitor Tracking" count={3} />
          <SidebarItem icon={<Video />} label="AI Prompts" />
          <SidebarItem icon={<BarChart3 />} label="Tracked channels" nested count={12} />
        </SidebarSection>
        <SidebarSection title="Account">
          <SidebarItem icon={<Settings />} label="Settings" />
        </SidebarSection>
      </Sidebar>
    </div>
  ),
};

export const StartsCollapsed: Story = {
  render: () => (
    <div className="h-96">
      <Sidebar defaultCollapsed>
        <SidebarSection title="Research">
          <SidebarItem icon={<Compass />} label="Niche Finder" active />
          <SidebarItem icon={<Radar />} label="Competitor Tracking" count={3} />
        </SidebarSection>
      </Sidebar>
    </div>
  ),
};
