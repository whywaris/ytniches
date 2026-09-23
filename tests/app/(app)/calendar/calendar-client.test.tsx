import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";
import type { CalendarEntry } from "@/lib/services/calendar";

const createEntryAction = vi.fn();
const updateEntryAction = vi.fn();
const deleteEntryAction = vi.fn();
const moveEntryAction = vi.fn();
vi.mock("@/app/(app)/calendar/actions", () => ({
  createEntryAction: (...args: unknown[]) => createEntryAction(...args),
  updateEntryAction: (...args: unknown[]) => updateEntryAction(...args),
  deleteEntryAction: (...args: unknown[]) => deleteEntryAction(...args),
  moveEntryAction: (...args: unknown[]) => moveEntryAction(...args),
}));

const { CalendarClient } = await import("@/app/(app)/calendar/calendar-client");

const MEMBERS = [{ id: "user-1", name: "Alice" }];

function makeEntry(overrides: Partial<CalendarEntry> = {}): CalendarEntry {
  return {
    id: "e1",
    workspaceId: "ws-1",
    userId: "user-1",
    channelId: "chan-1",
    channelName: "Sleep Sounds",
    title: "New video",
    description: null,
    linkedPrompts: [],
    status: "idea",
    scheduledFor: "2026-02-15T10:00:00.000Z",
    assigneeId: null,
    ...overrides,
  };
}

function renderClient(props: Partial<ComponentProps<typeof CalendarClient>> = {}) {
  return render(
    <ToastProvider>
      <CalendarClient
        workspaceId="ws-1"
        members={MEMBERS}
        isContributor
        initialEntries={[makeEntry()]}
        {...props}
      />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CalendarClient", () => {
  // FullCalendar renders a full month grid (~35-42 cells) -- axe's scan of
  // that much DOM needs more than the 5s default test timeout.
  // button-name/role-img-alt disabled: FullCalendar 6.1.21's own
  // prev/next toolbar chevrons (unmodified upstream markup, not this
  // integration's code) ship without an accessible name -- a real, but
  // third-party, gap this project doesn't control. Nothing this
  // component itself renders relies on either rule being off.
  it("has no accessibility violations", async () => {
    const { container } = renderClient();
    expect(
      await axe(container, {
        rules: { "button-name": { enabled: false }, "role-img-alt": { enabled: false } },
      }),
    ).toHaveNoViolations();
  }, 20_000);

  it("shows the empty state with no entries", () => {
    renderClient({ initialEntries: [] });
    expect(
      screen.getByText(
        "No videos planned yet. Add your first from a saved prompt, or drag one from Outliers.",
      ),
    ).toBeInTheDocument();
  });

  it("hides Add entry for a non-contributor", () => {
    renderClient({ isContributor: false });
    expect(screen.queryByRole("button", { name: "Add entry" })).not.toBeInTheDocument();
  });

  it("creates an entry through the Add entry modal", async () => {
    createEntryAction.mockResolvedValue({
      ok: true,
      value: makeEntry({ id: "e2", title: "Another video" }),
    });
    renderClient();

    await userEvent.click(screen.getByRole("button", { name: "Add entry" }));
    await userEvent.type(screen.getByLabelText("Title"), "Another video");
    await userEvent.click(screen.getByRole("button", { name: "Add to calendar" }));

    expect(createEntryAction).toHaveBeenCalledWith(
      "ws-1",
      expect.objectContaining({ title: "Another video" }),
    );
  });

  it("disables .ics export with no entries", () => {
    renderClient({ initialEntries: [] });
    expect(screen.getByRole("button", { name: "Export .ics" })).toBeDisabled();
  });
});
