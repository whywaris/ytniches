import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_FILTER_VALUES,
  FilterPanel,
} from "@/components/features/niche-finder/filter-panel";

describe("FilterPanel", () => {
  it("disables Search when keyword is empty and every filter is at default", () => {
    render(
      <FilterPanel
        values={DEFAULT_FILTER_VALUES}
        onChange={() => {}}
        onSearch={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();
  });

  it("enables Search once a keyword is entered", () => {
    render(
      <FilterPanel
        values={{ ...DEFAULT_FILTER_VALUES, keyword: "sleep music" }}
        onChange={() => {}}
        onSearch={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Search" })).toBeEnabled();
  });

  it("enables Search when a non-keyword filter is set, even with an empty keyword", () => {
    render(
      <FilterPanel
        values={{ ...DEFAULT_FILTER_VALUES, subscribersMin: "1000" }}
        onChange={() => {}}
        onSearch={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Search" })).toBeEnabled();
  });

  it("calls onSearch when Search is clicked", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <FilterPanel
        values={{ ...DEFAULT_FILTER_VALUES, keyword: "x" }}
        onChange={() => {}}
        onSearch={onSearch}
        onReset={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it("calls onReset when Reset is clicked", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(
      <FilterPanel
        values={DEFAULT_FILTER_VALUES}
        onChange={() => {}}
        onSearch={() => {}}
        onReset={onReset}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("calls onChange with the updated keyword when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterPanel
        values={DEFAULT_FILTER_VALUES}
        onChange={onChange}
        onSearch={() => {}}
        onReset={() => {}}
      />,
    );
    await user.type(screen.getByLabelText("Keyword"), "x");
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTER_VALUES, keyword: "x" });
  });
});
