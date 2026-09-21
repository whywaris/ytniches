import Image from "next/image";

import { Video } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { Card } from "@/components/ui/card";
import type { PromptSummary } from "@/components/features/prompts/types";

// UI-UX-Flow.md §7.1 library list item: "source video thumbnail + title +
// generated-at date". Presentational only -- onOpen is a callback, the
// parent page owns navigation.
export interface PromptCardProps {
  prompt: PromptSummary;
  onOpen?: (promptId: string) => void;
  className?: string;
}

function PromptCard({ prompt, onOpen, className }: PromptCardProps) {
  return (
    <Card
      variant="interactive"
      className={cn("flex items-center gap-3", className)}
      onClick={() => onOpen?.(prompt.id)}
    >
      {prompt.sourceVideo.thumbnailUrl ? (
        <Image
          src={prompt.sourceVideo.thumbnailUrl}
          alt=""
          width={80}
          height={45}
          className="h-11 w-20 shrink-0 rounded-xs object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-11 w-20 shrink-0 items-center justify-center rounded-xs bg-bg-surface-2">
          <Video className="size-4 text-text-tertiary" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-text-primary">
          {prompt.sourceVideo.title}
        </p>
        <p className="text-caption text-text-tertiary">{formatRelativeTime(prompt.createdAt)}</p>
      </div>
    </Card>
  );
}

export { PromptCard };
