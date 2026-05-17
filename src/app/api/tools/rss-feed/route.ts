import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/tools/youtube'

export const runtime = 'nodejs'

interface YoutubeChannelItem {
  id: string
  snippet: {
    title: string
    description: string
    customUrl?: string
    thumbnails: { default?: { url: string }; medium?: { url: string } }
    publishedAt: string
  }
  statistics: {
    subscriberCount?: string
    videoCount?: string
  }
}

interface YoutubeChannelResponse {
  items?: YoutubeChannelItem[]
}

interface YoutubeSearchResponse {
  items?: { snippet: { channelId: string; channelTitle: string } }[]
}

function extractChannelIdentifier(input: string): { type: 'id' | 'handle' | 'username'; value: string } | null {
  const trimmed = input.trim()

  // Direct channel ID (UCxxxxxxxx...)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
    return { type: 'id', value: trimmed }
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)

    // /channel/UCxxx
    const channelMatch = url.pathname.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/)
    if (channelMatch) return { type: 'id', value: channelMatch[1] }

    // /@handle or /c/username or /user/username
    const handleMatch = url.pathname.match(/^\/@([^/]+)/)
    if (handleMatch) return { type: 'handle', value: handleMatch[1] }

    const cMatch = url.pathname.match(/^\/c\/([^/]+)/)
    if (cMatch) return { type: 'handle', value: cMatch[1] }

    const userMatch = url.pathname.match(/^\/user\/([^/]+)/)
    if (userMatch) return { type: 'username', value: userMatch[1] }

    // bare path like youtube.com/mkbhd
    const bare = url.pathname.slice(1).split('/')[0]
    if (bare && bare !== 'watch' && bare !== 'shorts') {
      return { type: 'handle', value: bare }
    }
  } catch {
    // Not a URL — treat as handle/username
    const clean = trimmed.replace(/^@/, '')
    if (clean) return { type: 'handle', value: clean }
  }

  return null
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.' },
      { status: 429 }
    )
  }

  try {
    const body = (await request.json()) as { channelInput?: string }
    const channelInput = body.channelInput?.trim() ?? ''
    if (!channelInput) {
      return NextResponse.json({ error: 'Please enter a channel URL or ID.' }, { status: 400 })
    }

    const identifier = extractChannelIdentifier(channelInput)
    if (!identifier) {
      return NextResponse.json(
        { error: 'Could not parse channel. Try pasting the full channel URL.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    let channelId = ''
    let channelData: YoutubeChannelItem | null = null

    if (identifier.type === 'id') {
      channelId = identifier.value
    } else {
      // Search for channel by handle/username
      const searchParam =
        identifier.type === 'username'
          ? `forUsername=${encodeURIComponent(identifier.value)}`
          : `q=${encodeURIComponent(identifier.value)}&type=channel&maxResults=1`

      if (identifier.type === 'username') {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(identifier.value)}&key=${apiKey}`,
          { next: { revalidate: 3600 } }
        )
        const data = (await res.json()) as YoutubeChannelResponse
        channelId = data.items?.[0]?.id ?? ''
      }

      if (!channelId) {
        // Fall back to search
        void searchParam
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(identifier.value)}&type=channel&maxResults=1&key=${apiKey}`,
          { next: { revalidate: 3600 } }
        )
        const data = (await res.json()) as YoutubeSearchResponse
        channelId = data.items?.[0]?.snippet?.channelId ?? ''
      }
    }

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel not found. Try pasting the full YouTube channel URL.' },
        { status: 404 }
      )
    }

    // Fetch channel details
    const detailRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    const detailData = (await detailRes.json()) as YoutubeChannelResponse
    channelData = detailData.items?.[0] ?? null

    if (!channelData) {
      return NextResponse.json({ error: 'Channel not found.' }, { status: 404 })
    }

    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`

    return NextResponse.json({
      channelId,
      rssUrl,
      channelTitle: channelData.snippet.title,
      channelDescription: channelData.snippet.description,
      channelHandle: channelData.snippet.customUrl ?? null,
      thumbnailUrl:
        channelData.snippet.thumbnails.medium?.url ??
        channelData.snippet.thumbnails.default?.url ??
        '',
      subscriberCount: parseInt(channelData.statistics.subscriberCount ?? '0', 10),
      videoCount: parseInt(channelData.statistics.videoCount ?? '0', 10),
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
