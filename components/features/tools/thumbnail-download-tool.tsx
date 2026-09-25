"use client";

import * as React from "react";

import { Download, ExternalLink } from "lucide-react";

import { thumbnailOptions, type ThumbnailOption } from "@/lib/tools/calculators";
import { parseVideoInput } from "@/lib/youtube/urls";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { ResultCta, trackToolUsed } from "@/components/features/tools/tool-kit";

// Straight from YouTube's fixed image URLs: no API call, nothing on our
// server (D-055).
async function download(option: ThumbnailOption, videoId: string) {
  try {
    const response = await fetch(option.url);
    if (!response.ok) throw new Error(String(response.status));
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = `${videoId}-${option.key}.jpg`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    // Fall back to opening the image when the browser blocks the fetch.
    window.open(option.url, "_blank", "noopener,noreferrer");
  }
}

function ThumbnailCard({ option, videoId }: { option: ThumbnailOption; videoId: string }) {
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
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void download(option, videoId)}>
            <Download />
            Download
          </Button>
          <Button asChild size="sm" variant="secondary">
            <a href={option.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Open<span className="sr-only"> {option.label} (new tab)</span>
            </a>
          </Button>
        </div>
      )}
    </li>
  );
}

export function ThumbnailDownloadTool() {
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
              <ThumbnailCard key={option.key} option={option} videoId={videoId} />
            ))}
          </ul>
          <ResultCta slug="youtube-thumbnail-download" />
        </div>
      )}
    </div>
  );
}
