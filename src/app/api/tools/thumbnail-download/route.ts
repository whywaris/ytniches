import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { url, quality, videoId } = await request.json()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 })
    }

    const buffer = await response.arrayBuffer()
    const filename = `thumbnail-${quality || 'hd'}-${videoId || 'video'}.jpg`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch thumbnail' }, { status: 500 })
  }
}
