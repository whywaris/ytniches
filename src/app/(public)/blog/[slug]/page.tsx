import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Clock, Eye, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { BackToTop } from '@/components/blog/BackToTop'
import { BlogPostJsonLd } from '@/components/shared/JsonLd'
import { PageAds } from '@/components/ads/PageAds'
import type { BlogPost } from '@/types'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('title, excerpt, content, cover_image, slug, created_at')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  const post = data as BlogPost | null

  if (!post) return { title: 'Post Not Found' }

  return {
    title: post.title,
    description: post.excerpt ?? post.content.replace(/<[^>]+>/g, '').slice(0, 160),
    alternates: { canonical: `https://ytniches.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? '',
      url: `https://ytniches.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.created_at,
      images: post.cover_image
        ? [{ url: post.cover_image, width: 1200, height: 630 }]
        : [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  }
}

type CardPost = Pick<BlogPost,
  'id' | 'slug' | 'title' | 'excerpt' | 'cover_image' |
  'category' | 'read_time' | 'views' | 'author_name' | 'tags' | 'created_at'
>

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) notFound()
  const post = data as BlogPost

  // Related posts from same category
  const { data: relatedData } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, category, read_time, views, author_name, tags, created_at')
    .eq('published', true)
    .eq('category', post.category)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const related = (relatedData as CardPost[]) ?? []

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const formattedViews = (post.views ?? 0) >= 1000
    ? `${((post.views ?? 0) / 1000).toFixed(1)}k`
    : String(post.views ?? 0)

  return (
    <article className="min-h-screen bg-[#F5F0E8]">
      <BlogPostJsonLd post={post} />
      <ReadingProgress />
      <BackToTop />

      {/* Cover image hero */}
      {post.cover_image && (
        <div className="w-full max-h-[480px] overflow-hidden bg-[#EDE8DF]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            style={{ aspectRatio: '21/9', maxHeight: '480px', objectPosition: 'center' }}
          />
        </div>
      )}

      {/* Main layout — article + TOC sidebar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-12 items-start">

          {/* ── Article ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-[#8A7F72] hover:text-[#1A1612] mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>

            {/* Category + meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-xs font-semibold bg-[#E8402A] text-white px-3 py-1 rounded-full">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-xs text-[#8A7F72]">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{post.read_time} min read</span>
                <span className="text-[#E0D9CE]">·</span>
                <time dateTime={post.created_at}>{formattedDate}</time>
                <span className="text-[#E0D9CE]">·</span>
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span>{formattedViews} views</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-[#1A1612] leading-tight mb-5">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-lg text-[#8A7F72] leading-relaxed mb-7 pl-4 border-l-4 border-[#E8402A]">
                {post.excerpt}
              </p>
            )}

            {/* Author */}
            <div className="flex items-center gap-3 pb-8 border-b border-[#E0D9CE] mb-8">
              <div className="w-9 h-9 rounded-full bg-[#E8402A] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {(post.author_name || 'Y').charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1612]">{post.author_name || 'YTNiches Team'}</p>
                <p className="text-xs text-[#8A7F72]">Author</p>
              </div>
            </div>

            {/* ── BLOG CONTENT ── */}
            <PageAds>
              <div
                className="blog-content pb-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </PageAds>

            {/* Tags */}
            {(post.tags ?? []).length > 0 && (
              <div className="pt-8 pb-6 border-t border-[#E0D9CE]">
                <p className="text-xs font-semibold text-[#8A7F72] uppercase tracking-wider mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {(post.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 bg-white border border-[#E0D9CE] text-[#8A7F72] rounded-full hover:border-[#E8402A] hover:text-[#E8402A] transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related posts */}
            {related.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-bold text-[#1A1612] mb-5">Related Articles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((rel) => (
                    <BlogPostCard key={rel.id} post={rel} />
                  ))}
                </div>
              </div>
            )}

            {/* Footer CTA */}
            <div className="mt-12 bg-[#1A1612] rounded-[20px] p-8 text-center">
              <p className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                Ready to find your YouTube niche?
              </p>
              <p className="text-[#C8C0B4] mb-6 text-sm">
                Browse 200+ researched niches with full AI content kits.
              </p>
              <Link
                href="/niches"
                className="inline-flex items-center gap-2 bg-[#E8402A] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#CF3520] transition-colors text-sm"
              >
                Browse the Niche Library <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ── TOC Sidebar — desktop only ───────────────────────── */}
          <aside className="hidden lg:block w-52 shrink-0">
            <TableOfContents content={post.content} />

            {/* Upgrade CTA */}
            <div className="mt-4 bg-[#FDF0ED] border border-[#F5C4BA] rounded-[20px] p-4 text-center">
              <p className="font-semibold text-sm text-[#1A1612] mb-1">Find your niche</p>
              <p className="text-xs text-[#8A7F72] mb-3 leading-relaxed">
                Browse 1,200+ curated YouTube niches
              </p>
              <Link
                href="/niches"
                className="block px-4 py-2 bg-[#E8402A] text-white rounded-full text-xs font-semibold hover:bg-[#CF3520] transition-colors"
              >
                Browse niches →
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </article>
  )
}
