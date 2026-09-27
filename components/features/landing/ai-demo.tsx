"use client";

import * as React from "react";

import { useInView, useReducedMotion } from "framer-motion";
import { Link2, Loader2, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { AI_SECTION } from "@/components/features/landing/content";

// ai_demo_loop. 5s sequence: URL appears -> processing -> 5 prompt cards
// one by one; 2s pause; repeat. Starts only once in view, pauses on hover,
// static end-state under reduced motion. Driven by one step counter +
// CSS transitions (opacity/transform only, §3.4) -- no framer needed here.
const STEPS = AI_SECTION.demoCategories.length + 2; // url, processing, cards...
const STEP_MS = 5000 / STEPS;
const LOOP_GAP_MS = 2000;

function AiDemo() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [paused, setPaused] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (reduce || !inView || paused) return;
    const atEnd = step >= STEPS;
    const timer = window.setTimeout(
      () => setStep(atEnd ? 0 : step + 1),
      atEnd ? LOOP_GAP_MS : STEP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [reduce, inView, paused, step]);

  const shown = reduce ? STEPS : step;
  const cardsShown = Math.max(0, shown - 2);

  return (
    <div
      ref={ref}
      data-ill="ai_generation_demo"
      aria-label="Demo: a video URL is pasted and five prompt categories are generated"
      role="img"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="rounded-xl border border-border-default bg-bg-surface-1 p-5"
    >
      <div className="flex items-center gap-2 rounded-md border border-border-default bg-bg-base px-3 py-2 font-mono text-body-sm text-text-secondary">
        <Link2 className="size-4 shrink-0" aria-hidden="true" />
        <span
          className={cn(
            "transition-opacity duration-slow",
            shown >= 1 ? "opacity-100" : "opacity-0",
          )}
        >
          {AI_SECTION.demoUrl}
        </span>
      </div>
      <div
        className={cn(
          "mt-3 flex items-center gap-2 text-body-sm text-text-secondary transition-opacity duration-default",
          shown === 2 ? "opacity-100" : "opacity-0",
        )}
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Analyzing the winning video…
      </div>
      <ul className="mt-2 space-y-2">
        {AI_SECTION.demoCategories.map((category, index) => (
          <li
            key={category}
            className={cn(
              "flex items-center gap-2 rounded-md border border-border-subtle bg-bg-surface-2 px-3 py-2.5 text-body-sm text-text-primary",
              "transition-[opacity,transform] duration-slow ease-out",
              index < cardsShown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            )}
          >
            <Sparkles className="size-3.5 text-accent-text" aria-hidden="true" />
            {category}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { AiDemo };
