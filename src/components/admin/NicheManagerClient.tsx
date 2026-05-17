'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Pencil, Eye, EyeOff, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Niche } from '@/types'

interface Props { niches: Niche[] }

const COMP_STYLE: Record<string, string> = {
  Low: 'bg-[#EBF5EF] text-[#2A7A4B]',
  Medium: 'bg-[#FEF6E8] text-[#A06B00]',
  High: 'bg-[#FDF0ED] text-[#E8402A]',
}

export function NicheManagerClient({ niches: initialNiches }: Props) {
  const [niches, setNiches] = useState(initialNiches)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterPremium, setFilterPremium] = useState('All')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const PER_PAGE = 20

  const categories = ['All', ...Array.from(new Set(initialNiches.map((n) => n.category)))]

  const filtered = useMemo(() => {
    return niches.filter((n) => {
      const matchSearch = n.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCat === 'All' || n.category === filterCat
      const matchPrem = filterPremium === 'All' || (filterPremium === 'Premium' ? n.is_premium : !n.is_premium)
      return matchSearch && matchCat && matchPrem
    })
  }, [niches, search, filterCat, filterPremium])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  async function togglePublished(niche: Niche) {
    const res = await fetch(`/api/admin/niches/${niche.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !niche.published }),
    })
    if (res.ok) {
      setNiches((prev) => prev.map((n) => n.id === niche.id ? { ...n, published: !n.published } : n))
    }
  }

  async function deleteNiche(id: string) {
    const res = await fetch(`/api/admin/niches/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setNiches((prev) => prev.filter((n) => n.id !== id))
      setConfirmDelete(null)
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A7F72]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search niches..." className="pl-9 pr-4 py-2 text-sm bg-white border border-[#E0D9CE] rounded-full focus:outline-none focus:border-[#E8402A] w-48" />
        </div>
        <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1) }} className="text-sm bg-white border border-[#E0D9CE] rounded-full px-4 py-2 focus:outline-none focus:border-[#E8402A]">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={filterPremium} onChange={(e) => { setFilterPremium(e.target.value); setPage(1) }} className="text-sm bg-white border border-[#E0D9CE] rounded-full px-4 py-2 focus:outline-none focus:border-[#E8402A]">
          {['All', 'Free', 'Premium'].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[20px] border border-[#E0D9CE] overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E0D9CE] bg-[#F5F0E8]">
              {['Name', 'Category', 'CPM', 'Competition', 'Type', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#8A7F72] uppercase tracking-wider first:pl-5 last:text-right last:pr-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D9CE]">
            {paginated.map((niche) => (
              <tr key={niche.id} className="hover:bg-[#F5F0E8] transition-colors">
                <td className="px-5 py-3 font-semibold text-[#1A1612] max-w-[200px] truncate">{niche.name}</td>
                <td className="px-4 py-3 text-[#8A7F72]">{niche.category}</td>
                <td className="px-4 py-3 text-[#8A7F72]">${niche.cpm_min}–${niche.cpm_max}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', COMP_STYLE[niche.competition_level] ?? COMP_STYLE.Low)}>
                    {niche.competition_level}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', niche.is_premium ? 'bg-[#FDF0ED] text-[#E8402A]' : 'bg-[#EBF5EF] text-[#2A7A4B]')}>
                    {niche.is_premium ? 'Premium' : 'Free'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', niche.published ? 'bg-[#EBF5EF] text-[#2A7A4B]' : 'bg-[#F5F0E8] text-[#8A7F72]')}>
                    {niche.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/niches/${niche.id}/edit`} className="p-1.5 text-[#8A7F72] hover:text-[#1A1612] transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button onClick={() => togglePublished(niche)} className="p-1.5 text-[#8A7F72] hover:text-[#1A1612] transition-colors" title={niche.published ? 'Unpublish' : 'Publish'}>
                      {niche.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setConfirmDelete(niche.id)} className="p-1.5 text-[#8A7F72] hover:text-[#E8402A] transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-[#8A7F72]">No niches found.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="px-4 py-2 text-sm font-semibold rounded-full border border-[#E0D9CE] disabled:opacity-40 hover:border-[#E8402A] transition-colors">Prev</button>
          <span className="text-sm text-[#8A7F72]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="px-4 py-2 text-sm font-semibold rounded-full border border-[#E0D9CE] disabled:opacity-40 hover:border-[#E8402A] transition-colors">Next</button>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full">
            <h3 className="font-display font-bold text-lg text-[#1A1612] mb-2">Delete niche?</h3>
            <p className="text-sm text-[#8A7F72] mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-[#E0D9CE] text-[#1A1612] font-bold text-sm py-2.5 rounded-full hover:bg-[#F5F0E8] transition-colors">Cancel</button>
              <button onClick={() => deleteNiche(confirmDelete)} className="flex-1 bg-[#E8402A] text-white font-bold text-sm py-2.5 rounded-full hover:bg-[#CF3520] transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
