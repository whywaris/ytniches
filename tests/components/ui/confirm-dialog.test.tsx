import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

describe("ConfirmDialog", () => {
  it("has no accessibility violations", async () => {
    const { baseElement } = render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="Delete account"
        description="This cannot be undone."
        onConfirm={() => {}}
        destructive
      />,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("calls onConfirm and onOpenChange(false) for confirm/cancel respectively", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Delete account"
        onConfirm={onConfirm}
        confirmLabel="Delete"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
