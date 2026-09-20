import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { NumberInput } from "@/components/ui/number-input";

describe("NumberInput", () => {
  it("has no accessibility violations and renders a native number input", async () => {
    const { container, getByLabelText } = render(<NumberInput label="Credits" min={0} max={100} />);
    expect(getByLabelText("Credits")).toHaveAttribute("type", "number");
    expect(await axe(container)).toHaveNoViolations();
  });
});
