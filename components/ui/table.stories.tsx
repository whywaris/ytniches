import * as React from "react";

import { Button } from "@/components/ui/button";
import { Table, type ColumnDef } from "@/components/ui/table";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

interface Channel {
  id: string;
  name: string;
  subs: number;
  avgViews: number;
  country: string;
  monetized: boolean;
}

const DATA: Channel[] = [
  {
    id: "1",
    name: "Sleep Sounds Daily",
    subs: 482_000,
    avgViews: 91_200,
    country: "US",
    monetized: true,
  },
  {
    id: "2",
    name: "AI History Hub",
    subs: 128_500,
    avgViews: 34_100,
    country: "CA",
    monetized: true,
  },
  {
    id: "3",
    name: "Faceless Facts",
    subs: 76_200,
    avgViews: 12_800,
    country: "GB",
    monetized: false,
  },
  {
    id: "4",
    name: "Cozy Ambience",
    subs: 1_204_000,
    avgViews: 210_500,
    country: "US",
    monetized: true,
  },
  {
    id: "5",
    name: "Tiny Tech Reviews",
    subs: 44_900,
    avgViews: 8_300,
    country: "AU",
    monetized: false,
  },
];

const COLUMNS: ColumnDef<Channel>[] = [
  {
    key: "name",
    header: "Channel",
    accessor: (row) => row.name,
    sortable: true,
    sticky: true,
    width: "240px",
  },
  {
    key: "subs",
    header: "Subscribers",
    accessor: (row) => row.subs.toLocaleString(),
    sortAccessor: (row) => row.subs,
    sortable: true,
  },
  {
    key: "avgViews",
    header: "Avg views",
    accessor: (row) => row.avgViews.toLocaleString(),
    sortAccessor: (row) => row.avgViews,
    sortable: true,
  },
  { key: "country", header: "Country", accessor: (row) => row.country },
  {
    key: "monetized",
    header: "Monetized",
    accessor: (row) => (row.monetized ? "Yes" : "No"),
  },
];

const meta: Meta<typeof Table<Channel>> = {
  title: "ui/Table",
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Table<Channel>>;

export const Populated: Story = {
  render: () => <Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} />,
};

export const WithSelectionAndBulkActions: Story = {
  render: () => (
    <Table
      data={DATA}
      columns={COLUMNS}
      getRowKey={(row) => row.id}
      onSelectionChange={() => {}}
      renderBulkActions={(rows, clear) => (
        <>
          <Button size="sm" onClick={clear}>
            Save {rows.length} to tracking
          </Button>
          <Button size="sm" variant="secondary" onClick={clear}>
            Export
          </Button>
        </>
      )}
    />
  ),
};

export const WithPagination: Story = {
  render: function Render() {
    const [page, setPage] = React.useState(1);
    return (
      <Table
        data={DATA}
        columns={COLUMNS}
        getRowKey={(row) => row.id}
        pagination={{ page, pageSize: 5, totalRows: 42, onPageChange: setPage }}
      />
    );
  },
};

export const LoadingState: Story = {
  render: () => <Table data={[]} columns={COLUMNS} getRowKey={(row) => row.id} loading />,
};

export const ErrorStateStory: Story = {
  name: "Error state",
  render: () => (
    <Table data={[]} columns={COLUMNS} getRowKey={(row) => row.id} error onRetry={() => {}} />
  ),
};

export const EmptyStateStory: Story = {
  name: "Empty state",
  render: () => <Table data={[]} columns={COLUMNS} getRowKey={(row) => row.id} />,
};
