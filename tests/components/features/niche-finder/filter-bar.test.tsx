import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const showToast = vi.fn();
vi.mock("@/components/ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));

const { FilterBar } = await import("@/components/features/niche-finder/filter-bar/filter-bar");
const { CHANNEL_FILTERS, CHANNEL_PRESETS, SORT_OPTIONS, withNicheOptions } =
  await import("@/lib/discovery/feed-filters");

const defs = withNicheOptions(CHANNEL_FILTERS, [
  { value: "mafia-history", label: "Mafia History" },
]);
const unlock = vi.fn(async () => ({ ok: true as const, value: { charged: true } }));

function renderBar(props: Partial<React.ComponentProps<typeof FilterBar>> = {}) {
  return render(
    <FilterBar
      tab="channels"
      defs={defs}
      values={{}}
      isPro
      unlocked
      unlock={unlock}
      presets={CHANNEL_PRESETS}
      sortOptions={SORT_OPTIONS.channels}
      defaultSort="outlier_score"
      searchKey="q"
      {...props}
    />,
  );
}

beforeEach(() => vi.clearAllMocks());

describe("FilterBar (D-077)", () => {
  it("shows the basic chips in a bar, with the default view free", async () => {
    const { container } = renderBar();
    for (const label of [
      "Niche",
      "Subscribers",
      "Avg views",
      "Channel age",
      "Language",
      "Country",
      "Content type",
    ]) {
      expect(screen.getByRole("button", { name: new RegExp(`^${label}`) })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Show results · free" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("a custom filter set costs 1 credit: charge, then navigate", async () => {
    const user = userEvent.setup();
    renderBar();
    await user.click(screen.getByRole("button", { name: /^Subscribers/ }));
    await user.click(await screen.findByRole("button", { name: "1K–10K" }));
    expect(screen.getByRole("button", { name: /^Subscribers: 1K–10K/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show results · 1 credit" }));
    await waitFor(() =>
      expect(unlock).toHaveBeenCalledWith(
        "channels",
        { minSubs: "1000", maxSubs: "10000" },
        expect.any(String),
      ),
    );
    expect(push).toHaveBeenCalledWith("/niches?minSubs=1000&maxSubs=10000");
  });

  it("presets are free: they navigate without charging", async () => {
    renderBar();
    await userEvent.setup().click(screen.getByRole("button", { name: /Small \+ breakout/ }));
    expect(push).toHaveBeenCalledWith("/niches?preset=small-breakout");
    expect(unlock).not.toHaveBeenCalled();
  });

  it("locks the Pro filters for Starter (visible, never hidden) with an upgrade link", async () => {
    const user = userEvent.setup();
    renderBar({ isPro: false });
    await user.click(screen.getByRole("button", { name: /More filters/ }));
    const panel = document.getElementById("more-filters")!;
    expect(within(panel).getByRole("switch", { name: /Faceless only/ })).toBeDisabled();
    expect(within(panel).getByRole("link", { name: "Upgrade to use them" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
  });

  it("removes an applied filter from its chip", async () => {
    renderBar({ values: { lang: "en", minSubs: "1000" } });
    const active = screen.getByRole("list", { name: "Active filters" });
    await userEvent
      .setup()
      .click(within(active).getByRole("button", { name: "Remove Language: English" }));
    expect(push).toHaveBeenCalledWith("/niches?minSubs=1000");
  });

  it("re-showing an already unlocked view is free", () => {
    renderBar({ values: { lang: "en" }, unlocked: true });
    expect(screen.getAllByRole("button", { name: "Show results · free" }).length).toBeGreaterThan(
      0,
    );
  });

  it("opens the mobile bottom sheet with the same controls", async () => {
    const user = userEvent.setup();
    renderBar({ values: { lang: "en" } });
    await user.click(screen.getByRole("button", { name: "Filters (1)" }));
    const sheet = screen.getByRole("dialog", { name: "Filters" });
    expect(within(sheet).getByRole("group", { name: "Subscribers presets" })).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: /Show results/ })).toBeInTheDocument();
  });
});
