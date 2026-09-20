import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
  it("has no accessibility violations across states", async () => {
    const { container } = render(
      <>
        <Checkbox aria-label="Unchecked" />
        <Checkbox aria-label="Checked" defaultChecked />
        <Checkbox aria-label="Indeterminate" checked="indeterminate" />
        <Checkbox aria-label="Disabled" disabled />
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("toggles checked state on click", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Checkbox aria-label="Select row" />);
    const checkbox = getByRole("checkbox");

    expect(checkbox).toHaveAttribute("data-state", "unchecked");
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });
});
