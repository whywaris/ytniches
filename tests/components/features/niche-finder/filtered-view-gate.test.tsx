import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
const showToast = vi.fn();
vi.mock("@/components/ui/toast-provider", () => ({ useToast: () => ({ showToast }) }));

const { FilteredViewGate } = await import("@/components/features/niche-finder/filtered-view-gate");

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
