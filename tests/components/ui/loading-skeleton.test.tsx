import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

describe("LoadingSkeleton", () => {
  it("has no accessibility violations and announces via role=status", async () => {
    const { container, getByRole } = render(<LoadingSkeleton className="h-4 w-32" />);
    expect(getByRole("status")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
