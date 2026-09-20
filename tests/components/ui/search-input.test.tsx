import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { SearchInput } from "@/components/ui/search-input";

describe("SearchInput", () => {
  it("has no accessibility violations with and without a clear button", async () => {
    const { container } = render(
      <>
        <SearchInput label="Search" value="" onChange={() => {}} />
        <SearchInput label="Search channels" value="react" onClear={() => {}} onChange={() => {}} />
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("calls onClear when the clear button is clicked", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const { getByRole } = render(
      <SearchInput label="Search" value="react" onClear={onClear} onChange={() => {}} />,
    );

    await user.click(getByRole("button", { name: "Clear search" }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
