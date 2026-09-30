import Link from "next/link";

import { ChevronDown } from "lucide-react";

import { FAQ, type FaqItem } from "@/components/features/landing/content";
import { SectionHeading } from "@/components/features/landing/section-heading";

// Native <details>: keyboard and screen-reader support for free, no JS.
function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[760px]">
        <SectionHeading id="faq-heading" className="text-center">
          Questions, answered
        </SectionHeading>
        <div className="mt-10 flex flex-col gap-3">
          {FAQ.map((item) => (
            <details key={item.question} className="glass-flat group rounded-lg px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-body-lg font-medium text-text-primary [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-text-secondary transition-transform duration-fast group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-body-lg text-text-secondary">
                {item.answer}
                {item.link ? (
                  <>
                    {" "}
                    <Link href={item.link.href} className="text-accent-text hover:underline">
                      {item.link.label}
                    </Link>
                  </>
                ) : null}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// schema.org FAQPage, from the same array the page renders.
export function faqJsonLd(items: FaqItem[] = FAQ) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export { FaqSection };
