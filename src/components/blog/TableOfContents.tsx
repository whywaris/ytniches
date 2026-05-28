'use client'

import { useEffect, useState } from 'react'

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
    <nav aria-label="Table of contents" className="text-[13px]">
      <p className="text-[10px] font-bold text-[#8A7F72] uppercase tracking-widest mb-2">
        Contents
      </p>
      <ul className="space-y-0.5 border-l border-[#E0D9CE]">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block py-0.5 leading-snug transition-colors truncate ${
                heading.level === 3 ? 'pl-4 text-[12px]' : 'pl-3'
              } ${
                activeId === heading.id
                  ? 'text-[#E8402A] font-medium border-l-2 border-[#E8402A] -ml-px'
                  : 'text-[#8A7F72] hover:text-[#1A1612]'
              }`}
            >
              {heading.text.length > 30 ? heading.text.slice(0, 28) + '…' : heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
