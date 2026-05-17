'use client'

import { useState } from 'react'
import { Copy, Check, Lock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Prompt {
  id: string
  title: string
  category: string
  prompt_text: string
  tags: string[]
  is_premium: boolean
}

interface Props {
  prompts: Prompt[]
  categories: string[]
  isPro: boolean
}

export function PromptsClient({ prompts, categories, isPro }: Props) {
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = prompts.filter((p) => p.category === activeCategory)

  async function copy(prompt: Prompt) {
    if (prompt.is_premium && !isPro) return
    await navigator.clipboard.writeText(prompt.prompt_text)
    setCopied(prompt.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-foreground">Prompt Library</h1>
        <p className="text-muted text-sm mt-1">{prompts.length} curated prompts for YouTube creators</p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'text-sm font-semibold px-4 py-2 rounded-full transition-colors',
              activeCategory === cat
                ? 'bg-accent text-white'
                : 'text-muted hover:text-foreground hover:bg-secondary',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((prompt) => {
          const locked = prompt.is_premium && !isPro
          return (
            <div
              key={prompt.id}
              className={cn('bg-card rounded-[20px] border border-border p-5', locked && 'opacity-80')}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 block">
                    {prompt.category}
                  </span>
                  <h3 className="font-display font-bold text-foreground">{prompt.title}</h3>
                </div>
                {locked ? (
                  <Link href="/pricing" className="shrink-0 flex items-center gap-1 text-xs font-bold text-accent bg-accent-light px-3 py-1.5 rounded-full">
                    <Lock className="w-3 h-3" /> Pro
                  </Link>
                ) : (
                  <button
                    onClick={() => copy(prompt)}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors"
                  >
                    {copied === prompt.id ? (
                      <><Check className="w-3.5 h-3.5 text-[#2A7A4B]" /> Copied</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
                )}
              </div>

              <p className={cn('text-xs text-muted leading-relaxed mb-3', locked && 'blur-sm select-none')}>
                {prompt.prompt_text}
              </p>

              {prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold bg-secondary text-muted px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-14 text-center text-muted text-sm">No prompts in this category yet.</div>
      )}
    </div>
  )
}
