import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { ConsentLine } from "@/components/features/auth/consent-line";

describe("ConsentLine", () => {
  it("links the Terms and Privacy Policy and is accessible", async () => {
    const { container } = render(<ConsentLine />);
    expect(screen.getByText(/By continuing, you agree to our/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/legal/terms");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute(
      "href",
      "/legal/privacy",
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
