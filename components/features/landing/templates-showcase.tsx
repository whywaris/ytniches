"use client";

import * as React from "react";

import { FileText, Layers } from "lucide-react";

import { capture } from "@/lib/analytics/client";
import { Modal } from "@/components/ui/modal";
import { TEMPLATES } from "@/components/features/landing/content";
import { CtaLink } from "@/components/features/landing/cta-link";
import { Section, SectionHeading } from "@/components/features/landing/section-heading";

type Row = (typeof TEMPLATES.rows)[number];

// Landing-Page-Spec §7 / template_modal. ui/Modal supplies the focus trap,
// Esc, focus return, and the 300ms fade + 0.95 scale enter. D-030: the
// templates themselves aren't built, so the modal says so honestly.
function TemplatesShowcase() {
  const [opened, setOpened] = React.useState<{ row: Row; name: string } | null>(null);

  return (
    <Section id="templates" labelledBy="templates-heading">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          id="templates-heading"
          eyebrow={TEMPLATES.eyebrow}
          headline={TEMPLATES.headline}
          subhead={TEMPLATES.subhead}
        />
        <div className="space-y-8">
          {TEMPLATES.rows.map((row) => {
            const Icon = row.id === "prompts" ? FileText : Layers;
            return (
              <div key={row.id}>
                <h3 className="mb-3 text-body-sm font-semibold text-text-secondary">{row.label}</h3>
                <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
                  {row.items.map((name) => (
                    <li key={name} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setOpened({ row, name });
                          void capture("landing_template_opened", { template: name });
                        }}
                        className="flex items-center gap-2 rounded-full border border-border-default bg-bg-surface-1 px-4 py-2 text-body-sm whitespace-nowrap text-text-primary outline-none transition-colors duration-fast hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
                      >
                        <Icon className="size-3.5 text-accent-text" aria-hidden="true" />
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-body-sm text-text-secondary">{TEMPLATES.bottomLine}</p>
      </div>

      <Modal
        open={opened !== null}
        onOpenChange={(open) => !open && setOpened(null)}
        title={opened?.name ?? ""}
        description={opened?.row.label}
        footer={
          <CtaLink
            href="/signup"
            event="landing_hero_cta_click"
            eventProps={{ source: "template_modal" }}
            size="md"
          >
            {TEMPLATES.modalCta}
          </CtaLink>
        }
      >
        <p className="text-body text-text-secondary">{opened?.row.modalLine}</p>
        <p className="mt-4 text-body font-medium text-text-primary">{TEMPLATES.modalStatus}</p>
      </Modal>
    </Section>
  );
}

export { TemplatesShowcase };
