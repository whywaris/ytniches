'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface Prompt {
  id: string
  title: string
  category: string
  prompt_text: string
  tags: string[]
  is_premium: boolean
  created_at: string
}

const CATEGORIES = ['Video Scripts', 'Thumbnail Prompts', 'Community Posts', 'YouTube Shorts', 'Channel Description', 'About Page']

export function AdminPromptsClient({ prompts: initial }: { prompts: Prompt[] }) {
  const [prompts, setPrompts] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Prompt | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [promptText, setPromptText] = useState('')
  const [tags, setTags] = useState('')
  const [isPremium, setIsPremium] = useState(false)

  const supabase = createClient()

  function resetForm() {
    setTitle('')
    setCategory(CATEGORIES[0])
    setPromptText('')
    setTags('')
    setIsPremium(false)
    setEditing(null)
    setShowForm(false)
  }

  function startEdit(prompt: Prompt) {
    setTitle(prompt.title)
    setCategory(prompt.category)
    setPromptText(prompt.prompt_text)
    setTags(prompt.tags.join(', '))
    setIsPremium(prompt.is_premium)
    setEditing(prompt)
    setShowForm(true)
  }

  async function handleSave() {
    if (!title.trim() || !promptText.trim()) return
    setSaving(true)

    const payload = {
      title: title.trim(),
      category,
      prompt_text: promptText.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      is_premium: isPremium,
    }

    if (editing) {
      const { data } = await supabase
        .from('prompts')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()

      if (data) {
        setPrompts((prev) => prev.map((p) => (p.id === data.id ? data : p)))
      }
    } else {
      const { data } = await supabase
        .from('prompts')
        .insert(payload)
        .select()
        .single()

      if (data) {
        setPrompts((prev) => [data, ...prev])
      }
    }

    setSaving(false)
    resetForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this prompt?')) return
    await supabase.from('prompts').delete().eq('id', id)
    setPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      {/* Create button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-[#E8402A] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Prompt
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1A1612]">{editing ? 'Edit Prompt' : 'New Prompt'}</h2>
            <button onClick={resetForm} className="text-[#8A7F72] hover:text-[#1A1612]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. YouTube Video Hook Script"
                className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-[#1A1612] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E0D9CE] text-[#E8402A] focus:ring-[#E8402A]"
                  />
                  Pro only
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Prompt Text</label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={5}
                placeholder="Write the full prompt text here..."
                className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A] resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8A7F72] uppercase mb-1.5">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. hook, script, intro"
                className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !promptText.trim()}
              className="bg-[#E8402A] text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Update Prompt' : 'Create Prompt'}
            </button>
          </div>
        </div>
      )}

      {/* Prompts list */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden overflow-x-auto">
        {prompts.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#8A7F72]">
            No prompts yet. Create one above.
          </div>
        ) : (
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E0D9CE] bg-[#F5F0E8]">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#8A7F72] uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#8A7F72] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              {prompts.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-[#F5F0E8] transition-colors">
                  <td className="px-5 py-3 text-[#1A1612] font-medium">{prompt.title}</td>
                  <td className="px-4 py-3 text-[#8A7F72] hidden sm:table-cell">{prompt.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', prompt.is_premium ? 'bg-[#FDF0ED] text-[#E8402A]' : 'bg-[#EBF5EF] text-[#2A7A4B]')}>
                      {prompt.is_premium ? 'Pro' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => startEdit(prompt)} className="p-1.5 text-[#8A7F72] hover:text-[#E8402A] transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(prompt.id)} className="p-1.5 text-[#8A7F72] hover:text-[#E8402A] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
