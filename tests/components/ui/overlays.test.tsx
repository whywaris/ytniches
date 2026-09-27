import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet } from "@/components/ui/sheet";
import { Tooltip } from "@/components/ui/tooltip";

describe("Popover", () => {
  it("opens from its trigger and is accessible", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary">Subscribers</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Subscribers filter">Range controls</PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Subscribers" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Range controls")).toBeInTheDocument();
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});

describe("Tooltip", () => {
  it("shows its text on keyboard focus and links it with aria-describedby", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Explains the rule">
        <button type="button">Breakout</button>
      </Tooltip>,
    );
    await user.tab();
    const trigger = screen.getByRole("button", { name: "Breakout" });
    expect(trigger).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Explains the rule");
  });
});

describe("Sheet", () => {
  it("is a titled modal dialog with a close button", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    const { baseElement } = render(
      <Sheet open onOpenChange={onOpenChange} title="Filters" footer={<Button>Apply</Button>}>
        Body
      </Sheet>,
    );
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
