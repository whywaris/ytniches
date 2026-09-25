import { Sparkles } from "lucide-react";

import { FOOTER, askAiLinks, withBlogLink } from "@/components/features/landing/content";
import { SoonLink } from "@/components/features/landing/soon-link";

// Landing-Page-Spec §15. Social row omitted with Mac's handles (call F).
function Footer({ blogLive = false }: { blogLive?: boolean }) {
  return (
    <footer className="border-t border-border-subtle bg-bg-base px-6 py-20 md:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-h4 font-semibold text-text-primary">YTNiches</p>
            <p className="mt-3 text-body-sm text-text-secondary">{FOOTER.tagline}</p>
            <p className="mt-6 text-body-sm text-text-secondary">{FOOTER.madeIn}</p>
          </div>
          {FOOTER.columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-body-sm font-semibold text-text-primary">{column.heading}</h2>
              <ul className="mt-4 space-y-3 text-body-sm text-text-secondary">
                {withBlogLink(column.links, blogLive).map((link) => (
                  <li key={link.label}>
                    <SoonLink item={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-border-subtle pt-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-2" aria-label="Ask AI about YTNiches">
            {askAiLinks(FOOTER.askAiQuery).map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-border-default px-3 py-1.5 text-body-sm text-text-secondary transition-colors duration-fast hover:bg-bg-hover hover:text-text-primary"
                >
                  <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-body-sm text-text-secondary">{FOOTER.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
