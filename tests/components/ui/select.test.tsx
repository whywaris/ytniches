import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Select } from "@/components/ui/select";

const OPTIONS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

describe("Select", () => {
  it("has no accessibility violations in its closed state", async () => {
    const { container } = render(
      <Select label="Plan" placeholder="Choose a plan" options={OPTIONS} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the selected option's label", () => {
    const { getByRole } = render(<Select label="Plan" options={OPTIONS} value="pro" />);
    expect(getByRole("combobox")).toHaveTextContent("Pro");
  });
});
