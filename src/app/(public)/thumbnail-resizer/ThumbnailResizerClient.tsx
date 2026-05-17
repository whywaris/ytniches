'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ImageIcon, Download, Upload, RefreshCw } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'

interface Preset {
  label: string
  width: number
  height: number
  note?: string
}

const PRESETS: Preset[] = [
  { label: 'Standard Thumbnail', width: 1280, height: 720, note: 'Recommended' },
  { label: 'Small Preview', width: 320, height: 180 },
  { label: 'Medium Preview', width: 640, height: 360 },
  { label: 'Custom', width: 1280, height: 720 },
]

type ResizeMode = 'fill' | 'fit' | 'stretch'

const MODES: { value: ResizeMode; label: string; desc: string }[] = [
  { value: 'fill', label: 'Fill', desc: 'Crop to fill — no letterboxing' },
  { value: 'fit', label: 'Fit', desc: 'Fit inside — may add bars' },
  { value: 'stretch', label: 'Stretch', desc: 'Stretch to fit — may distort' },
]

const RELATED_TOOLS = [
  {
    name: 'YouTube Tag Extractor',
    href: '/tag-extractor',
    description: 'Extract hidden tags from any YouTube video',
  },
  {
    name: 'Watch Time Calculator',
    href: '/watch-time-calculator',
    description: "Calculate when you'll reach 4,000 watch hours",
  },
  {
    name: 'RSS Feed Generator',
    href: '/rss-feed-generator',
    description: 'Get the RSS feed URL for any YouTube channel',
  },
]

const FAQS = [
  {
    q: 'What is the ideal YouTube thumbnail size?',
    a: 'YouTube recommends 1280×720 pixels (16:9 aspect ratio) with a maximum file size of 2 MB. Supported formats are JPG, PNG, GIF, and BMP. The minimum width is 640 pixels. This tool resizes to 1280×720 by default.',
  },
  {
    q: 'What is the difference between Fill, Fit, and Stretch?',
    a: "Fill crops the image to perfectly fill the output dimensions with no empty space — the most common choice for thumbnails. Fit scales the image to fit entirely inside the output, adding colored bars (letterboxing) if the aspect ratios differ. Stretch resizes the image to exactly fill the output, which may distort non-16:9 images.",
  },
  {
    q: 'Does the image get uploaded anywhere?',
    a: 'No. All image processing happens entirely in your browser using the HTML5 Canvas API. Your image is never sent to any server. This means the tool is instant and 100% private.',
  },
  {
    q: 'What file formats are supported?',
    a: 'You can upload JPG, PNG, WebP, GIF (first frame), BMP, or any other format your browser supports as an image. The output is always a PNG file for maximum quality.',
  },
]

function drawImageOnCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  mode: ResizeMode,
  bgColor: string
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const cw = canvas.width
  const ch = canvas.height
  const iw = img.naturalWidth
  const ih = img.naturalHeight

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, cw, ch)

  if (mode === 'stretch') {
    ctx.drawImage(img, 0, 0, cw, ch)
    return
  }

  const canvasRatio = cw / ch
  const imgRatio = iw / ih

  if (mode === 'fill') {
    let sx = 0, sy = 0, sw = iw, sh = ih
    if (imgRatio > canvasRatio) {
      sw = ih * canvasRatio
      sx = (iw - sw) / 2
    } else {
      sh = iw / canvasRatio
      sy = (ih - sh) / 2
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch)
  } else {
    // fit
    let dw = cw, dh = ch, dx = 0, dy = 0
    if (imgRatio > canvasRatio) {
      dh = cw / imgRatio
      dy = (ch - dh) / 2
    } else {
      dw = ch * imgRatio
      dx = (cw - dw) / 2
    }
    ctx.drawImage(img, dx, dy, dw, dh)
  }
}

