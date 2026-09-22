import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FinishOnboardingBanner } from "@/app/(app)/dashboard/finish-onboarding-banner";

const DISMISSED_KEY = "ytniches:onboarding_banner_dismissed";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("FinishOnboardingBanner", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<FinishOnboardingBanner />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders the link back to onboarding by default", () => {
    render(<FinishOnboardingBanner />);
    expect(screen.getByRole("link", { name: /Finish setting up your account/ })).toHaveAttribute(
      "href",
      "/onboarding",
    );
  });

  it("hides itself and persists the dismissal when Dismiss is clicked", async () => {
    const user = userEvent.setup();
    render(<FinishOnboardingBanner />);

    await user.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(
      screen.queryByRole("link", { name: /Finish setting up your account/ }),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem(DISMISSED_KEY)).toBe("true");
  });

  it("stays hidden on a fresh mount if already dismissed", () => {
    window.localStorage.setItem(DISMISSED_KEY, "true");

    render(<FinishOnboardingBanner />);

    expect(
      screen.queryByRole("link", { name: /Finish setting up your account/ }),
    ).not.toBeInTheDocument();
  });
});
