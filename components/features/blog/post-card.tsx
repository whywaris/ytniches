import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { CATEGORIES, getCategory } from "@/lib/blog/categories";
import type { Author, PostSummary } from "@/lib/blog";
import { Tag } from "@/components/ui/tag";

const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPostDate(date: string): string {
  return DATE.format(new Date(`${date}T00:00:00Z`));
}

function DraftTag() {
  return <Tag tone="warning">Draft</Tag>;
}

// No coverImage yet (true for every launch draft): a token-colored panel
// with the wordmark, instead of a broken or stock image.
function Cover({
  post,
  priority,
  className,
}: {
  post: PostSummary;
  priority?: boolean;
  className?: string;
}) {
  if (post.coverImage) {
    return (
      <div
        className={cn(
          "relative aspect-[16/9] overflow-hidden rounded-md bg-bg-surface-2",
          className,
        )}
      >
        <Image
          src={post.coverImage}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex aspect-[16/9] items-end overflow-hidden rounded-md border border-border-subtle bg-gradient-to-br from-accent-subtle via-bg-surface-1 to-bg-surface-2 p-5",
        className,
      )}
    >
      <span className="text-body-sm font-semibold tracking-tight text-text-secondary">
        YTNiches
      </span>
    </div>
  );
}

function PostMeta({ post, author }: { post: PostSummary; author?: Author }) {
  return (
    <p className="text-caption text-text-secondary">
      {author ? `${author.name} · ` : ""}
      <time dateTime={post.publishDate}>{formatPostDate(post.publishDate)}</time> ·{" "}
      {post.readingMinutes} min read
    </p>
  );
}

function CategoryLabel({ post }: { post: PostSummary }) {
  return (
    <span className="flex items-center gap-2">
      <Tag tone="info">{getCategory(post.category)?.name}</Tag>
      {post.draft && <DraftTag />}
    </span>
  );
}

function PostCard({ post, author }: { post: PostSummary; author?: Author }) {
  return (
    <article className="group relative flex flex-col gap-3">
      <Cover post={post} />
      <CategoryLabel post={post} />
      <h3 className="text-h4 font-semibold text-text-primary group-hover:text-accent-text">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </h3>
      <p className="line-clamp-2 text-body-sm text-text-secondary">{post.excerpt}</p>
      <PostMeta post={post} author={author} />
    </article>
  );
}

function FeaturedPostCard({ post, author }: { post: PostSummary; author?: Author }) {
  return (
    <article className="group relative grid gap-6 lg:grid-cols-2 lg:items-center">
      <Cover post={post} priority />
      <div className="flex flex-col gap-4">
        <CategoryLabel post={post} />
        <h2 className="text-h1 font-semibold text-text-primary group-hover:text-accent-text">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>
        <p className="text-body-lg text-text-secondary">{post.excerpt}</p>
        <PostMeta post={post} author={author} />
      </div>
    </article>
  );
}

function PostGrid({
  posts,
  authors,
  empty = "No posts here yet.",
}: {
  posts: PostSummary[];
  authors: Author[];
  empty?: string;
}) {
  if (posts.length === 0) return <p className="text-body text-text-secondary">{empty}</p>;
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard
          key={post.slug}
          post={post}
          author={authors.find((author) => author.slug === post.author)}
        />
      ))}
    </div>
  );
}

function CategoryPills({ active }: { active?: string }) {
  const pill = (isActive: boolean) =>
    cn(
      "inline-flex h-8 items-center rounded-full border px-3 text-body-sm whitespace-nowrap transition-colors duration-fast",
      isActive
        ? "border-accent bg-accent-subtle text-text-primary"
        : "border-border-subtle text-text-secondary hover:bg-bg-hover hover:text-text-primary",
    );
  return (
    <nav aria-label="Blog categories" className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none]">
      <ul className="flex gap-2">
        <li>
          <Link href="/blog" aria-current={!active ? "page" : undefined} className={pill(!active)}>
            All
          </Link>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/blog/categories/${category.slug}`}
              aria-current={active === category.slug ? "page" : undefined}
              className={pill(active === category.slug)}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AuthorAvatar({ author, size = 40 }: { author: Author; size?: number }) {
  if (author.avatar) {
    return (
      <Image
        src={author.avatar}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-bg-surface-2 text-body-sm font-semibold text-text-primary"
    >
      {author.name.slice(0, 1)}
    </span>
  );
}

export { AuthorAvatar, CategoryPills, Cover, DraftTag, FeaturedPostCard, PostCard, PostGrid };
