import { ImageResponse } from "next/og";

import { getPost, getPosts } from "@/lib/blog";
import { getCategory } from "@/lib/blog/categories";

// PRD.md §10.2 "OG images per post": title on the brand background,
// generated at build time. ImageResponse can't read CSS variables, so the
// values below mirror globals.css :root (bg-base, text-primary,
// text-secondary, accent) -- keep them in sync.
const BG_BASE = "#0a0a0b";
const TEXT_PRIMARY = "#f5f5f7";
const TEXT_SECONDARY = "#a1a1a6";
const ACCENT = "#ff5a2e";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "YTNiches blog post";

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  const category = post ? getCategory(post.category)?.name : undefined;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: BG_BASE,
        color: TEXT_PRIMARY,
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: ACCENT, fontWeight: 600 }}>
        {category ?? "Blog"}
      </div>
      <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
        {post?.title ?? "YTNiches Blog"}
      </div>
      <div style={{ display: "flex", fontSize: 28, color: TEXT_SECONDARY }}>ytniches.com/blog</div>
    </div>,
    size,
  );
}
