import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { TIER_INFO } from "@/lib/billing/plans";
import { SUPPORT_EMAIL } from "@/lib/site";
import { HELP_MDX_COMPONENTS } from "@/components/features/help/help-mdx";
import { StillStuck } from "@/components/features/help/still-stuck";

const { PlanTable, SupportLink } = HELP_MDX_COMPONENTS;

describe("help components", () => {
  it("PlanTable shows every plan from TIER_INFO and is accessible", async () => {
    const { container } = render(<PlanTable />);
    expect(screen.getByRole("rowheader", { name: TIER_INFO.team.label })).toBeInTheDocument();
    expect(screen.getByText(`$${TIER_INFO.pro.monthlyPrice}`)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("StillStuck and SupportLink mail the one support address", async () => {
    const { container } = render(
      <>
        <StillStuck />
        <p>
          <SupportLink />
        </p>
      </>,
    );
    for (const link of screen.getAllByRole("link", { name: SUPPORT_EMAIL })) {
      expect(link).toHaveAttribute("href", `mailto:${SUPPORT_EMAIL}`);
    }
    expect(await axe(container)).toHaveNoViolations();
  });
});
