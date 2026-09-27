import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/components/ui/toast-provider", () => ({ useToast: () => ({ showToast: vi.fn() }) }));

const { FeedFilterPanel } = await import("@/components/features/niche-finder/feed-filter-panel");

import type { FilterField } from "@/components/features/niche-finder/feed-filter-panel";

const FIELDS: FilterField[] = [
  { kind: "number", key: "minSubs", label: "Min subscribers" },
  { kind: "toggle", key: "faceless", label: "Faceless only" },
  { kind: "date", key: "after", label: "Started after" },
];

beforeEach(() => push.mockClear());

describe("FeedFilterPanel (spec §9.4)", () => {
  it("writes applied filters to the URL", async () => {
    const user = userEvent.setup();
    render(<FeedFilterPanel tab="channels" fields={FIELDS} values={{}} />);
    const panel = screen.getByRole("complementary", { name: "Filters" });

    await user.type(panel.querySelector("input[type=number]")!, "1000");
    await user.click(screen.getAllByRole("switch", { name: "Faceless only" })[0]!);
    await user.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/niches?tab=channels&minSubs=1000&faceless=1"),
    );
  });

  it("reset clears every filter", async () => {
    render(<FeedFilterPanel tab="niches" fields={FIELDS} values={{ minSubs: "5" }} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/niches"));
  });

  it("shows the active filter count on the mobile trigger", () => {
    render(
      <FeedFilterPanel tab="channels" fields={FIELDS} values={{ minSubs: "5", faceless: "1" }} />,
    );
    expect(screen.getByRole("button", { name: "Filters (2)" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<FeedFilterPanel tab="channels" fields={FIELDS} values={{}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
