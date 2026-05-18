'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaqItem {
  q: string
  a: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-[#E0D9CE]">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="flex items-center justify-between w-full py-5 text-left gap-4"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-semibold text-[#1A1612] text-sm leading-snug">{item.q}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-[#8A7F72] shrink-0 transition-transform duration-200',
                open === i && 'rotate-180'
              )}
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-200',
              open === i ? 'max-h-96 pb-5' : 'max-h-0'
            )}
          >
            <p className="text-sm text-[#6B6259] leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
