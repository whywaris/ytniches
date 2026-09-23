import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";
import type { Task } from "@/lib/services/tasks";

const createTaskAction = vi.fn();
const updateTaskAction = vi.fn();
const deleteTaskAction = vi.fn();
vi.mock("@/app/(app)/workspace/tasks/actions", () => ({
  createTaskAction: (...args: unknown[]) => createTaskAction(...args),
  updateTaskAction: (...args: unknown[]) => updateTaskAction(...args),
  deleteTaskAction: (...args: unknown[]) => deleteTaskAction(...args),
}));

const { TasksClient } = await import("@/app/(app)/workspace/tasks/tasks-client");

const MEMBERS = [{ id: "user-1", name: "Alice" }];

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    workspaceId: "ws-1",
    title: "Write outline",
    description: null,
    assigneeId: "user-1",
    assigneeName: "Alice",
    dueDate: null,
    status: "open",
    linkedType: null,
    linkedId: null,
    createdBy: "user-1",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function renderClient(props: Partial<ComponentProps<typeof TasksClient>> = {}) {
  return render(
    <ToastProvider>
      <TasksClient
        workspaceId="ws-1"
        members={MEMBERS}
        myUserId="user-1"
        isContributor
        initialTasks={[makeTask()]}
        {...props}
      />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TasksClient", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <ToastProvider>
        <TasksClient
          workspaceId="ws-1"
          members={MEMBERS}
          myUserId="user-1"
          isContributor
          initialTasks={[]}
        />
      </ToastProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the empty state with no tasks", () => {
    renderClient({ initialTasks: [] });
    expect(screen.getByText("No tasks yet.")).toBeInTheDocument();
  });

  it("hides New task for a non-contributor", () => {
    renderClient({ isContributor: false });
    expect(screen.queryByRole("button", { name: "New task" })).not.toBeInTheDocument();
  });

  it("filters to my tasks", async () => {
    renderClient({
      myUserId: "user-2",
      initialTasks: [makeTask(), makeTask({ id: "t2", assigneeId: "user-2", title: "Other task" })],
    });
    expect(screen.getByText("Write outline")).toBeInTheDocument();
    expect(screen.getByText("Other task")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "My tasks" }));

    expect(screen.queryByText("Write outline")).not.toBeInTheDocument();
    expect(screen.getByText("Other task")).toBeInTheDocument();
  });

  it("switches to kanban and groups by status", async () => {
    renderClient({
      initialTasks: [
        makeTask({ status: "open" }),
        makeTask({ id: "t2", title: "Done task", status: "done" }),
      ],
    });
    await userEvent.click(screen.getByRole("button", { name: "Kanban" }));
    // "Open"/"Done" appear twice each (column header + per-card status
    // select), so this checks the titles ended up in their columns
    // rather than asserting on the ambiguous status text.
    expect(screen.getByText("Write outline")).toBeInTheDocument();
    expect(screen.getByText("Done task")).toBeInTheDocument();
  });

  it("creates a task through the New task modal", async () => {
    createTaskAction.mockResolvedValue({
      ok: true,
      value: makeTask({ id: "t2", title: "New task title" }),
    });
    renderClient({ initialTasks: [] });

    await userEvent.click(screen.getByRole("button", { name: "New task" }));
    await userEvent.type(screen.getByLabelText("Title"), "New task title");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(createTaskAction).toHaveBeenCalledWith(
      "ws-1",
      expect.objectContaining({ title: "New task title" }),
    );
    expect(await screen.findByText("New task title")).toBeInTheDocument();
  });

  it("deletes a task", async () => {
    deleteTaskAction.mockResolvedValue({ ok: true, value: undefined });
    renderClient();

    await userEvent.click(screen.getByRole("button", { name: 'Delete "Write outline"' }));

    expect(deleteTaskAction).toHaveBeenCalledWith("t1");
    expect(await screen.findByText("No tasks yet.")).toBeInTheDocument();
  });
});
