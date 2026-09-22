"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import {
  skipOnboardingAction,
  updateOnboardingStepAction,
  updateProfileAction,
} from "@/app/(app)/onboarding/actions";
import { saveChannelAction, searchNichesAction } from "@/app/(app)/niches/actions";
import { toSearchState, type SearchState } from "@/app/(app)/niches/search-state";
import { toSearchInput } from "@/app/(app)/niches/url-filters";
import { listTopVideosForChannelAction, generatePromptsAction } from "@/app/(app)/prompts/actions";
import { cn } from "@/lib/utils";
import type { VideoSummary } from "@/lib/services/channels";
import type { PrimaryGoal } from "@/lib/services/onboarding.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { TextInput } from "@/components/ui/text-input";
import { useToast } from "@/components/ui/toast-provider";
import { ChannelCard } from "@/components/features/niche-finder/channel-card";
import {
  DEFAULT_FILTER_VALUES,
  FilterPanel,
  type NicheFilterValues,
} from "@/components/features/niche-finder/filter-panel";
import { PromptResults } from "@/components/features/prompts/prompt-results";
import type { PromptOutput } from "@/components/features/prompts/types";

export interface OnboardingClientProps {
  initialStep: number;
  initialName: string;
  initialPrimaryGoal: PrimaryGoal | null;
}

const TOTAL_DOTS = 5;

const PERSONA_OPTIONS: { value: PrimaryGoal; label: string }[] = [
  { value: "explorer", label: "I'm exploring niches — no channel yet" },
  { value: "stuck", label: "I have a channel but growth is flat" },
  { value: "grower", label: "My channel is growing, I need to systematize" },
  { value: "operator", label: "I run multiple channels / a team" },
];

// D-033 (Open): UI-UX-Flow.md §3 Step 3 says filters "vary by persona" but
// only specifies one concrete set -- used here for all four personas until
// that's resolved. "2-4-week" is the closest existing NicheFilterValues
// bucket to the spec's literal "2-7 per week" (no exact match exists).
const ONBOARDING_DEFAULT_FILTERS: NicheFilterValues = {
  ...DEFAULT_FILTER_VALUES,
  subscribersMin: "1000",
  subscribersMax: "100000",
  avgViewsMin: "10000",
  avgViewsMax: "500000",
  uploadFrequency: "2-4-week",
  languages: ["en"],
};

// onboarding_step: 0-5 (Backend-Schema.md §2.2). Value 3 is reserved but
// never persisted -- Steps 3+4 share one screen (approved decision), so
// the DB jumps straight from 2 to 4 on that screen's final Continue.
function dbStepToUiStep(step: number): 1 | 2 | 3 | 5 {
  if (step <= 0) return 1;
  if (step === 1) return 2;
  if (step === 4) return 5;
  return 3;
}

function widenedFilters(values: NicheFilterValues): NicheFilterValues {
  return { ...DEFAULT_FILTER_VALUES, keyword: values.keyword, languages: values.languages };
}

function describeGenerationError(error: {
  type: string;
  message?: string;
  balance?: number;
  required?: number;
}): string {
  if (error.type === "insufficient_credits") {
    return `Not enough credits (${error.balance} of ${error.required} needed).`;
  }
  return error.message ?? "This video can't be analyzed. Try a different one.";
}

// UI-UX-Flow.md §3 "Layout for every step": centered card, no sidebar,
// progress dots at top, skip link top-right.
function OnboardingLayout({
  activeDot,
  onSkip,
  children,
}: {
  activeDot: number;
  onSkip: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <div
            role="progressbar"
            aria-valuenow={activeDot}
            aria-valuemin={1}
            aria-valuemax={TOTAL_DOTS}
            aria-label="Onboarding progress"
            className="flex items-center gap-1.5"
          >
            {Array.from({ length: TOTAL_DOTS }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 w-6 rounded-full",
                  index + 1 <= activeDot ? "bg-accent" : "bg-border-subtle",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="text-body-sm text-text-tertiary hover:text-text-secondary hover:underline"
          >
            Skip — I&apos;ll figure it out
          </button>
        </div>
        <Card padding="lg">{children}</Card>
      </div>
    </div>
  );
}

// Composed from Card/Button (no Radio primitive exists in Design-System.md
// or components/ui/ -- approved decision), same pattern RegenerateModal
// uses for its multi-select feedback chips, single-select here.
function PersonaRadioGroup({
  value,
  onChange,
}: {
  value: PrimaryGoal | null;
  onChange: (value: PrimaryGoal) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Primary goal" className="flex flex-col gap-2">
      {PERSONA_OPTIONS.map((option) => (
        <Card
          key={option.value}
          role="radio"
          tabIndex={0}
          aria-checked={value === option.value}
          variant={value === option.value ? "selected" : "interactive"}
          padding="sm"
          className="text-body-sm text-text-primary"
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onChange(option.value);
            }
          }}
        >
          {option.label}
        </Card>
      ))}
    </div>
  );
}

