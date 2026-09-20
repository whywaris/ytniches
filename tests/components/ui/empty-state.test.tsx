import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Search } from "lucide-react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
  it("has no accessibility violations with an icon and action", async () => {
    const { container } = render(
      <EmptyState
        icon={<Search />}
        message="You haven't saved any channels yet."
        actionLabel="Try Niche Finder"
        onAction={() => {}}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations with just a message", async () => {
    const { container } = render(<EmptyState message="Nothing here yet." />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
