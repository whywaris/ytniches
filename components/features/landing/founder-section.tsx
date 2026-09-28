import Image from "next/image";

import { FOUNDER } from "@/components/features/landing/content";
import { FounderArt } from "@/components/features/landing/illustrations";
import { SectionHeading } from "@/components/features/landing/section-heading";

export interface FounderPhoto {
  src: string;
  alt: string;
}

// Landing-Page-Spec §11: a quiet, human moment -- no animation. The copy
// is Mac's final story, unchanged. Abstract art until a photo is passed.
function FounderSection({ photo }: { photo?: FounderPhoto }) {
  return (
    <section aria-labelledby="founder-heading" className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 md:grid-cols-5">
        <div className="mx-auto w-full max-w-[320px] md:col-span-2">
          {photo ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={320}
              height={400}
              className="glass aspect-[4/5] w-full rounded-xl object-cover"
            />
          ) : (
            <FounderArt />
          )}
        </div>
        <div className="md:col-span-3">
          <p className="mb-3 text-body-sm font-medium tracking-wide text-accent-text uppercase">
            {FOUNDER.eyebrow}
          </p>
          <SectionHeading id="founder-heading">{FOUNDER.headline}</SectionHeading>
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
