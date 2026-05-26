import type { Metadata } from 'next'
import Link from 'next/link'
import { Star, Clock, Eye, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { BackToTop } from '@/components/shared/BackToTop'
import type { BlogPost } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Learn how to find profitable YouTube niches, grow your channel and create content that gets views.',
  alternates: { canonical: 'https://ytniches.com/blog' },
}

type ListPost = Pick<BlogPost,
  'id' | 'slug' | 'title' | 'excerpt' | 'cover_image' |
  'category' | 'read_time' | 'views' | 'author_name' | 'tags' | 'created_at'
> & { is_featured: boolean }

export default async function BlogPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, category, read_time, is_featured, views, author_name, tags, created_at')
    .eq('published', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  const posts = (data as ListPost[]) ?? []
  const featured = posts.find((p) => p.is_featured) ?? null
  const grid = posts.filter((p) => !p.is_featured).slice(0, 6)

  const formattedFeaturedDate = featured
    ? new Date(featured.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <BackToTop />
      <div className="container-site section-padding">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#1A1612] mb-3">Blog</h1>
          <p className="text-[#8A7F72] text-lg max-w-xl mx-auto">
            Grow Faster. Pick Smarter. Real talk on YouTube niches, growth strategies, and what&apos;s actually working for creators right now.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-10">
            <div className="bg-white border border-[#E0D9CE] rounded-[20px] overflow-hidden hover:border-[#C8C0B4] hover:shadow-lg transition-all duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image */}
                <div className="aspect-video lg:aspect-auto lg:min-h-[320px] overflow-hidden bg-[#F5F0E8] relative">
                  {featured.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.cover_image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#F5F0E8] to-[#EDE8DF]" />
                  )}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-[#E8402A] text-white px-3 py-1 rounded-full">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                    <span className="text-xs font-semibold bg-white/90 backdrop-blur-sm text-[#E8402A] px-2.5 py-1 rounded-full">
                      {featured.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#8A7F72] mb-4 flex-wrap">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{featured.read_time} min read</span>
                      <span className="text-[#E0D9CE]">·</span>
                      <span>{formattedFeaturedDate}</span>
                      <span className="text-[#E0D9CE]">·</span>
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>{featured.views >= 1000 ? `${(featured.views / 1000).toFixed(1)}k` : featured.views}</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1A1612] leading-tight mb-4 group-hover:text-[#E8402A] transition-colors">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-[#8A7F72] leading-relaxed mb-6 line-clamp-3">
                        {featured.excerpt}
                      </p>
                    )}
                    {(featured.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {(featured.tags ?? []).slice(0, 4).map((tag) => (
                          <span key={tag} className="text-xs px-2.5 py-1 bg-[#F5F0E8] text-[#8A7F72] rounded-full border border-[#E0D9CE]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-5 border-t border-[#E0D9CE]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#E8402A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(featured.author_name || 'Y').charAt(0)}
                      </div>
                      <span className="text-sm text-[#8A7F72]">{featured.author_name || 'YTNiches Team'}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#E8402A] flex items-center gap-1.5 group-hover:gap-2.5 transition-all shrink-0">
                      Read article <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        {grid.length > 0 && (
          <>
            {featured && (
              <h2 className="font-display font-bold text-xl text-[#1A1612] mb-6">More Articles</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {grid.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}

        {posts.length === 0 && (
          <div className="text-center py-20 border border-dashed border-[#E0D9CE] rounded-[20px]">
            <p className="text-[#8A7F72]">No posts yet. Check back soon!</p>
          </div>
        )}


      </div>
    </div>
  )
}
