import * as React from "react";

import {
  DEFAULT_FILTER_VALUES,
  FilterPanel,
  type NicheFilterValues,
} from "@/components/features/niche-finder/filter-panel";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof FilterPanel> = {
  title: "features/niche-finder/FilterPanel",
  component: FilterPanel,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof FilterPanel>;

export const Default: Story = {
  render: function Render() {
    const [values, setValues] = React.useState<NicheFilterValues>(DEFAULT_FILTER_VALUES);
    return (
      <div className="max-w-xs">
        <FilterPanel
          values={values}
          onChange={setValues}
          onSearch={() => {}}
          onReset={() => setValues(DEFAULT_FILTER_VALUES)}
        />
      </div>
    );
  },
};

export const WithFiltersSet: Story = {
  render: function Render() {
    const [values, setValues] = React.useState<NicheFilterValues>({
      ...DEFAULT_FILTER_VALUES,
      keyword: "sleep music",
      subscribersMin: "1000",
      subscribersMax: "100000",
      uploadFrequency: "2-4-week",
      languages: ["en"],
      countries: ["US", "CA"],
    });
    return (
      <div className="max-w-xs">
        <FilterPanel
          values={values}
          onChange={setValues}
          onSearch={() => {}}
          onReset={() => setValues(DEFAULT_FILTER_VALUES)}
        />
      </div>
    );
  },
};
