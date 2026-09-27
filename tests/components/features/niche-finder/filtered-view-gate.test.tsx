import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push }) }));
const showToast = vi.fn();
vi.mock("@/components/ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));

const { FilteredViewGate } = await import("@/components/features/niche-finder/filtered-view-gate");
const { FeedFilterPanel } = await import("@/components/features/niche-finder/feed-filter-panel");

beforeEach(() => vi.clearAllMocks());

describe("FilteredViewGate (D-072)", () => {
  it("charges through the action and refreshes on success", async () => {
    const unlock = vi.fn(async () => ({ ok: true as const, value: { charged: true } }));
    const { container } = render(
      <FilteredViewGate tab="channels" values={{ faceless: "1" }} unlock={unlock} />,
    );
    expect(await axe(container)).toHaveNoViolations();

    await userEvent.setup().click(screen.getByRole("button", { name: "Show results (1 credit)" }));

    expect(unlock).toHaveBeenCalledWith("channels", { faceless: "1" }, expect.any(String));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("explains a missing credit instead of refreshing", async () => {
    const unlock = vi.fn(async () => ({
      ok: false as const,
      error: { type: "insufficient_credits" },
    }));
    render(<FilteredViewGate tab="channels" values={{ faceless: "1" }} unlock={unlock} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Show results (1 credit)" }));
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "You need 1 credit for a filtered search." }),
      ),
    );
    expect(refresh).not.toHaveBeenCalled();
  });
});

describe("FeedFilterPanel Apply with credits (D-072)", () => {
  const fields = [
    {
      kind: "select" as const,
      key: "niche",
      label: "Niche",
      options: [{ value: "a", label: "A" }],
    },
    { kind: "toggle" as const, key: "faceless", label: "Faceless only" },
  ];

  it("charges before navigating when the filters are billable", async () => {
    const unlock = vi.fn(async () => ({ ok: true as const, value: { charged: true } }));
    render(<FeedFilterPanel tab="channels" fields={fields} values={{}} unlock={unlock} />);
    const user = userEvent.setup();

    await user.click(screen.getAllByRole("switch", { name: "Faceless only" })[0]!);
    expect(
      screen.getAllByText("Filtered search: 1 credit, then free to re-run for 24h.").length,
    ).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Apply filters" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/niches?tab=channels&faceless=1"));
    expect(unlock).toHaveBeenCalledWith("channels", { faceless: "1" }, expect.any(String));
  });

  it("stays put and toasts when the user has no credits", async () => {
    const unlock = vi.fn(async () => ({
      ok: false as const,
      error: { type: "insufficient_credits" },
    }));
    render(
      <FeedFilterPanel tab="channels" fields={fields} values={{ faceless: "1" }} unlock={unlock} />,
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(showToast).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
  });

  it("applies free views without calling the action", async () => {
    const unlock = vi.fn();
    render(<FeedFilterPanel tab="channels" fields={fields} values={{}} unlock={unlock} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Apply filters" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/niches?tab=channels"));
    expect(unlock).not.toHaveBeenCalled();
  });
});
