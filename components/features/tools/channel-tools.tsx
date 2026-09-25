"use client";

import * as React from "react";

import { rssFeedUrl, subscribeLink, type FeedSource } from "@/lib/tools/builders";
import type { ToolSlug } from "@/lib/tools/registry";
import { parsePlaylistId } from "@/lib/youtube/urls";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import {
  CopyField,
  Honeypot,
  ResultCta,
  trackToolUsed,
  useChannelResolver,
  type ResolvedChannel,
} from "@/components/features/tools/tool-kit";

type Outcome<T> = { ok: true; value: T } | { ok: false; message: string };

// Shared form for the channel-input tools (subscribe link, RSS feed,
// channel ID). `shortcut` lets a tool answer without resolving a channel
// at all (the RSS tool's playlist links).
function ChannelToolForm<T>({
  slug,
  label,
  placeholder,
  buttonLabel,
  toResult,
  shortcut,
  renderResult,
}: {
  slug: ToolSlug;
  label: string;
  placeholder: string;
  buttonLabel: string;
  toResult: (channel: ResolvedChannel) => T;
  shortcut?: (query: string) => T | null;
  renderResult: (result: T) => React.ReactNode;
}) {
  const [query, setQuery] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [outcome, setOutcome] = React.useState<Outcome<T> | null>(null);
  const { resolve, pending } = useChannelResolver();

  function finish(next: Outcome<T>) {
    setOutcome(next);
    if (next.ok) trackToolUsed(slug);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const quick = shortcut?.(query);
    if (quick) return finish({ ok: true, value: quick });
    resolve(query, company, (result) =>
      finish(result.ok ? { ok: true, value: toResult(result.value) } : result),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <TextInput
            label={label}
            placeholder={placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            errorMessage={outcome && !outcome.ok ? outcome.message : undefined}
            required
          />
        </div>
        <Honeypot value={company} onChange={setCompany} />
        <Button type="submit" loading={pending} className="sm:mt-6">
          {buttonLabel}
        </Button>
      </form>
      {outcome?.ok && (
        <div className="flex flex-col gap-4">
          {renderResult(outcome.value)}
          <ResultCta slug={slug} />
        </div>
      )}
    </div>
  );
}

export function SubscribeLinkTool() {
  return (
    <ChannelToolForm
      slug="youtube-subscribe-link-generator"
      label="Channel URL, @handle or ID"
      placeholder="@yourchannel"
      buttonLabel="Generate"
      toResult={(channel) => ({ ...channel, link: subscribeLink(channel.channelId) })}
      renderResult={(result) => (
        <>
          {result.title && (
            <p className="text-body-sm text-text-secondary">Channel: {result.title}</p>
          )}
          <CopyField label="Your subscribe link" value={result.link} />
        </>
      )}
    />
  );
}

export function RssFeedTool() {
  const feed = (source: FeedSource, title?: string) => ({ source, title, url: rssFeedUrl(source) });
  return (
    <ChannelToolForm
      slug="rss-feed-generator"
      label="Channel, @handle or playlist link"
      placeholder="youtube.com/@yourchannel"
      buttonLabel="Generate"
      shortcut={(query) => {
        const playlistId = parsePlaylistId(query);
        return playlistId ? feed({ kind: "playlist", id: playlistId }) : null;
      }}
      toResult={(channel) => feed({ kind: "channel", id: channel.channelId }, channel.title)}
      renderResult={(result) => (
        <>
          <p className="text-body-sm text-text-secondary">
            {result.source.kind === "playlist"
              ? "Playlist feed"
              : `Channel feed${result.title ? `: ${result.title}` : ""}`}
          </p>
          <CopyField label="RSS feed URL" value={result.url} />
        </>
      )}
    />
  );
}

export function ChannelIdFinderTool() {
  return (
    <ChannelToolForm
      slug="youtube-channel-id-finder"
      label="@handle or channel link"
      placeholder="@yourchannel"
      buttonLabel="Find ID"
      toResult={(channel) => channel}
      renderResult={(result) => (
        <>
          {result.title && (
            <p className="text-body-sm text-text-secondary">Channel: {result.title}</p>
          )}
          <CopyField label="Channel ID" value={result.channelId} />
        </>
      )}
    />
  );
}
