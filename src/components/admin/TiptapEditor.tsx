'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import {
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Terminal, Minus,
  Link as LinkIcon, Link2Off, Image as ImageIcon,
  Undo2, Redo2, Code, Play, X, Loader2,
  Table as TableIcon, Trash2,
} from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'

interface Props {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

// ─── Toolbar primitives ────────────────────────────────────────────────────
function Btn({
  onClick, active = false, disabled = false, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean
  title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all shrink-0
        ${active ? 'bg-[#E8402A] text-white' : 'text-[#8A7F72] hover:bg-[#F5F0E8] hover:text-[#1A1612]'}
        disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-[#E0D9CE] mx-0.5 shrink-0" />
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#E0D9CE] shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function TiptapEditor({ content, onChange, placeholder = 'Start writing…' }: Props) {
  const [showLink, setShowLink] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImage, setShowImage] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [showYoutube, setShowYoutube] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-[#1A1612] text-[#F5F0E8] rounded-xl p-5 font-mono text-sm my-4 overflow-x-auto',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'blog-blockquote',
          },
        },
        horizontalRule: {
          HTMLAttributes: { class: 'my-6' },
        },
      }),
      Heading.configure({ levels: [1, 2, 3, 4] }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#E8402A] underline underline-offset-2 hover:opacity-70',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: 'rounded-xl max-w-full h-auto my-4 border border-[#E0D9CE]' },
      }),
      Youtube.configure({
        width: 720,
        height: 405,
        HTMLAttributes: { class: 'rounded-xl my-4 w-full aspect-video' },
      }),
      Placeholder.configure({ placeholder }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'blog-table border-collapse border border-[#E0D9CE] rounded-xl my-4 w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-[#E0D9CE] bg-[#F5F0E8] px-4 py-2 font-semibold text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-[#E0D9CE] px-4 py-2',
        },
      }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
      const words = editor.getText().trim().split(/\s+/).filter(Boolean).length
      setWordCount(words)
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[480px] px-8 py-6 blog-content',
      },
    },
    immediatelyRender: false,
  })

  // Sync content when editing an existing post
  useEffect(() => {
    if (editor && content && editor.isEmpty && content !== '<p></p>') {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  const applyLink = useCallback(() => {
    if (!linkUrl) return
    editor?.chain().focus().setLink({ href: linkUrl }).run()
    setLinkUrl('')
    setShowLink(false)
  }, [editor, linkUrl])

  const insertImage = useCallback(() => {
    if (!imageUrl) return
    editor?.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run()
    setImageUrl('')
    setImageAlt('')
    setShowImage(false)
  }, [editor, imageUrl, imageAlt])

  const insertYoutube = useCallback(() => {
    if (!youtubeUrl) return
    editor?.commands.setYoutubeVideo({ src: youtubeUrl })
    setYoutubeUrl('')
    setShowYoutube(false)
  }, [editor, youtubeUrl])

  if (!editor) return (
    <div className="border border-[#E0D9CE] rounded-2xl bg-white flex items-center justify-center h-48">
      <Loader2 className="w-5 h-5 animate-spin text-[#8A7F72]" />
    </div>
  )

  const headingValue =
    editor.isActive('heading', { level: 1 }) ? '1' :
    editor.isActive('heading', { level: 2 }) ? '2' :
    editor.isActive('heading', { level: 3 }) ? '3' :
    editor.isActive('heading', { level: 4 }) ? '4' : 'p'

  return (
    <div className="border border-[#E0D9CE] rounded-2xl overflow-hidden bg-white">

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="border-b border-[#E0D9CE] bg-[#FAFAF8] px-3 py-2 flex items-center gap-0.5 flex-wrap">

        {/* Block format */}
        <select
          value={headingValue}
          onChange={e => {
            const v = e.target.value
            if (v === 'p') editor.chain().focus().setParagraph().run()
            else editor.chain().focus().setHeading({ level: parseInt(v) as 1|2|3|4 }).run()
          }}
          className="h-8 px-2 text-sm text-[#1A1612] bg-white border border-[#E0D9CE] rounded-lg outline-none focus:border-[#E8402A] mr-1 shrink-0"
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>

        <Sep />

        {/* Text formatting */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <span className="underline underline-offset-1">U</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <span className="line-through">S</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          <Code className="w-3.5 h-3.5" />
        </Btn>

        <Sep />

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <AlignLeft className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
          <AlignCenter className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <AlignRight className="w-3.5 h-3.5" />
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered className="w-3.5 h-3.5" />
        </Btn>

        <Sep />

        {/* Block elements */}
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <span className="text-[10px] font-bold leading-none">&ldquo;</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
          <Terminal className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal rule">
          <Minus className="w-3.5 h-3.5" />
        </Btn>

        <Sep />

        {/* Media */}
        <Btn onClick={() => setShowLink(true)} active={editor.isActive('link')} title="Insert link">
          <LinkIcon className="w-3.5 h-3.5" />
        </Btn>
        {editor.isActive('link') && (
          <Btn onClick={() => editor.chain().focus().unsetLink().run()} active={false} title="Remove link">
            <Link2Off className="w-3.5 h-3.5" />
          </Btn>
        )}
        <Btn onClick={() => setShowImage(true)} active={false} title="Insert image">
          <ImageIcon className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => setShowYoutube(true)} active={false} title="Embed YouTube video">
          <Play className="w-3.5 h-3.5" />
        </Btn>

        <Sep />

        {/* Table */}
        <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={editor.isActive('table')} title="Insert table (3×3)">
          <TableIcon className="w-3.5 h-3.5" />
        </Btn>
        {editor.isActive('table') && (
          <>
            <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} active={false} title="Add column after">
              <span className="text-[10px] font-bold">+Col</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().addRowAfter().run()} active={false} title="Add row after">
              <span className="text-[10px] font-bold">+Row</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteColumn().run()} active={false} title="Delete column">
              <span className="text-[10px] font-bold">-Col</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteRow().run()} active={false} title="Delete row">
              <span className="text-[10px] font-bold">-Row</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteTable().run()} active={false} title="Delete table">
              <Trash2 className="w-3.5 h-3.5" />
            </Btn>
          </>
        )}

        <Sep />

        {/* History */}
        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} active={false} title="Undo">
          <Undo2 className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} active={false} title="Redo">
          <Redo2 className="w-3.5 h-3.5" />
        </Btn>

        <div className="ml-auto text-xs text-[#8A7F72] px-2 shrink-0">{wordCount}w</div>
      </div>

      {/* ── Editor content area ────────────────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Status bar ────────────────────────────────────────────── */}
      <div className="border-t border-[#E0D9CE] px-5 py-2 bg-[#FAFAF8] flex items-center justify-between text-xs text-[#8A7F72]">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
        </div>
        <span>Select text for quick formatting</span>
      </div>

      {/* ── Link modal ─────────────────────────────────────────────── */}
      {showLink && (
        <Modal onClose={() => { setShowLink(false); setLinkUrl('') }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1A1612]">Insert Link</h3>
              <button type="button" onClick={() => { setShowLink(false); setLinkUrl('') }} className="text-[#8A7F72] hover:text-[#1A1612]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyLink()}
              placeholder="https://example.com"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] mb-4"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowLink(false); setLinkUrl('') }} className="flex-1 px-4 py-2 rounded-full text-sm border border-[#E0D9CE] text-[#8A7F72] hover:bg-[#F5F0E8]">Cancel</button>
              <button type="button" onClick={applyLink} className="flex-1 px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium hover:bg-[#CF3520]">Insert</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Image modal ────────────────────────────────────────────── */}
      {showImage && (
        <Modal onClose={() => { setShowImage(false); setImageUrl(''); setImageAlt('') }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1A1612]">Insert Image</h3>
              <button type="button" onClick={() => { setShowImage(false); setImageUrl(''); setImageAlt('') }} className="text-[#8A7F72] hover:text-[#1A1612]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8A7F72] mb-1 block">Image URL *</label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://…/image.jpg" autoFocus className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A]" />
              </div>
              <div>
                <label className="text-xs text-[#8A7F72] mb-1 block">Alt text</label>
                <input type="text" value={imageAlt} onChange={e => setImageAlt(e.target.value)} placeholder="Describe the image…" className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A]" />
              </div>
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Preview" className="w-full rounded-xl object-cover max-h-28 border border-[#E0D9CE]" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => { setShowImage(false); setImageUrl(''); setImageAlt('') }} className="flex-1 px-4 py-2 rounded-full text-sm border border-[#E0D9CE] text-[#8A7F72] hover:bg-[#F5F0E8]">Cancel</button>
              <button type="button" onClick={insertImage} disabled={!imageUrl} className="flex-1 px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium hover:bg-[#CF3520] disabled:opacity-50">Insert</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── YouTube modal ──────────────────────────────────────────── */}
      {showYoutube && (
        <Modal onClose={() => { setShowYoutube(false); setYoutubeUrl('') }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1A1612]">Embed YouTube Video</h3>
              <button type="button" onClick={() => { setShowYoutube(false); setYoutubeUrl('') }} className="text-[#8A7F72] hover:text-[#1A1612]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="url"
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && insertYoutube()}
              placeholder="https://youtube.com/watch?v=…"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0D9CE] text-sm outline-none focus:border-[#E8402A] mb-4"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowYoutube(false); setYoutubeUrl('') }} className="flex-1 px-4 py-2 rounded-full text-sm border border-[#E0D9CE] text-[#8A7F72] hover:bg-[#F5F0E8]">Cancel</button>
              <button type="button" onClick={insertYoutube} disabled={!youtubeUrl} className="flex-1 px-4 py-2 rounded-full text-sm bg-[#E8402A] text-white font-medium hover:bg-[#CF3520] disabled:opacity-50">Embed</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
