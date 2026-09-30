"use client";

import * as React from "react";

import type { TagExtraction } from "@/lib/services/free-tools";
import { parseVideoInput } from "@/lib/youtube/urls";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { TextInput } from "@/components/ui/text-input";
import {
  CopyField,
  Honeypot,
  ResultCta,
  TOOL_ERROR_COPY,
  trackToolUsed,
} from "@/components/features/tools/tool-kit";
import { extractTagsAction } from "@/app/(marketing)/tools/actions";

// Server-backed (1 unit per uncached video), behind the free-tools guard:
// per-IP limit + the free-tools quota budget (D-054, D-055, D-075).
export function TagExtractorTool() {
  const [query, setQuery] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TagExtraction | null>(null);
  const [pending, startTransition] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!parseVideoInput(query)) {
      setResult(null);
      setError("Paste a YouTube video link.");
      return;
    }
    startTransition(async () => {
      const response = await extractTagsAction({ query, company });
      if (response.ok) {
        setError(null);
        setResult(response.value);
        trackToolUsed("tag-extractor");
      } else {
        setResult(null);
        setError(
          response.error === "invalid_input"
            ? "Paste a YouTube video link."
            : (TOOL_ERROR_COPY[response.error] ?? TOOL_ERROR_COPY.failed),
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <TextInput
            label="Video link"
            placeholder="https://www.youtube.com/watch?v=…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            errorMessage={error ?? undefined}
            required
          />
        </div>
        <Honeypot value={company} onChange={setCompany} />
        <Button type="submit" loading={pending} className="sm:mt-6">
          Extract
        </Button>
      </form>
      {result && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-body font-semibold text-text-primary">{result.video.title}</p>
            {result.video.channelTitle && (
              <p className="text-body-sm text-text-secondary">{result.video.channelTitle}</p>
            )}
          </div>
          {result.tags.length === 0 ? (
            <p role="status" className="text-body-sm text-text-secondary">
              This video has no tags. Plenty of uploaders don&apos;t add any.
            </p>
          ) : (
            <>
              <p role="status" className="text-body-sm text-text-secondary">
                {result.tags.length} {result.tags.length === 1 ? "tag" : "tags"}
              </p>
              <ul className="flex flex-wrap gap-2">
                {result.tags.map((tag) => (
                  <li key={tag}>
                    <Tag>{tag}</Tag>
                  </li>
                ))}
              </ul>
              <CopyField label="All tags, comma-separated" value={result.tags.join(", ")} />
            </>
          )}
          <ResultCta slug="tag-extractor" />
        </div>
      )}
    </div>
  );
}
