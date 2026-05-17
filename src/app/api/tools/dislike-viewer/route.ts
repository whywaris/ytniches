import { NextResponse } from 'next/server'
import { extractVideoId, checkRateLimit } from '@/lib/tools/youtube'

export const runtime = 'nodejs'

interface DislikeApiResponse {
  likes: number
  dislikes: number
  rating: number
  viewCount: number
}

interface YoutubeVideoItem {
  snippet: {
    title: string
    channelTitle: string
    publishedAt: string
    thumbnails: { medium?: { url: string }; default?: { url: string } }
  }
  statistics: {
    viewCount?: string
    likeCount?: string
    commentCount?: string
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

    const [dislikeRes, ytRes] = await Promise.all([
      fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`, {
        next: { revalidate: 300 },
      }),
      fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
        { next: { revalidate: 300 } }
      ),
    ])

    if (!dislikeRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch dislike data. Please try again.' },
        { status: 502 }
      )
    }

    if (!ytRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video data from YouTube. Please try again.' },
        { status: 502 }
      )
    }

    const dislikeData = (await dislikeRes.json()) as DislikeApiResponse
    const ytData = (await ytRes.json()) as YoutubeApiResponse

    if (!ytData.items?.length) {
      return NextResponse.json(
        { error: 'Video not found. Check the URL and try again.' },
        { status: 404 }
      )
    }

    const video = ytData.items[0]

    return NextResponse.json({
      videoTitle: video.snippet.title,
      channelName: video.snippet.channelTitle,
      thumbnailUrl:
        video.snippet.thumbnails.medium?.url ??
        video.snippet.thumbnails.default?.url ??
        '',
      publishedAt: video.snippet.publishedAt,
      likes: dislikeData.likes,
      dislikes: dislikeData.dislikes,
      rating: dislikeData.rating,
      viewCount: parseInt(video.statistics.viewCount ?? '0', 10),
      likeCount: parseInt(video.statistics.likeCount ?? '0', 10),
      commentCount: parseInt(video.statistics.commentCount ?? '0', 10),
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
