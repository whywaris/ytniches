import * as React from "react";

import { ViewToggle } from "@/components/features/niche-finder/view-toggle";
import type { NicheFinderView } from "@/components/features/niche-finder/types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof ViewToggle> = {
  title: "features/niche-finder/ViewToggle",
  component: ViewToggle,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ViewToggle>;

export const Interactive: Story = {
  render: function Render() {
    const [value, setValue] = React.useState<NicheFinderView>("grid");
    return <ViewToggle value={value} onValueChange={setValue} />;
  },
};

export const ListActive: Story = {
  render: () => <ViewToggle value="list" onValueChange={() => {}} />,
};

export const ComparisonDisabled: Story = {
  name: "Comparison disabled (fewer than 2 selected)",
  render: () => <ViewToggle value="grid" onValueChange={() => {}} comparisonDisabled />,
};

export const ComparisonEnabled: Story = {
  render: () => <ViewToggle value="comparison" onValueChange={() => {}} />,
};
