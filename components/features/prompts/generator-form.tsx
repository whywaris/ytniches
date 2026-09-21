"use client";

import * as React from "react";

import { CheckCircle2, Circle } from "lucide-react";

import type { Result } from "@/lib/result";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Select, type SelectOption } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextInput } from "@/components/ui/text-input";
import { PromptResults } from "@/components/features/prompts/prompt-results";
import type { PromptOutput, Tone } from "@/components/features/prompts/types";

export interface VideoPickerChannel {
  id: string;
  name: string;
}

export interface VideoPickerVideo {
  id: string;
  title: string;
  viewCount: number;
}

export type GenerateInput = {
  targetAudience: string | null;
  tone: Tone;
} & ({ videoId: string } | { videoUrl: string });

export interface GeneratedPrompt {
  id: string;
  output: PromptOutput;
}

export type GenerateErrorReason =
  | { type: "unsupported"; message: string }
  | { type: "insufficient_credits"; balance: number; required: number }
  | { type: "failed"; message: string };

export interface GeneratorFormProps {
  trackedChannels: VideoPickerChannel[];
  onListTopVideos: (channelId: string) => Promise<VideoPickerVideo[]>;
  onGenerate: (input: GenerateInput) => Promise<Result<GeneratedPrompt, GenerateErrorReason>>;
  onGenerated?: (promptId: string) => void;
  onDiscard?: (promptId: string) => Promise<void>;
  className?: string;
}

type FormState =
  | { status: "idle" }
  | { status: "generating"; videoLabel: string }
  | { status: "results"; prompt: GeneratedPrompt }
  | { status: "unsupported"; message: string }
  | { status: "insufficient_credits"; balance: number; required: number }
  | { status: "failed"; message: string };

const TONE_OPTIONS: SelectOption[] = [
  { value: "neutral", label: "Neutral" },
  { value: "casual", label: "Casual" },
  { value: "educational", label: "Educational" },
  { value: "dramatic", label: "Dramatic" },
  { value: "clickbait_lite", label: "Clickbait-lite" },
];

const PROGRESS_STEPS = [
  "Fetching video metadata",
  "Reading transcript",
  "Analyzing title pattern",
  "Analyzing thumbnail style",
  "Generating variants",
];
const PROGRESS_STEP_MS = 1200;

