import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export function NichesPagination({ currentPage, totalPages, searchParams }: PaginationProps) {
  function buildPageUrl(page: number) {
    const sp = new URLSearchParams()
    if (searchParams.category) sp.set('category', searchParams.category)
    if (searchParams.search) sp.set('search', searchParams.search)
    sp.set('page', String(page))
    return `/niches?${sp.toString()}`
  }

  function getPageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">

      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E0D9CE] rounded-full text-sm text-[#8A7F72] hover:border-[#1A1612] hover:text-[#1A1612] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E0D9CE] rounded-full text-sm text-[#C8C0B4] cursor-not-allowed">
          <ArrowLeft className="w-4 h-4" /> Prev
        </span>
      )}

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-[#8A7F72]">
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildPageUrl(page)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#E8402A] text-white'
                  : 'bg-white border border-[#E0D9CE] text-[#8A7F72] hover:border-[#E8402A] hover:text-[#E8402A]'
              }`}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E0D9CE] rounded-full text-sm text-[#8A7F72] hover:border-[#1A1612] hover:text-[#1A1612] transition-colors"
        >
          Next <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E0D9CE] rounded-full text-sm text-[#C8C0B4] cursor-not-allowed">
          Next <ArrowRight className="w-4 h-4" />
        </span>
      )}

      <span className="text-xs text-[#8A7F72] ml-2">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  )
}
