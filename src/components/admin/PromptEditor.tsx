'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Pencil, Image, FileText, List, ListOrdered,
  Copy, Check, Save, Plus, X, ChevronRight,
} from 'lucide-react'
import { PromptStep, PromptSubtab } from '@/types'

const STEP_ICONS: Record<string, React.ReactNode> = {
  search: <Search className="w-3.5 h-3.5" />,
  pencil: <Pencil className="w-3.5 h-3.5" />,
  image: <Image className="w-3.5 h-3.5" />,
  'file-text': <FileText className="w-3.5 h-3.5" />,
}

function getStepIcon(icon: string) {
  return STEP_ICONS[icon] ?? <FileText className="w-3.5 h-3.5" />
}

export function PromptEditor() {
  const [steps, setSteps] = useState<PromptStep[]>([])
  const [activeStepId, setActiveStepId] = useState<string>('')
  const [activeSubtabId, setActiveSubtabId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [showNewStepModal, setShowNewStepModal] = useState(false)
  const [newStepName, setNewStepName] = useState('')
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [renamingType, setRenamingType] = useState<'step' | 'subtab'>('subtab')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fetchSteps = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/prompts')
      const data: unknown = await res.json()
      const safeSteps = Array.isArray(data) ? (data as PromptStep[]) : []
      setSteps(safeSteps)
      if (safeSteps.length > 0) {
        setActiveStepId((prev) => prev || safeSteps[0].id)
        setActiveSubtabId((prev) => prev || safeSteps[0].subtabs?.[0]?.id || '')
      }
    } catch {
      setSteps([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchSteps()
  }, [fetchSteps])

  // Close modals on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowNewStepModal(false)
        setShowRenameModal(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const activeStep = steps.find((s) => s.id === activeStepId)
  const activeSubtab = activeStep?.subtabs?.find((s) => s.id === activeSubtabId)

  const wordCount = activeSubtab?.content
    ? activeSubtab.content.trim().split(/\s+/).filter(Boolean).length
    : 0
  const lineCount = activeSubtab?.content ? activeSubtab.content.split('\n').length : 0

  function selectStep(stepId: string) {
    setActiveStepId(stepId)
    const step = steps.find((s) => s.id === stepId)
    if (step?.subtabs?.length) {
      setActiveSubtabId(step.subtabs[0].id)
    }
  }

  function updateSubtabLocal(field: keyof PromptSubtab, value: string) {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        subtabs: step.subtabs?.map((sub) =>
          sub.id === activeSubtabId ? { ...sub, [field]: value } : sub
        ),
      }))
    )

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      void persistSubtab(activeSubtabId, { [field]: value })
    }, 1500)
  }

  async function persistSubtab(subtabId: string, data: Partial<PromptSubtab>) {
    setSaveStatus('saving')
    await fetch(`/api/admin/prompts/subtabs/${subtabId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 1500)
  }

  async function handleManualSave() {
    if (!activeSubtab) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    await persistSubtab(activeSubtab.id, {
      title: activeSubtab.title,
      subtitle: activeSubtab.subtitle,
      content: activeSubtab.content,
    })
  }

  async function handleCopy() {
    if (!activeSubtab?.content) return
    await navigator.clipboard.writeText(activeSubtab.content)
    setCopyStatus('copied')
    setTimeout(() => setCopyStatus('idle'), 1500)
  }

  async function handleAddStep() {
    if (!newStepName.trim()) return
    await fetch('/api/admin/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newStepName.trim() }),
    })
    setShowNewStepModal(false)
    setNewStepName('')
    await fetchSteps()
  }

  async function handleAddSubtab(stepId: string) {
    await fetch(`/api/admin/prompts/${stepId}/subtabs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'New Prompt' }),
    })
    await fetchSteps()
  }

  async function handleDeleteStep(stepId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (steps.length <= 1) return
    await fetch(`/api/admin/prompts/${stepId}`, { method: 'DELETE' })
    const remaining = steps.filter((s) => s.id !== stepId)
    if (remaining.length > 0) {
      setActiveStepId(remaining[0].id)
      setActiveSubtabId(remaining[0].subtabs?.[0]?.id ?? '')
    }
    await fetchSteps()
  }

  async function handleDeleteSubtab(subtabId: string, e: React.MouseEvent) {
    e.stopPropagation()
    const currentStep = steps.find((s) => s.id === activeStepId)
    if ((currentStep?.subtabs?.length ?? 0) <= 1) return
    await fetch(`/api/admin/prompts/subtabs/${subtabId}`, { method: 'DELETE' })
    const remaining = currentStep?.subtabs?.filter((s) => s.id !== subtabId) ?? []
    if (remaining.length > 0) setActiveSubtabId(remaining[0].id)
    await fetchSteps()
  }

  async function handleRenameStep() {
    if (!renameValue.trim()) return
    await fetch(`/api/admin/prompts/${activeStepId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: renameValue.trim() }),
    })
    setShowRenameModal(false)
    await fetchSteps()
  }

  async function handleRenameSubtab() {
    if (!renameValue.trim()) return
    await fetch(`/api/admin/prompts/subtabs/${activeSubtabId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: renameValue.trim() }),
    })
    setShowRenameModal(false)
    await fetchSteps()
  }

  function insertFormatting(prefix: string, suffix = '') {
    const textarea = textareaRef.current
    if (!textarea || !activeSubtab) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = activeSubtab.content.substring(start, end)
    const newContent =
      activeSubtab.content.substring(0, start) +
      prefix +
      selected +
      suffix +
      activeSubtab.content.substring(end)
    updateSubtabLocal('content', newContent)
    setTimeout(() => {
      textarea.selectionStart = start + prefix.length
      textarea.selectionEnd = end + prefix.length
      textarea.focus()
    }, 0)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      void handleManualSave()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent =
        (activeSubtab?.content ?? '').substring(0, start) +
        '  ' +
        (activeSubtab?.content ?? '').substring(end)
      updateSubtabLocal('content', newContent)
      setTimeout(() => {
        textarea.selectionStart = start + 2
        textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-white rounded-2xl border border-[#E0D9CE]" style={{ height: '620px' }}>
        <p className="text-sm text-[#8A7F72]">Loading prompt editor...</p>
      </div>
    )
  }

  return (
    <>
      {/* ── EDITOR ── */}
      <div className="flex bg-white rounded-2xl border border-[#E0D9CE] overflow-hidden" style={{ height: '620px' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div className="flex flex-col border-r border-[#E0D9CE] shrink-0" style={{ width: '220px', background: '#FAFAF8' }}>
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-3 py-3 border-b border-[#E0D9CE]">
            <span className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-wider">Prompts</span>
            <button
              onClick={() => setShowNewStepModal(true)}
              title="Add new step"
              className="w-6 h-6 flex items-center justify-center rounded-md text-[#8A7F72] hover:bg-[#E0D9CE] hover:text-[#1A1612] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Steps list */}
          <div className="flex-1 overflow-y-auto py-1">
            {steps.map((step) => (
              <div key={step.id}>
                {/* Step row */}
                <div
                  onClick={() => selectStep(step.id)}
                  className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                    activeStepId === step.id
                      ? 'bg-white border-l-2 border-[#E8402A] text-[#1A1612]'
                      : 'text-[#8A7F72] hover:bg-white hover:text-[#1A1612] border-l-2 border-transparent'
                  }`}
                >
                  <span className="shrink-0 opacity-60">{getStepIcon(step.icon)}</span>
                  <span className="text-xs font-medium flex-1 truncate">{step.label}</span>
                  {steps.length > 1 && (
                    <button
                      onClick={(e) => { void handleDeleteStep(step.id, e) }}
                      className="opacity-0 group-hover:opacity-100 text-[#8A7F72] hover:text-[#E8402A] transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Subtabs — visible when step is active */}
                {activeStepId === step.id && (
                  <div className="pb-1">
                    {step.subtabs?.map((subtab) => (
                      <div
                        key={subtab.id}
                        onClick={() => setActiveSubtabId(subtab.id)}
                        className={`group flex items-center gap-2 pl-7 pr-3 py-1.5 cursor-pointer transition-colors ${
                          activeSubtabId === subtab.id
                            ? 'bg-[#FDF0ED] text-[#E8402A]'
                            : 'text-[#8A7F72] hover:bg-white hover:text-[#1A1612]'
                        }`}
                      >
                        <span className="text-xs flex-1 truncate">{subtab.label}</span>
                        {(step.subtabs?.length ?? 0) > 1 && (
                          <button
                            onClick={(e) => { void handleDeleteSubtab(subtab.id, e) }}
                            className="opacity-0 group-hover:opacity-100 text-[#8A7F72] hover:text-[#E8402A] transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add subtab */}
                    <button
                      onClick={() => { void handleAddSubtab(step.id) }}
                      className="flex items-center gap-1.5 pl-7 pr-3 py-1.5 w-full text-left text-xs text-[#8A7F72] hover:text-[#E8402A] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add prompt</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT EDITOR AREA ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-[#E0D9CE] bg-[#FAFAF8] shrink-0">
            <span className="text-xs text-[#8A7F72]">Prompts</span>
            {activeStep && (
              <>
                <ChevronRight className="w-3 h-3 text-[#C8C0B4]" />
                <span className="text-xs text-[#8A7F72]">{activeStep.label}</span>
              </>
            )}
            {activeSubtab && (
              <>
                <ChevronRight className="w-3 h-3 text-[#C8C0B4]" />
                <span className="text-xs text-[#1A1612] font-medium">{activeSubtab.label}</span>
              </>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-[#E0D9CE] shrink-0 flex-wrap">
            {/* Format buttons */}
            <button
              onClick={() => insertFormatting('**', '**')}
              title="Bold"
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612] border border-transparent hover:border-[#E0D9CE] transition-all"
            >B</button>
            <button
              onClick={() => insertFormatting('*', '*')}
              title="Italic"
              className="w-7 h-7 rounded flex items-center justify-center text-xs italic text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612] border border-transparent hover:border-[#E0D9CE] transition-all"
            >I</button>
            <button
              onClick={() => insertFormatting('`', '`')}
              title="Code"
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-mono text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612] border border-transparent hover:border-[#E0D9CE] transition-all"
            >{"`"}</button>

            <div className="w-px h-4 bg-[#E0D9CE] mx-1" />

            <button
              onClick={() => insertFormatting('\n- ')}
              title="Bullet list"
              className="w-7 h-7 rounded flex items-center justify-center text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612] border border-transparent hover:border-[#E0D9CE] transition-all"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('\n1. ')}
              title="Numbered list"
              className="w-7 h-7 rounded flex items-center justify-center text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612] border border-transparent hover:border-[#E0D9CE] transition-all"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            <div className="flex-1" />

            {/* Auto-save pulse */}
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-xs text-[#8A7F72] mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8A7F72] animate-pulse" />
                Saving...
              </span>
            )}

            {/* Rename */}
            <button
              onClick={() => {
                setRenamingType('subtab')
                setRenameValue(activeSubtab?.label ?? '')
                setShowRenameModal(true)
              }}
              className="flex items-center gap-1.5 px-2.5 h-7 rounded text-xs text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612] border border-transparent hover:border-[#E0D9CE] transition-all"
            >
              <Pencil className="w-3 h-3" />
              Rename
            </button>

            <div className="w-px h-4 bg-[#E0D9CE] mx-1" />

            {/* Copy */}
            <button
              onClick={() => { void handleCopy() }}
              className={`flex items-center gap-1.5 px-2.5 h-7 rounded text-xs border transition-all ${
                copyStatus === 'copied'
                  ? 'bg-[#EBF5EF] text-[#2A7A4B] border-[#C2E0CE]'
                  : 'text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612] border-transparent hover:border-[#E0D9CE]'
              }`}
            >
              {copyStatus === 'copied' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copyStatus === 'copied' ? 'Copied' : 'Copy'}
            </button>

            {/* Save */}
            <button
              onClick={() => { void handleManualSave() }}
              className={`flex items-center gap-1.5 px-2.5 h-7 rounded text-xs border transition-all ${
                saveStatus === 'saved'
                  ? 'bg-[#EBF5EF] text-[#2A7A4B] border-[#C2E0CE]'
                  : saveStatus === 'saving'
                  ? 'bg-[#F5F0E8] text-[#8A7F72] border-[#E0D9CE]'
                  : 'bg-[#E8402A] text-white border-[#E8402A] hover:bg-[#CF3520]'
              }`}
            >
              {saveStatus === 'saved' ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
              {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Document area */}
          <div className="flex-1 overflow-y-auto px-10 py-6">
            {activeSubtab ? (
              <>
                <input
                  type="text"
                  value={activeSubtab.title}
                  onChange={(e) => updateSubtabLocal('title', e.target.value)}
                  placeholder="Prompt title..."
                  className="w-full text-2xl font-bold text-[#1A1612] bg-transparent border-none outline-none placeholder-[#C8C0B4] mb-2"
                  style={{ fontFamily: 'Fraunces, serif' }}
                />
                <input
                  type="text"
                  value={activeSubtab.subtitle}
                  onChange={(e) => updateSubtabLocal('subtitle', e.target.value)}
                  placeholder="Short description..."
                  className="w-full text-sm text-[#8A7F72] bg-transparent border-none outline-none placeholder-[#C8C0B4] mb-4"
                />
                <hr className="border-[#E0D9CE] mb-5" />
                <textarea
                  ref={textareaRef}
                  value={activeSubtab.content}
                  onChange={(e) => updateSubtabLocal('content', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write your prompt here..."
                  spellCheck={false}
                  className="w-full bg-transparent border-none outline-none text-sm text-[#1A1612] resize-none placeholder-[#C8C0B4]"
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    lineHeight: '1.8',
                    minHeight: '320px',
                  }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[#8A7F72]">
                Select a prompt from the sidebar to start editing
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-6 py-2 border-t border-[#E0D9CE] bg-[#FAFAF8] shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#8A7F72]">
              {activeStep && <span>{activeStep.label}</span>}
              {activeSubtab && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span>{activeSubtab.label}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#8A7F72]">
              <span>{wordCount} words</span>
              <span>{lineCount} lines</span>
              <span className="px-2 py-0.5 bg-[#1A1612] text-white rounded text-[10px] font-medium">Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEW STEP MODAL ── */}
      {showNewStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-xl p-6 w-80">
            <h3 className="font-display font-bold text-lg text-[#1A1612] mb-1">New Step Tab</h3>
            <p className="text-sm text-[#8A7F72] mb-4">Enter a name for the new prompt step.</p>
            <input
              autoFocus
              type="text"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleAddStep() }}
              placeholder="e.g. Step 4 — SEO Optimization"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowNewStepModal(false); setNewStepName('') }}
                className="px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8] transition-colors"
              >Cancel</button>
              <button
                onClick={() => { void handleAddStep() }}
                disabled={!newStepName.trim()}
                className="px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium disabled:opacity-50 hover:bg-[#CF3520] transition-colors"
              >Create Tab</button>
            </div>
          </div>
        </div>
      )}

      {/* ── RENAME MODAL ── */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-xl p-6 w-80">
            <h3 className="font-display font-bold text-lg text-[#1A1612] mb-1">
              Rename {renamingType === 'step' ? 'Step' : 'Prompt'}
            </h3>
            <p className="text-sm text-[#8A7F72] mb-4">Enter a new name.</p>
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void (renamingType === 'step' ? handleRenameStep() : handleRenameSubtab())
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8] transition-colors"
              >Cancel</button>
              <button
                onClick={() => { void (renamingType === 'step' ? handleRenameStep() : handleRenameSubtab()) }}
                disabled={!renameValue.trim()}
                className="px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium disabled:opacity-50 hover:bg-[#CF3520] transition-colors"
              >Rename</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