// D-028: generation is one synchronous call -- this checklist is a
// cosmetic, timer-driven reveal, not real server-reported progress.
function GenerationProgress({ videoLabel }: { videoLabel: string }) {
  const [stepIndex, setStepIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, PROGRESS_STEPS.length - 1));
    }, PROGRESS_STEP_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-text-primary">Analyzing {videoLabel}&hellip;</p>
      <ul className="flex flex-col gap-1.5">
        {PROGRESS_STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2 text-body-sm">
            {index <= stepIndex ? (
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            ) : (
              <Circle className="size-4 text-text-tertiary" aria-hidden="true" />
            )}
            <span className={index <= stepIndex ? "text-text-primary" : "text-text-tertiary"}>
              {step}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

// UI-UX-Flow.md §7.1's "Generate prompts from a video" card + §7.2/§7.3's
// loading/results states. Presentational + its own client-visible state
// machine, matching AddChannelModal's pattern -- onGenerate is injected so
// the parent page owns the actual Server Action call.
function GeneratorForm({
  trackedChannels,
  onListTopVideos,
  onGenerate,
  onGenerated,
  onDiscard,
  className,
}: GeneratorFormProps) {
  const [tab, setTab] = React.useState<"channel" | "url">("channel");
  const [channelId, setChannelId] = React.useState("");
  const [videos, setVideos] = React.useState<VideoPickerVideo[]>([]);
  const [videoId, setVideoId] = React.useState("");
  const [loadingVideos, setLoadingVideos] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [targetAudience, setTargetAudience] = React.useState("");
  const [tone, setTone] = React.useState<Tone>("neutral");
  const [state, setState] = React.useState<FormState>({ status: "idle" });
  const [discarding, setDiscarding] = React.useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = React.useState(false);

  async function handleChannelChange(nextChannelId: string) {
    setChannelId(nextChannelId);
    setVideoId("");
    setVideos([]);
    setLoadingVideos(true);
    const nextVideos = await onListTopVideos(nextChannelId);
    setVideos(nextVideos);
    setLoadingVideos(false);
  }

  async function handleGenerate() {
    const input: GenerateInput | null =
      tab === "channel" && videoId
        ? { videoId, targetAudience: targetAudience.trim() || null, tone }
        : tab === "url" && url.trim()
          ? { videoUrl: url.trim(), targetAudience: targetAudience.trim() || null, tone }
          : null;
    if (!input) return;

    const videoLabel =
      tab === "channel"
        ? (videos.find((video) => video.id === videoId)?.title ?? "video")
        : url.trim();
    setState({ status: "generating", videoLabel });

    const result = await onGenerate(input);
    if (!result.ok) {
      if (result.error.type === "insufficient_credits") {
        setState({
          status: "insufficient_credits",
          balance: result.error.balance,
          required: result.error.required,
        });
      } else if (result.error.type === "unsupported") {
        setState({ status: "unsupported", message: result.error.message });
      } else {
        setState({ status: "failed", message: result.error.message });
      }
      return;
    }

    setState({ status: "results", prompt: result.value });
    onGenerated?.(result.value.id);
  }

  async function handleDiscard() {
    if (state.status !== "results") return;
    setDiscarding(true);
    await onDiscard?.(state.prompt.id);
    setDiscarding(false);
    setConfirmingDiscard(false);
    setState({ status: "idle" });
  }

  const canGenerate =
    (tab === "channel" && Boolean(videoId)) || (tab === "url" && url.trim().length > 0);

  if (state.status === "generating") {
    return (
      <Card padding="lg" className={className}>
        <GenerationProgress videoLabel={state.videoLabel} />
      </Card>
    );
  }

  if (state.status === "results") {
    return (
      <div className={className}>
        <PromptResults key={state.prompt.id} output={state.prompt.output} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmingDiscard(true)}>
            Discard
          </Button>
          <Button variant="ghost" onClick={() => setState({ status: "idle" })}>
            Generate another
          </Button>
        </div>
        <ConfirmDialog
          open={confirmingDiscard}
          onOpenChange={setConfirmingDiscard}
          title="Discard this generation?"
          description="This removes it from your library. This can't be undone."
          confirmLabel="Discard"
          destructive
          loading={discarding}
          onConfirm={() => void handleDiscard()}
        />
      </div>
    );
  }

  return (
    <Card padding="lg" className={className}>
      <CardHeader>
        <h2 className="text-h3 text-text-primary">Generate prompts from a video</h2>
      </CardHeader>

      {state.status === "unsupported" ? (
        <p role="alert" className="mb-3 text-body-sm text-error">
          {state.message}
        </p>
      ) : null}
      {state.status === "failed" ? (
        <p role="alert" className="mb-3 text-body-sm text-error">
          Something went wrong. Your credit was not charged. {state.message}
        </p>
      ) : null}
      {state.status === "insufficient_credits" ? (
        <p role="alert" className="mb-3 text-body-sm text-warning">
          Not enough credits ({state.balance} of {state.required} needed).
        </p>
      ) : null}

      <Tabs value={tab} onValueChange={(value) => setTab(value === "url" ? "url" : "channel")}>
        <TabsList>
          <TabsTrigger value="channel">From tracked channel</TabsTrigger>
          <TabsTrigger value="url">From URL</TabsTrigger>
        </TabsList>

        <TabsContent value="channel" className="flex flex-col gap-3 pt-4">
          <Select
            label="Tracked channel"
            placeholder="Pick a channel"
            options={trackedChannels.map((channel) => ({ value: channel.id, label: channel.name }))}
            value={channelId}
            onValueChange={(value) => void handleChannelChange(value)}
          />
          <Select
            label="Video"
            placeholder={loadingVideos ? "Loading videos…" : "Pick a video (top 10 by views)"}
            disabled={!channelId || loadingVideos}
            options={videos.map((video) => ({
              value: video.id,
              label: `${video.title} (${video.viewCount.toLocaleString()} views)`,
            }))}
            value={videoId}
            onValueChange={setVideoId}
          />
        </TabsContent>

        <TabsContent value="url" className="pt-4">
          <TextInput
            label="Channel URL"
            placeholder="https://youtube.com/watch?v=..."
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex flex-col gap-3">
        <TextInput
          label="Target audience"
          placeholder="e.g. beginners, US teens"
          helperText="Optional"
          value={targetAudience}
          onChange={(event) => setTargetAudience(event.target.value)}
        />
        <Select
          label="Tone"
          options={TONE_OPTIONS}
          value={tone}
          onValueChange={(v) => setTone(v as Tone)}
        />
      </div>

      <Button
        fullWidth
        className="mt-4"
        disabled={!canGenerate}
        onClick={() => void handleGenerate()}
      >
        Generate prompts &middot; Uses 5 credits
      </Button>
    </Card>
  );
}

export { GeneratorForm };
