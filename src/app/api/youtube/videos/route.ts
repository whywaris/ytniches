import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { YouTubeVideoData } from '@/types'

export const runtime = 'nodejs'

const CACHE_DAYS = 7
const YT_BASE = 'https://www.googleapis.com/youtube/v3'

export async function POST(request: NextRequest) {
  let body: { videoIds?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { videoIds } = body
  if (!Array.isArray(videoIds) || videoIds.length === 0) {
    return NextResponse.json({ error: 'videoIds must be a non-empty array' }, { status: 400 })
  }

  const ids = videoIds.slice(0, 50).map((id) => id.trim()).filter(Boolean)
  const supabase = createAdminClient()

  // Check Supabase cache (entries within 7 days)
  const cutoff = new Date(Date.now() - CACHE_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data: cached } = await supabase
    .from('youtube_cache')
    .select('video_id, data')
    .in('video_id', ids)
    .gte('cached_at', cutoff)

  const resultMap = new Map<string, YouTubeVideoData>()
  for (const row of cached ?? []) {
    resultMap.set(row.video_id, row.data as YouTubeVideoData)
  }

  const uncachedIds = ids.filter((id) => !resultMap.has(id))

  if (uncachedIds.length > 0) {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
    }

    // Fetch video details (snippet + statistics + contentDetails)
    const videoUrl =
      `${YT_BASE}/videos?part=snippet,statistics,contentDetails` +
      `&id=${uncachedIds.join(',')}&key=${apiKey}`
    const videoRes = await fetch(videoUrl)
    if (!videoRes.ok) {
      return NextResponse.json({ error: 'YouTube API error fetching videos' }, { status: 502 })
    }
    const videoJson = await videoRes.json()
    const videoItems: any[] = videoJson.items ?? []

    // Collect unique channel IDs for subscriber lookup
    const channelIds = Array.from(new Set(videoItems.map((v) => v.snippet.channelId as string)))
    const subscriberMap = new Map<string, string>()

    if (channelIds.length > 0) {
      const chanUrl =
        `${YT_BASE}/channels?part=statistics&id=${channelIds.join(',')}&key=${apiKey}`
      const chanRes = await fetch(chanUrl)
      if (chanRes.ok) {
        const chanJson = await chanRes.json()
        for (const ch of chanJson.items ?? []) {
          subscriberMap.set(ch.id, ch.statistics?.subscriberCount ?? '0')
        }
      }
    }

    const toCache: Array<{ video_id: string; data: YouTubeVideoData; cached_at: string }> = []

    for (const item of videoItems) {
      const videoId: string = item.id
      const thumb =
        item.snippet.thumbnails?.maxres?.url ||
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

      const entry: YouTubeVideoData = {
        video_id: videoId,
        title: item.snippet.title,
        channel_title: item.snippet.channelTitle,
        channel_id: item.snippet.channelId,
        thumbnail_url: thumb,
        view_count: item.statistics?.viewCount ?? '0',
        like_count: item.statistics?.likeCount ?? '0',
        duration: item.contentDetails?.duration ?? 'PT0S',
        subscriber_count: subscriberMap.get(item.snippet.channelId) ?? '0',
        published_at: item.snippet.publishedAt,
      }

      resultMap.set(videoId, entry)
      toCache.push({ video_id: videoId, data: entry, cached_at: new Date().toISOString() })
    }

    if (toCache.length > 0) {
      await supabase
        .from('youtube_cache')
        .upsert(toCache, { onConflict: 'video_id' })
    }
  }

  const videos = ids.map((id) => resultMap.get(id)).filter(Boolean) as YouTubeVideoData[]
  return NextResponse.json({ videos })
}
