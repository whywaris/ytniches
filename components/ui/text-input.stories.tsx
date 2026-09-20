import * as React from "react";

import { Search } from "lucide-react";

import { TextInput } from "@/components/ui/text-input";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof TextInput> = {
  title: "ui/TextInput",
  component: TextInput,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof TextInput>;

export const States: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <TextInput label="Name" placeholder="Jane Doe" />
      <TextInput label="Email" helperText="We'll never share this" />
      <TextInput label="Username" errorMessage="Already taken" defaultValue="taken_name" />
      <TextInput label="Disabled" disabled defaultValue="Can't touch this" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="w-72">
      <TextInput label="Search channels" prefix={<Search />} placeholder="Search..." />
    </div>
  ),
};

export const WithCharCount: Story = {
  // Char count only reflects a controlled `value` — needs local state.
  render: function Render() {
    const [value, setValue] = React.useState("Faceless YouTube creator");
    return (
      <div className="w-72">
        <TextInput
          label="Bio"
          maxLength={40}
          showCharCount
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
    );
  },
};
