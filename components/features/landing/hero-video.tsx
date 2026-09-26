"use client";

import * as React from "react";

import { Play } from "lucide-react";

import { capture } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LIFT } from "@/components/features/landing/lift";

// hero_video_modal. No video yet (Landing-Page-Spec §2 constraint): both
// the poster and the "Watch 2-min demo" CTA open the same modal, which
// shows a placeholder until the real <video> swaps in here.
function useVideoModal() {
  const [open, setOpen] = React.useState(false);
  const openModal = React.useCallback(() => {
    setOpen(true);
    void capture("landing_video_play");
  }, []);
  return { open, setOpen, openModal };
}

const VideoModalContext = React.createContext<ReturnType<typeof useVideoModal> | null>(null);

function HeroVideoProvider({ children }: { children: React.ReactNode }) {
  const modal = useVideoModal();
  return (
    <VideoModalContext.Provider value={modal}>
      {children}
      <Modal open={modal.open} onOpenChange={modal.setOpen} title="YTNiches in 2 minutes" size="xl">
        <div
          data-ill="hero_video"
          className="flex aspect-video items-center justify-center rounded-lg border border-border-default bg-bg-surface-1 font-mono text-caption text-text-secondary"
        >
          hero_video — demo coming soon
        </div>
      </Modal>
    </VideoModalContext.Provider>
  );
}

function useHeroVideo() {
  const context = React.useContext(VideoModalContext);
  if (!context) throw new Error("useHeroVideo must be used inside HeroVideoProvider");
  return context;
}

function WatchDemoButton({ label }: { label: string }) {
  const { openModal } = useHeroVideo();
  return (
    <Button
      variant="secondary"
      size="lg"
      className={LIFT}
      onClick={() => {
        void capture("landing_hero_cta_click", { cta: "secondary" });
        openModal();
      }}
    >
      <Play aria-hidden="true" /> {label}
    </Button>
  );
}

function HeroVideoPoster() {
  const { openModal } = useHeroVideo();
  return (
    <button
      type="button"
      onClick={openModal}
      aria-label="Play the 2-minute demo"
      data-ill="hero_mockup"
      className={cn(
        "group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl",
        "border border-border-default bg-bg-surface-1 bg-cover bg-center outline-none",
        "focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
      )}
    >
      <span className="absolute top-4 left-4 font-mono text-caption text-text-secondary">
        hero_mockup
      </span>
      <span className="flex size-16 items-center justify-center rounded-full bg-accent text-text-inverse shadow-lg transition-transform duration-fast group-hover:scale-105 motion-reduce:transition-none">
        <Play className="size-6 translate-x-0.5" aria-hidden="true" />
      </span>
    </button>
  );
}

export { HeroVideoProvider, HeroVideoPoster, WatchDemoButton };
