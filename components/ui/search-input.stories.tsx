import * as React from "react";

import { SearchInput } from "@/components/ui/search-input";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof SearchInput> = {
  title: "ui/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

export const WithClear: Story = {
  render: function Render() {
    const [value, setValue] = React.useState("react tutorials");
    return (
      <div className="w-72">
        <SearchInput
          label="Search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onClear={() => setValue("")}
        />
      </div>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <div className="w-72">
      <SearchInput label="Search" value="" onChange={() => {}} placeholder="Search channels..." />
    </div>
  ),
};
