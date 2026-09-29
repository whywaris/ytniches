import { FOOTER, withBlogLink } from "@/components/features/landing/content";
import { SoonLink } from "@/components/features/landing/soon-link";
import { Logo } from "@/components/features/brand/logo";

// Landing-Page-Spec §15 / D-082: legal, contact, blog, tools, help and the
// /vs/* pages (named from content/vs).
function Footer({ blogLive = false }: { blogLive?: boolean }) {
  return (
    <footer className="border-t border-(--glass-border) px-6 py-16 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="h-7 text-text-primary" />
            <p className="mt-3 text-body-sm text-text-secondary">{FOOTER.tagline}</p>
            <a
              href={`mailto:${FOOTER.email}`}
              className="mt-6 inline-block text-body-sm text-text-secondary hover:text-text-primary"
            >
              {FOOTER.email}
            </a>
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

        <div className="mt-12 flex flex-col gap-2 border-t border-(--glass-border) pt-8 text-body-sm text-text-secondary md:flex-row md:justify-between">
          <p>{FOOTER.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
