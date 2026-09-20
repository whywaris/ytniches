import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { MultiSelect } from "@/components/ui/multi-select";

const OPTIONS = [
  { value: "channels", label: "Channels" },
  { value: "videos", label: "Videos" },
];

describe("MultiSelect", () => {
  it("has no accessibility violations in its closed state", async () => {
    const { container } = render(
      <MultiSelect label="Object types" options={OPTIONS} value={[]} onValueChange={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a tag for each selected option", () => {
    const { getByText } = render(
      <MultiSelect
        label="Object types"
        options={OPTIONS}
        value={["channels", "videos"]}
        onValueChange={() => {}}
      />,
    );
    expect(getByText("Channels")).toBeInTheDocument();
    expect(getByText("Videos")).toBeInTheDocument();
  });
});
