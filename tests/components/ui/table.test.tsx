import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Table, type ColumnDef } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Channel {
  id: string;
  name: string;
  subs: number;
  country: string;
}

const DATA: Channel[] = [
  { id: "1", name: "Zeta", subs: 500, country: "US" },
  { id: "2", name: "Alpha", subs: 1500, country: "CA" },
  { id: "3", name: "Mid", subs: 1000, country: "US" },
];

const COLUMNS: ColumnDef<Channel>[] = [
  {
    key: "name",
    header: "Channel",
    accessor: (row) => row.name,
    sortable: true,
    sticky: true,
    width: "200px",
  },
  {
    key: "subs",
    header: "Subscribers",
    accessor: (row) => row.subs.toLocaleString(),
    sortAccessor: (row) => row.subs,
    sortable: true,
  },
  { key: "country", header: "Country", accessor: (row) => row.country },
];

function getBodyRowNames() {
  const rows = screen.getAllByRole("row").slice(1); // skip header row
  // No selection column in these tests (onSelectionChange/renderBulkActions
  // not passed), so the name column is cell 0, not 1.
  return rows.map((row) => within(row).getAllByRole("cell")[0].textContent);
}

describe("Table", () => {
  it("has no accessibility violations when populated", async () => {
    const { container } = render(
      <Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders data rows correctly", () => {
    render(<Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} />);
    expect(screen.getByText("Zeta")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
    expect(screen.getAllByText("US")).toHaveLength(2);
  });

  it("sort: clicking a header cycles asc -> desc -> none", async () => {
    const user = userEvent.setup();
    render(<Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} />);
    const header = screen.getByRole("button", { name: /Channel/ });

    await user.click(header);
    expect(getBodyRowNames()).toEqual(["Alpha", "Mid", "Zeta"]);

    await user.click(header);
    expect(getBodyRowNames()).toEqual(["Zeta", "Mid", "Alpha"]);

    await user.click(header);
    expect(getBodyRowNames()).toEqual(["Zeta", "Alpha", "Mid"]); // back to original order
  });

  it("sort: uses sortAccessor (numeric) instead of the stringified accessor output", async () => {
    const user = userEvent.setup();
    render(<Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} />);
    await user.click(screen.getByRole("button", { name: /Subscribers/ }));

    // String-sorting "1,000" / "1,500" / "500" would order Mid, Alpha, Zeta.
    // Numeric sortAccessor orders 500 < 1000 < 1500 => Zeta, Mid, Alpha.
    expect(getBodyRowNames()).toEqual(["Zeta", "Mid", "Alpha"]);
  });

  it("sticky column: the first column's header and cells carry sticky positioning", () => {
    render(<Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} />);
    const headerCell = screen.getByRole("columnheader", { name: /Channel/ });
    expect(headerCell.className).toMatch(/\bsticky\b/);

    const firstDataCell = screen.getAllByRole("cell")[0];
    expect(firstDataCell.className).toMatch(/\bsticky\b/);
  });

  it("row selection: selecting one row, then all, then clearing reports the right rows", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Table
        data={DATA}
        columns={COLUMNS}
        getRowKey={(row) => row.id}
        onSelectionChange={onSelectionChange}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Select row 1" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([DATA[0]]);

    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(DATA);

    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  it("renderBulkActions appears when rows are selected and disappears when cleared", async () => {
    const user = userEvent.setup();
    render(
      <Table
        data={DATA}
        columns={COLUMNS}
        getRowKey={(row) => row.id}
        onSelectionChange={() => {}}
        renderBulkActions={(rows, clear) => (
          <Button size="sm" onClick={clear}>
            Save {rows.length} to tracking
          </Button>
        )}
      />,
    );

    expect(screen.queryByText(/Save \d+ to tracking/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Select row 1" }));
    expect(screen.getByText("Save 1 to tracking")).toBeInTheDocument();

    await user.click(screen.getByText("Save 1 to tracking"));
    expect(screen.queryByText(/Save \d+ to tracking/)).not.toBeInTheDocument();
  });

  it("density toggle switches row padding between comfortable (default) and compact", async () => {
    const user = userEvent.setup();
    render(<Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} />);
    const firstCell = () => screen.getAllByRole("cell")[0];

    expect(firstCell().className).toMatch(/\bpy-6\b/);
    await user.click(screen.getByRole("button", { name: "Compact" }));
    expect(firstCell().className).toMatch(/\bpy-3\b/);
  });

  it("density toggle: fires the optional onDensityChange callback so a consumer can persist it", async () => {
    const user = userEvent.setup();
    const onDensityChange = vi.fn();
    render(
      <Table
        data={DATA}
        columns={COLUMNS}
        getRowKey={(row) => row.id}
        onDensityChange={onDensityChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Compact" }));
    expect(onDensityChange).toHaveBeenCalledWith("compact");

    await user.click(screen.getByRole("button", { name: "Comfortable" }));
    expect(onDensityChange).toHaveBeenCalledWith("comfortable");
  });

  it("column visibility: hiding a column removes its header and cells from the DOM", async () => {
    const user = userEvent.setup();
    render(<Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} />);

    expect(screen.getByRole("columnheader", { name: "Country" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Columns/ }));
    await user.click(screen.getByRole("checkbox", { name: "Country" }));

    expect(screen.queryByRole("columnheader", { name: "Country" })).not.toBeInTheDocument();
    expect(screen.queryAllByText("CA")).toHaveLength(0);
  });

  it("pagination: prev/next call onPageChange with the correct page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Table
        data={DATA}
        columns={COLUMNS}
        getRowKey={(row) => row.id}
        pagination={{ page: 2, pageSize: 3, totalRows: 9, onPageChange }}
      />,
    );

    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("loading: renders skeleton rows instead of real data", () => {
    render(<Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} loading />);
    expect(screen.queryByText("Zeta")).not.toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(5);
  });

  it("error: renders ErrorState and fires onRetry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <Table data={DATA} columns={COLUMNS} getRowKey={(row) => row.id} error onRetry={onRetry} />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("empty: renders the default EmptyState when data is empty and not loading/error", () => {
    render(<Table data={[]} columns={COLUMNS} getRowKey={(row) => row.id} />);
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("empty: renders a consumer-provided emptyState instead of the default", () => {
    render(
      <Table
        data={[]}
        columns={COLUMNS}
        getRowKey={(row) => row.id}
        emptyState={<p>Nothing tracked yet.</p>}
      />,
    );
    expect(screen.getByText("Nothing tracked yet.")).toBeInTheDocument();
    expect(screen.queryByText("No results found.")).not.toBeInTheDocument();
  });
});
