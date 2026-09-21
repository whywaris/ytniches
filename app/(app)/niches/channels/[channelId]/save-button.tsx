"use client";

import * as React from "react";

import { Bookmark, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { saveChannelAction } from "@/app/(app)/niches/actions";

// Small client island — the rest of the channel detail page is server
// rendered. Session-local optimistic state only, same caveat as the
// search results grid: no "is this already tracked" lookup exists yet
// (Competitor Tracking, Task 2), so a previously-tracked channel still
// shows as unsaved until that ships.
export function SaveButton({ channelId }: { channelId: string }) {
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function handleClick() {
    setPending(true);
    setError(null);
    const result = await saveChannelAction(channelId);
    setPending(false);
    if (result.ok) {
      setSaved(true);
    } else {
      setError(
        `You're at ${result.error.current}/${result.error.limit} tracked channels. Upgrade to track more.`,
      );
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant={saved ? "secondary" : "primary"}
        loading={pending}
        onClick={handleClick}
        disabled={saved}
      >
        {saved ? (
          <BookmarkCheck className="text-accent" aria-hidden="true" />
        ) : (
          <Bookmark aria-hidden="true" />
        )}
        {saved ? "Saved to tracking" : "Save to tracking"}
      </Button>
      {error ? (
        <p role="alert" className="text-caption text-warning">
          {error}
        </p>
      ) : null}
    </div>
  );
}
