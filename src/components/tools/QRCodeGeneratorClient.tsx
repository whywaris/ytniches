'use client'

import { useState } from 'react'
import { Download, QrCode } from 'lucide-react'

export function QRCodeGeneratorClient() {
  const [url, setUrl] = useState('')
  const [size, setSize] = useState('300')

  const isValidUrl = url.includes('youtube.com') || url.includes('youtu.be')

  // Using Google Charts QR API (no dependency needed)
  const qrUrl = isValidUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`
    : ''

  return (
    <div>
      {/* Input */}
      <div className="bg-card border border-border rounded-[20px] p-6 mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">YouTube URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube video or channel URL..."
          className="w-full border-[1.5px] border-border rounded-full px-5 py-3 text-sm text-foreground bg-card focus:outline-none focus:border-accent mb-4"
        />

        <div>
          <label className="block text-xs text-muted mb-1">QR Code Size</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:border-accent"
          >
            <option value="200">200 × 200 px</option>
            <option value="300">300 × 300 px</option>
            <option value="400">400 × 400 px</option>
            <option value="500">500 × 500 px</option>
          </select>
        </div>
      </div>

      {/* Result */}
      {isValidUrl && (
        <div className="bg-card border border-border rounded-[20px] p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-accent" />
            <p className="font-semibold text-foreground text-sm">Your QR Code</p>
          </div>
          <div className="inline-block bg-white p-4 rounded-xl border border-border mb-4">
            <img
              src={qrUrl}
              alt="YouTube QR Code"
              width={parseInt(size)}
              height={parseInt(size)}
              className="max-w-full h-auto"
            />
          </div>
          <div>
            <a
              href={qrUrl}
              download={`youtube-qr-${size}.png`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-accent-hover transition-colors"
            >
              <Download className="w-4 h-4" /> Download QR Code
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
