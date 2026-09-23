"use client";

import { X } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { Task, TaskStatus } from "@/lib/services/tasks";

export interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange?: (status: TaskStatus) => void;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = (
  Object.keys(STATUS_LABEL) as TaskStatus[]
).map((status) => ({ value: status, label: STATUS_LABEL[status] }));

function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null;
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// PRD.md §8.2. D-044: no UI-UX-Flow.md spec — a compact card used by both
// the list view and each kanban column.
function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const dueDate = formatDueDate(task.dueDate);

  return (
    <Card padding="md" className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="text-left text-body-sm font-medium text-text-primary hover:underline"
        >
          {task.title}
        </button>
        <Button size="xs" variant="ghost" onClick={onDelete} aria-label={`Delete "${task.title}"`}>
          <X />
        </Button>
      </div>

      {task.description ? (
        <p className="line-clamp-2 text-caption text-text-secondary">{task.description}</p>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {task.assigneeId ? (
            <Avatar size="xs" fallback={(task.assigneeName ?? "?").slice(0, 2).toUpperCase()} />
          ) : (
            <span className="text-caption text-text-tertiary">Unassigned</span>
          )}
          {dueDate ? <span className="text-caption text-text-tertiary">{dueDate}</span> : null}
        </div>
        {onStatusChange ? (
          <Select
            options={STATUS_OPTIONS}
            value={task.status}
            onValueChange={(value) => onStatusChange(value as TaskStatus)}
            className="w-32"
          />
        ) : (
          <span className="text-caption text-text-tertiary">{STATUS_LABEL[task.status]}</span>
        )}
      </div>
    </Card>
  );
}

export { TaskCard, STATUS_LABEL };
