"use client";

import * as React from "react";

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Result } from "@/lib/result";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextInput } from "@/components/ui/text-input";

// UI-UX-Flow.md §6.5 / Application-Flow.md §4.2. Presentational + its own
// state machine, but no direct Server Action calls — onValidateUrl/
// onAddChannel/onSearch are injected so the parent page (Phase 2D) owns the
// actual data layer. Toast + close-on-success also live in the parent (via
// onAdded), not here, matching the rest of this codebase's
// component-stays-dumb convention (see channel-card.tsx).
export interface ChannelPreview {
  channelId: string;
  name: string;
  avatarUrl: string | null;
  subscriberCount: number;
  videoCount: number;
}

export interface ChannelSearchResultItem {
  channelId: string;
  name: string;
  avatarUrl: string | null;
  subscriberCount: number;
}

export type ValidateUrlError = { type: "invalid_url" } | { type: "not_found" };
export type AddChannelErrorReason =
  { type: "tier_limit"; limit: number; current: number } | { type: "unknown" };

export interface AddChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidateUrl: (url: string) => Promise<Result<ChannelPreview, ValidateUrlError>>;
  onAddChannel: (channelId: string) => Promise<Result<void, AddChannelErrorReason>>;
  onSearch: (query: string) => Promise<ChannelSearchResultItem[]>;
  onAdded?: (channelId: string) => void;
}

// Application-Flow.md §4.2's exact states: idle -> validating -> previewing
// -> adding -> added, with a separate invalid branch off validating and a
// failed branch (retryable back to previewing) off adding.
type UrlFlowState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "previewing"; channel: ChannelPreview }
  | { status: "adding"; channel: ChannelPreview }
  | { status: "added"; channel: ChannelPreview }
  | { status: "invalid"; message: string }
  | { status: "failed"; channel: ChannelPreview; message: string };

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function validateErrorMessage(error: ValidateUrlError): string {
  return error.type === "not_found"
    ? "We couldn't find a channel at that URL."
    : "That doesn't look like a valid YouTube channel URL.";
}

function addErrorMessage(error: AddChannelErrorReason): string {
  return error.type === "tier_limit"
    ? `You've reached your tracking limit (${error.current} of ${error.limit}). Upgrade to track more.`
    : "Something went wrong adding this channel. Try again.";
}

function ChannelPreviewCard({ channel }: { channel: ChannelPreview }) {
  return (
    <Card variant="base" padding="md" className="flex items-center gap-3">
      <Avatar
        size="lg"
        src={channel.avatarUrl ?? undefined}
        fallback={channel.name.slice(0, 2).toUpperCase()}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-h4 text-text-primary">{channel.name}</p>
        <p className="text-body-sm text-text-secondary">
          {formatCount(channel.subscriberCount)} subs &middot; {formatCount(channel.videoCount)}{" "}
          videos
        </p>
      </div>
    </Card>
  );
}

