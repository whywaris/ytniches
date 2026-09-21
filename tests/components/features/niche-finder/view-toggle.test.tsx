import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ViewToggle } from "@/components/features/niche-finder/view-toggle";

describe("ViewToggle", () => {
  it("marks the active view as selected", () => {
    render(<ViewToggle value="list" onValueChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "List" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Grid" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onValueChange with the clicked view", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ViewToggle value="grid" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: "List" }));

    expect(onValueChange).toHaveBeenCalledWith("list");
  });

  it("disables (not hides) the Comparison tab when comparisonDisabled is true", () => {
    render(<ViewToggle value="grid" onValueChange={() => {}} comparisonDisabled />);

    const comparisonTab = screen.getByRole("tab", { name: "Comparison" });
    expect(comparisonTab).toBeDisabled();
    expect(comparisonTab).toHaveAttribute("title", "Select 2+ channels to compare");
  });

  it("does not disable Comparison by default", () => {
    render(<ViewToggle value="grid" onValueChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Comparison" })).not.toBeDisabled();
  });
});
