import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { PresetProNote } from "@/components/features/niche-finder/preset-pro-note";

describe("PresetProNote (D-077)", () => {
  it("says the Faceless filter is Pro and links to upgrade", async () => {
    const { container } = render(<PresetProNote />);
    expect(container.textContent).toBe("Faceless filter is Pro — upgrade to customise it.");
    expect(screen.getByRole("link", { name: "upgrade" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