export function ThumbnailResizerClient() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null)
  const [presetIndex, setPresetIndex] = useState(0)
  const [customW, setCustomW] = useState(1280)
  const [customH, setCustomH] = useState(720)
  const [mode, setMode] = useState<ResizeMode>('fill')
  const [bgColor, setBgColor] = useState('#000000')
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isCustom = presetIndex === PRESETS.length - 1
  const outputW = isCustom ? customW : PRESETS[presetIndex].width
  const outputH = isCustom ? customH : PRESETS[presetIndex].height

  const redraw = useCallback(() => {
    if (!imageSrc || !canvasRef.current) return
    const img = new window.Image()
    img.onload = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = outputW
      canvasRef.current.height = outputH
      drawImageOnCanvas(canvasRef.current, img, mode, bgColor)
    }
    img.src = imageSrc
  }, [imageSrc, outputW, outputH, mode, bgColor])

  useEffect(() => {
    redraw()
  }, [redraw])

  function loadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      setImageSrc(src)
      const img = new window.Image()
      img.onload = () => setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight })
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) loadFile(file)
  }

  function handleDownload() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `thumbnail_${outputW}x${outputH}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <ToolLayout
      title="Thumbnail Resizer"
      description="Resize any image to the perfect YouTube thumbnail dimensions (1280×720 px). Fill, fit, or stretch — download as PNG instantly."
      icon={<ImageIcon className="w-6 h-6 text-[#16A34A]" />}
      relatedTools={RELATED_TOOLS}
    >
      <div className="space-y-5">
        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-[20px] p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E0D9CE] hover:border-[#16A34A]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload className="w-8 h-8 text-[#8A7F72] mx-auto mb-3" />
          <p className="font-semibold text-[#1A1612] text-sm mb-1">
            {imageSrc ? 'Click or drag to replace image' : 'Click or drag image here'}
          </p>
          <p className="text-xs text-[#8A7F72]">JPG, PNG, WebP, GIF — max 20 MB</p>
          {originalDims && (
            <p className="text-xs text-[#16A34A] mt-2 font-medium">
              Original: {originalDims.w} × {originalDims.h} px
            </p>
          )}
        </div>

        {imageSrc && (
          <>
            {/* Settings row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preset */}
              <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7F72] mb-3">
                  Output Size
                </label>
                <div className="space-y-2">
                  {PRESETS.map((preset, i) => (
                    <button
                      key={preset.label}
                      onClick={() => setPresetIndex(i)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        presetIndex === i
                          ? 'bg-[#16A34A] text-white font-semibold'
                          : 'bg-[#F5F0E8] text-[#1A1612] hover:bg-[#E0D9CE]'
                      }`}
                    >
                      <span className="font-medium">{preset.label}</span>
                      {!isCustom || i !== PRESETS.length - 1 ? (
                        <span className={`ml-2 text-xs ${presetIndex === i ? 'text-green-100' : 'text-[#8A7F72]'}`}>
                          {preset.width}×{preset.height}
                          {preset.note ? ` · ${preset.note}` : ''}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
                {isCustom && (
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-[#8A7F72] mb-1 block">Width</label>
                      <input
                        type="number"
                        min={1}
                        max={7680}
                        value={customW}
                        onChange={(e) => setCustomW(Math.max(1, parseInt(e.target.value) || 1280))}
                        className="w-full border border-[#E0D9CE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-[#8A7F72] mb-1 block">Height</label>
                      <input
                        type="number"
                        min={1}
                        max={4320}
                        value={customH}
                        onChange={(e) => setCustomH(Math.max(1, parseInt(e.target.value) || 720))}
                        className="w-full border border-[#E0D9CE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mode + color */}
              <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7F72] mb-3">
                    Resize Mode
                  </label>
                  <div className="space-y-2">
                    {MODES.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMode(m.value)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                          mode === m.value
                            ? 'bg-[#16A34A] text-white'
                            : 'bg-[#F5F0E8] text-[#1A1612] hover:bg-[#E0D9CE]'
                        }`}
                      >
                        <span className="text-sm font-medium">{m.label}</span>
                        <span className={`ml-2 text-xs ${mode === m.value ? 'text-green-100' : 'text-[#8A7F72]'}`}>
                          — {m.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {mode === 'fit' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#8A7F72] mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-[#E0D9CE] cursor-pointer p-0.5"
                      />
                      <code className="text-sm text-[#1A1612] font-mono">{bgColor}</code>
                      <button
                        onClick={() => setBgColor('#000000')}
                        className="text-xs text-[#8A7F72] hover:text-[#1A1612]"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas preview */}
            <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8A7F72]">
                    Preview
                  </p>
                  <p className="text-sm font-semibold text-[#1A1612] mt-0.5">
                    {outputW} × {outputH} px
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={redraw}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-[#E0D9CE] rounded-full hover:border-[#1A1612] transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 bg-[#16A34A] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#15803D] transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download PNG
                  </button>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-[#E0D9CE] bg-[#F5F0E8]">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[360px] object-contain"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          </>
        )}

        {/* Tips */}
        <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
          <h2 className="font-display font-bold text-base text-[#1A1612] mb-3">
            YouTube Thumbnail Best Practices
          </h2>
          <ul className="space-y-2">
            {[
              'Use 1280×720 px (16:9) — the official YouTube recommendation',
              'Keep file size under 2 MB for fast loading',
              'Use high contrast text that is readable at small sizes',
              'Include a face when possible — thumbnails with faces get more clicks',
              'Avoid misleading thumbnails — they increase abandonment rate',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-[#8A7F72]">
                <span className="text-[#16A34A] shrink-0 font-bold">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="bg-white border border-[#E0D9CE] rounded-[20px] p-5">
          <h2 className="font-display font-bold text-base text-[#1A1612] mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <details key={i} className="group border-b border-[#F5F0E8] last:border-0 pb-3 last:pb-0">
                <summary className="font-semibold text-[#1A1612] text-sm cursor-pointer list-none flex items-center justify-between gap-3 pt-3 first:pt-0">
                  <span>{item.q}</span>
                  <span className="text-[#8A7F72] shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm text-[#8A7F72] leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
