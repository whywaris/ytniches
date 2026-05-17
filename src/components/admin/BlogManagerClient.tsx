'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Eye, EyeOff, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlogPost } from '@/types'

export function BlogManagerClient({ posts: initialPosts }: { posts: BlogPost[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function togglePublished(post: BlogPost) {
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    })
    if (res.ok) setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, published: !p.published } : p))
  }

  async function deletePost(id: string) {
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    if (res.ok) { setPosts((prev) => prev.filter((p) => p.id !== id)); setConfirmDelete(null) }
  }

  return (
    <>
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E0D9CE] bg-[#F5F0E8]">
              {['Title', 'Status', 'Created', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider first:pl-5 last:text-right last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D9CE]">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-[#F5F0E8] transition-colors">
                <td className="px-5 py-3 font-semibold text-[#1A1612] max-w-xs truncate">{post.title}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', post.published ? 'bg-[#EBF5EF] text-[#2A7A4B]' : 'bg-[#F5F0E8] text-[#8A7F72]')}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8A7F72]">
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/blog/${post.id}/edit`} className="p-1.5 text-[#8A7F72] hover:text-[#1A1612]"><Pencil className="w-4 h-4" /></Link>
                    <button onClick={() => togglePublished(post)} className="p-1.5 text-[#8A7F72] hover:text-[#1A1612]">
                      {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setConfirmDelete(post.id)} className="p-1.5 text-[#8A7F72] hover:text-[#E8402A]"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <div className="py-10 text-center text-sm text-[#8A7F72]">No posts yet. Create your first post!</div>}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full">
            <h3 className="font-display font-bold text-lg text-[#1A1612] mb-2">Delete post?</h3>
            <p className="text-sm text-[#8A7F72] mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-[#E0D9CE] text-[#1A1612] font-bold text-sm py-2.5 rounded-full hover:bg-[#F5F0E8]">Cancel</button>
              <button onClick={() => deletePost(confirmDelete)} className="flex-1 bg-[#E8402A] text-white font-bold text-sm py-2.5 rounded-full hover:bg-[#CF3520]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
