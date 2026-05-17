'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Niche, NicheFilters, CompetitionLevel } from '@/types'

interface NicheState {
  niches: Niche[]
  filteredNiches: Niche[]
  currentNiche: Niche | null
  filters: NicheFilters
  isLoading: boolean
  error: string | null

  setNiches: (niches: Niche[]) => void
  setCurrentNiche: (niche: Niche | null) => void
  setFilter: (key: keyof NicheFilters, value: string) => void
  resetFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const defaultFilters: NicheFilters = {
  category: 'All',
  competition: 'All',
  search: '',
  cpmRange: 'All',
  content_type: 'All',
}

function applyFilters(niches: Niche[], filters: NicheFilters): Niche[] {
  return niches.filter((niche) => {
    const matchesCategory =
      filters.category === 'All' || niche.category === filters.category

    const matchesCompetition =
      filters.competition === 'All' ||
      niche.competition_level === (filters.competition as CompetitionLevel)

    const matchesSearch =
      !filters.search ||
      niche.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      niche.category.toLowerCase().includes(filters.search.toLowerCase())

    const matchesCpm = (() => {
      if (!filters.cpmRange || filters.cpmRange === 'All') return true
      const avg = (niche.cpm_min + niche.cpm_max) / 2
      if (filters.cpmRange === '0-10') return avg < 10
      if (filters.cpmRange === '10-20') return avg >= 10 && avg < 20
      if (filters.cpmRange === '20-40') return avg >= 20 && avg < 40
      if (filters.cpmRange === '40+') return avg >= 40
      return true
    })()

    const matchesContentType =
      !filters.content_type || filters.content_type === 'All' ||
      niche.content_type === filters.content_type

    return matchesCategory && matchesCompetition && matchesSearch && matchesCpm && matchesContentType
  })
}

export const useNicheStore = create<NicheState>()(
  devtools(
    (set, get) => ({
      niches: [],
      filteredNiches: [],
      currentNiche: null,
      filters: defaultFilters,
      isLoading: false,
      error: null,

      setNiches: (niches) =>
        set({ niches, filteredNiches: applyFilters(niches, get().filters) }),

      setCurrentNiche: (niche) => set({ currentNiche: niche }),

      setFilter: (key, value) => {
        const filters = { ...get().filters, [key]: value }
        set({ filters, filteredNiches: applyFilters(get().niches, filters) })
      },

      resetFilters: () => {
        set({
          filters: defaultFilters,
          filteredNiches: applyFilters(get().niches, defaultFilters),
        })
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    { name: 'niche-store' }
  )
)
