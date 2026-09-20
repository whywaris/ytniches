import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { CommandPalette, type CommandPaletteGroup } from "@/components/ui/command-palette";

function groups(onSelectA = vi.fn(), onSelectB = vi.fn()): CommandPaletteGroup[] {
  return [
    {
      heading: "Navigation",
      items: [
        { id: "a", label: "Niche Finder", onSelect: onSelectA },
        { id: "b", label: "Settings", onSelect: onSelectB },
      ],
    },
  ];
}

describe("CommandPalette", () => {
  it("has no accessibility violations while open", async () => {
    const { baseElement } = render(
      <CommandPalette groups={groups()} open onOpenChange={() => {}} />,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("opens on Cmd+K and closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CommandPalette groups={groups()} onOpenChange={onOpenChange} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.keyboard("{Meta>}k{/Meta}");
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("moves the highlight with ArrowDown and selects the highlighted item with Enter", async () => {
    const user = userEvent.setup();
    const onSelectA = vi.fn();
    const onSelectB = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CommandPalette groups={groups(onSelectA, onSelectB)} open onOpenChange={onOpenChange} />,
    );

    const input = screen.getByPlaceholderText("Type to search or navigate…");
    input.focus();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onSelectB).toHaveBeenCalledOnce();
    expect(onSelectA).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("filters items via fuzzy search", async () => {
    const user = userEvent.setup();
    render(<CommandPalette groups={groups()} open onOpenChange={() => {}} />);

    const input = screen.getByPlaceholderText("Type to search or navigate…");
    await user.type(input, "settings");

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.queryByText("Niche Finder")).not.toBeInTheDocument();
  });
});
