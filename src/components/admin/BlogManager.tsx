'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/types'

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('blog_posts')
      .select('id, title, slug, published, created_at, excerpt, author, tags, cover_image, content, updated_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts((data as BlogPost[]) ?? [])
        setIsLoading(false)
      })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('blog_posts').delete().eq('id', id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleTogglePublish(post: BlogPost) {
    const supabase = createClient()
    const { data } = await supabase
      .from('blog_posts')
      .update({ published: !post.published })
      .eq('id', post.id)
      .select()
      .single()

    if (data) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? (data as BlogPost) : p))
      )
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Blog Manager</h2>
        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {['Title', 'Status', 'Author', 'Date', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">
                    {post.title}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleTogglePublish(post)}>
                      <Badge variant={post.published ? 'success' : 'default'}>
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">{post.author}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(post.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}