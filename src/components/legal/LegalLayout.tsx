'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  label: string
}

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  breadcrumbLabel: string
  toc: TocItem[]
  children: React.ReactNode
}

export function LegalLayout({ title, lastUpdated, breadcrumbLabel, toc, children }: LegalLayoutProps) {
  const [activeId, setActiveId] = useState(toc[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-10% 0px -75% 0px' }
    )
    toc.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [toc])

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <nav className="text-xs text-[#8A7F72] mb-8">
          <Link href="/" className="hover:text-[#1A1612]">Home</Link>
          <span className="mx-2">→</span>
          <Link href="/legal" className="hover:text-[#1A1612]">Legal</Link>
          <span className="mx-2">→</span>
          <span className="text-[#1A1612]">{breadcrumbLabel}</span>
        </nav>

        <div className="lg:flex lg:gap-16">
          {/* Sticky TOC */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7F72] mb-3">On this page</p>
              <nav className="flex flex-col gap-0.5">
                {toc.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`text-sm py-1.5 px-2.5 rounded-lg transition-colors leading-snug ${
                      activeId === id
                        ? 'text-[#E8402A] font-semibold bg-[#FDF0ED]'
                        : 'text-[#8A7F72] hover:text-[#1A1612] hover:bg-[#F5F0E8]'
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <h1 className="font-display font-black text-[36px] text-[#1A1612] mb-2">{title}</h1>
            <p className="text-sm text-[#8A7F72] mb-12">Last updated: {lastUpdated}</p>
            <div className="space-y-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display font-bold text-xl text-[#1A1612] mb-3">{title}</h2>
      <div className="text-[#6B6259] leading-[1.8] space-y-3">
        {children}
      </div>
    </section>
  )
}
