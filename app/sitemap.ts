import { getAuthors, getPublishedPosts, getTags } from "@/lib/blog";
import { CATEGORIES } from "@/lib/blog/categories";
import { SITE_URL } from "@/lib/site";

import type { MetadataRoute } from "next";

// PRD.md §10.2 "sitemap auto-generated". Indexable public pages only:
// /vs/* stubs are noindex, and blog lists appear once they have a
// published post. Drafts never appear, whatever the environment.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPublishedPosts();
  const latest = (list: typeof posts) => list[0]?.updatedDate ?? list[0]?.publishDate;
  const entry = (path: string, lastModified?: string): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    ...(lastModified && { lastModified }),
  });

  return [
    entry("/"),
    entry("/pricing"),
    ...(posts.length > 0 ? [entry("/blog", latest(posts))] : []),
    ...posts.map((post) => entry(`/blog/${post.slug}`, post.updatedDate ?? post.publishDate)),
    ...CATEGORIES.flatMap((category) => {
      const inCategory = posts.filter((post) => post.category === category.slug);
      return inCategory.length > 0
        ? [entry(`/blog/categories/${category.slug}`, latest(inCategory))]
        : [];
    }),
    ...getAuthors().flatMap((author) => {
      const byAuthor = posts.filter((post) => post.author === author.slug);
      return byAuthor.length > 0 ? [entry(`/blog/authors/${author.slug}`, latest(byAuthor))] : [];
    }),
    ...getTags(posts).map((tag) => entry(`/blog/tags/${tag}`)),
  ];
}
