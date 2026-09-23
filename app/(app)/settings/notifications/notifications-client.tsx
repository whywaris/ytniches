"use client";

import * as React from "react";

import {
  listChannelNotificationOverridesAction,
  updateChannelNotificationOverrideAction,
  updateNotificationPreferencesAction,
} from "@/app/(app)/settings/notifications/actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TextInput } from "@/components/ui/text-input";
import { useToast } from "@/components/ui/toast-provider";
import { UpgradeModal } from "@/components/features/billing/upgrade-modal";
import type {
  ChannelNotificationOverride,
  DigestCadence,
  NotificationEventType,
  NotificationPreferencesSummary,
  PerTypePreference,
} from "@/lib/services/notification-preferences";

export interface NotificationsClientProps {
  initialPreferences: NotificationPreferencesSummary;
  initialChannelOverrides: ChannelNotificationOverride[];
}

const TYPE_LABELS: Record<NotificationEventType, string> = {
  new_video: "New video",
  view_spike: "View spike",
  cadence_change: "Cadence change",
  outlier_detected: "Outlier detected",
};

const CADENCE_OPTIONS: { value: DigestCadence; label: string }[] = [
  { value: "off", label: "Off" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

const DAY_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

// `time` column <-> <input type="time"> conversion: DB carries seconds
// ("22:00:00"), the input doesn't.
function toInputTime(value: string | null): string {
  return value ? value.slice(0, 5) : "";
}
function toDbTime(value: string): string | null {
  return value ? `${value}:00` : null;
}

interface Draft {
  perType: PerTypePreference[];
  digestCadence: DigestCadence;
  digestDayOfWeek: number;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

function toDraft(summary: NotificationPreferencesSummary): Draft {
  return {
    perType: summary.perType,
    digestCadence: summary.digestCadence,
    digestDayOfWeek: summary.digestDayOfWeek,
    quietHoursStart: summary.quietHoursStart,
    quietHoursEnd: summary.quietHoursEnd,
  };
}

// UI-UX-Flow.md §6.4's notification preferences page. Server-rendered
// initial data comes from page.tsx; this is the interactive layer --
// global per-type toggles, digest cadence + day, quiet hours, and the
// per-channel override table, all wired to real Server Actions.
function NotificationsClient({
  initialPreferences,
  initialChannelOverrides,
}: NotificationsClientProps) {
  const { showToast } = useToast();
  const [emailAvailable] = React.useState(initialPreferences.emailAvailable);
  const [saved, setSaved] = React.useState<Draft>(() => toDraft(initialPreferences));
  const [draft, setDraft] = React.useState<Draft>(() => toDraft(initialPreferences));
  const [saving, setSaving] = React.useState(false);
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  const [channelOverrides, setChannelOverrides] = React.useState(initialChannelOverrides);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function updateType(type: NotificationEventType, patch: Partial<PerTypePreference>) {
    setDraft((current) => ({
      ...current,
      perType: current.perType.map((pref) => (pref.type === type ? { ...pref, ...patch } : pref)),
    }));
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateNotificationPreferencesAction(draft);
    setSaving(false);
    if (result.ok) {
      setSaved(draft);
      showToast({ title: "Notification preferences saved", variant: "success" });
    } else {
      showToast({ title: "Couldn't save preferences", variant: "error" });
    }
  }

  async function handleChannelToggle(channelId: string, enabled: boolean) {
    setChannelOverrides((current) =>
      current.map((row) =>
        row.channelId === channelId ? { ...row, notificationsEnabled: enabled } : row,
      ),
    );
    await updateChannelNotificationOverrideAction(channelId, enabled);
    // Re-fetch rather than trust the optimistic value long-term -- cheap,
    // and keeps this table correct even if the write silently no-ops.
    setChannelOverrides(await listChannelNotificationOverridesAction());
  }

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6 px-6 py-6">
      <div>
        <h1 className="text-h3 text-text-primary">Notification preferences</h1>
        <p className="text-body-sm text-text-secondary">Choose what you hear about, and how.</p>
      </div>

      <Card padding="lg" className="flex flex-col gap-4">
        <h2 className="text-h4 text-text-primary">By type</h2>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-caption text-text-tertiary">
            <span />
            <span>In-app</span>
            <span>Email</span>
          </div>
          {draft.perType.map((pref) => (
            <div
              key={pref.type}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-border-subtle pt-3 first:border-t-0 first:pt-0"
            >
              <span className="text-body text-text-primary">{TYPE_LABELS[pref.type]}</span>
              <Switch
                checked={pref.inAppEnabled}
                onCheckedChange={(checked) => updateType(pref.type, { inAppEnabled: checked })}
                aria-label={`${TYPE_LABELS[pref.type]} in-app`}
              />
              <Switch
                checked={emailAvailable && pref.emailEnabled}
                disabled={!emailAvailable}
                onCheckedChange={(checked) => updateType(pref.type, { emailEnabled: checked })}
                aria-label={`${TYPE_LABELS[pref.type]} email`}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h4 text-text-primary">Digest &amp; quiet hours</h2>
          {!emailAvailable ? (
            <Button size="sm" variant="secondary" onClick={() => setShowUpgrade(true)}>
              Upgrade for email
            </Button>
          ) : null}
        </div>
        {!emailAvailable ? (
          <p role="alert" className="text-body-sm text-warning">
            Email digests and quiet hours are available on Pro and Team plans.
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            label="Digest cadence"
            options={CADENCE_OPTIONS}
            value={draft.digestCadence}
            disabled={!emailAvailable}
            onValueChange={(value) =>
              setDraft((current) => ({ ...current, digestCadence: value as DigestCadence }))
            }
            className="flex-1"
          />
          {draft.digestCadence === "weekly" ? (
            <Select
              label="Digest day"
              options={DAY_OPTIONS}
              value={String(draft.digestDayOfWeek)}
              disabled={!emailAvailable}
              onValueChange={(value) =>
                setDraft((current) => ({ ...current, digestDayOfWeek: Number(value) }))
              }
              className="flex-1"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <TextInput
            type="time"
            label="Quiet hours start"
            value={toInputTime(draft.quietHoursStart)}
            disabled={!emailAvailable}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                quietHoursStart: toDbTime(event.target.value),
              }))
            }
            className="flex-1"
          />
          <TextInput
            type="time"
            label="Quiet hours end"
            value={toInputTime(draft.quietHoursEnd)}
            disabled={!emailAvailable}
            onChange={(event) =>
              setDraft((current) => ({ ...current, quietHoursEnd: toDbTime(event.target.value) }))
            }
            className="flex-1"
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button disabled={!dirty} loading={saving} onClick={() => void handleSave()}>
          Save changes
        </Button>
      </div>

      <Card padding="lg" className="flex flex-col gap-4">
        <h2 className="text-h4 text-text-primary">Per-channel overrides</h2>
        {channelOverrides.length === 0 ? (
          <EmptyState message="Track a channel to set per-channel notification overrides." />
        ) : (
          <div className="flex flex-col gap-3">
            {channelOverrides.map((row) => (
              <div key={row.channelId} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar
                    size="sm"
                    src={row.avatarUrl ?? undefined}
                    fallback={row.channelName.slice(0, 2).toUpperCase()}
                  />
                  <span className="truncate text-body-sm text-text-primary">{row.channelName}</span>
                </div>
                <Switch
                  checked={row.notificationsEnabled}
                  onCheckedChange={(checked) => void handleChannelToggle(row.channelId, checked)}
                  aria-label={`Notifications for ${row.channelName}`}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <UpgradeModal
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        reason="Email notifications are available on Pro and Team plans."
      />
    </div>
  );
}

export { NotificationsClient };
