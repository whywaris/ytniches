import Link from 'next/link'

export function ThumbnailDownloaderContent() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">

      {/* Introduction */}
      <section className="mb-12">
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          This free YouTube thumbnail downloader lets you save any video thumbnail in seconds — no signup, no watermarks, no limits. Whether you need a high-definition 1280×720 image for a blog post or a quick reference for your own thumbnail design, this tool handles it all from your browser.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          It works on desktop and mobile, supports all five YouTube thumbnail resolutions (including maxresdefault), and even works with YouTube Shorts URLs. Just paste a link and download.
        </p>
        <p className="text-[#8A7F72] text-sm">
          Below, we explain exactly how to use it, what each resolution means, and how to use downloaded thumbnails to improve your own click-through rate.
        </p>
      </section>

      {/* How to Download */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          How to Download a YouTube Thumbnail
        </h2>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Step 1 — Copy the YouTube Video URL
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          On desktop, click the address bar in your browser while watching a YouTube video and copy the full URL. On mobile, tap the Share button below the video and select &ldquo;Copy link.&rdquo;
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          The tool accepts all standard YouTube URL formats: <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">youtube.com/watch?v=VIDEO_ID</code>, <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">youtu.be/VIDEO_ID</code>, and YouTube Shorts URLs like <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">youtube.com/shorts/VIDEO_ID</code>.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Step 2 — Paste and Extract
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          Paste the URL into the input field above. The tool automatically detects the 11-character video ID and fetches all available thumbnail resolutions from YouTube&apos;s CDN.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          If no HD thumbnail exists for a particular video (common with older uploads), the tool will still show all available lower resolutions. You&apos;ll always get at least the default 120×90 thumbnail.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Step 3 — Choose Your Resolution and Download
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          You&apos;ll see up to five thumbnail options. Click the download button on whichever resolution you need. The image saves directly to your device as a JPG file.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed">
          For blog posts and presentations, use maxresdefault (1280×720). For social media posts, hqdefault (480×360) is usually enough. For quick reference or small previews, the default 120×90 works fine.
        </p>
      </section>

      {/* All Thumbnail Sizes */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          All YouTube Thumbnail Sizes Explained
        </h2>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Max Resolution — 1280×720 (maxresdefault)
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          This is the official YouTube thumbnail spec: 1280×720 pixels, 16:9 aspect ratio, maximum 2MB file size, in JPG, PNG, or GIF format. It&apos;s the highest quality thumbnail YouTube stores and the one you should download for HD use cases like blog embeds, reference boards, or design analysis.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Important: not every video has a maxresdefault thumbnail. Older videos, auto-generated thumbnails, and some unlisted content may only have lower resolutions available.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          SD, HQ, MQ, and Default — When Each Is Used
        </h3>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Size</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr><td className="px-4 py-3 text-[#1A1612] font-medium">maxresdefault</td><td className="px-4 py-3 text-[#8A7F72]">1280×720</td><td className="px-4 py-3 text-[#8A7F72]">HD downloads, blog embeds, design reference</td></tr>
              <tr><td className="px-4 py-3 text-[#1A1612] font-medium">sddefault</td><td className="px-4 py-3 text-[#8A7F72]">640×480</td><td className="px-4 py-3 text-[#8A7F72]">Standard fallback when HD unavailable</td></tr>
              <tr><td className="px-4 py-3 text-[#1A1612] font-medium">hqdefault</td><td className="px-4 py-3 text-[#8A7F72]">480×360</td><td className="px-4 py-3 text-[#8A7F72]">Social media posts, quick shares</td></tr>
              <tr><td className="px-4 py-3 text-[#1A1612] font-medium">mqdefault</td><td className="px-4 py-3 text-[#8A7F72]">320×180</td><td className="px-4 py-3 text-[#8A7F72]">Medium quality previews</td></tr>
              <tr><td className="px-4 py-3 text-[#1A1612] font-medium">default</td><td className="px-4 py-3 text-[#8A7F72]">120×90</td><td className="px-4 py-3 text-[#8A7F72]">Always available, small previews</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Why Some Videos Don&apos;t Have HD Thumbnails
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed">
          Videos uploaded before 2009, videos with auto-generated thumbnails (where YouTube picks a frame instead of the creator uploading a custom image), and very old or unlisted videos often lack the maxresdefault file. In these cases, use sddefault or hqdefault as your fallback.
        </p>
      </section>

      {/* YouTube Shorts */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Does This Work for YouTube Shorts?
        </h2>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          How Shorts Thumbnails Differ
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          YouTube Shorts are vertical 9:16 videos. Their thumbnails are typically auto-generated from a frame in the video rather than a custom upload. This YouTube thumbnail downloader works with Shorts URLs — just paste the <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">youtube.com/shorts/VIDEO_ID</code> link.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed">
          Note that most Shorts thumbnails won&apos;t have a maxresdefault version since creators rarely upload custom thumbnails for Shorts. The hqdefault or sddefault versions will usually be available.
        </p>
      </section>

      {/* Direct URL Method */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          How to Get a YouTube Thumbnail URL Without a Tool
        </h2>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          The Direct YouTube CDN URL Structure
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Every YouTube thumbnail is hosted on a predictable CDN URL. If you know the video ID (the 11-character string after <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">v=</code> in the URL), you can construct the thumbnail URL directly:
        </p>

        <div className="bg-[#1A1612] rounded-xl p-4 mb-4 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://i.ytimg.com/vi/<span className="text-[#E8402A]">VIDEO_ID</span>/<span className="text-[#E8402A]">maxresdefault</span>.jpg
          </code>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          Replace <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">VIDEO_ID</code> with the 11-character ID from any YouTube URL. Replace <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">maxresdefault</code> with any of: sddefault, hqdefault, mqdefault, or default.
        </p>

        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          <strong>Example:</strong> For the video <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">youtube.com/watch?v=dQw4w9WgXcQ</code>, the HD thumbnail URL is:
        </p>

        <div className="bg-[#1A1612] rounded-xl p-4 mb-4 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg
          </code>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed">
          <strong>Fallback chain:</strong> If maxresdefault returns a 404, try sddefault → hqdefault → mqdefault → default. The &ldquo;default&rdquo; version is always available for every public video.
        </p>
      </section>

      {/* CTR Improvement */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          How to Use Downloaded Thumbnails to Improve Your Own CTR
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          This thumbnail downloader isn&apos;t just for saving images — it&apos;s a research tool. Download thumbnails from top-performing videos in your niche, analyze what works, and apply those patterns to your own designs.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          What Patterns Top Creators Repeat in Every Thumbnail
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          After downloading dozens of thumbnails from high-view-count videos, you&apos;ll notice consistent patterns: high contrast between the subject and background, human faces showing strong emotion (curiosity, shock, excitement), bold 2–4 word text overlays with maximum readability, and a single clear focal point with no visual clutter.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Industry benchmarks: entertainment channels average 4–8% click-through rate, while education channels typically see 2–4%. If you&apos;re below these numbers, your thumbnails are the first thing to fix.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Build a Competitor Thumbnail Research Folder
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Download 10–15 thumbnails from the top creators in your niche. Sort them by view count — the highest-viewed videos have proven CTR performance. Look for repeated color palettes, text placement patterns, and face positioning. Use the{' '}
          <Link href="/niches" className="text-[#E8402A] hover:underline font-medium">YTNiches niche library</Link>
          {' '}to identify which categories and content styles dominate your space.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Apply the 4 Design Levers
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li><strong>Contrast</strong> — use a background color that makes your subject pop against it</li>
          <li><strong>Faces</strong> — eyes and emotional expressions drive instinctive clicks</li>
          <li><strong>Text</strong> — 3 words maximum, high contrast, readable even at 100px wide</li>
          <li><strong>Focal point</strong> — the viewer&apos;s eye should have exactly ONE thing to land on</li>
        </ol>
        <p className="text-[#1A1612] text-base leading-relaxed">
          Need help finding the right niche for your next video?{' '}
          <Link href="/niches" className="text-[#E8402A] hover:underline font-medium">
            Browse the niche library →
          </Link>
        </p>
      </section>

      {/* Legal */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Is Downloading YouTube Thumbnails Legal?
        </h2>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Personal &amp; Educational Use — Generally Fair Use
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          Downloading YouTube thumbnails for personal reference, creative research, or educational purposes is generally accepted. You are not bypassing a paywall — thumbnails are publicly accessible images served by YouTube&apos;s CDN to every visitor. Saving them locally is standard digital behavior, similar to saving any public web image.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Reference:{' '}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline">
            YouTube Terms of Service
          </a>
          {' '}— Section 5 covers content usage guidelines.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          What You Cannot Do
        </h3>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed">
          <li>Cannot republish downloaded thumbnails as your own original work</li>
          <li>Cannot use them commercially without the creator&apos;s explicit permission</li>
          <li>Cannot use them to mislead, defame, or misrepresent the original creator</li>
          <li>When in doubt, always credit the original creator</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Frequently Asked Questions About YouTube Thumbnail Downloader
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I download a YouTube thumbnail?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Copy the YouTube video URL, paste it into the tool above, and click the download button on your preferred resolution. The image saves directly to your device.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Is it legal to download YouTube thumbnails?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">For personal reference and research, yes. Thumbnails are publicly accessible images. You cannot republish them as your own work or use them commercially without permission from the original creator.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">What size is a YouTube thumbnail in HD?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">The HD YouTube thumbnail (maxresdefault) is 1280×720 pixels with a 16:9 aspect ratio. This is the maximum resolution YouTube stores for custom-uploaded thumbnails.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Can I download thumbnails from YouTube Shorts?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes. Paste the Shorts URL (youtube.com/shorts/VIDEO_ID) into the tool. Note that most Shorts use auto-generated thumbnails from a video frame rather than custom uploads.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Why is no HD thumbnail available for some videos?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Videos uploaded before 2009, videos with auto-generated thumbnails, and some unlisted videos don&apos;t have a maxresdefault file. Use sddefault (640×480) or hqdefault (480×360) as alternatives.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I get the maxresdefault thumbnail URL directly?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Use the pattern: https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg — replace VIDEO_ID with the 11-character ID from the YouTube URL. If it returns a 404, try sddefault or hqdefault instead.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Can I use downloaded YouTube thumbnails for my own content?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">You can use them as design reference and inspiration. You cannot copy them directly for your own videos or commercial use. Create original thumbnails inspired by the patterns you observe.</p>
          </div>
        </div>
      </section>

      {/* Conclusion + CTA */}
      <section>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          This free YouTube thumbnail downloader gives you instant access to any video&apos;s thumbnail in all available resolutions — HD, SD, HQ, MQ, and default. It works for regular videos and YouTube Shorts, requires no signup, and adds no watermarks. Use it to save thumbnails for research, analyze what top creators do differently, and improve your own click-through rate.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/niches" className="inline-flex items-center justify-center px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors">
            Browse the Niche Library →
          </Link>
          <Link href="/tools" className="inline-flex items-center justify-center px-6 py-3 border border-[#E0D9CE] text-[#1A1612] rounded-full text-sm font-semibold hover:bg-[#F5F0E8] transition-colors">
            Explore All Free YouTube Tools →
          </Link>
        </div>
      </section>

    </article>
  )
}
