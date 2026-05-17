'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Heading {
  id: string
  text: string
  level: number
}

interface Props {
  content: string
}

export function TableOfContents({ content }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')

  // Parse H2/H3 from HTML content
  useEffect(() => {
    if (typeof window === 'undefined') return
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const elements = doc.querySelectorAll('h2, h3')

    const parsed: Heading[] = Array.from(elements).map((el, i) => {
      const id = el.id || `heading-${i}`
      return { id, text: el.textContent ?? '', level: parseInt(el.tagName[1]) }
    })
    setHeadings(parsed)
  }, [content])

  // Assign IDs to actual DOM headings after the content renders
  useEffect(() => {
    if (headings.length === 0) return
    const article = document.querySelector('.blog-content')
    if (!article) return
    const domHeadings = article.querySelectorAll('h2, h3')
    domHeadings.forEach((el, i) => {
      if (!el.id) el.id = headings[i]?.id ?? `heading-${i}`
    })
  }, [headings])

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-10% 0% -80% 0%' }
    )

    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 sticky top-24">
      <p className="text-xs font-bold text-[#8A7F72] uppercase tracking-wider mb-3">
        On this page
      </p>
      <nav className="space-y-1" aria-label="Table of contents">
        {headings.map((heading) => (
          <Link
            key={heading.id}
            href={`#${heading.id}`}
            className={`block text-sm leading-relaxed transition-colors py-0.5 ${
              heading.level === 3 ? 'pl-3' : ''
            } ${
              activeId === heading.id
                ? 'text-[#E8402A] font-medium'
                : 'text-[#8A7F72] hover:text-[#1A1612]'
            }`}
          >
            {heading.level === 3 && (
              <span className="mr-1 text-[#C8C0B4]">—</span>
            )}
            {heading.text}
          </Link>
        ))}
      </nav>
    </div>
  )
}
