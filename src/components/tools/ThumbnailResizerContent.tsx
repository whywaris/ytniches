import Link from 'next/link'

export function ThumbnailResizerContent() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">

      {/* H2: The Correct YouTube Thumbnail Size in 2026 */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          The Correct YouTube Thumbnail Size in 2026
        </h2>

        {/* Featured Snippet Target */}
        <div className="border-l-4 border-[#16A34A] bg-[#F0FDF4] rounded-r-xl p-4 mb-6">
          <p className="text-[#1A1612] text-base leading-relaxed">
            The correct YouTube thumbnail size is <strong>1280×720 pixels</strong> at a <strong>16:9 aspect ratio</strong>,
            with a maximum file size of 2MB. For best results on retina displays and large screens, design at 1920×1080
            and export at 1280×720. YouTube accepts JPG, PNG, WebP, and non-animated GIF formats.
          </p>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]"></th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Standard Video Thumbnail</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">YouTube Shorts Thumbnail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Recommended dimensions</td>
                <td className="px-4 py-3 text-[#8A7F72]">1920×1080px</td>
                <td className="px-4 py-3 text-[#8A7F72]">1080×1920px</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Minimum dimensions</td>
                <td className="px-4 py-3 text-[#8A7F72]">1280×720px</td>
                <td className="px-4 py-3 text-[#8A7F72]">1080×1920px</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Aspect ratio</td>
                <td className="px-4 py-3 text-[#8A7F72]">16:9 (horizontal)</td>
                <td className="px-4 py-3 text-[#8A7F72]">9:16 (vertical)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Maximum file size</td>
                <td className="px-4 py-3 text-[#8A7F72]">2MB</td>
                <td className="px-4 py-3 text-[#8A7F72]">2MB</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Accepted formats</td>
                <td className="px-4 py-3 text-[#8A7F72]">JPG, PNG, WebP, GIF</td>
                <td className="px-4 py-3 text-[#8A7F72]">JPG, PNG, WebP, GIF</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Where it displays</td>
                <td className="px-4 py-3 text-[#8A7F72]">Video page, search, browse</td>
                <td className="px-4 py-3 text-[#8A7F72]">Shorts feed, Shorts page</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          <a href="https://support.google.com/youtube/answer/72431" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">
            YouTube&apos;s official thumbnail requirements →
          </a>
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Standard Videos — 1280×720 vs 1920×1080: Which Should You Use?
        </h3>
        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>1920×1080 is YouTube&apos;s recommended upload resolution — it displays sharply on 4K TVs, Chromecast, and retina laptop screens</li>
          <li>1280×720 is the minimum — sufficient for desktop browsers and mobile, but may appear slightly softer on premium displays</li>
          <li>The file size difference between 1280×720 and 1920×1080 at 85% JPG quality is typically 50–150KB — negligible, both under 2MB</li>
        </ul>
        <p className="text-[#1A1612] text-base leading-relaxed mb-8">
          <strong>Recommendation:</strong> design at 1920×1080, export at 85% JPG quality, verify the file is under 2MB, upload. This YouTube thumbnail resizer handles both sizes with a single preset selection.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          YouTube Shorts Thumbnail — 1080×1920px (9:16 Vertical)
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          YouTube Shorts use a 9:16 vertical format — the opposite aspect ratio of standard videos. If you upload a
          16:9 thumbnail to a Short, YouTube will crop it to fit the vertical player, cutting off the sides.
        </p>
        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Shorts thumbnail dimensions: 1080px wide × 1920px tall (9:16 vertical)</li>
          <li>Shorts thumbnails display in the Shorts feed as vertical cards — different from the horizontal thumbnails in regular search</li>
          <li>If you don&apos;t set a custom Shorts thumbnail, YouTube selects a frame from the video</li>
          <li>The thumbnail resizer above includes a &ldquo;YouTube Shorts (1080×1920)&rdquo; preset — use it for Shorts content</li>
        </ul>
        <p className="text-[#1A1612] text-base leading-relaxed mb-8">
          For channels that mix regular videos and Shorts, always check which preset you&apos;re selecting — the YouTube thumbnail dimensions are completely different.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          File Size Limit — Why 2MB Matters More Than You Think
        </h3>

        {/* Warning Callout */}
        <div className="bg-[#FEF6E8] border border-[#F5D78E] rounded-xl p-4 mb-4">
          <p className="text-[#1A1612] text-sm leading-relaxed">
            <span className="font-bold">⚠️ Files approaching 2MB trigger aggressive recompression by YouTube&apos;s CDN.</span> The
            practical target is under 1.8MB. Export at 85% JPG quality and verify file size before uploading.
          </p>
        </div>

        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>YouTube&apos;s 2MB limit is a hard cap — but the damage happens before you hit it</li>
          <li><strong>Optimal target: export under 1.8MB</strong> to avoid YouTube&apos;s recompression triggering</li>
          <li>At 85% JPG quality, a 1920×1080 thumbnail typically compresses to 300–700KB — well under the safe threshold</li>
          <li>PNG files of the same resolution often exceed 2MB — use JPG or WebP for photographic thumbnails with faces and gradients; reserve PNG for thumbnails with hard-edged text and simple graphics</li>
        </ul>
      </section>

      {/* H2: How to Resize a YouTube Thumbnail */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          How to Resize a YouTube Thumbnail — Step by Step
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          The YouTube thumbnail resizer above handles this in under 60 seconds. Here&apos;s exactly what each step does.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Using This Thumbnail Resizer (4 Steps)
        </h3>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>Step 1: Upload your image</strong></p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Click the upload area or drag and drop your file</li>
          <li>Accepts: JPG, PNG, WebP, non-animated GIF</li>
          <li>No file size limit on upload — the tool handles oversized files and exports at the correct size</li>
          <li>Your image is processed entirely in your browser — no server upload, no data stored</li>
        </ul>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>Step 2: Select your size preset</strong></p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li><strong>YouTube Thumbnail (1280×720)</strong> — standard videos, correct 16:9 ratio</li>
          <li><strong>YouTube Shorts (1080×1920)</strong> — vertical Shorts content, correct 9:16 ratio</li>
          <li><strong>Custom size</strong> — enter any pixel dimensions manually</li>
        </ul>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>Step 3: Choose Fill, Fit, or Stretch mode</strong></p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          This step is where most free tools get it wrong — here&apos;s what each mode does to your image:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Mode</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">What It Does</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">When to Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Fill (Crop)</td>
                <td className="px-4 py-3 text-[#8A7F72]">Fills the entire canvas, crops edges</td>
                <td className="px-4 py-3 text-[#8A7F72]">When subject is centered and cropping edges is acceptable</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Fit (Letterbox)</td>
                <td className="px-4 py-3 text-[#8A7F72]">Fits entire image with bars on sides/top</td>
                <td className="px-4 py-3 text-[#8A7F72]">When you need to keep the full image visible</td>
              </tr>
              <tr className="bg-[#FEF6E8]/50">
                <td className="px-4 py-3 text-[#A06B00] font-medium">Stretch</td>
                <td className="px-4 py-3 text-[#8A7F72]">Distorts to fill canvas</td>
                <td className="px-4 py-3 text-[#A06B00]">Almost never — use Fill or Fit instead</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>Step 4: Set quality and download</strong></p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-6">
          <li>Set JPG quality to 85–90% — this balances visual quality and file size within YouTube&apos;s 2MB limit</li>
          <li>PNG export: use for thumbnails with text-heavy graphics; expect larger file sizes</li>
          <li>WebP export: smallest file size, highest quality — supported by YouTube; less compatible with some design tools</li>
          <li>Click Download — file saves to your device with the correct dimensions</li>
        </ul>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Resizing in Canva (If You&apos;re Already Designing There)
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Open your design in{' '}
            <a href="https://www.canva.com" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">Canva</a>
            {' '}→ click &ldquo;Resize&rdquo; (top toolbar)</li>
          <li>Select &ldquo;Custom size&rdquo; → enter 1280 × 720 → click &ldquo;Resize&rdquo;</li>
          <li>Download as JPG → set quality to 80–85%</li>
          <li>Check file size before uploading — Canva JPG exports often land between 200–600KB, well under 2MB</li>
        </ol>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Resizing in Photoshop (For Advanced Users)
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Image → Image Size → set Width to 1920, Height to 1080 (or 1280×720), Resolution 72dpi</li>
          <li>File → Export → Export As → JPG → Quality 85% → verify file size in the dialog</li>
          <li>If file exceeds 1.8MB: reduce quality to 80% or use Save for Web (File → Export → Save for Web) with the file size target visible</li>
        </ol>
      </section>

      {/* H2: Why Your YouTube Thumbnail Looks Blurry */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Why Your YouTube Thumbnail Looks Blurry (and How to Fix It)
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          YouTube thumbnails look blurry for three main reasons: the file exceeded 2MB and YouTube recompressed it
          aggressively, the image was uploaded at the wrong aspect ratio and got auto-cropped, or the original image
          resolution was too low. Here&apos;s how to diagnose and fix each one.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Cause 1 — File Over 2MB (YouTube Recompressed It)
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          When you upload a thumbnail that exceeds 2MB, YouTube&apos;s CDN automatically recompresses it to bring it
          below the limit. This recompression is aggressive — it introduces visible JPEG artifacts, color banding, and
          a general softness that no amount of re-sharpening will fix after the fact.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>The fix:</strong></p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-6">
          <li>Download your thumbnail and check its file size before uploading</li>
          <li>If over 2MB: re-export at 80–85% JPG quality in your design tool, or use the resizer above and adjust the quality slider down until the exported file is under 1.8MB</li>
          <li>Re-upload the corrected file in YouTube Studio — YouTube applies the new file immediately</li>
        </ul>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Cause 2 — Wrong Aspect Ratio (YouTube Auto-Cropped)
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          If you upload a 4:3 image (1024×768) or a square image (1080×1080) as a YouTube thumbnail, YouTube crops it
          to fit the 16:9 display — cutting off parts of your design. The resulting thumbnail appears zoomed in and
          off-center, not blurry from compression but blurry from unexpected cropping.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>The fix:</strong></p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-6">
          <li>Always design and export at 16:9 (1280×720 or 1920×1080)</li>
          <li>Use the resizer above with the YouTube Thumbnail preset — it outputs 16:9 automatically regardless of your source image dimensions</li>
        </ul>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Cause 3 — The Red/Warm Gradient Compression Problem
        </h3>

        {/* Info Callout */}
        <div className="bg-[#EBF4FF] border border-[#BFDBFE] rounded-xl p-4 mb-4">
          <p className="text-[#1A1612] text-sm leading-relaxed">
            <span className="font-bold">ℹ️ This is the most underreported cause of thumbnail quality issues</span> — and
            it&apos;s specific to how YouTube compresses color data.
          </p>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          YouTube uses 4:2:0 chroma subsampling when compressing uploaded thumbnails. This compression method reduces
          color resolution at half the rate of brightness resolution — meaning areas with high color complexity (warm
          reds, orange gradients, skin tones against colorful backgrounds) lose detail faster than areas with neutral tones.
        </p>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>What this looks like in practice:</strong></p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Red text on a white background: text edges may appear slightly blurred or have a colored fringe</li>
          <li>Orange/yellow gradients: banding appears at gradient transitions that wasn&apos;t in your original file</li>
          <li>Skin tones + busy colored backgrounds: skin colors shift slightly orange or magenta</li>
          <li>Blue/cool backgrounds: compress significantly better than warm-toned backgrounds</li>
        </ul>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>The fix:</strong></p>
        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>If your thumbnail relies heavily on red/warm gradients, design with slightly more contrast than you think you need — 4:2:0 compression reduces perceived contrast in warm color ranges</li>
          <li>Export as PNG instead of JPG for thumbnails with hard-edged red text — PNG uses lossless compression and avoids chroma subsampling entirely (but verify under 2MB)</li>
          <li>When exporting JPG, use the highest quality setting that stays under 1.8MB — lower JPG quality amplifies chroma subsampling artifacts in warm color ranges</li>
        </ul>
      </section>

      {/* H2: JPG vs PNG vs WebP */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          JPG vs PNG vs WebP — Which Format Should You Use?
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          For most YouTube thumbnails: JPG at 85% quality. For thumbnails with hard-edged text and graphics on
          solid/transparent backgrounds: PNG. For smallest possible file size with no quality loss: WebP.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">Format</th>
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">Best For</th>
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">File Size</th>
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">YouTube</th>
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">Trade-off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr className="bg-[#F0FDF4]/50">
                <td className="px-3 py-3 text-[#16A34A] font-medium">JPG</td>
                <td className="px-3 py-3 text-[#8A7F72]">Faces, photos, gradients</td>
                <td className="px-3 py-3 text-[#8A7F72]">Small (200–700KB)</td>
                <td className="px-3 py-3 text-[#16A34A] font-medium">Yes</td>
                <td className="px-3 py-3 text-[#8A7F72]">Lossy — artifacts at low quality</td>
              </tr>
              <tr className="bg-[#FEF6E8]/30">
                <td className="px-3 py-3 text-[#A06B00] font-medium">PNG</td>
                <td className="px-3 py-3 text-[#8A7F72]">Text-heavy, hard edges, transparency</td>
                <td className="px-3 py-3 text-[#8A7F72]">Large (1–4MB)</td>
                <td className="px-3 py-3 text-[#16A34A] font-medium">Yes</td>
                <td className="px-3 py-3 text-[#8A7F72]">Often exceeds 2MB — compress first</td>
              </tr>
              <tr className="bg-[#EBF4FF]/30">
                <td className="px-3 py-3 text-[#2563EB] font-medium">WebP</td>
                <td className="px-3 py-3 text-[#8A7F72]">Everything — modern format</td>
                <td className="px-3 py-3 text-[#8A7F72]">Smallest (100–400KB)</td>
                <td className="px-3 py-3 text-[#16A34A] font-medium">Yes</td>
                <td className="px-3 py-3 text-[#8A7F72]">Less supported in older design tools</td>
              </tr>
              <tr>
                <td className="px-3 py-3 text-[#8A7F72] font-medium">GIF</td>
                <td className="px-3 py-3 text-[#8A7F72]">Rarely — non-animated only</td>
                <td className="px-3 py-3 text-[#8A7F72]">Varies</td>
                <td className="px-3 py-3 text-[#16A34A] font-medium">Yes (non-animated)</td>
                <td className="px-3 py-3 text-[#8A7F72]">Limited color range — avoid for photos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          <strong>The case for JPG (most thumbnails):</strong> A 1920×1080 JPG at 85% quality is visually
          indistinguishable from the original at normal viewing distances and on standard displays. File size lands
          at 300–600KB — well under YouTube&apos;s 2MB limit. This is the correct choice for thumbnails featuring
          faces, lifestyle photography, or colorful backgrounds.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          <strong>When PNG makes sense:</strong> If your thumbnail is primarily text, logos, or graphics with hard
          edges, PNG preserves those edges without the color fringing JPG introduces. The trade-off: PNG thumbnails
          frequently exceed 2MB. Always check file size before uploading — use{' '}
          <a href="https://squoosh.app" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">
            Squoosh
          </a>
          {' '}to compress oversized PNG thumbnails before uploading.
        </p>
      </section>

      {/* H2: YouTube Thumbnail Best Practices */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          YouTube Thumbnail Best Practices That Actually Improve CTR
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Correct dimensions are the technical requirement. These practices are what separate thumbnails that get
          clicked from ones that get scrolled past.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          The Arm&apos;s Length Test — Design for Mobile First
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          YouTube&apos;s mobile feed shows thumbnails at approximately 120×90 pixels — roughly the size of a postage
          stamp. Before uploading any thumbnail, zoom out until it appears at that size on your screen and ask: is the
          main subject still clear? Can you read the text?
        </p>
        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-6">
          <li>Text must be readable at 120px wide — minimum 40–60px font size in your full-resolution design</li>
          <li>Limit text to 3–5 words maximum — more text becomes unreadable at thumbnail size</li>
          <li>Keep the subject (face, product, object) in the center 60% of the canvas — edges get clipped by YouTube&apos;s rounded corners on mobile</li>
          <li>Use high contrast between your subject and background — low-contrast thumbnails disappear in a fast-scrolling feed</li>
        </ul>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          The Safe Zone — Where to Place Text and Faces
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          YouTube applies rounded corners to thumbnails in the mobile feed and some desktop contexts. Important
          elements placed in the corners may be partially obscured.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Keep all text and critical elements within the central 80% of the canvas — leave a 10% margin on all sides</li>
          <li>For 1280×720 thumbnails: safe zone is approximately 128px inset from each edge</li>
          <li>For 1920×1080 thumbnails: safe zone is approximately 192px inset from each edge</li>
        </ul>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          <strong>Dark mode consideration:</strong> YouTube displays thumbnails on both white (default) and dark mode
          backgrounds. Thumbnails with white or very light edges become invisible against the white mobile background.
          Always check your thumbnail against both a white and dark background before uploading.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Color Compression Tip — Cool Tones Compress Better
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          As covered in the blurry thumbnail section, YouTube&apos;s 4:2:0 chroma subsampling compresses warm colors
          more aggressively than cool colors. Thumbnails that use blue, teal, or green color palettes often appear
          sharper after YouTube&apos;s compression than equivalent designs using red, orange, or warm yellow palettes.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          This doesn&apos;t mean avoid warm colors — it means: if sharpness is critical, design with slightly higher
          contrast in warm color areas to compensate for what compression will reduce.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Does Changing Your Thumbnail Affect Views?
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          Yes — but carefully. Changing a thumbnail on a video that&apos;s already performing well can reset
          YouTube&apos;s A/B testing signals and temporarily reduce impressions while the algorithm re-evaluates
          the new thumbnail.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>When changing a thumbnail helps:</strong></p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Video is underperforming (low CTR below 3%) despite good watch time — new thumbnail can dramatically improve CTR</li>
          <li>Thumbnail is factually outdated (shows wrong year, old branding)</li>
          <li>Video is getting search impressions but few clicks — thumbnail is likely the problem</li>
        </ul>
        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>When NOT to change it:</strong></p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Video is actively growing and performing above your channel average — don&apos;t interrupt what&apos;s working</li>
          <li>Video was recently uploaded (under 30 days) — YouTube hasn&apos;t finished testing yet</li>
        </ul>
      </section>

      {/* H2: Frequently Asked Questions */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              What is the best size for a YouTube thumbnail?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              The best YouTube thumbnail size is 1920×1080 pixels (16:9 aspect ratio) for the sharpest display on all
              screens, with a minimum of 1280×720 pixels. Keep the file under 2MB — YouTube accepts JPG, PNG, WebP, and
              non-animated GIF. The resizer above outputs both sizes in a single click.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              How do I resize a thumbnail for YouTube for free?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Use the free YouTube thumbnail resizer at the top of this page — upload your image, select the YouTube
              Thumbnail (1280×720) preset, set JPG quality to 85%, and download. No login, no watermark, no upload limit.
              Processed entirely in your browser — your image is never sent to a server.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              Why does my YouTube thumbnail look blurry?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Three causes: (1) File exceeded 2MB and YouTube recompressed it — re-export at 85% JPG quality under 1.8MB.
              (2) Wrong aspect ratio uploaded — use exactly 16:9 (1280×720 or 1920×1080). (3) Red/warm gradient chroma
              compression artifact from YouTube&apos;s 4:2:0 encoding — increase contrast in warm color areas or export as PNG.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              What is the file size limit for YouTube thumbnails?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              2MB is the hard limit. However, files approaching 2MB trigger aggressive recompression by YouTube&apos;s CDN,
              which degrades quality. The practical target is under 1.8MB. At 85% JPG quality, a 1920×1080 thumbnail
              typically exports at 300–600KB — well within the safe range.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              Can I use PNG for YouTube thumbnails?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Yes — YouTube accepts PNG thumbnails. PNG is best for thumbnails with hard-edged text, logos, or graphics
              where JPG&apos;s compression artifacts would be visible. The trade-off: PNG thumbnails at 1920×1080 often
              exceed 2MB and must be compressed before uploading. Use JPG at 85% quality for photographic thumbnails.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              What aspect ratio should YouTube thumbnails be?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              16:9 (widescreen horizontal) for standard videos. 9:16 (vertical) for YouTube Shorts. If you upload a
              thumbnail with the wrong aspect ratio — 4:3, 1:1 square, or any other ratio — YouTube crops it to fit,
              cutting off parts of your design. Always verify the ratio before uploading.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              What size thumbnail does YouTube Shorts need?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              YouTube Shorts thumbnails should be 1080×1920 pixels (9:16 vertical aspect ratio) — the inverse of standard
              video thumbnails. If you upload a standard 16:9 horizontal thumbnail to a Short, YouTube crops the sides to
              fit the vertical player. The resizer above includes a YouTube Shorts preset for one-click resizing to 1080×1920.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              Does changing a thumbnail affect views?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Yes — but it depends on timing. Changing a thumbnail on an actively growing video resets YouTube&apos;s
              impression testing signals and can temporarily reduce reach. For underperforming videos (CTR below 3%
              despite good watch time), a new thumbnail can meaningfully increase clicks. Avoid changing thumbnails on
              videos that are already performing above your channel average.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <div className="space-y-2 mb-6">
          <p className="text-[#1A1612] text-base leading-relaxed flex items-start gap-2">
            <span className="text-[#16A34A] font-bold">✓</span>
            <span>Standard YouTube thumbnail: 1280×720px minimum, 1920×1080px recommended, 16:9 aspect ratio, under 2MB</span>
          </p>
          <p className="text-[#1A1612] text-base leading-relaxed flex items-start gap-2">
            <span className="text-[#16A34A] font-bold">✓</span>
            <span>YouTube Shorts thumbnail: 1080×1920px, 9:16 vertical, under 2MB</span>
          </p>
          <p className="text-[#1A1612] text-base leading-relaxed flex items-start gap-2">
            <span className="text-[#16A34A] font-bold">✓</span>
            <span>Best format: JPG at 85% quality for photos/faces; PNG for text-heavy graphics</span>
          </p>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          The most common mistake: uploading a great-looking file that exceeds 2MB — YouTube&apos;s recompression will
          silently degrade it. Use this free YouTube thumbnail resizer to export at the correct dimensions and verify
          file size before uploading.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Need thumbnail inspiration?{' '}
          <Link href="/youtube-thumbnail-download" className="text-[#E8402A] hover:underline font-medium">Download any YouTube thumbnail</Link>
          {' '}to study what top creators are doing, then{' '}
          <Link href="/tag-extractor" className="text-[#E8402A] hover:underline font-medium">optimize your video tags</Link>
          {' '}for maximum reach.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/tools" className="inline-flex items-center justify-center px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors">
            Explore All Free YouTube Tools →
          </Link>
          <Link href="/niches" className="inline-flex items-center justify-center px-6 py-3 border border-[#E0D9CE] text-[#1A1612] rounded-full text-sm font-semibold hover:bg-[#F5F0E8] transition-colors">
            Research Your YouTube Niche →
          </Link>
        </div>
      </section>

    </article>
  )
}
