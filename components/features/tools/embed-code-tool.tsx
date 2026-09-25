"use client";

import * as React from "react";

import { embedCode, type EmbedOptions } from "@/lib/tools/builders";
import { parseStartTime, parseVideoInput } from "@/lib/youtube/urls";
import { Checkbox } from "@/components/ui/checkbox";
import { TextInput } from "@/components/ui/text-input";
import { CopyField, ResultCta, trackToolUsed } from "@/components/features/tools/tool-kit";

type Toggle = "autoplay" | "controls" | "privacyEnhanced" | "responsive";

const TOGGLES: { key: Toggle; label: string; hint?: string }[] = [
  { key: "autoplay", label: "Autoplay", hint: "Starts muted; browsers block autoplay with sound." },
  { key: "controls", label: "Show player controls" },
  { key: "privacyEnhanced", label: "Privacy-enhanced mode (youtube-nocookie.com)" },
  { key: "responsive", label: "Responsive (fills its container, keeps 16:9)" },
];

// Entirely client-side: the code updates as you type, nothing is sent anywhere.
export function EmbedCodeTool() {
  const [url, setUrl] = React.useState("");
  const [startText, setStartText] = React.useState("");
  const [toggles, setToggles] = React.useState<Record<Toggle, boolean>>({
    autoplay: false,
    controls: true,
    privacyEnhanced: true,
    responsive: true,
  });
  const tracked = React.useRef(false);

  const video = url.trim() ? parseVideoInput(url) : null;
  const startFromField = startText.trim() ? parseStartTime(startText) : null;
  const startError =
    startText.trim() && startFromField === null ? "Use 90, 1:30 or 1m30s." : undefined;
  const start = startFromField ?? video?.start;

  const options: EmbedOptions | null = video ? { videoId: video.id, start, ...toggles } : null;
  const code = options ? embedCode(options) : null;

  React.useEffect(() => {
    if (code && !tracked.current) {
      tracked.current = true;
      trackToolUsed("youtube-embed-code-generator");
    }
  }, [code]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
        <TextInput
          label="Video link"
          placeholder="https://www.youtube.com/watch?v=…"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          errorMessage={url.trim() && !video ? "Paste a YouTube video link." : undefined}
        />
        <TextInput
          label="Start at (optional)"
          placeholder="1:30"
          value={startText}
          onChange={(event) => setStartText(event.target.value)}
          errorMessage={startError}
          helperText={!startText && video?.start ? `From the link: ${video.start}s` : undefined}
        />
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-body-sm font-medium text-text-primary">Options</legend>
        {TOGGLES.map((toggle) => (
          <div key={toggle.key} className="flex items-start gap-2">
            <Checkbox
              id={`embed-${toggle.key}`}
              checked={toggles[toggle.key]}
              onCheckedChange={(checked) =>
                setToggles((current) => ({ ...current, [toggle.key]: checked === true }))
              }
              className="mt-0.5"
            />
            <label htmlFor={`embed-${toggle.key}`} className="text-body-sm text-text-primary">
              {toggle.label}
              {toggle.hint && (
                <span className="block text-caption text-text-secondary">{toggle.hint}</span>
              )}
            </label>
          </div>
        ))}
      </fieldset>

      {code && (
        <div className="flex flex-col gap-4">
          <CopyField label="Embed code" value={code} multiline />
          <ResultCta slug="youtube-embed-code-generator" />
        </div>
      )}
    </div>
  );
}
