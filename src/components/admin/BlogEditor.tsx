'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { TiptapEditor } from './TiptapEditor'
import type { BlogPost } from '@/types'

const BLOG_CATEGORIES = [
  'Niche Research', 'CPM & Revenue', 'Getting Started', 'Channel Ideas',
  'Monetization', 'Beginners', 'Growth Tips', 'Tools & Tech', 'General',
]

interface Props { initialData?: BlogPost }

export function BlogEditor({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [coverImage, setCoverImage] = useState(initialData?.cover_image ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [published, setPublished] = useState(initialData?.published ?? false)
  const [category, setCategory] = useState(initialData?.category ?? 'General')
  const [readTime, setReadTime] = useState(initialData?.read_time ?? 5)
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false)
  const [tagsInput, setTagsInput] = useState((initialData?.tags ?? []).join(', '))
  const [authorName, setAuthorName] = useState(initialData?.author_name ?? 'YTNiches Team')

  // Auto-generate slug from title on new posts
  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }

  async function handleSave() {
    if (!title.trim() || !content.trim() || content === '<p></p>') {
      setError('Title and content are required')
      return
    }
    setSaving(true)
    setError('')

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      cover_image: coverImage.trim() || null,
      content,
      published,
      category,
      read_time: readTime,
      is_featured: isFeatured,
      tags,
      author_name: authorName.trim(),
    }

    const url = isEdit ? `/api/admin/blog/${initialData!.id}` : '/api/admin/blog'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    let data: { error?: string } = {}
    const text = await res.text()
    try {
      data = JSON.parse(text) as { error?: string }
    } catch {
      setError(`Server error (${res.status}) — check browser console for details`)
      console.error('Non-JSON response from API:', text.slice(0, 500))
      setSaving(false)
      return
    }

    if (!res.ok) {
      setError(data.error ?? 'Failed to save')
      setSaving(false)
      return
    }

    router.push('/admin/blog')
  }

  return (
    <div className="max-w-5xl space-y-5">

      {/* Title */}
      <input
        value={title}
        onChange={e => handleTitleChange(e.target.value)}
        placeholder="Post title…"
        className="w-full font-display text-2xl font-bold bg-white border border-[#E0D9CE] rounded-[20px] px-6 py-4 focus:outline-none focus:border-[#E8402A] text-[#1A1612]"
      />

      {/* Meta fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Slug</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full text-sm bg-white border border-[#E0D9CE] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E8402A]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Cover Image URL</label>
          <input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://…" className="w-full text-sm bg-white border border-[#E0D9CE] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E8402A]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full text-sm bg-white border border-[#E0D9CE] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E8402A] text-[#1A1612]">
            {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Read Time (minutes)</label>
          <input type="number" min={1} max={60} value={readTime} onChange={e => setReadTime(Number(e.target.value))} className="w-full text-sm bg-white border border-[#E0D9CE] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E8402A]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Author Name</label>
          <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="YTNiches Team" className="w-full text-sm bg-white border border-[#E0D9CE] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E8402A]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Tags (comma-separated)</label>
          <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="YouTube Niches, CPM, 2025" className="w-full text-sm bg-white border border-[#E0D9CE] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E8402A]" />
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="text-xs font-semibold text-[#8A7F72] mb-1 block">Excerpt (SEO description)</label>
        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="Brief description for blog cards and SEO…" className="w-full text-sm bg-white border border-[#E0D9CE] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E8402A] resize-none" />
      </div>

      {/* Rich text content */}
      <div>
        <label className="text-xs font-semibold text-[#8A7F72] mb-1.5 block">Content *</label>
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your blog post here…"
        />
      </div>

      {/* Publish bar */}
      <div className="flex flex-wrap items-center justify-between bg-white rounded-[20px] border border-[#E0D9CE] px-6 py-4 gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="accent-[#E8402A] w-4 h-4" />
            <span className="text-sm font-semibold text-[#1A1612]">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="accent-[#E8402A] w-4 h-4" />
            <span className="text-sm font-semibold text-[#1A1612]">Featured</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-[#E8402A]">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex items-center gap-2 bg-[#E8402A] text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? 'Update post' : 'Save post'}
          </button>
        </div>
      </div>

    </div>
  )
}
