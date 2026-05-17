'use client'

import { useState } from 'react'
import { Download, Loader2, AlertCircle } from 'lucide-react'

interface ThumbnailResult {
  videoId: string
  title: string
  thumbnails: { label: string; url: string; width: number; height: number }[]
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function ThumbnailDownloaderClient() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ThumbnailResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)

    const videoId = extractVideoId(url.trim())
    if (!videoId) {
      setError('Please enter a valid YouTube video URL.')
      return
    }

    setLoading(true)

    // YouTube thumbnails follow a predictable URL pattern
    const thumbnails = [
      { label: 'Max Resolution (1280×720)', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, width: 1280, height: 720 },
      { label: 'SD Quality (640×480)', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, width: 640, height: 480 },
      { label: 'High Quality (480×360)', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, width: 480, height: 360 },
      { label: 'Medium Quality (320×180)', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, width: 320, height: 180 },
      { label: 'Default (120×90)', url: `https://img.youtube.com/vi/${videoId}/default.jpg`, width: 120, height: 90 },
    ]

    setResult({ videoId, title: `Video: ${videoId}`, thumbnails })
    setLoading(false)
  }

  return (
    <div>
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube video URL here..."
          className="flex-1 border-[1.5px] border-border rounded-full px-5 py-3.5 text-sm text-foreground bg-card focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="bg-accent text-white font-bold text-sm px-7 py-3.5 rounded-full hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Get Thumbnails
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.thumbnails.map((thumb) => (
            <div
              key={thumb.label}
              className="bg-card border border-border rounded-[20px] p-4 flex flex-col sm:flex-row items-center gap-4"
            >
              <img
                src={thumb.url}
                alt={thumb.label}
                className="w-full sm:w-48 rounded-xl object-cover"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{thumb.label}</p>
                <p className="text-xs text-muted mt-0.5">{thumb.width} × {thumb.height} px</p>
              </div>
              <a
                href={thumb.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="shrink-0 bg-accent text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-accent-hover transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
