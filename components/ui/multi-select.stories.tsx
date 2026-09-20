import * as React from "react";

import { MultiSelect } from "@/components/ui/multi-select";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const OPTIONS = [
  { value: "channels", label: "Channels" },
  { value: "videos", label: "Videos" },
  { value: "prompts", label: "Prompts" },
  { value: "outliers", label: "Outliers" },
];

const meta: Meta<typeof MultiSelect> = {
  title: "ui/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof MultiSelect>;

export const Default: Story = {
  render: function Render() {
    const [value, setValue] = React.useState<string[]>(["channels", "videos"]);
    return (
      <div className="w-72">
        <MultiSelect
          label="Object types"
          options={OPTIONS}
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};
