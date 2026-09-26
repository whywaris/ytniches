import { Mail } from "lucide-react";

import { SUPPORT_EMAIL } from "@/lib/site";

function StillStuck() {
  return (
    <section
      aria-labelledby="still-stuck-heading"
      className="rounded-md border border-border-subtle bg-bg-surface-1 p-6"
    >
      <h2 id="still-stuck-heading" className="text-h4 font-semibold text-text-primary">
        Still stuck?
      </h2>
      <p className="mt-2 text-body-sm text-text-secondary">
        Email us and a person will get back to you.
      </p>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="mt-4 inline-flex items-center gap-2 text-body-sm font-medium text-accent hover:underline"
      >
        <Mail aria-hidden="true" className="size-4" />
        {SUPPORT_EMAIL}
      </a>
    </section>
  );
}

export { StillStuck };
