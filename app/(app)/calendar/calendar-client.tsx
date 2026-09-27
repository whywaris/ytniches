"use client";

import * as React from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  createEntryAction,
  deleteEntryAction,
  moveEntryAction,
  updateEntryAction,
} from "@/app/(app)/calendar/actions";
import { EntryForm, type EntryFormValues } from "@/components/features/calendar/entry-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import { buildGoogleCalendarUrl, buildICS } from "@/lib/calendar/export";
import { channelColor } from "@/lib/calendar/colors";
import type { CalendarEntry, CalendarStatus } from "@/lib/services/calendar";

import type { EventClickArg, EventContentArg, EventDropArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";

export interface CalendarClientProps {
  workspaceId: string;
  members: { id: string; name: string | null }[];
  isContributor: boolean;
  initialEntries: CalendarEntry[];
}

// Radix Select.Item forbids an empty-string value (reserved internally
// for "cleared") -- same "all" sentinel tracking-client.tsx already
// established for this exact filter-panel shape.
const ALL = "all";
const STATUS_OPTIONS: { value: CalendarStatus | typeof ALL; label: string }[] = [
  { value: ALL, label: "All statuses" },
  { value: "idea", label: "Idea" },
  { value: "scripted", label: "Scripted" },
  { value: "filmed", label: "Filmed" },
  { value: "edited", label: "Edited" },
  { value: "published", label: "Published" },
];

function toInput(values: EntryFormValues) {
  return {
    title: values.title,
    description: values.description.trim() || undefined,
    channelId: values.channelId || undefined,
    status: values.status,
    scheduledFor: values.scheduledFor ? new Date(values.scheduledFor).toISOString() : undefined,
    assigneeId: values.assigneeId || undefined,
  };
}

function downloadICS(entries: CalendarEntry[]) {
  const blob = new Blob([buildICS(entries)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "content-calendar.ics";
  link.click();
  URL.revokeObjectURL(url);
}

// PRD.md §8.3. D-044: no UI-UX-Flow.md spec. Uses FullCalendar (open-
// source packages only -- daygrid/timegrid/interaction, no premium
// plugins) for the day/week/month views and drag-and-drop, per the
// Phase 3 kickoff's own library call. The channel/status/assignee
// filter panel and prompt-linking scope down to what's directly in
// Backend-Schema.md §5.5's columns -- picking prompts from a saved
// library (rather than typing a prompt id) isn't built here; it's a
// separate cross-feature picker, not a calendar concern, and nothing
// in this task's scope named it as required now.
function CalendarClient({
  workspaceId,
  members,
  isContributor,
  initialEntries,
}: CalendarClientProps) {
  const { showToast } = useToast();
  const [entries, setEntries] = React.useState(initialEntries);
  const [statusFilter, setStatusFilter] = React.useState<CalendarStatus | typeof ALL>(ALL);
  const [assigneeFilter, setAssigneeFilter] = React.useState<string>(ALL);
  const [channelFilter, setChannelFilter] = React.useState<string>(ALL);
  const [modalState, setModalState] = React.useState<
    { mode: "new"; date?: string } | { mode: "edit"; entry: CalendarEntry } | null
  >(null);
  const [submitting, setSubmitting] = React.useState(false);

  const channels = React.useMemo(() => {
    const map = new Map<string, string | null>();
    for (const entry of entries) {
      if (entry.channelId) map.set(entry.channelId, entry.channelName);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [entries]);

  const filteredEntries = entries.filter(
    (entry) =>
      (statusFilter === ALL || entry.status === statusFilter) &&
      (assigneeFilter === ALL || entry.assigneeId === assigneeFilter) &&
      (channelFilter === ALL || entry.channelId === channelFilter),
  );

  const events = filteredEntries
    .filter((entry) => entry.scheduledFor)
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      start: entry.scheduledFor!,
      backgroundColor: channelColor(entry.channelId),
      borderColor: channelColor(entry.channelId),
      extendedProps: { entry },
    }));

  async function handleSubmit(values: EntryFormValues) {
    setSubmitting(true);
    const input = toInput(values);

    if (modalState?.mode === "new") {
      const result = await createEntryAction(workspaceId, input);
      setSubmitting(false);
      if (!result.ok) {
        showToast({
          title:
            result.error.type === "assignee_not_member"
              ? "That person isn't a workspace member"
              : "Couldn't create entry",
          variant: "error",
        });
        return;
      }
      setEntries((current) => [...current, result.value]);
      setModalState(null);
      return;
    }

    if (modalState?.mode === "edit") {
      const entryId = modalState.entry.id;
      const result = await updateEntryAction(entryId, input);
      setSubmitting(false);
      if (!result.ok) {
        showToast({
          title:
            result.error.type === "assignee_not_member"
              ? "That person isn't a workspace member"
              : "Couldn't save entry",
          variant: "error",
        });
        return;
      }
      setEntries((current) =>
        current.map((e) =>
          e.id === entryId
            ? {
                ...e,
                title: values.title,
                description: input.description ?? null,
                channelId: input.channelId ?? null,
                status: values.status,
                scheduledFor: input.scheduledFor ?? null,
                assigneeId: input.assigneeId ?? null,
              }
            : e,
        ),
      );
      setModalState(null);
    }
  }

  async function handleDelete() {
    if (modalState?.mode !== "edit") return;
    const entryId = modalState.entry.id;
    const result = await deleteEntryAction(entryId);
    if (!result.ok) {
      showToast({ title: "Couldn't delete entry", variant: "error" });
      return;
    }
    setEntries((current) => current.filter((e) => e.id !== entryId));
    setModalState(null);
  }

  async function handleEventDrop(info: EventDropArg) {
    const entryId = info.event.id;
    const newDate = info.event.start?.toISOString();
    if (!newDate) return;
    const result = await moveEntryAction(entryId, newDate);
    if (!result.ok) {
      showToast({ title: "Couldn't reschedule", variant: "error" });
      info.revert();
      return;
    }
    setEntries((current) =>
      current.map((e) => (e.id === entryId ? { ...e, scheduledFor: newDate } : e)),
    );
  }

  function handleDateClick(info: DateClickArg) {
    if (!isContributor) return;
    setModalState({ mode: "new", date: info.dateStr });
  }

  function handleEventClick(info: EventClickArg) {
    const entry = info.event.extendedProps.entry as CalendarEntry;
    setModalState({ mode: "edit", entry });
  }

  function renderEventContent(arg: EventContentArg) {
    return <span className="truncate px-1 text-caption text-text-inverse">{arg.event.title}</span>;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h2 text-text-primary">Content Calendar</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => downloadICS(filteredEntries)}
            disabled={filteredEntries.length === 0}
          >
            Export .ics
          </Button>
          {isContributor ? (
            <Button onClick={() => setModalState({ mode: "new" })}>Add entry</Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as CalendarStatus | typeof ALL)}
          className="w-40"
        />
        <Select
          options={[
            { value: ALL, label: "All assignees" },
            ...members.map((m) => ({ value: m.id, label: m.name ?? "Unnamed" })),
          ]}
          value={assigneeFilter}
          onValueChange={setAssigneeFilter}
          className="w-40"
        />
        <Select
          options={[
            { value: ALL, label: "All channels" },
            ...channels.map((c) => ({ value: c.id, label: c.name ?? "Unnamed" })),
          ]}
          value={channelFilter}
          onValueChange={setChannelFilter}
          className="w-40"
        />
      </div>

      {entries.length === 0 ? (
        <EmptyState message="No videos planned yet. Add your first from a saved prompt, or drag one from Outliers." />
      ) : (
        <div className="rounded-md border border-border-default bg-bg-surface-1 p-2">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            editable={isContributor}
            eventDrop={(info) => void handleEventDrop(info)}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
          />
        </div>
      )}

      <Modal
        open={modalState !== null}
        onOpenChange={(open) => !open && setModalState(null)}
        title={modalState?.mode === "edit" ? "Edit entry" : "Add entry"}
        footer={
          modalState?.mode === "edit" ? (
            <div className="flex w-full items-center justify-between">
              <a
                href={buildGoogleCalendarUrl(modalState.entry)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-sm text-accent-text hover:underline"
              >
                Add to Google Calendar
              </a>
              <Button variant="destructive" onClick={() => void handleDelete()}>
                Delete
              </Button>
            </div>
          ) : undefined
        }
      >
        <EntryForm
          members={members}
          channels={channels}
          initialEntry={modalState?.mode === "edit" ? modalState.entry : undefined}
          initialDate={modalState?.mode === "new" ? modalState.date : undefined}
          submitting={submitting}
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={() => setModalState(null)}
        />
      </Modal>
    </div>
  );
}

export { CalendarClient };
