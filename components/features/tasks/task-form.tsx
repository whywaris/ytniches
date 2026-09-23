"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TextInput } from "@/components/ui/text-input";
import type { Task, TaskStatus } from "@/lib/services/tasks";

export interface TaskFormValues {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  status: TaskStatus;
}

export interface TaskFormProps {
  members: { id: string; name: string | null }[];
  initialTask?: Task;
  submitting: boolean;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

// Radix Select.Item forbids an empty-string value (it's reserved
// internally to mean "cleared") -- app/(app)/tracking/tracking-client.tsx
// already established the fix for this exact shape ("all" instead of "").
// TaskFormValues.assigneeId keeps its own "" == unassigned contract for
// the caller (tasks-client.tsx's toFormInput); this sentinel is purely
// local to how the Select renders that same state.
const UNASSIGNED = "unassigned";

// PRD.md §8.2. D-044: no UI-UX-Flow.md spec — shared by the "New task"
// and "Edit task" modals on /workspace/tasks.
function TaskForm({ members, initialTask, submitting, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = React.useState(initialTask?.title ?? "");
  const [description, setDescription] = React.useState(initialTask?.description ?? "");
  const [assigneeId, setAssigneeId] = React.useState(initialTask?.assigneeId ?? "");
  const [dueDate, setDueDate] = React.useState(initialTask?.dueDate ?? "");
  const [status, setStatus] = React.useState<TaskStatus>(initialTask?.status ?? "open");

  const memberOptions = [
    { value: UNASSIGNED, label: "Unassigned" },
    ...members.map((m) => ({ value: m.id, label: m.name ?? "Unnamed" })),
  ];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ title, description, assigneeId, dueDate, status });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextInput label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
      <Textarea
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
      />
      <div className="flex gap-3">
        <Select
          label="Assignee"
          options={memberOptions}
          value={assigneeId || UNASSIGNED}
          onValueChange={(value) => setAssigneeId(value === UNASSIGNED ? "" : value)}
          className="flex-1"
        />
        <TextInput
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="flex-1"
        />
      </div>
      {initialTask ? (
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onValueChange={(value) => setStatus(value as TaskStatus)}
        />
      ) : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={!title.trim()}>
          {initialTask ? "Save" : "Create task"}
        </Button>
      </div>
    </form>
  );
}

export { TaskForm };
