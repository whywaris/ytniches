import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Tabs> = {
  title: "ui/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="activity" className="w-96">
      <TabsList>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
      </TabsList>
      <TabsContent value="activity">Activity timeline for this channel.</TabsContent>
      <TabsContent value="videos">Full video list with view velocity.</TabsContent>
      <TabsContent value="metrics">Subs, views, and upload cadence aggregates.</TabsContent>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="url" className="w-96">
      <TabsList>
        <TabsTrigger value="url">Paste URL</TabsTrigger>
        <TabsTrigger value="search" disabled>
          Search (unavailable)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="url">Paste a channel URL to validate it.</TabsContent>
      <TabsContent value="search">Search results.</TabsContent>
    </Tabs>
  ),
};
