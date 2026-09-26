"use client";

import * as React from "react";

import { setTimeZoneAction } from "@/app/(app)/settings/profile/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";

export interface ProfileClientProps {
  timeZone: string;
  timeZones: string[];
}

function ProfileClient({ timeZone, timeZones }: ProfileClientProps) {
  const { showToast } = useToast();
  const [saved, setSaved] = React.useState(timeZone);
  const [draft, setDraft] = React.useState(timeZone);
  const [saving, setSaving] = React.useState(false);
  const options = React.useMemo(
    () => timeZones.map((zone) => ({ value: zone, label: zone.replace(/_/g, " ") })),
    [timeZones],
  );

  async function handleSave() {
    setSaving(true);
    const result = await setTimeZoneAction(draft);
    setSaving(false);
    if (result.ok) {
      setSaved(draft);
      showToast({ title: "Time zone saved", variant: "success" });
    } else {
      showToast({ title: "Couldn't save your time zone", variant: "error" });
    }
  }

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6 px-6 py-6">
      <h1 className="text-h3 text-text-primary">Profile</h1>

      <Card padding="lg" className="flex flex-col gap-4">
        <Select
          label="Time zone"
          helperText="Sets when your email digest arrives and when quiet hours apply."
          options={options}
          value={draft}
          onValueChange={setDraft}
        />
        <Button
          className="self-start"
          disabled={draft === saved}
          loading={saving}
          onClick={() => void handleSave()}
        >
          Save changes
        </Button>
      </Card>
    </div>
  );
}

export { ProfileClient };