function WelcomeStep({
  initialName,
  initialPrimaryGoal,
  saving,
  onContinue,
}: {
  initialName: string;
  initialPrimaryGoal: PrimaryGoal | null;
  saving: boolean;
  onContinue: (name: string, primaryGoal: PrimaryGoal) => void;
}) {
  const [name, setName] = React.useState(initialName);
  const [primaryGoal, setPrimaryGoal] = React.useState<PrimaryGoal | null>(initialPrimaryGoal);
  const trimmedName = name.trim();
  const canContinue = trimmedName.length > 0 && primaryGoal !== null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-h3 text-text-primary">
          Welcome to YTNiches{trimmedName ? `, ${trimmedName}` : ""}
        </h1>
        <p className="text-body-sm text-text-secondary">
          Two quick questions, then you&apos;ll be in.
        </p>
      </div>
      <TextInput label="Name" value={name} onChange={(event) => setName(event.target.value)} />
      <PersonaRadioGroup value={primaryGoal} onChange={setPrimaryGoal} />
      <Button
        fullWidth
        disabled={!canContinue}
        loading={saving}
        onClick={() => primaryGoal && onContinue(trimmedName, primaryGoal)}
      >
        Continue
      </Button>
    </div>
  );
}

// D-015 (Open): YouTube OAuth scope isn't wired yet -- button shows a
// "Coming soon" toast instead of a real connect flow.
function ConnectStep({ saving, onSkip }: { saving: boolean; onSkip: () => void }) {
  const { showToast } = useToast();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-h3 text-text-primary">Connect your channel?</h1>
        <p className="text-body-sm text-text-secondary">
          We&apos;ll personalize your niche recommendations. You can skip and connect later.
        </p>
      </div>
      <Button fullWidth onClick={() => showToast({ title: "Coming soon", variant: "info" })}>
        Connect with YouTube
      </Button>
      <Button fullWidth variant="ghost" loading={saving} onClick={onSkip}>
        Skip for now
      </Button>
    </div>
  );
}

