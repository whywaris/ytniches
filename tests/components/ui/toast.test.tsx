import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { ToastProvider, useToast } from "@/components/ui/toast-provider";

function TriggerToast() {
  const { showToast } = useToast();
  return (
    <Button
      onClick={() =>
        showToast({ variant: "success", title: "Saved", description: "Channel tracked." })
      }
    >
      Trigger
    </Button>
  );
}

describe("Toast / ToastProvider", () => {
  it("has no accessibility violations once a toast is shown", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(
      <ToastProvider>
        <TriggerToast />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("useToast throws outside of a ToastProvider", () => {
    // Swallow the expected React error-boundary console noise.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TriggerToast />)).toThrow("useToast must be used within a ToastProvider");
    spy.mockRestore();
  });
});
