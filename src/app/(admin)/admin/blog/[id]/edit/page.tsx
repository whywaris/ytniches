import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { BlogEditor } from '@/components/admin/BlogEditor'
import type { BlogPost } from '@/types'

export const metadata: Metadata = { title: 'Edit Post — Admin', robots: { index: false, follow: false } }

interface Props { params: Promise<{ id: string }> }

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: post } = await supabase.from('blog_posts').select('*').eq('id', id).single()
  if (!post) notFound()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-[#1A1612]">Edit Post</h1>
      </div>
      <BlogEditor initialData={post as BlogPost} />
    </div>
  )
}
