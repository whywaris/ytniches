import * as React from "react";

import { Select } from "@/components/ui/select";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const OPTIONS = [
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
];

const meta: Meta<typeof Select> = {
  title: "ui/Select",
  component: Select,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: function Render() {
    const [value, setValue] = React.useState("pro");
    return (
      <div className="w-56">
        <Select label="Plan" options={OPTIONS} value={value} onValueChange={setValue} />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div className="w-56">
      <Select label="Plan" options={OPTIONS} errorMessage="Select a plan to continue" />
    </div>
  ),
};
