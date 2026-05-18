'use client'

import { useState } from 'react'
import { CopyButton } from './CopyButton'

interface Props {
  ideas: string[]
  preview?: number
}

export function VideoIdeasList({ ideas, preview = 8 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const displayed = expanded ? ideas : ideas.slice(0, preview)

  return (
    <div>
      <ol className="flex flex-col gap-2.5">
        {displayed.map((idea, i) => (
          <li key={i} className="flex items-start gap-2.5 group">
            <span className="font-display font-bold text-[#E8402A] text-sm shrink-0 w-5 mt-0.5">
              {i + 1}.
            </span>
            <span className="flex-1 text-sm text-[#1A1612] leading-snug">{idea}</span>
            <CopyButton text={idea} className="opacity-0 group-hover:opacity-100" />
          </li>
        ))}
      </ol>

      {ideas.length > preview && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm font-semibold text-[#E8402A] hover:text-[#CF3520] transition-colors"
        >
          {expanded ? '↑ Show fewer' : `↓ Show all ${ideas.length} ideas`}
        </button>
      )}
    </div>
  )
}
