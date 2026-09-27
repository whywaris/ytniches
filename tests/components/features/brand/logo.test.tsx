import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { Logo } from "@/components/features/brand/logo";

describe("Logo", () => {
  it("is an accessible image named YTNiches, with theme-following text", async () => {
    const { container } = render(<Logo />);
    const logo = screen.getByRole("img", { name: "YTNiches" });
    expect(logo.querySelector('path[fill="currentColor"]')).not.toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders just the mark, and hides itself when decorative", () => {
    const { container } = render(<Logo variant="mark" decorative />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg.querySelector('path[fill="currentColor"]')).toBeNull();
  });
});
