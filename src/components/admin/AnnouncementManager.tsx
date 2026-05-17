'use client'

import { useState } from 'react'
import { Plus, Trash2, Loader2, Edit2, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Announcement {
  id: string
  message: string
  target: 'public' | 'dashboard'
  active: boolean
  created_at: string
}

export function AnnouncementManager({ announcements: initial }: { announcements: Announcement[] }) {
  const [announcements, setAnnouncements] = useState(initial)
  const [newMessage, setNewMessage] = useState('')
  const [newTarget, setNewTarget] = useState<'public' | 'dashboard'>('public')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  async function handleCreate() {
    if (!newMessage.trim()) return
    setCreating(true)

    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage.trim(), target: newTarget }),
    })
    const data = await res.json()

    if (res.ok && data.announcement) {
      setAnnouncements((prev) => [data.announcement, ...prev])
      setNewMessage('')
    }
    setCreating(false)
  }

  async function toggleActive(id: string, currentActive: boolean) {
    const res = await fetch('/api/admin/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !currentActive }),
    })
    if (res.ok) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !currentActive } : a))
      )
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editText.trim()) return
    const res = await fetch('/api/admin/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, message: editText.trim() }),
    })
    if (res.ok) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, message: editText.trim() } : a))
      )
      setEditingId(null)
      setEditText('')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return
    const res = await fetch('/api/admin/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
    }
  }

  function startEdit(a: Announcement) {
    setEditingId(a.id)
    setEditText(a.message)
  }

  return (
    <div>
      {/* Create new */}
      <div className="bg-white rounded-[20px] border border-[#E0D9CE] p-6 mb-6">
        <h2 className="font-semibold text-[#1A1612] text-sm mb-4">Create Announcement</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="e.g. 🔥 New — 47 niches added this week including AI & Finance"
            className="w-full border border-[#E0D9CE] rounded-xl px-4 py-3 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
          />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#8A7F72] uppercase">Show on:</label>
              <select
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value as 'public' | 'dashboard')}
                className="border border-[#E0D9CE] rounded-lg px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
              >
                <option value="public">Public (Homepage + Tools)</option>
                <option value="dashboard">Dashboard (Logged-in users)</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || !newMessage.trim()}
              className="ml-auto bg-[#E8402A] text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#CF3520] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-[20px] border border-[#E0D9CE] py-12 text-center text-sm text-[#8A7F72]">
            No announcements yet. Create one above.
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="bg-white rounded-[16px] border border-[#E0D9CE] p-4">
              <div className="flex items-start gap-4">
                {/* On/Off Toggle */}
                <button
                  onClick={() => toggleActive(a.id, a.active)}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5',
                    a.active ? 'bg-[#2A7A4B]' : 'bg-[#E0D9CE]'
                  )}
                  title={a.active ? 'Turn off' : 'Turn on'}
                >
                  <span className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                    a.active ? 'translate-x-5' : 'translate-x-0.5'
                  )} />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingId === a.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 border border-[#E0D9CE] rounded-lg px-3 py-2 text-sm text-[#1A1612] focus:outline-none focus:border-[#E8402A]"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(a.id)}
                        className="p-2 text-[#2A7A4B] hover:bg-[#EBF5EF] rounded-lg"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditText('') }}
                        className="p-2 text-[#8A7F72] hover:bg-[#F5F0E8] rounded-lg"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className={cn('text-sm', a.active ? 'text-[#1A1612]' : 'text-[#8A7F72]')}>
                        {a.message}
                      </p>
                      <p className="text-[10px] text-[#8A7F72] mt-1">
                        <span className={cn('font-bold uppercase', a.target === 'public' ? 'text-blue-600' : 'text-purple-600')}>
                          {a.target === 'public' ? 'Public Pages' : 'Dashboard'}
                        </span>
                        {' · '}
                        {a.active ? '🟢 Active' : '⚪ Off'}
                        {' · '}
                        {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>

                {/* Actions */}
                {editingId !== a.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(a)}
                      className="p-2 rounded-lg text-[#8A7F72] hover:text-[#1A1612] hover:bg-[#F5F0E8] transition-colors"
                      title="Edit text"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2 rounded-lg text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
