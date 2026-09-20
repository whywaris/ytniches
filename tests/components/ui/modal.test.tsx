import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "@/components/ui/modal";

// Radix Dialog portals into document.body, so axe/queries use
// baseElement/screen rather than the render() container.
describe("Modal", () => {
  it("has no accessibility violations while open", async () => {
    const { baseElement } = render(
      <Modal
        open
        onOpenChange={() => {}}
        title="Delete channel"
        description="This cannot be undone."
      >
        Are you sure?
      </Modal>,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("exposes role=dialog with aria-modal and an accessible name from the title", () => {
    render(
      <Modal open onOpenChange={() => {}} title="Delete channel">
        Are you sure?
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Delete channel");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="Delete channel">
        Are you sure?
      </Modal>,
    );

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("moves focus into the dialog on open (focus trap)", () => {
    render(
      <Modal open onOpenChange={() => {}} title="Confirm" footer={<button>Confirm</button>}>
        Body content
      </Modal>,
    );

    expect(document.activeElement).not.toBe(document.body);
    expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
  });

  it("does not render when closed", () => {
    render(<Modal open={false} onOpenChange={() => {}} title="Hidden" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
