'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Download, Loader2, AlertCircle, Clipboard, Check, Archive } from 'lucide-react'
import JSZip from 'jszip'

interface ThumbnailItem {
  label: string
  quality: string
  url: string
  width: number
  height: number
  aspect: string
  badge: { text: string; bg: string; color: string }
  fileSize: string | null
}

interface ThumbnailResult {
  videoId: string
  thumbnails: ThumbnailItem[]
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

const BADGE_CONFIG: Record<string, { text: string; bg: string; color: string }> = {
  maxres:  { text: 'HD',  bg: 'bg-[#EBF5EF]', color: 'text-[#2A7A4B]' },
  sd:      { text: 'SD',  bg: 'bg-[#F5F0E8]', color: 'text-[#8A7F72]' },
  hq:      { text: 'HQ',  bg: 'bg-[#EBF4FF]', color: 'text-[#2563EB]' },
  mq:      { text: 'MQ',  bg: 'bg-[#FEF6E8]', color: 'text-[#A06B00]' },
  default: { text: 'SD',  bg: 'bg-[#F5F0E8]', color: 'text-[#8A7F72]' },
}

const ASPECT_MAP: Record<string, string> = {
  maxres: '16/9',
  sd: '4/3',
  hq: '4/3',
  mq: '16/9',
  default: '4/3',
}

export function ThumbnailDownloaderClient() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ThumbnailResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [zipping, setZipping] = useState(false)
  const [zipWarning, setZipWarning] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const fetchThumbnails = useCallback((inputUrl: string) => {
    setError('')
    setResult(null)

    const videoId = extractVideoId(inputUrl.trim())
    if (!videoId) {
      if (inputUrl.trim()) setError('Please enter a valid YouTube video URL')
      return
    }

    setLoading(true)

    const thumbnails: ThumbnailItem[] = [
      { label: 'Max Resolution (1280×720)', quality: 'maxres', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, width: 1280, height: 720, aspect: ASPECT_MAP.maxres, badge: BADGE_CONFIG.maxres, fileSize: null },
      { label: 'SD Quality (640×480)', quality: 'sd', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, width: 640, height: 480, aspect: ASPECT_MAP.sd, badge: BADGE_CONFIG.sd, fileSize: null },
      { label: 'High Quality (480×360)', quality: 'hq', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, width: 480, height: 360, aspect: ASPECT_MAP.hq, badge: BADGE_CONFIG.hq, fileSize: null },
      { label: 'Medium Quality (320×180)', quality: 'mq', url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, width: 320, height: 180, aspect: ASPECT_MAP.mq, badge: BADGE_CONFIG.mq, fileSize: null },
      { label: 'Default (120×90)', quality: 'default', url: `https://img.youtube.com/vi/${videoId}/default.jpg`, width: 120, height: 90, aspect: ASPECT_MAP.default, badge: BADGE_CONFIG.default, fileSize: null },
    ]

    setResult({ videoId, thumbnails })
    setLoading(false)
  }, [])

