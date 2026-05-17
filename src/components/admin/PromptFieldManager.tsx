'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Plus, Loader2, Eye, EyeOff } from 'lucide-react'
import type { PromptField } from '@/types'

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, title }: { value: boolean; onChange: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      title={title}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${value ? 'bg-[#E8402A]' : 'bg-[#E0D9CE]'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

// ── Sortable Row ──────────────────────────────────────────────────────────────
function SortableFieldRow({
  field,
  onRename,
  onToggleShow,
  onDeleteRequest,
}: {
  field: PromptField
  onRename: (id: string, name: string) => void
  onToggleShow: (id: string, show: boolean) => void
  onDeleteRequest: (id: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(field.name)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  }

  function submitRename() {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== field.name) onRename(field.id, trimmed)
    else setEditName(field.name)
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white border rounded-xl transition-shadow ${isDragging ? 'border-[#E8402A] shadow-lg' : 'border-[#E0D9CE]'}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 text-[#C8C0B4] hover:text-[#8A7F72] transition-colors cursor-grab active:cursor-grabbing touch-none p-0.5"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Position */}
      <span className="shrink-0 w-5 text-xs text-[#C8C0B4] font-mono text-center">
        {field.position + 1}
      </span>

      {/* Name — inline editable */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitRename()
              if (e.key === 'Escape') { setEditName(field.name); setIsEditing(false) }
            }}
            autoFocus
            className="w-full px-2 py-1 text-sm text-[#1A1612] bg-[#F5F0E8] border border-[#E8402A] rounded-lg outline-none"
          />
        ) : (
          <button
            onClick={() => { setEditName(field.name); setIsEditing(true) }}
            title="Click to rename"
            className="flex items-center gap-1.5 group w-full text-left"
          >
            <span className="text-sm font-medium text-[#1A1612] group-hover:text-[#E8402A] transition-colors truncate">
              {field.name}
            </span>
            <Pencil className="w-3 h-3 text-[#C8C0B4] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
        <p className="text-[10px] text-[#C8C0B4] font-mono mt-0.5 truncate">{field.slug}</p>
      </div>

      {/* Show to users */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-[#8A7F72] hidden md:block">Show to users</span>
        {field.show_to_users
          ? <Eye className="w-3.5 h-3.5 text-[#2A7A4B] md:hidden" />
          : <EyeOff className="w-3.5 h-3.5 text-[#C8C0B4] md:hidden" />
        }
        <Toggle
          value={field.show_to_users}
          onChange={() => onToggleShow(field.id, !field.show_to_users)}
          title={field.show_to_users ? 'Hide from users' : 'Show to users'}
        />
      </div>

      {/* Delete */}
      <button
        onClick={() => onDeleteRequest(field.id)}
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#C8C0B4] hover:text-[#E8402A] hover:bg-[#FDF0ED] transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PromptFieldManager() {
  const [fields, setFields] = useState<PromptField[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPlaceholder, setNewPlaceholder] = useState('')
  const [newShow, setNewShow] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchFields = useCallback(async () => {
    const res = await fetch('/api/admin/prompt-fields')
    const data: unknown = await res.json()
    setFields(Array.isArray(data) ? (data as PromptField[]) : [])
    setIsLoading(false)
  }, [])

  useEffect(() => { void fetchFields() }, [fetchFields])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    const reordered = arrayMove(fields, oldIndex, newIndex)

    setFields(reordered)
    setIsSavingOrder(true)
    await fetch('/api/admin/prompt-fields/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reordered.map((f) => f.id) }),
    })
    setIsSavingOrder(false)
  }

  async function handleRename(id: string, name: string) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
    await fetch(`/api/admin/prompt-fields/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  }

  async function handleToggleShow(id: string, show: boolean) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, show_to_users: show } : f)))
    await fetch(`/api/admin/prompt-fields/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_to_users: show }),
    })
  }

  async function handleDelete(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id))
    setDeleteConfirmId(null)
    await fetch(`/api/admin/prompt-fields/${id}`, { method: 'DELETE' })
  }

  async function handleAddField() {
    if (!newName.trim()) return
    setIsAdding(true)
    const res = await fetch('/api/admin/prompt-fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), placeholder: newPlaceholder.trim(), show_to_users: newShow }),
    })
    const newField = (await res.json()) as PromptField
    if (newField.id) setFields((prev) => [...prev, newField])
    setNewName('')
    setNewPlaceholder('')
    setNewShow(true)
    setShowAddForm(false)
    setIsAdding(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-[#8A7F72]">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading fields...
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-[#E0D9CE] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0D9CE] bg-[#FAFAF8]">
          <div>
            <h3 className="font-semibold text-sm text-[#1A1612]">Manage Prompt Fields</h3>
            <p className="text-xs text-[#8A7F72] mt-0.5">
              {fields.length} fields · Drag to reorder · Click name to rename
              {isSavingOrder && <span className="ml-2 text-[#E8402A]">Saving...</span>}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#E8402A] text-white rounded-full text-xs font-semibold hover:bg-[#CF3520] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Field
          </button>
        </div>

        {/* Field list */}
        <div className="p-4 space-y-2">
          {fields.length === 0 && !showAddForm ? (
            <div className="text-center py-8 text-sm text-[#8A7F72]">
              No fields yet.{' '}
              <button onClick={() => setShowAddForm(true)} className="text-[#E8402A] hover:underline">
                Add your first field
              </button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {fields.map((field) => (
                  <SortableFieldRow
                    key={field.id}
                    field={field}
                    onRename={handleRename}
                    onToggleShow={handleToggleShow}
                    onDeleteRequest={setDeleteConfirmId}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Inline add form */}
        {showAddForm && (
          <div className="px-4 pb-4">
            <div className="border border-[#E8402A] rounded-xl p-4 bg-[#FDF8F7]">
              <p className="text-xs font-semibold text-[#E8402A] uppercase tracking-wider mb-3">New Field</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#8A7F72] mb-1 block">Field Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void handleAddField() }}
                    placeholder="e.g. Hook Writing Prompt"
                    autoFocus
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D9CE] rounded-lg outline-none focus:border-[#E8402A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8A7F72] mb-1 block">Placeholder Text (optional)</label>
                  <input
                    type="text"
                    value={newPlaceholder}
                    onChange={(e) => setNewPlaceholder(e.target.value)}
                    placeholder="e.g. Write a hook for this niche..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D9CE] rounded-lg outline-none focus:border-[#E8402A] transition-colors"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Toggle value={newShow} onChange={() => setNewShow((p) => !p)} />
                  <span className="text-sm text-[#1A1612]">Show to users</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setShowAddForm(false); setNewName(''); setNewPlaceholder(''); setNewShow(true) }}
                  className="flex-1 px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] bg-white hover:bg-[#F5F0E8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { void handleAddField() }}
                  disabled={!newName.trim() || isAdding}
                  className="flex-1 px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-semibold hover:bg-[#CF3520] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isAdding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isAdding ? 'Adding...' : 'Add Field'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-xl p-6 w-80">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDF0ED] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-[#E8402A]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1A1612]">Delete this field?</p>
                <p className="text-xs text-[#8A7F72]">All content saved in this field will also be deleted.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 rounded-full text-sm text-[#8A7F72] border border-[#E0D9CE] hover:bg-[#F5F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { void handleDelete(deleteConfirmId) }}
                className="flex-1 px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium hover:bg-[#CF3520] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
