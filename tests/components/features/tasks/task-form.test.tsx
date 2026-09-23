import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { TaskForm } from "@/components/features/tasks/task-form";

const MEMBERS = [
  { id: "user-1", name: "Alice" },
  { id: "user-2", name: "Bob" },
];

describe("TaskForm", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <TaskForm members={MEMBERS} submitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("disables submit until a title is entered", async () => {
    render(<TaskForm members={MEMBERS} submitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Create task" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Title"), "Write outline");
    expect(screen.getByRole("button", { name: "Create task" })).toBeEnabled();
  });

  it("does not show a status field when creating (no initialTask)", () => {
    render(<TaskForm members={MEMBERS} submitting={false} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByText("Status")).not.toBeInTheDocument();
  });

  it("shows a status field pre-filled when editing", () => {
    render(
      <TaskForm
        members={MEMBERS}
        submitting={false}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        initialTask={{
          id: "t1",
          workspaceId: "ws-1",
          title: "Write outline",
          description: null,
          assigneeId: null,
          assigneeName: null,
          dueDate: null,
          status: "in_progress",
          linkedType: null,
          linkedId: null,
          createdBy: "user-1",
          createdAt: "2026-01-01T00:00:00Z",
        }}
      />,
    );
    expect(screen.getByDisplayValue("Write outline")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("submits the entered values", async () => {
    const onSubmit = vi.fn();
    render(
      <TaskForm members={MEMBERS} submitting={false} onSubmit={onSubmit} onCancel={vi.fn()} />,
    );
    await userEvent.type(screen.getByLabelText("Title"), "Write outline");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Write outline", status: "open" }),
    );
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <TaskForm members={MEMBERS} submitting={false} onSubmit={vi.fn()} onCancel={onCancel} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
