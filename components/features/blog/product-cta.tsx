import { CtaLink } from "@/components/features/landing/cta-link";

// PRD.md §10.2 "product CTA at end": research + execution, not another
// niche list (Landing-Copy.md §1.2 positioning).
function ProductCta({ source }: { source: string }) {
  return (
    <section className="rounded-md border border-accent-border bg-accent-subtle p-6 text-center md:p-10">
      <h2 className="text-h2 font-semibold text-text-primary">Find the niche. Then keep going.</h2>
      <p className="mx-auto mt-3 max-w-xl text-body-lg text-text-secondary">
        YTNiches finds the outliers in your niche and turns them into scripts, titles and a content
        calendar. From idea to something you can film.
      </p>
      <CtaLink href="/signup" event="blog_cta_click" eventProps={{ source }} className="mt-6">
        Start free
      </CtaLink>
    </section>
  );
}

export { ProductCta };
