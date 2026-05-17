'use client'

import { useState } from 'react'
import { Copy, Check, Code } from 'lucide-react'

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

export function EmbedCodeGeneratorClient() {
  const [url, setUrl] = useState('')
  const [width, setWidth] = useState('560')
  const [height, setHeight] = useState('315')
  const [autoplay, setAutoplay] = useState(false)
  const [loop, setLoop] = useState(false)
  const [mute, setMute] = useState(false)
  const [controls, setControls] = useState(true)
  const [startTime, setStartTime] = useState('')
  const [responsive, setResponsive] = useState(true)
  const [copied, setCopied] = useState(false)

  const videoId = extractVideoId(url)

  function generateCode() {
    if (!videoId) return ''

    const params: string[] = []
    if (autoplay) params.push('autoplay=1')
    if (loop) params.push(`loop=1&playlist=${videoId}`)
    if (mute) params.push('mute=1')
    if (!controls) params.push('controls=0')
    if (startTime) params.push(`start=${startTime}`)

    const query = params.length > 0 ? '?' + params.join('&') : ''
    const src = `https://www.youtube.com/embed/${videoId}${query}`

    if (responsive) {
      return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe src="${src}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>`
    }

    return `<iframe width="${width}" height="${height}" src="${src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  }

  const embedCode = generateCode()

  function handleCopy() {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* URL Input */}
      <div className="bg-card border border-border rounded-[20px] p-6 mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Video URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube video URL..."
          className="w-full border-[1.5px] border-border rounded-full px-5 py-3 text-sm text-foreground bg-card focus:outline-none focus:border-accent"
        />
      </div>

      {/* Options */}
      <div className="bg-card border border-border rounded-[20px] p-6 mb-6">
        <h2 className="font-semibold text-foreground text-sm mb-4">Options</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Autoplay', checked: autoplay, onChange: setAutoplay },
            { label: 'Loop', checked: loop, onChange: setLoop },
            { label: 'Mute', checked: mute, onChange: setMute },
            { label: 'Show Controls', checked: controls, onChange: setControls },
            { label: 'Responsive', checked: responsive, onChange: setResponsive },
          ].map((opt) => (
            <label key={opt.label} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.onChange(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {!responsive && (
            <>
              <div>
                <label className="block text-xs text-muted mb-1">Width (px)</label>
                <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Height (px)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:border-accent" />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs text-muted mb-1">Start time (sec)</label>
            <input type="number" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="0" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:border-accent" />
          </div>
        </div>
      </div>

      {/* Output */}
      {videoId && embedCode && (
        <div className="bg-card border border-border rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Code className="w-4 h-4" /> Embed Code
            </p>
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-xs text-foreground bg-secondary rounded-xl p-4 whitespace-pre-wrap font-mono overflow-x-auto">
            {embedCode}
          </pre>

          {/* Preview */}
          <div className="mt-4">
            <p className="text-xs text-muted mb-2">Preview:</p>
            <div className="rounded-xl overflow-hidden border border-border" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
