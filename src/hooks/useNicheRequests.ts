'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NicheRequest, RequestSortBy, RequestFilter } from '@/types'

export function useNicheRequests() {
  const [requests, setRequests] = useState<NicheRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<RequestSortBy>('votes')
  const [filterStatus, setFilterStatus] = useState<RequestFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  async function fetchRequests() {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      let query = supabase.from('niche_requests').select('*')

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      if (sortBy === 'votes') query = query.order('votes_count', { ascending: false })
      else if (sortBy === 'newest') query = query.order('created_at', { ascending: false })
      else query = query.order('created_at', { ascending: true })

      const { data: requestsData, error: fetchError } = await query
      if (fetchError) throw fetchError
      if (!requestsData) return

      if (user) {
        const { data: userVotes } = await supabase
          .from('niche_request_votes')
          .select('request_id')
          .eq('user_id', user.id)

        const votedIds = new Set(userVotes?.map(v => v.request_id) ?? [])
        setRequests(requestsData.map(r => ({ ...r, has_voted: votedIds.has(r.id) })))
      } else {
        setRequests(requestsData)
      }
    } catch {
      setError('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  async function submitRequest(data: {
    title: string
    description: string
    category: string
    reason: string
  }): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not logged in' }

    const { error } = await supabase.from('niche_requests').insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      category: data.category,
      reason: data.reason || null,
      status: 'pending',
      votes_count: 1,
    })

    if (error) {
      if (error.message.includes('Request limit')) {
        return { success: false, error: 'You can only submit 3 requests per month.' }
      }
      return { success: false, error: error.message }
    }

    await fetchRequests()
    return { success: true }
  }

  async function toggleVote(requestId: string): Promise<void> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const request = requests.find(r => r.id === requestId)
    if (!request) return

    // Optimistic update
    setRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, has_voted: !r.has_voted, votes_count: r.has_voted ? r.votes_count - 1 : r.votes_count + 1 }
          : r
      )
    )

    if (request.has_voted) {
      await supabase
        .from('niche_request_votes')
        .delete()
        .eq('request_id', requestId)
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('niche_request_votes')
        .insert({ request_id: requestId, user_id: user.id })
    }
  }

  async function getUserRequests(): Promise<NicheRequest[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('niche_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return data ?? []
  }

  async function deleteRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()
    const { error } = await supabase
      .from('niche_requests')
      .delete()
      .eq('id', requestId)

    if (error) return { success: false, error: error.message }
    setRequests(prev => prev.filter(r => r.id !== requestId))
    return { success: true }
  }

  async function getMonthlyRequestCount(): Promise<number> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('niche_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo)

    return count ?? 0
  }

  const filteredRequests = useMemo(
    () =>
      requests.filter(r =>
        searchQuery
          ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(searchQuery.toLowerCase())
          : true
      ),
    [requests, searchQuery]
  )

  useEffect(() => {
    fetchRequests()
  }, [sortBy, filterStatus])

  // Realtime vote count sync
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('niche_requests_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'niche_requests' },
        (payload) => {
          if (payload.new) {
            setRequests(prev =>
              prev.map(r =>
                r.id === payload.new.id
                  ? { ...r, votes_count: (payload.new as NicheRequest).votes_count, status: (payload.new as NicheRequest).status }
                  : r
              )
            )
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return {
    requests: filteredRequests,
    isLoading,
    error,
    sortBy,
    setSortBy,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    submitRequest,
    toggleVote,
    getUserRequests,
    deleteRequest,
    getMonthlyRequestCount,
    refetch: fetchRequests,
  }
}
