import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { ErrorState } from "@/components/ui/error-state";

describe("ErrorState", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<ErrorState onRetry={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("announces via role=alert and calls onRetry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const { getByRole } = render(<ErrorState onRetry={onRetry} />);

    expect(getByRole("alert")).toBeInTheDocument();
    await user.click(getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
