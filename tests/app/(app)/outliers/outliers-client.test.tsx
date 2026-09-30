import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/outliers",
}));

const listOutlierFeedAction = vi.fn();
const listTopOutliersAction = vi.fn();
vi.mock("@/app/(app)/outliers/actions", () => ({
  listOutlierFeedAction: (...args: unknown[]) => listOutlierFeedAction(...args),
  listTopOutliersAction: (...args: unknown[]) => listTopOutliersAction(...args),
}));

const { OutliersClient } = await import("@/app/(app)/outliers/outliers-client");

function renderClient() {
  return render(
    <OutliersClient
      initialView="feed"
      initialPublished={30}
      initialFeedState={{ status: "empty" }}
      initialTopItems={[]}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  listOutlierFeedAction.mockResolvedValue({ ok: true, value: { items: [], nextCursor: null } });
  listTopOutliersAction.mockResolvedValue([]);
});

describe("OutliersClient publish filter (D-085)", () => {
  it("offers Last 30 days / 90 days / All time, with 30 days selected by default", async () => {
    const { container } = renderClient();
    const group = screen.getByRole("group", { name: "Published" });
    expect(group).toHaveTextContent("Last 30 days");
    expect(screen.getByRole("button", { name: "Last 30 days" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "90 days" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("reloads the current view with the chosen window and keeps it in the URL", async () => {
    const user = userEvent.setup();
    renderClient();

    await user.click(screen.getByRole("button", { name: "All time" }));

    expect(listOutlierFeedAction).toHaveBeenCalledWith(
      expect.objectContaining({ published: "all" }),
    );
    expect(replace).toHaveBeenCalledWith("/outliers?published=all");
  });

  it("applies the same window to Grid", async () => {
    const user = userEvent.setup();
    renderClient();

    await user.click(screen.getByRole("button", { name: "90 days" }));
    await user.click(screen.getByRole("tab", { name: "Grid" }));

    expect(listTopOutliersAction).toHaveBeenLastCalledWith({ view: "grid", published: 90 });
    expect(replace).toHaveBeenLastCalledWith("/outliers?view=grid&published=90");
  });
});
