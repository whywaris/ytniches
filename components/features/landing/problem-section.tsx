import { PROBLEM } from "@/components/features/landing/content";
import { Stagger, StaggerItem } from "@/components/features/landing/reveal";

// Landing-Page-Spec §3 + scattered_tools_stagger (80ms, 300ms, 8px). The
// tool labels sit inside the illustration placeholder so the stagger has
// real elements to animate before the art exists.
function ProblemSection() {
  return (
    <section aria-labelledby="problem-heading" className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 md:grid-cols-5">
        <div
          data-ill="scattered_tools_metaphor"
          role="img"
          aria-label="Scattered tools: TubeBuddy, VidIQ, spreadsheets, Notion notes, AI prompts, Trello — none of them connected"
          className="rounded-xl border border-border-default bg-bg-surface-1 bg-cover bg-center p-6 md:col-span-3"
        >
          <Stagger
            as="ul"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            stagger={0.08}
            duration={0.3}
            rise={8}
          >
            {PROBLEM.tools.map((tool, index) => (
              <StaggerItem key={tool}>
                <span
                  className={
                    "flex h-20 items-center justify-center rounded-md border border-dashed border-border-strong bg-bg-surface-2 px-2 text-center text-body-sm text-text-secondary " +
                    (index % 2 === 1 ? "sm:translate-y-4" : "")
                  }
                >
                  {tool}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-4 text-center font-mono text-caption text-text-secondary">
            scattered_tools_metaphor
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="mb-3 text-body-sm font-medium tracking-wide text-accent uppercase">
            {PROBLEM.eyebrow}
          </p>
          <h2 id="problem-heading" className="text-h1 font-semibold text-text-primary">
            {PROBLEM.headline}
          </h2>
          <div className="mt-6 space-y-4 text-body-lg text-text-secondary">
            {PROBLEM.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-8 text-body-lg font-medium text-text-primary">{PROBLEM.transition}</p>
        </div>
      </div>
    </section>
  );
}

export { ProblemSection };
