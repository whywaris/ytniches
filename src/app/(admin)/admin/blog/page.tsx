import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { BlogManagerClient } from '@/components/admin/BlogManagerClient'
import type { BlogPost } from '@/types'

export const metadata: Metadata = { title: 'Blog Post', robots: { index: false, follow: false } }

export default async function AdminBlogPage() {
  const supabase = createAdminClient()
  const { data: posts } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#1A1612]">Blog Posts</h1>
          <p className="text-[#8A7F72] text-sm mt-1">{posts?.length ?? 0} posts</p>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors">
          <Plus className="w-4 h-4" /> New post
        </Link>
      </div>
      <BlogManagerClient posts={(posts as BlogPost[]) ?? []} />
    </div>
  )
}

