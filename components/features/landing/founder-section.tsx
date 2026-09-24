import { FOUNDER } from "@/components/features/landing/content";
import { Ill } from "@/components/features/landing/ill";

// Landing-Page-Spec §11: a quiet, human moment -- no animation.
function FounderSection() {
  return (
    <section aria-labelledby="founder-heading" className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1120px] items-start gap-12 md:grid-cols-5">
        <Ill id="founder_photo" className="aspect-[4/5] md:col-span-2" />
        <div className="md:col-span-3">
          <p className="mb-3 text-body-sm font-medium tracking-wide text-accent uppercase">
            {FOUNDER.eyebrow}
          </p>
          <h2 id="founder-heading" className="text-h1 font-semibold text-text-primary">
            {FOUNDER.headline}
          </h2>
          <div className="mt-6 space-y-4 text-body-lg text-text-secondary">
            {FOUNDER.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-8 text-body-lg font-medium text-text-primary">{FOUNDER.signature}</p>
        </div>
      </div>
    </section>
  );
}

export { FounderSection };
