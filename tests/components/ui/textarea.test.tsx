import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Textarea } from "@/components/ui/textarea";

describe("Textarea", () => {
  it("has no accessibility violations across states", async () => {
    const { container } = render(
      <>
        <Textarea label="Notes" placeholder="Add a note" />
        <Textarea label="Description" helperText="Markdown supported" />
        <Textarea label="Bio" errorMessage="Too long" />
        <Textarea label="Disabled" disabled />
      </>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
