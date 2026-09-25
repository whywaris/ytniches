"use client";

import * as React from "react";

import { chapterProblems, formatChapters, parseChapterLines } from "@/lib/tools/calculators";
import { Textarea } from "@/components/ui/textarea";
import { CopyField, ResultCta, trackToolUsed } from "@/components/features/tools/tool-kit";

// Manual chapter formatter: no AI, no server call (D-055).
export function TimestampTool() {
  const [text, setText] = React.useState("");
  const tracked = React.useRef(false);

  const { chapters, unreadable } = parseChapterLines(text);
  const problems = chapters.length > 0 ? chapterProblems(chapters) : [];
  const ready = chapters.length > 0;

  React.useEffect(() => {
    if (ready && problems.length === 0 && !tracked.current) {
      tracked.current = true;
      trackToolUsed("youtube-timestamp-generator");
    }
  }, [ready, problems.length]);

  return (
    <div className="flex flex-col gap-6">
      <Textarea
        label="Your chapters, one per line"
        placeholder={"0:00 Intro\n1:30 The setup\n4:05 What happened next"}
        rows={8}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      {unreadable.length > 0 && (
        <p role="alert" className="text-body-sm text-warning">
          We couldn&apos;t read {unreadable.length === 1 ? "this line" : "these lines"}:{" "}
          {unreadable.map((line) => `"${line}"`).join(", ")}. Each needs a time like 1:30 and a
          title.
        </p>
      )}
      {ready && (
        <div className="flex flex-col gap-4">
          {problems.length > 0 ? (
            <div role="alert" className="rounded-md border border-warning/40 bg-warning/12 p-4">
              <p className="text-body-sm font-semibold text-warning">
                YouTube won&apos;t show these chapters yet:
              </p>
              <ul className="mt-2 list-disc pl-5 text-body-sm text-text-primary">
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p role="status" className="text-body-sm font-medium text-success">
              These chapters meet YouTube&apos;s rules.
            </p>
          )}
          <CopyField
            label="Paste into your description"
            value={formatChapters(chapters)}
            multiline
          />
          <ResultCta slug="youtube-timestamp-generator" />
        </div>
      )}
    </div>
  );
}
