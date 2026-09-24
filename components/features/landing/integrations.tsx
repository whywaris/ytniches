"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { INTEGRATIONS } from "@/components/features/landing/content";
import { Section, SectionHeading } from "@/components/features/landing/section-heading";
import { SoonTag } from "@/components/features/landing/soon-link";

// integration_hover: hovered/focused pill goes full color, everything else
// in the block dims to 40%, tooltip above. Touch: tap to reveal, tap
// elsewhere to dismiss (Interaction-Spec §3.3). Pills are grayscale until
// active; the real logos swap in via [data-ill="integration_<id>"].
function Integrations() {
  const [active, setActive] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!active) return;
    const dismiss = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setActive(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [active]);

  return (
    <Section labelledBy="integrations-heading">
      <div ref={rootRef} className="mx-auto max-w-[1120px]">
        <SectionHeading
          id="integrations-heading"
          eyebrow={INTEGRATIONS.eyebrow}
          headline={INTEGRATIONS.headline}
        />
        <div className="space-y-6">
          {INTEGRATIONS.categories.map((category) => (
            <div
              key={category.id}
              className="grid items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface-1 p-5 md:grid-cols-[160px_1fr]"
            >
              <h3
                className={cn(
                  "text-body-sm font-semibold text-text-secondary transition-opacity duration-fast",
                  active && "opacity-40",
                )}
              >
                {category.label}
              </h3>
              <ul className="flex flex-wrap gap-3">
                {category.items.map((item) => {
                  const isActive = active === item.id;
                  const tooltipId = `integration-tip-${item.id}`;
                  return (
                    <li key={item.id} className="relative">
                      <button
                        type="button"
                        data-ill={`integration_${item.id}`}
                        aria-describedby={isActive ? tooltipId : undefined}
                        onPointerEnter={(event) =>
                          event.pointerType === "mouse" && setActive(item.id)
                        }
                        onPointerLeave={(event) => event.pointerType === "mouse" && setActive(null)}
                        onFocus={() => setActive(item.id)}
                        onBlur={() => setActive(null)}
                        onClick={() => setActive(item.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-full border border-border-default bg-bg-surface-2 px-4 py-2 text-body-sm text-text-primary outline-none",
                          "transition-[opacity,filter] duration-fast ease-out motion-reduce:transition-none",
                          "focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
                          isActive ? "grayscale-0" : "grayscale",
                          active && !isActive && "opacity-40",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-2 rounded-full",
                            item.live ? "bg-accent" : "bg-text-disabled",
                          )}
                        />
                        {item.name}
                        {item.live ? null : <SoonTag />}
                      </button>
                      {isActive ? (
                        <span
                          id={tooltipId}
                          role="tooltip"
                          className="elev-2 absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-md px-3 py-2 text-caption text-text-primary"
                        >
                          {item.tooltip}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export { Integrations };
