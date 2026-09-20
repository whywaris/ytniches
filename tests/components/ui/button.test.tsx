import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Heart } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("has no accessibility violations across variants, sizes, and states", async () => {
    const { container } = render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button fullWidth>Full width</Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button iconOnly aria-label="Favorite">
          <Heart />
        </Button>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("disables interaction while loading", () => {
    const { getByRole } = render(<Button loading>Save</Button>);
    expect(getByRole("button")).toBeDisabled();
  });
});
