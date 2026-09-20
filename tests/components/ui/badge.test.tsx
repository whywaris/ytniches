import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("has no accessibility violations across tones and shapes", async () => {
    const { container } = render(
      <>
        <Badge tone="neutral">3</Badge>
        <Badge tone="accent">9</Badge>
        <Badge tone="success">1</Badge>
        <Badge tone="warning">2</Badge>
        <Badge tone="error">4</Badge>
        <Badge tone="info">5</Badge>
        <Badge shape="rounded">99+</Badge>
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