// UI-UX-Flow.md §3 Steps 3+4 (one screen, approved decision): search
// renders inline, then a banner + bookmark icon handle the save, then
// Continue (only once something's saved) prepares Step 5's video list and
// advances the parent.
function SearchSaveStep({
  onSaved,
  onContinue,
}: {
  onSaved: () => void;
  onContinue: (channelId: string, videos: VideoSummary[]) => void;
}) {
  const [filters, setFilters] = React.useState(ONBOARDING_DEFAULT_FILTERS);
  const [state, setState] = React.useState<SearchState>({ status: "idle" });
  const [hasWidened, setHasWidened] = React.useState(false);
  const [savedChannelId, setSavedChannelId] = React.useState<string | null>(null);
  const [preparing, setPreparing] = React.useState(false);

  async function runSearch(nextFilters: NicheFilterValues, isWidenRetry = false) {
    setState({ status: "searching" });
    const result = await searchNichesAction(
      toSearchInput(nextFilters, "relevance", 1),
      crypto.randomUUID(),
    );
    const nextState = toSearchState(result);

    // UI-UX-Flow.md §3 empty handling: auto-widen once, then show the
    // empty state for real.
    if (nextState.status === "empty" && !isWidenRetry && !hasWidened) {
      setHasWidened(true);
      await runSearch(widenedFilters(nextFilters), true);
      return;
    }
    setState(nextState);
  }

  async function handleSave(channelId: string) {
    const result = await saveChannelAction(channelId);
    if (result.ok) {
      setSavedChannelId(channelId);
      onSaved();
    }
  }

  async function handleContinue() {
    if (!savedChannelId) return;
    setPreparing(true);
    const [videos] = await Promise.all([
      listTopVideosForChannelAction(savedChannelId),
      updateOnboardingStepAction(4),
    ]);
    setPreparing(false);
    onContinue(savedChannelId, videos.slice(0, 5));
  }

  const results = state.status === "results" ? state.data : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-h3 text-text-primary">Let&apos;s find your first niche</h1>
        <p className="text-body-sm text-text-secondary">
          Filters are pre-filled based on what usually works. Tweak or hit Search.
        </p>
      </div>

      <FilterPanel
        values={filters}
        onChange={setFilters}
        onSearch={() => void runSearch(filters)}
        onReset={() => setFilters(ONBOARDING_DEFAULT_FILTERS)}
      />

      {state.status === "searching" ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <ErrorState message={state.message} onRetry={() => void runSearch(filters)} />
      ) : null}

      {state.status === "empty" ? (
        <EmptyState message="No channels matched, even after widening the search. Try different keywords." />
      ) : null}

      {state.status === "rate_limited" ||
      state.status === "insufficient_credits" ||
      state.status === "quota_exhausted" ? (
        <div
          role="alert"
          className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-body-sm text-warning"
        >
          {state.status === "rate_limited"
            ? `You've hit today's search limit. Try again in ${state.retryAfterSeconds}s.`
            : "Search is unavailable right now — try again shortly."}
        </div>
      ) : null}

      {state.status === "results" ? (
        <>
          <div
            role="status"
            className="rounded-md border border-accent/40 bg-accent-subtle px-4 py-3 text-body-sm text-text-primary"
          >
            {savedChannelId
              ? "Nice — saved to your Competitor Tracking. One more step."
              : "Save any channel to track it. Click the bookmark icon."}
          </div>
          <div className="flex flex-col gap-3">
            {results.map((channel, index) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                saved={savedChannelId === channel.id}
                onSave={(channelId) => void handleSave(channelId)}
                className={
                  !savedChannelId && index === 0 ? "animate-pulse ring-2 ring-accent/50" : undefined
                }
              />
            ))}
          </div>
        </>
      ) : null}

      {savedChannelId ? (
        <Button fullWidth loading={preparing} onClick={() => void handleContinue()}>
          Continue
        </Button>
      ) : null}
    </div>
  );
}

type GenerationStatus = "idle" | "generating" | "results" | "failed";

// UI-UX-Flow.md §3 Step 5. generatePromptsAction already persists on
// success (D-031) -- "Save prompts and finish setup" only needs to mark
// onboarding complete, not save anything itself.
function PromptStep({
  initialVideos,
  onFinish,
}: {
  initialVideos: VideoSummary[];
  onFinish: () => void;
}) {
  const [videoUrl, setVideoUrl] = React.useState("");
  const [status, setStatus] = React.useState<GenerationStatus>("idle");
  const [output, setOutput] = React.useState<PromptOutput | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [finishing, setFinishing] = React.useState(false);

  async function generate(input: { videoId: string } | { videoUrl: string }) {
    setStatus("generating");
    const result = await generatePromptsAction(
      { ...input, targetAudience: null, tone: "neutral" },
      crypto.randomUUID(),
    );
    if (!result.ok) {
      setErrorMessage(describeGenerationError(result.error));
      setStatus("failed");
      return;
    }
    setOutput(result.value.output);
    setStatus("results");
  }

  async function handleFinish() {
    setFinishing(true);
    await updateOnboardingStepAction(5);
    setFinishing(false);
    onFinish();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-h3 text-text-primary">Turn a winning video into content ideas</h1>
        <p className="text-body-sm text-text-secondary">
          Pick any video from your saved channel and watch YTNiches extract prompts.
        </p>
      </div>

      {status === "idle" && initialVideos.length > 0 ? (
        <div className="flex flex-col gap-2">
          {initialVideos.map((video) => (
            <Card
              key={video.id}
              variant="interactive"
              padding="sm"
              className="flex items-center justify-between gap-3"
              onClick={() => void generate({ videoId: video.id })}
            >
              <span className="truncate text-body-sm text-text-primary">{video.title}</span>
              <span className="shrink-0 text-caption text-text-tertiary">
                {video.viewCount.toLocaleString()} views
              </span>
            </Card>
          ))}
        </div>
      ) : null}

      {/* UI-UX-Flow.md §3 empty handling: no videos synced yet (rare, sync
          worker hasn't run) -- paste any YouTube URL instead. */}
      {status === "idle" && initialVideos.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-text-secondary">
            No videos synced for this channel yet — paste any YouTube URL instead.
          </p>
          <TextInput
            label="Video URL"
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
          />
          <Button
            disabled={!videoUrl.trim()}
            onClick={() => void generate({ videoUrl: videoUrl.trim() })}
          >
            Generate prompts
          </Button>
        </div>
      ) : null}

      {status === "generating" ? (
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-text-secondary">Analyzing&hellip;</p>
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : null}

      {status === "failed" ? (
        <ErrorState message={errorMessage ?? undefined} onRetry={() => setStatus("idle")} />
      ) : null}

      {status === "results" && output ? (
        <>
          <PromptResults output={output} />
          <Button fullWidth loading={finishing} onClick={() => void handleFinish()}>
            Save prompts and finish setup
          </Button>
        </>
      ) : null}
    </div>
  );
}

