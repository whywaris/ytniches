import { getHelpArticle, getHelpArticles } from "@/lib/help";
import { getHelpCategory } from "@/lib/help/categories";
import { OG_SIZE, ogCard } from "@/lib/og/card";

// Per-article help card, same design as the blog's (shared helper).
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "YTNiches help article";

export function generateStaticParams() {
  return getHelpArticles().map((article) => ({ slug: article.slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getHelpArticle((await params).slug);
  return ogCard({
    eyebrow: article ? getHelpCategory(article.category)?.name : "Help center",
    title: article?.title ?? "YTNiches Help",
    footer: "ytniches.com/help",
  });
}
