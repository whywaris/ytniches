import Link from 'next/link'
import { Clock, Eye, ArrowRight } from 'lucide-react'
import type { BlogPost } from '@/types'

type CardPost = Pick<BlogPost,
  'id' | 'slug' | 'title' | 'excerpt' | 'cover_image' |
  'category' | 'read_time' | 'views' | 'author_name' | 'tags' | 'created_at'
>

export function BlogPostCard({ post }: { post: CardPost }) {
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const formattedViews = post.views >= 1000
    ? `${(post.views / 1000).toFixed(1)}k`
    : String(post.views)

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div className="bg-white border border-[#E0D9CE] rounded-[20px] overflow-hidden hover:border-[#C8C0B4] hover:shadow-md transition-all duration-200 h-full flex flex-col">

        {/* Cover image */}
        <div className="aspect-video overflow-hidden bg-[#F5F0E8] relative shrink-0">
          {post.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#F5F0E8] to-[#EDE8DF]" />
          )}
          <div className="absolute top-3 left-3">
            <span className="text-xs font-semibold bg-white/90 backdrop-blur-sm text-[#E8402A] px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-3 text-xs text-[#8A7F72]">
            <Clock className="w-3 h-3 shrink-0" />
            <span>{post.read_time} min read</span>
            <span className="text-[#E0D9CE]">·</span>
            <span>{formattedDate}</span>
            <span className="text-[#E0D9CE]">·</span>
            <Eye className="w-3 h-3 shrink-0" />
            <span>{formattedViews}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-lg font-bold text-[#1A1612] leading-snug mb-2 group-hover:text-[#E8402A] transition-colors line-clamp-2 flex-1">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-[#8A7F72] leading-relaxed line-clamp-2 mb-4">
              {post.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#E0D9CE]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#E8402A] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {(post.author_name || 'Y').charAt(0)}
              </div>
              <span className="text-xs text-[#8A7F72] truncate max-w-[100px]">{post.author_name || 'YTNiches Team'}</span>
            </div>
            <span className="text-xs font-semibold text-[#E8402A] flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
              Read <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
