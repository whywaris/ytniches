import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { DateRangeInput } from "@/components/ui/date-range-input";

describe("DateRangeInput", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <DateRangeInput
        label="Date range"
        startDate="2026-01-01"
        endDate="2026-01-31"
        onStartDateChange={() => {}}
        onEndDateChange={() => {}}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders two native date inputs with distinct labels", () => {
    const { getByLabelText } = render(
      <DateRangeInput label="Date range" onStartDateChange={() => {}} onEndDateChange={() => {}} />,
    );
    expect(getByLabelText("From")).toHaveAttribute("type", "date");
    expect(getByLabelText("To")).toHaveAttribute("type", "date");
  });
});
