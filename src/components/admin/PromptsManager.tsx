'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronRight, Loader2, Save, Check, X, Pencil } from 'lucide-react'
import type { NicheChannel, NichePromptValue, PromptAccess } from '@/types'

// ── Channel Editor ────────────────────────────────────────────────────────────
function ChannelEditor({ channel, onUpdate, onDelete }: {
  channel: NicheChannel
  onUpdate: () => void
  onDelete: (id: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [channelName, setChannelName] = useState(channel.channel_name)
  const [channelUrl, setChannelUrl] = useState(channel.channel_url)
  const [isSavingInfo, setIsSavingInfo] = useState(false)

  const [fields, setFields] = useState<NichePromptValue[]>(channel.prompt_values ?? [])
  const [contents, setContents] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    channel.prompt_values?.forEach(pv => { map[pv.id] = pv.content })
    return map
  })
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [showAddField, setShowAddField] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldAccess, setNewFieldAccess] = useState<PromptAccess>('free')
  const [isAddingField, setIsAddingField] = useState(false)
  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null)

  const filledCount = fields.filter(f => (contents[f.id] ?? f.content).trim() !== '').length

  async function saveChannelInfo() {
    setIsSavingInfo(true)
    await fetch(`/api/admin/niche-channels/${channel.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_name: channelName, channel_url: channelUrl }),
    })
    setIsSavingInfo(false); setIsEditingInfo(false); onUpdate()
  }

  async function handleAddField() {
    if (!newFieldName.trim()) return
    setIsAddingField(true)
    const res = await fetch(`/api/admin/niche-channels/${channel.id}/prompts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field_name: newFieldName.trim(), access: newFieldAccess, content: '' }),
    })
    const newField = await res.json()
    if (newField.id) {
      setFields(prev => [...prev, newField])
      setContents(prev => ({ ...prev, [newField.id]: '' }))
    }
    setNewFieldName(''); setNewFieldAccess('free'); setShowAddField(false); setIsAddingField(false)
  }

  async function handleSaveField(fieldId: string) {
    setSavingId(fieldId)
    await fetch(`/api/admin/niche-channels/${channel.id}/prompts/${fieldId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: contents[fieldId] ?? '' }),
    })
    setSavingId(null); setSavedId(fieldId)
    setTimeout(() => setSavedId(null), 2000)
  }

  async function handleToggleAccess(fieldId: string, access: PromptAccess) {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, access } : f))
    await fetch(`/api/admin/niche-channels/${channel.id}/prompts/${fieldId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access }),
    })
  }

  async function handleDeleteField(fieldId: string) {
    setFields(prev => prev.filter(f => f.id !== fieldId)); setDeleteFieldId(null)
    await fetch(`/api/admin/niche-channels/${channel.id}/prompts/${fieldId}`, { method: 'DELETE' })
  }

  return (
    <div className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-3 flex-1 text-left">
          <ChevronRight className={`w-4 h-4 text-[#8A7F72] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold text-[#1A1612]">{channel.channel_name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                fields.length === 0 ? 'bg-[#F5F0E8] text-[#8A7F72]' :
                filledCount === fields.length ? 'bg-[#EBF5EF] text-[#2A7A4B]' :
                'bg-[#FEF6E8] text-[#A06B00]'
              }`}>{fields.length === 0 ? '0 fields' : `${filledCount}/${fields.length} filled`}</span>
            </div>
            {channel.channel_url && <p className="text-xs text-[#8A7F72] mt-0.5 truncate max-w-xs">{channel.channel_url}</p>}
          </div>
        </button>
        <button onClick={() => setIsEditingInfo(!isEditingInfo)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A7F72] hover:text-[#1A1612] hover:bg-[#F5F0E8]" title="Edit info">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(channel.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A7F72] hover:text-[#E8402A] hover:bg-[#FDF0ED]" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Edit info */}
      {isEditingInfo && (
        <div className="px-5 pb-4 border-t border-[#E0D9CE] pt-4 bg-[#FAFAF8]">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-[#8A7F72] mb-1 block">Channel Name</label>
              <input type="text" value={channelName} onChange={e => setChannelName(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            </div>
            <div>
              <label className="text-xs text-[#8A7F72] mb-1 block">Channel URL</label>
              <input type="url" value={channelUrl} onChange={e => setChannelUrl(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsEditingInfo(false)} className="px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8]">Cancel</button>
            <button onClick={saveChannelInfo} disabled={isSavingInfo} className="px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium hover:bg-[#c42e2e] disabled:opacity-50">{isSavingInfo ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      )}

      {/* Expanded fields */}
      {isExpanded && (
        <div className="border-t border-[#E0D9CE]">
          {fields.length === 0 && !showAddField ? (
            <div className="px-5 py-8 text-center text-sm text-[#8A7F72]">
              No fields yet. <button onClick={() => setShowAddField(true)} className="text-[#E8402A] hover:underline">Add your first field</button>
            </div>
          ) : (
            <div>
              {fields.map(field => (
                <div key={field.id} className="px-5 py-4 border-b border-[#E0D9CE] last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1A1612] uppercase tracking-wider">{field.field_name}</span>
                      <div className="flex items-center gap-0.5 bg-[#F5F0E8] rounded-full p-0.5">
                        <button onClick={() => handleToggleAccess(field.id, 'free')}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${field.access === 'free' ? 'bg-[#EBF5EF] text-[#2A7A4B]' : 'text-[#8A7F72]'}`}>Free</button>
                        <button onClick={() => handleToggleAccess(field.id, 'pro')}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${field.access === 'pro' ? 'bg-[#EDE8FF] text-[#5B47CC]' : 'text-[#8A7F72]'}`}>Pro</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleSaveField(field.id)} disabled={savingId === field.id}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                          savedId === field.id ? 'bg-[#EBF5EF] text-[#2A7A4B]' :
                          savingId === field.id ? 'bg-[#F5F0E8] text-[#8A7F72]' :
                          'bg-[#E8402A] text-white hover:bg-[#c42e2e]'
                        }`}>
                        {savingId === field.id ? 'Saving...' : savedId === field.id ? '✓ Saved!' : 'Save'}
                      </button>
                      <button onClick={() => setDeleteFieldId(field.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#C8C0B4] hover:text-[#E8402A] hover:bg-[#FDF0ED]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <textarea value={contents[field.id] ?? ''} onChange={e => setContents(p => ({ ...p, [field.id]: e.target.value }))}
                    onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSaveField(field.id) } }}
                    rows={5} className="w-full px-4 py-3 bg-[#F5F0E8] border border-[#E0D9CE] rounded-xl text-sm text-[#1A1612] outline-none focus:border-[#E8402A] resize-y leading-relaxed font-mono" spellCheck={false} />
                  <p className="text-[10px] text-[#C8C0B4] mt-1">Ctrl+S / Cmd+S to save</p>
                </div>
              ))}
            </div>
          )}

          {/* Add field form */}
          {showAddField ? (
            <div className="px-5 py-4 bg-[#FDF0ED] border-t border-[#E0D9CE]">
              <p className="text-xs font-semibold text-[#E8402A] uppercase tracking-wider mb-3">New Field</p>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs text-[#8A7F72] mb-1 block">Field Name *</label>
                  <input type="text" value={newFieldName} onChange={e => setNewFieldName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddField()} placeholder="e.g. Hook Writing, Title Generator..."
                    autoFocus className="w-full px-3 py-2 text-sm bg-white border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
                </div>
                <div>
                  <label className="text-xs text-[#8A7F72] mb-1 block">Access</label>
                  <div className="flex items-center gap-1 bg-white border border-[#E0D9CE] rounded-xl p-1">
                    <button onClick={() => setNewFieldAccess('free')} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${newFieldAccess === 'free' ? 'bg-[#EBF5EF] text-[#2A7A4B]' : 'text-[#8A7F72]'}`}>Free</button>
                    <button onClick={() => setNewFieldAccess('pro')} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${newFieldAccess === 'pro' ? 'bg-[#EDE8FF] text-[#5B47CC]' : 'text-[#8A7F72]'}`}>Pro</button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <button onClick={() => { setShowAddField(false); setNewFieldName('') }} className="px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] bg-white hover:bg-[#F5F0E8]">Cancel</button>
                <button onClick={handleAddField} disabled={!newFieldName.trim() || isAddingField} className="px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-semibold hover:bg-[#c42e2e] disabled:opacity-50">
                  {isAddingField ? 'Adding...' : 'Add Field'}
                </button>
              </div>
            </div>
          ) : (
            <div className="px-5 py-3 border-t border-[#E0D9CE]">
              <button onClick={() => setShowAddField(true)} className="flex items-center gap-1.5 text-xs font-semibold text-[#E8402A] hover:text-[#c42e2e]">
                <Plus className="w-3.5 h-3.5" />Add Field
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete field modal */}
      {deleteFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-xl p-6 w-72">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDF0ED] flex items-center justify-center"><Trash2 className="w-5 h-5 text-[#E8402A]" /></div>
              <div>
                <p className="font-semibold text-sm text-[#1A1612]">Delete this field?</p>
                <p className="text-xs text-[#8A7F72]">The prompt content will be permanently deleted.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteFieldId(null)} className="flex-1 px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8]">Cancel</button>
              <button onClick={() => handleDeleteField(deleteFieldId)} className="flex-1 px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium hover:bg-[#c42e2e]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PromptsManager() {
  const [channels, setChannels] = useState<NicheChannel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [newChName, setNewChName] = useState('')
  const [newChUrl, setNewChUrl] = useState('')
  const [isAddingCh, setIsAddingCh] = useState(false)
  const [deleteChId, setDeleteChId] = useState<string | null>(null)

  useEffect(() => { fetchChannels() }, [])

  async function fetchChannels() {
    const res = await fetch('/api/admin/niche-channels')
    const data = await res.json()
    setChannels(Array.isArray(data) ? data : [])
    setIsLoading(false)
  }

  async function handleAddChannel() {
    if (!newChName.trim()) return
    setIsAddingCh(true)
    const res = await fetch('/api/admin/niche-channels', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_name: newChName.trim(), channel_url: newChUrl.trim() }),
    })
    const data = await res.json()
    if (data.id) setChannels(prev => [...prev, { ...data, prompt_values: [] }])
    setNewChName(''); setNewChUrl(''); setShowAddChannel(false); setIsAddingCh(false)
  }

  async function handleDeleteChannel(id: string) {
    setChannels(prev => prev.filter(c => c.id !== id)); setDeleteChId(null)
    await fetch(`/api/admin/niche-channels/${id}`, { method: 'DELETE' })
  }

  if (isLoading) return <div className="flex items-center justify-center h-48 text-sm text-[#8A7F72]"><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A1612]">Prompts</h2>
          <p className="text-sm text-[#8A7F72] mt-1">Add channels and manage their prompt fields independently.</p>
        </div>
        <button onClick={() => setShowAddChannel(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e]">
          <Plus className="w-4 h-4" />Add Channel
        </button>
      </div>

      {/* Add channel form */}
      {showAddChannel && (
        <div className="border-2 border-[#E8402A] rounded-2xl p-4 bg-[#FDF0ED]">
          <p className="text-xs font-semibold text-[#E8402A] uppercase mb-3">New Channel</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-[#8A7F72] mb-1 block">Channel Name *</label>
              <input type="text" value={newChName} onChange={e => setNewChName(e.target.value)} placeholder="e.g. Dan Martell" autoFocus
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            </div>
            <div>
              <label className="text-xs text-[#8A7F72] mb-1 block">Channel URL</label>
              <input type="url" value={newChUrl} onChange={e => setNewChUrl(e.target.value)} placeholder="https://youtube.com/@channel"
                className="w-full px-4 py-2.5 text-sm bg-white border border-[#E0D9CE] rounded-xl outline-none focus:border-[#E8402A]" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowAddChannel(false); setNewChName(''); setNewChUrl('') }} className="px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] bg-white hover:bg-[#F5F0E8]">Cancel</button>
            <button onClick={handleAddChannel} disabled={!newChName.trim() || isAddingCh} className="px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-semibold hover:bg-[#c42e2e] disabled:opacity-50">
              {isAddingCh ? 'Adding...' : 'Add Channel'}
            </button>
          </div>
        </div>
      )}

      {/* Channels list */}
      {channels.length === 0 ? (
        <div className="bg-white border border-[#E0D9CE] rounded-2xl p-12 text-center text-sm text-[#8A7F72]">
          No channels yet. <button onClick={() => setShowAddChannel(true)} className="text-[#E8402A] hover:underline">Add your first channel</button>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map(ch => (
            <ChannelEditor key={ch.id} channel={ch} onUpdate={fetchChannels} onDelete={id => setDeleteChId(id)} />
          ))}
        </div>
      )}

      {/* Delete channel modal */}
      {deleteChId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-xl p-6 w-72">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDF0ED] flex items-center justify-center"><Trash2 className="w-5 h-5 text-[#E8402A]" /></div>
              <div>
                <p className="font-semibold text-sm text-[#1A1612]">Delete this channel?</p>
                <p className="text-xs text-[#8A7F72]">All prompt fields and content will be deleted.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteChId(null)} className="flex-1 px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8]">Cancel</button>
              <button onClick={() => handleDeleteChannel(deleteChId)} className="flex-1 px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium hover:bg-[#c42e2e]">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