function AddChannelModal({
  open,
  onOpenChange,
  onValidateUrl,
  onAddChannel,
  onSearch,
  onAdded,
}: AddChannelModalProps) {
  const [tab, setTab] = React.useState<"url" | "search">("url");

  const [url, setUrl] = React.useState("");
  const [urlFlow, setUrlFlow] = React.useState<UrlFlowState>({ status: "idle" });

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ChannelSearchResultItem[] | null>(null);
  const [searching, setSearching] = React.useState(false);
  const [addingId, setAddingId] = React.useState<string | null>(null);
  const [addedId, setAddedId] = React.useState<string | null>(null);
  const [rowError, setRowError] = React.useState<{ id: string; message: string } | null>(null);

  function reset() {
    setTab("url");
    setUrl("");
    setUrlFlow({ status: "idle" });
    setQuery("");
    setResults(null);
    setSearching(false);
    setAddingId(null);
    setAddedId(null);
    setRowError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleValidate() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setUrlFlow({ status: "validating" });
    const result = await onValidateUrl(trimmed);
    if (result.ok) {
      setUrlFlow({ status: "previewing", channel: result.value });
    } else {
      setUrlFlow({ status: "invalid", message: validateErrorMessage(result.error) });
    }
  }

  async function handleConfirmAdd(channel: ChannelPreview) {
    setUrlFlow({ status: "adding", channel });
    const result = await onAddChannel(channel.channelId);
    if (result.ok) {
      setUrlFlow({ status: "added", channel });
      onAdded?.(channel.channelId);
    } else {
      setUrlFlow({ status: "failed", channel, message: addErrorMessage(result.error) });
    }
  }

  async function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    const found = await onSearch(trimmed);
    setResults(found);
    setSearching(false);
  }

  async function handleSearchAdd(result: ChannelSearchResultItem) {
    setRowError(null);
    setAddingId(result.channelId);
    const addResult = await onAddChannel(result.channelId);
    setAddingId(null);
    if (addResult.ok) {
      setAddedId(result.channelId);
      onAdded?.(result.channelId);
    } else {
      setRowError({ id: result.channelId, message: addErrorMessage(addResult.error) });
    }
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange} title="Add channel to tracking" size="md">
      <Tabs value={tab} onValueChange={(value) => setTab(value === "search" ? "search" : "url")}>
        <TabsList>
          <TabsTrigger value="url">Paste URL</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="flex flex-col gap-4 pt-4">
          {urlFlow.status === "idle" ||
          urlFlow.status === "invalid" ||
          urlFlow.status === "validating" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleValidate();
              }}
              className="flex flex-col gap-3"
            >
              <TextInput
                label="Channel URL"
                placeholder="https://youtube.com/@channel"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                errorMessage={urlFlow.status === "invalid" ? urlFlow.message : undefined}
                disabled={urlFlow.status === "validating"}
              />
              <Button
                type="submit"
                loading={urlFlow.status === "validating"}
                disabled={!url.trim()}
              >
                Validate
              </Button>
            </form>
          ) : null}

          {urlFlow.status === "previewing" || urlFlow.status === "failed" ? (
            <div className="flex flex-col gap-3">
              <ChannelPreviewCard channel={urlFlow.channel} />
              {urlFlow.status === "failed" ? (
                <p role="alert" className="text-body-sm text-error">
                  {urlFlow.message}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                <Button onClick={() => void handleConfirmAdd(urlFlow.channel)}>
                  {urlFlow.status === "failed" ? "Retry" : "Add to tracking"}
                </Button>
                <Button variant="ghost" onClick={() => setUrlFlow({ status: "idle" })}>
                  Change URL
                </Button>
              </div>
            </div>
          ) : null}

          {urlFlow.status === "adding" ? (
            <div className="flex flex-col gap-3">
              <ChannelPreviewCard channel={urlFlow.channel} />
              <Button loading disabled>
                Adding&hellip;
              </Button>
            </div>
          ) : null}

          {urlFlow.status === "added" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
              <p className="text-body text-text-primary">
                <strong>{urlFlow.channel.name}</strong> is now being tracked.
              </p>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="search" className="flex flex-col gap-3 pt-4">
          <form onSubmit={(event) => void handleSearchSubmit(event)} className="flex gap-2">
            <SearchInput
              aria-label="Search channels"
              placeholder="Search by channel name"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => {
                setQuery("");
                setResults(null);
              }}
              className="flex-1"
            />
            <Button type="submit" loading={searching} disabled={!query.trim()}>
              Search
            </Button>
          </form>

          {results === null ? null : results.length === 0 ? (
            <p className="py-6 text-center text-body-sm text-text-tertiary">
              No channels found for &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {results.map((result) => (
                <li
                  key={result.channelId}
                  className={cn(
                    "flex items-center gap-3 rounded-sm p-2",
                    "transition-colors duration-fast ease-out hover:bg-bg-hover",
                  )}
                >
                  <Avatar
                    size="sm"
                    src={result.avatarUrl ?? undefined}
                    fallback={result.name.slice(0, 2).toUpperCase()}
                  />
                  <span className="min-w-0 flex-1 truncate text-body-sm text-text-primary">
                    {result.name}
                  </span>
                  <span className="shrink-0 text-caption text-text-tertiary">
                    {formatCount(result.subscriberCount)} subs
                  </span>
                  {addedId === result.channelId ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
                  ) : (
                    <Button
                      size="xs"
                      variant="secondary"
                      loading={addingId === result.channelId}
                      onClick={() => void handleSearchAdd(result)}
                    >
                      Add
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {rowError ? (
            <p role="alert" className="text-body-sm text-error">
              {rowError.message}
            </p>
          ) : null}
        </TabsContent>
      </Tabs>
    </Modal>
  );
}

export { AddChannelModal };
