import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { TaskCard } from "@/components/features/tasks/task-card";
import type { Task } from "@/lib/services/tasks";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    workspaceId: "ws-1",
    title: "Write outline",
    description: "For the sleep video",
    assigneeId: "user-1",
    assigneeName: "Alice",
    dueDate: "2026-02-01",
    status: "open",
    linkedType: null,
    linkedId: null,
    createdBy: "user-1",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("TaskCard", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the title, description, and assignee", () => {
    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Write outline")).toBeInTheDocument();
    expect(screen.getByText("For the sleep video")).toBeInTheDocument();
  });

  it("shows Unassigned when there is no assignee", () => {
    render(
      <TaskCard
        task={makeTask({ assigneeId: null, assigneeName: null })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("calls onEdit when the title is clicked", async () => {
    const onEdit = vi.fn();
    render(<TaskCard task={makeTask()} onEdit={onEdit} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Write outline" }));
    expect(onEdit).toHaveBeenCalled();
  });

  it("calls onDelete when the delete button is clicked", async () => {
    const onDelete = vi.fn();
    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: 'Delete "Write outline"' }));
    expect(onDelete).toHaveBeenCalled();
  });

  it("shows a plain status label with no onStatusChange handler", () => {
    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows an editable status select when onStatusChange is provided", () => {
    render(
      <TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} />,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Open");
  });
});