  // Fetch file sizes after result is set
  useEffect(() => {
    if (!result) return

    async function fetchSizes() {
      const updated = await Promise.all(
        result!.thumbnails.map(async (thumb) => {
          try {
            const res = await fetch(thumb.url, { method: 'HEAD' })
            const contentLength = res.headers.get('content-length')
            if (contentLength) {
              const kb = Math.round(parseInt(contentLength) / 1024)
              return { ...thumb, fileSize: `~${kb} KB` }
            }
          } catch { /* ignore */ }
          return thumb
        })
      )
      setResult(prev => prev ? { ...prev, thumbnails: updated } : null)
    }

    fetchSizes()
  }, [result?.videoId])

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pastedText = e.clipboardData.getData('text')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchThumbnails(pastedText)
    }, 300)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      fetchThumbnails(url)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    fetchThumbnails(url)
  }

  async function handleDownload(thumb: ThumbnailItem) {
    if (!result) return
    setDownloadingId(thumb.quality)

    try {
      const res = await fetch('/api/tools/thumbnail-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: thumb.url, quality: thumb.quality, videoId: result.videoId }),
      })
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `thumbnail-${thumb.quality}-${result.videoId}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch {
      setError('Download failed. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleCopyImage(thumb: ThumbnailItem) {
    if (!result) return
    setCopyError(null)

    // Check clipboard API support
    if (!navigator.clipboard || !window.ClipboardItem) {
      setCopyError('Copy not supported in this browser. Use Download instead.')
      setTimeout(() => setCopyError(null), 4000)
      return
    }

    setCopyingId(thumb.quality)

    try {
      const res = await fetch('/api/tools/thumbnail-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: thumb.url, quality: thumb.quality, videoId: result.videoId }),
      })
      if (!res.ok) throw new Error('Fetch failed')

      const blob = await res.blob()
      // Convert to PNG for clipboard compatibility (some browsers require PNG)
      const pngBlob = new Blob([await blob.arrayBuffer()], { type: 'image/png' })

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob }),
      ])

      setCopiedId(thumb.quality)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      const message = err instanceof Error && err.name === 'NotAllowedError'
        ? 'Allow clipboard access to copy images'
        : 'Copy failed. Try using Download instead.'
      setCopyError(message)
      setTimeout(() => setCopyError(null), 4000)
    } finally {
      setCopyingId(null)
    }
  }

  async function handleDownloadAll() {
    if (!result) return
    setZipping(true)
    setZipWarning(null)

    const zip = new JSZip()
    let successCount = 0
    const total = result.thumbnails.length

    await Promise.all(
      result.thumbnails.map(async (thumb) => {
        try {
          const res = await fetch('/api/tools/thumbnail-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: thumb.url, quality: thumb.quality, videoId: result.videoId }),
          })
          if (!res.ok) return
          const blob = await res.blob()
          zip.file(`thumbnail-${thumb.quality}-${result.videoId}.jpg`, blob)
          successCount++
        } catch { /* skip failed */ }
      })
    )

    if (successCount === 0) {
      setError('All downloads failed. Please try again.')
      setZipping(false)
      return
    }

    if (successCount < total) {
      setZipWarning(`${successCount} of ${total} thumbnails downloaded (some failed)`)
      setTimeout(() => setZipWarning(null), 5000)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const blobUrl = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `thumbnails-${result.videoId}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
    setZipping(false)
  }

  return (
    <div>
      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
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

      {/* Copy error toast */}
      {copyError && (
        <div className="flex items-center gap-2 text-sm text-[#A06B00] bg-[#FEF6E8] border border-[#F5DFA8] rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {copyError}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Download All ZIP button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">5 thumbnails found</p>
            <button
              onClick={handleDownloadAll}
              disabled={zipping}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#E0D9CE] bg-white text-[#1A1612] text-xs font-bold rounded-full hover:border-[#E8402A] hover:text-[#E8402A] transition-colors disabled:opacity-50"
            >
              {zipping ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Preparing ZIP...</>
              ) : (
                <><Archive className="w-3.5 h-3.5" />Download All (ZIP)</>
              )}
            </button>
          </div>

          {/* ZIP warning */}
          {zipWarning && (
            <div className="flex items-center gap-2 text-sm text-[#A06B00] bg-[#FEF6E8] border border-[#F5DFA8] rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {zipWarning}
            </div>
          )}

          {/* Row 1: Full HD — full width */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#1A1612]">Full HD</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF5EF] text-[#2A7A4B]">HD</span>
                <span className="text-xs text-[#8A7F72]">1280 × 720 px{result.thumbnails[0]?.fileSize && ` · ${result.thumbnails[0].fileSize}`}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleCopyImage(result.thumbnails[0])} disabled={copyingId === 'maxres'}
                  className={`text-xs font-bold px-4 py-2 rounded-full border transition-colors disabled:opacity-50 flex items-center gap-1.5 ${copiedId === 'maxres' ? 'bg-[#EBF5EF] border-[#C2E0CE] text-[#2A7A4B]' : 'bg-white border-[#E0D9CE] text-[#1A1612] hover:border-[#E8402A] hover:text-[#E8402A]'}`}>
                  {copyingId === 'maxres' ? <><Loader2 className="w-3 h-3 animate-spin" />Copying...</> : copiedId === 'maxres' ? <><Check className="w-3 h-3" />Copied!</> : <><Clipboard className="w-3 h-3" />Copy</>}
                </button>
                <button onClick={() => handleDownload(result.thumbnails[0])} disabled={downloadingId === 'maxres'}
                  className="bg-[#E8402A] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#c42e2e] transition-colors disabled:opacity-50 flex items-center gap-1.5">
                  {downloadingId === 'maxres' ? <><Loader2 className="w-3 h-3 animate-spin" />Saving...</> : <><Download className="w-3 h-3" />Download</>}
                </button>
              </div>
            </div>
            <img src={result.thumbnails[0]?.url} alt="Full HD thumbnail" width={1280} height={720}
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }} loading="lazy" />
          </div>

          {/* Row 2: SD + HQ — two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SD (640×480) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1A1612]">SD Quality</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#8A7F72]">SD</span>
                  <span className="text-xs text-[#8A7F72]">640 × 480{result.thumbnails[1]?.fileSize && ` · ${result.thumbnails[1].fileSize}`}</span>
                </div>
                <button onClick={() => handleDownload(result.thumbnails[1])} disabled={downloadingId === 'sd'}
                  className="bg-[#E8402A] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#c42e2e] transition-colors disabled:opacity-50 flex items-center gap-1">
                  {downloadingId === 'sd' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                </button>
              </div>
              <img src={result.thumbnails[1]?.url} alt="SD thumbnail" width={640} height={480}
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }} loading="lazy" />
            </div>

            {/* HQ (480×360) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1A1612]">High Quality</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF4FF] text-[#2563EB]">HQ</span>
                  <span className="text-xs text-[#8A7F72]">480 × 360{result.thumbnails[2]?.fileSize && ` · ${result.thumbnails[2].fileSize}`}</span>
                </div>
                <button onClick={() => handleDownload(result.thumbnails[2])} disabled={downloadingId === 'hq'}
                  className="bg-[#E8402A] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#c42e2e] transition-colors disabled:opacity-50 flex items-center gap-1">
                  {downloadingId === 'hq' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                </button>
              </div>
              <img src={result.thumbnails[2]?.url} alt="HQ thumbnail" width={480} height={360}
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }} loading="lazy" />
            </div>
          </div>

          {/* Row 3: MQ + Default — two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MQ (320×180) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1A1612]">Medium Quality</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF6E8] text-[#A06B00]">MQ</span>
                  <span className="text-xs text-[#8A7F72]">320 × 180{result.thumbnails[3]?.fileSize && ` · ${result.thumbnails[3].fileSize}`}</span>
                </div>
                <button onClick={() => handleDownload(result.thumbnails[3])} disabled={downloadingId === 'mq'}
                  className="bg-[#E8402A] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#c42e2e] transition-colors disabled:opacity-50 flex items-center gap-1">
                  {downloadingId === 'mq' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                </button>
              </div>
              <img src={result.thumbnails[3]?.url} alt="MQ thumbnail" width={320} height={180}
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }} loading="lazy" />
            </div>

            {/* Default (120×90) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1A1612]">Default</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F0E8] text-[#8A7F72]">DEF</span>
                  <span className="text-xs text-[#8A7F72]">120 × 90{result.thumbnails[4]?.fileSize && ` · ${result.thumbnails[4].fileSize}`}</span>
                </div>
                <button onClick={() => handleDownload(result.thumbnails[4])} disabled={downloadingId === 'default'}
                  className="bg-[#E8402A] text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-[#c42e2e] transition-colors disabled:opacity-50 flex items-center gap-1">
                  {downloadingId === 'default' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                </button>
              </div>
              <img src={result.thumbnails[4]?.url} alt="Default thumbnail" width={120} height={90}
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }} loading="lazy" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
