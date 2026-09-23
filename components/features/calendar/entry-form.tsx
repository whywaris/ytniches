"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TextInput } from "@/components/ui/text-input";
import type { CalendarEntry, CalendarStatus } from "@/lib/services/calendar";

export interface EntryFormValues {
  title: string;
  description: string;
  channelId: string;
  status: CalendarStatus;
  scheduledFor: string;
  assigneeId: string;
}

export interface EntryFormProps {
  members: { id: string; name: string | null }[];
  channels: { id: string; name: string | null }[];
  initialEntry?: CalendarEntry;
  initialDate?: string;
  submitting: boolean;
  onSubmit: (values: EntryFormValues) => void;
  onCancel: () => void;
}

const STATUS_OPTIONS: { value: CalendarStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "scripted", label: "Scripted" },
  { value: "filmed", label: "Filmed" },
  { value: "edited", label: "Edited" },
  { value: "published", label: "Published" },
];

const NO_CHANNEL = "none";
const UNASSIGNED = "unassigned";

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  // A dateClick from the month view (FullCalendar's info.dateStr) is a
  // bare "YYYY-MM-DD" with no time part -- a <input type="datetime-local">
  // rejects that as invalid and silently clears itself, so this pads one
  // on rather than trusting the caller to always pass a full timestamp.
  return iso.includes("T") ? iso.slice(0, 16) : `${iso}T00:00`;
}

// PRD.md §8.3. D-044: no UI-UX-Flow.md spec — shared by the "New entry"
// and "Edit entry" modals on /calendar.
function EntryForm({
  members,
  channels,
  initialEntry,
  initialDate,
  submitting,
  onSubmit,
  onCancel,
}: EntryFormProps) {
  const [title, setTitle] = React.useState(initialEntry?.title ?? "");
  const [description, setDescription] = React.useState(initialEntry?.description ?? "");
  const [channelId, setChannelId] = React.useState(initialEntry?.channelId ?? "");
  const [status, setStatus] = React.useState<CalendarStatus>(initialEntry?.status ?? "idea");
  const [scheduledFor, setScheduledFor] = React.useState(
    toDatetimeLocal(initialEntry?.scheduledFor ?? initialDate ?? null),
  );
  const [assigneeId, setAssigneeId] = React.useState(initialEntry?.assigneeId ?? "");

  // Radix Select.Item forbids an empty-string value (reserved internally
  // for "cleared") -- same fix as tracking-client.tsx's "all" sentinel
  // and task-form.tsx's UNASSIGNED. EntryFormValues keeps "" == none for
  // the caller (calendar-client.tsx's toInput); these sentinels are
  // purely local to how the Selects render that same state.
  const channelOptions = [
    { value: NO_CHANNEL, label: "No channel" },
    ...channels.map((c) => ({ value: c.id, label: c.name ?? "Unnamed" })),
  ];
  const memberOptions = [
    { value: UNASSIGNED, label: "Unassigned" },
    ...members.map((m) => ({ value: m.id, label: m.name ?? "Unnamed" })),
  ];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({ title, description, channelId, status, scheduledFor, assigneeId });
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
          label="Channel"
          options={channelOptions}
          value={channelId || NO_CHANNEL}
          onValueChange={(value) => setChannelId(value === NO_CHANNEL ? "" : value)}
          className="flex-1"
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onValueChange={(value) => setStatus(value as CalendarStatus)}
          className="flex-1"
        />
      </div>
      <div className="flex gap-3">
        <TextInput
          label="Scheduled for"
          type="datetime-local"
          value={scheduledFor}
          onChange={(event) => setScheduledFor(event.target.value)}
          className="flex-1"
        />
        <Select
          label="Assignee"
          options={memberOptions}
          value={assigneeId || UNASSIGNED}
          onValueChange={(value) => setAssigneeId(value === UNASSIGNED ? "" : value)}
          className="flex-1"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={!title.trim()}>
          {initialEntry ? "Save" : "Add to calendar"}
        </Button>
      </div>
    </form>
  );
}

export { EntryForm };