function OnboardingClient({ initialStep, initialName, initialPrimaryGoal }: OnboardingClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [uiStep, setUiStep] = React.useState<1 | 2 | 3 | 5>(() => dbStepToUiStep(initialStep));
  const [savingStep, setSavingStep] = React.useState(false);
  const [hasSavedChannel, setHasSavedChannel] = React.useState(false);
  const [channelId, setChannelId] = React.useState<string | null>(null);
  const [videos, setVideos] = React.useState<VideoSummary[]>([]);

  async function handleSkip() {
    // UI-UX-Flow.md §3 "Skip is tracked as an event... for activation
    // metric analysis" -- analytics TBD, console.log for now.
    console.log("onboarding_skipped", { step: uiStep });
    await skipOnboardingAction();
    router.push("/dashboard");
  }

  async function handleWelcomeContinue(name: string, primaryGoal: PrimaryGoal) {
    setSavingStep(true);
    await updateProfileAction(name, primaryGoal);
    await updateOnboardingStepAction(1);
    setSavingStep(false);
    setUiStep(2);
  }

  async function handleConnectSkip() {
    setSavingStep(true);
    await updateOnboardingStepAction(2);
    setSavingStep(false);
    setUiStep(3);
  }

  function handleSearchSaveContinue(nextChannelId: string, nextVideos: VideoSummary[]) {
    setChannelId(nextChannelId);
    setVideos(nextVideos);
    setUiStep(5);
  }

  function handleFinish() {
    showToast({
      title: "You're set up. Cmd+K opens the command palette from anywhere.",
      variant: "success",
    });
    router.push("/dashboard");
  }

  // Dot 4 lights up once a channel's saved on the combined Step 3+4
  // screen, even though onboarding_step itself only ever holds 2 or 4.
  const activeDot = uiStep === 3 && hasSavedChannel ? 4 : uiStep;

  return (
    <OnboardingLayout activeDot={activeDot} onSkip={() => void handleSkip()}>
      {uiStep === 1 ? (
        <WelcomeStep
          initialName={initialName}
          initialPrimaryGoal={initialPrimaryGoal}
          saving={savingStep}
          onContinue={(name, primaryGoal) => void handleWelcomeContinue(name, primaryGoal)}
        />
      ) : null}
      {uiStep === 2 ? (
        <ConnectStep saving={savingStep} onSkip={() => void handleConnectSkip()} />
      ) : null}
      {uiStep === 3 ? (
        <SearchSaveStep
          onSaved={() => setHasSavedChannel(true)}
          onContinue={handleSearchSaveContinue}
        />
      ) : null}
      {uiStep === 5 && channelId ? (
        <PromptStep initialVideos={videos} onFinish={handleFinish} />
      ) : null}
    </OnboardingLayout>
  );
}

export { OnboardingClient };
