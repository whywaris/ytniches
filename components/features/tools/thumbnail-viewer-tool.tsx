"use client";

import * as React from "react";

import { ExternalLink } from "lucide-react";

import { thumbnailOptions, type ThumbnailOption } from "@/lib/tools/calculators";
import { parseVideoInput } from "@/lib/youtube/urls";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { ResultCta, trackToolUsed } from "@/components/features/tools/tool-kit";

// D-084: a viewer, not a downloader -- YouTube's Developer Policies don't
// allow enabling downloads of YouTube content. Images load straight from
// YouTube's fixed image URLs: no API call, nothing on our server (D-055).
function ThumbnailCard({ option }: { option: ThumbnailOption }) {
  // A missing maxres/sd image comes back as YouTube's 120×90 placeholder.
  const [missing, setMissing] = React.useState(false);
  return (
    <li className="flex flex-col gap-2 rounded-md border border-border-subtle p-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube image shown as-is */}
      <img
        src={option.url}
        alt={`${option.label} thumbnail`}
        onLoad={(event) =>
          setMissing(option.width > 120 && event.currentTarget.naturalWidth <= 120)
        }
        className="aspect-video w-full rounded-sm bg-bg-surface-2 object-cover"
      />
      <p className="text-body-sm text-text-primary">
        {option.label}{" "}
        <span className="text-text-secondary">
          {option.width}×{option.height}
        </span>
      </p>
      {missing ? (
        <p className="text-caption text-text-secondary">Not available for this video.</p>
      ) : (
        <Button asChild size="sm" variant="secondary" className="self-start">
          <a href={option.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            View full size<span className="sr-only"> {option.label} (new tab)</span>
          </a>
        </Button>
      )}
    </li>
  );
}

export function ThumbnailViewerTool() {
  const [url, setUrl] = React.useState("");
  const [videoId, setVideoId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const video = parseVideoInput(url);
    setVideoId(video?.id ?? null);
    setError(video ? null : "Paste a YouTube video link.");
    if (video) trackToolUsed("youtube-thumbnail-download");
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <TextInput
            label="Video link"
            placeholder="https://www.youtube.com/watch?v=…"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            errorMessage={error ?? undefined}
            required
          />
        </div>
        <Button type="submit" className="sm:mt-6">
          Get thumbnails
        </Button>
      </form>
      {videoId && (
        <div className="flex flex-col gap-4">
          <ul className="grid gap-3 sm:grid-cols-2">
            {thumbnailOptions(videoId).map((option) => (
              <ThumbnailCard key={option.key} option={option} />
            ))}
          </ul>
          <ResultCta slug="youtube-thumbnail-download" />
        </div>
      )}
    </div>
  );
}
