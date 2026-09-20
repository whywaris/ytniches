import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Switch } from "@/components/ui/switch";

describe("Switch", () => {
  it("has no accessibility violations across states", async () => {
    const { container } = render(
      <>
        <Switch aria-label="Off" />
        <Switch aria-label="On" defaultChecked />
        <Switch aria-label="Disabled" disabled />
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("toggles checked state on click", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Switch aria-label="Notifications" />);
    const toggle = getByRole("switch");

    expect(toggle).toHaveAttribute("data-state", "unchecked");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "checked");
  });
});
