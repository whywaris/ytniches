import { NextResponse } from 'next/server'
import { extractVideoId, checkRateLimit } from '@/lib/tools/youtube'

export const runtime = 'nodejs'

interface YoutubeVideoItem {
  snippet: {
    title: string
    channelTitle: string
    tags?: string[]
    thumbnails: {
      default?: { url: string }
      medium?: { url: string }
    }
  }
  statistics: {
    viewCount?: string
  }
}

interface YoutubeApiResponse {
  items?: YoutubeVideoItem[]
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
    const body = (await request.json()) as { videoUrl?: string }
    const videoId = extractVideoId(body.videoUrl ?? '')
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please paste a valid video link.' },
        { status: 400 }
      )
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    const res = await fetch(apiUrl, { next: { revalidate: 300 } })
    const data = (await res.json()) as YoutubeApiResponse

    if (!data.items?.length) {
      return NextResponse.json(
        { error: 'Video not found. Check the URL and try again.' },
        { status: 404 }
      )
    }

    const video = data.items[0]
    return NextResponse.json({
      tags: (video.snippet.tags ?? []) as string[],
      videoTitle: video.snippet.title,
      channelName: video.snippet.channelTitle,
      viewCount: parseInt(video.statistics.viewCount ?? '0').toLocaleString(),
      thumbnailUrl:
        video.snippet.thumbnails.medium?.url ??
        video.snippet.thumbnails.default?.url ??
        '',
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
