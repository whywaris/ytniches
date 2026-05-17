import type { Metadata } from 'next'
import { BlogEditor } from '@/components/admin/BlogEditor'

export const metadata: Metadata = { title: 'New Post — Admin', robots: { index: false, follow: false } }

export default function NewBlogPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-[#1A1612]">New Blog Post</h1>
      </div>
      <BlogEditor />
    </div>
  )
}

