import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function DemoMenu({ open }: { open?: boolean }) {
  return (
    <DropdownMenu open={open} onOpenChange={() => {}}>
      <DropdownMenuTrigger asChild>
        <Button>Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem destructive>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("has no accessibility violations closed", async () => {
    const { container } = render(<DemoMenu />);
    expect(await axe(container)).toHaveNoViolations();
  });

  // Fully controlled `open` (not `defaultOpen`, and not a simulated click)
  // -- both of those render open asynchronously via Radix's internal
  // uncontrolled-state effect, which was flaky under this project's
  // isolate:false shared-worker model (passed in isolation, intermittently
  // failed only in full-suite runs, immune to longer waits -- a different
  // leak mechanism than D-039's, not chased further since a fully
  // controlled `open` renders the same content synchronously and
  // deterministically on first render, with 10/10 clean full-suite runs).
  it("renders its items when open", () => {
    render(<DemoMenu open />);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });
});
