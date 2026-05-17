import { NextResponse } from 'next/server'
import { extractVideoId, checkRateLimit } from '@/lib/tools/youtube'

export const runtime = 'nodejs'

interface CommentSnippet {
  textDisplay: string
  authorDisplayName: string
  authorProfileImageUrl: string
  authorChannelUrl: string
  likeCount: number
  publishedAt: string
}

interface CommentThread {
  snippet: {
    topLevelComment: {
      snippet: CommentSnippet
    }
  }
}

interface CommentThreadsResponse {
  items?: CommentThread[]
  nextPageToken?: string
  pageInfo?: { totalResults?: number }
  error?: { message: string }
}

interface YoutubeVideoItem {
  snippet: { title: string; channelTitle: string }
  statistics: { commentCount?: string; viewCount?: string }
}

interface YoutubeApiResponse {
  items?: YoutubeVideoItem[]
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip, 5)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.' },
      { status: 429 }
    )
  }

  try {
    const body = (await request.json()) as { videoUrl?: string; filterText?: string }
    const videoId = extractVideoId(body.videoUrl ?? '')
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please paste a valid video link.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    const filterText = body.filterText?.trim().toLowerCase() ?? ''

    // Fetch video info and comments in parallel
    const [videoRes, commentsRes] = await Promise.all([
      fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
      ),
      fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&key=${apiKey}`
      ),
    ])

    const videoData = (await videoRes.json()) as YoutubeApiResponse
    const commentsData = (await commentsRes.json()) as CommentThreadsResponse

    if (commentsData.error) {
      const msg = commentsData.error.message ?? ''
      if (msg.includes('disabled')) {
        return NextResponse.json(
          { error: 'Comments are disabled on this video.' },
          { status: 422 }
        )
      }
      return NextResponse.json(
        { error: 'Could not fetch comments. The video may be private or restricted.' },
        { status: 502 }
      )
    }

    if (!videoData.items?.length) {
      return NextResponse.json({ error: 'Video not found.' }, { status: 404 })
    }

    const video = videoData.items[0]
    let comments = (commentsData.items ?? []).map((item) => item.snippet.topLevelComment.snippet)

    // Fetch a second page for more randomness if available
    if (commentsData.nextPageToken && comments.length >= 50) {
      try {
        const page2Res = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&pageToken=${commentsData.nextPageToken}&key=${apiKey}`
        )
        const page2Data = (await page2Res.json()) as CommentThreadsResponse
        const page2Comments = (page2Data.items ?? []).map(
          (item) => item.snippet.topLevelComment.snippet
        )
        comments = [...comments, ...page2Comments]
      } catch {
        // Ignore — first page is enough
      }
    }

    if (comments.length === 0) {
      return NextResponse.json({ error: 'This video has no comments yet.' }, { status: 422 })
    }

    // Apply text filter if provided
    if (filterText) {
      comments = comments.filter((c) =>
        c.textDisplay.toLowerCase().includes(filterText)
      )
      if (comments.length === 0) {
        return NextResponse.json(
          { error: `No comments matched "${body.filterText}".` },
          { status: 422 }
        )
      }
    }

    // Pick random winner
    const winner = comments[Math.floor(Math.random() * comments.length)]

    return NextResponse.json({
      winner: {
        text: winner.textDisplay,
        author: winner.authorDisplayName,
        profileImage: winner.authorProfileImageUrl,
        channelUrl: winner.authorChannelUrl,
        likes: winner.likeCount,
        publishedAt: winner.publishedAt,
      },
      totalComments: parseInt(video.statistics.commentCount ?? '0', 10),
      poolSize: comments.length,
      videoTitle: video.snippet.title,
      channelName: video.snippet.channelTitle,
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
