import type { ReactNode } from "react";

import type { Author, PostSummary } from "@/lib/blog";
import { NewsletterSignup } from "@/components/features/blog/newsletter-signup";
import { CategoryPills, PostGrid } from "@/components/features/blog/post-card";

// UI-UX-Flow.md §2.2 category / author (and tag) pages: H1, description,
// grid. No pagination until a list passes 12 posts (D-053).
function PostListPage({
  title,
  description,
  eyebrow,
  activeCategory,
  posts,
  authors,
}: {
  title: string;
  description: ReactNode;
  eyebrow?: string;
  activeCategory?: string;
  posts: PostSummary[];
  authors: Author[];
}) {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      {eyebrow && (
        <p className="text-caption font-semibold tracking-wide text-text-secondary uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-display-sm font-semibold tracking-tight text-text-primary">
        {title}
      </h1>
      <div className="mt-3 max-w-2xl text-body-lg text-text-secondary">{description}</div>
      <div className="mt-8">
        <CategoryPills active={activeCategory} />
      </div>
      <div className="mt-12">
        <PostGrid posts={posts} authors={authors} empty="No posts here yet. They're on the way." />
      </div>
      <div className="mt-20">
        <NewsletterSignup />
      </div>
    </div>
  );
}

export { PostListPage };
