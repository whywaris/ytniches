import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { EntryForm } from "@/components/features/calendar/entry-form";

const MEMBERS = [{ id: "user-1", name: "Alice" }];
const CHANNELS = [{ id: "chan-1", name: "Sleep Sounds" }];

describe("EntryForm", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <EntryForm
        members={MEMBERS}
        channels={CHANNELS}
        submitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("disables submit until a title is entered", async () => {
    render(
      <EntryForm
        members={MEMBERS}
        channels={CHANNELS}
        submitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Add to calendar" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Title"), "New video");
    expect(screen.getByRole("button", { name: "Add to calendar" })).toBeEnabled();
  });

  it("pre-fills the scheduled date from initialDate when creating", () => {
    render(
      <EntryForm
        members={MEMBERS}
        channels={CHANNELS}
        initialDate="2026-02-01"
        submitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Scheduled for")).toHaveValue("2026-02-01T00:00");
  });

  it("submits entered values", async () => {
    const onSubmit = vi.fn();
    render(
      <EntryForm
        members={MEMBERS}
        channels={CHANNELS}
        submitting={false}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );
    await userEvent.type(screen.getByLabelText("Title"), "New video");
    await userEvent.click(screen.getByRole("button", { name: "Add to calendar" }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New video", status: "idea" }),
    );
  });
});
