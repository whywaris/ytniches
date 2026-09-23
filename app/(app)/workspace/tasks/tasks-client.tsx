"use client";

import * as React from "react";

import {
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
} from "@/app/(app)/workspace/tasks/actions";
import { STATUS_LABEL, TaskCard } from "@/components/features/tasks/task-card";
import { TaskForm, type TaskFormValues } from "@/components/features/tasks/task-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast-provider";
import type { Task, TaskStatus } from "@/lib/services/tasks";

export interface TasksClientProps {
  workspaceId: string;
  members: { id: string; name: string | null }[];
  myUserId: string;
  isContributor: boolean;
  initialTasks: Task[];
}

const STATUS_ORDER: TaskStatus[] = ["open", "in_progress", "done"];

function toFormInput(values: TaskFormValues) {
  return {
    title: values.title,
    description: values.description.trim() || undefined,
    assigneeId: values.assigneeId || undefined,
    dueDate: values.dueDate || undefined,
  };
}

// PRD.md §8.2. D-044: no UI-UX-Flow.md spec — list/kanban toggle + "my
// tasks"/"all" filter, both applied client-side against one fetched
// list (RLS already lets every member see every workspace task, so
// there's no extra round trip for either toggle).
function TasksClient({
  workspaceId,
  members,
  myUserId,
  isContributor,
  initialTasks,
}: TasksClientProps) {
  const { showToast } = useToast();
  const [tasks, setTasks] = React.useState(initialTasks);
  const [view, setView] = React.useState<"all" | "mine">("all");
  const [display, setDisplay] = React.useState<"list" | "kanban">("list");
  const [modalTask, setModalTask] = React.useState<Task | "new" | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const visibleTasks = view === "mine" ? tasks.filter((t) => t.assigneeId === myUserId) : tasks;

  async function handleSubmit(values: TaskFormValues) {
    setSubmitting(true);
    const input = toFormInput(values);

    if (modalTask === "new") {
      const result = await createTaskAction(workspaceId, input);
      setSubmitting(false);
      if (!result.ok) {
        showToast({
          title:
            result.error.type === "assignee_not_member"
              ? "That person isn't a workspace member"
              : "Couldn't save task",
          variant: "error",
        });
        return;
      }
      setTasks((current) => [result.value, ...current]);
      setModalTask(null);
      return;
    }

    if (modalTask === null) return;
    const editedId = modalTask.id;
    const result = await updateTaskAction(editedId, { ...input, status: values.status });
    setSubmitting(false);
    if (!result.ok) {
      showToast({
        title:
          result.error.type === "assignee_not_member"
            ? "That person isn't a workspace member"
            : "Couldn't save task",
        variant: "error",
      });
      return;
    }
    setTasks((current) =>
      current.map((t) =>
        t.id === editedId
          ? {
              ...t,
              title: values.title,
              description: input.description ?? null,
              assigneeId: input.assigneeId ?? null,
              dueDate: input.dueDate ?? null,
              status: values.status,
            }
          : t,
      ),
    );
    setModalTask(null);
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    const result = await updateTaskAction(taskId, { status });
    if (!result.ok) {
      showToast({ title: "Couldn't update status", variant: "error" });
      return;
    }
    setTasks((current) => current.map((t) => (t.id === taskId ? { ...t, status } : t)));
  }

  async function handleDelete(taskId: string) {
    const result = await deleteTaskAction(taskId);
    if (!result.ok) {
      showToast({ title: "Couldn't delete task", variant: "error" });
      return;
    }
    setTasks((current) => current.filter((t) => t.id !== taskId));
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h2 text-text-primary">Tasks</h1>
        {isContributor ? <Button onClick={() => setModalTask("new")}>New task</Button> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={view === "all" ? "primary" : "secondary"}
          onClick={() => setView("all")}
        >
          All team tasks
        </Button>
        <Button
          size="sm"
          variant={view === "mine" ? "primary" : "secondary"}
          onClick={() => setView("mine")}
        >
          My tasks
        </Button>
        <span className="mx-2 h-4 w-px bg-border-subtle" />
        <Button
          size="sm"
          variant={display === "list" ? "primary" : "secondary"}
          onClick={() => setDisplay("list")}
        >
          List
        </Button>
        <Button
          size="sm"
          variant={display === "kanban" ? "primary" : "secondary"}
          onClick={() => setDisplay("kanban")}
        >
          Kanban
        </Button>
      </div>

      {visibleTasks.length === 0 ? (
        <EmptyState message="No tasks yet." />
      ) : display === "list" ? (
        <div className="flex flex-col gap-2">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => setModalTask(task)}
              onDelete={() => void handleDelete(task.id)}
              onStatusChange={
                isContributor ? (status) => void handleStatusChange(task.id, status) : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="flex flex-col gap-2">
              <p className="text-body-sm font-medium text-text-secondary">{STATUS_LABEL[status]}</p>
              {visibleTasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => setModalTask(task)}
                    onDelete={() => void handleDelete(task.id)}
                    onStatusChange={
                      isContributor
                        ? (newStatus) => void handleStatusChange(task.id, newStatus)
                        : undefined
                    }
                  />
                ))}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalTask !== null}
        onOpenChange={(open) => !open && setModalTask(null)}
        title={modalTask === "new" ? "New task" : "Edit task"}
      >
        <TaskForm
          members={members}
          initialTask={modalTask !== "new" ? (modalTask ?? undefined) : undefined}
          submitting={submitting}
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={() => setModalTask(null)}
        />
      </Modal>
    </div>
  );
}

export { TasksClient };
