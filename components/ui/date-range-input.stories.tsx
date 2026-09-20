import * as React from "react";

import { DateRangeInput } from "@/components/ui/date-range-input";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof DateRangeInput> = {
  title: "ui/DateRangeInput",
  component: DateRangeInput,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof DateRangeInput>;

export const Default: Story = {
  render: function Render() {
    const [start, setStart] = React.useState("2026-09-01");
    const [end, setEnd] = React.useState("2026-09-30");
    return (
      <DateRangeInput
        label="Date range"
        startDate={start}
        endDate={end}
        onStartDateChange={setStart}
        onEndDateChange={setEnd}
        helperText="Filters the activity feed"
      />
    );
  },
};
