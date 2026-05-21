import Link from 'next/link'

function Code({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1A1612] rounded-lg p-4 mb-4 overflow-x-auto">
      <pre className="text-sm text-[#F5F0E8] font-mono whitespace-pre">{children}</pre>
    </div>
  )
}

export function EmbedCodeGeneratorContent() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">

      {/* How to Use */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">How to Use This YouTube Embed Code Generator</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">Getting your embed code takes under 30 seconds.</p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Step 1 — Paste Your YouTube Video URL</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Copy from the browser address bar or Share → Copy Link. Accepts: youtube.com/watch?v=, youtu.be/, youtube.com/playlist?list=, youtube.com/shorts/. Does NOT work with private videos or videos with embedding disabled.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Step 2 — Customize the Player Options</h3>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li><strong>Autoplay</strong> — starts video automatically (must be muted)</li>
          <li><strong>Mute</strong> — required for autoplay to function</li>
          <li><strong>Loop</strong> — replays endlessly when finished</li>
          <li><strong>Controls</strong> — show or hide player controls</li>
          <li><strong>Start/End time</strong> — set exact seconds</li>
          <li><strong>Responsive</strong> — scales to any screen width</li>
          <li><strong>Privacy-enhanced mode</strong> — uses youtube-nocookie.com (GDPR)</li>
        </ul>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Step 3 — Copy and Paste</h3>
        <p className="text-[#1A1612] text-base leading-relaxed">
          Click &ldquo;Copy Code&rdquo; and paste into your website&apos;s HTML editor — WordPress Custom HTML block, Squarespace Code Block, Wix HTML Element, or raw HTML file. Never paste into a visual editor&apos;s text area.
        </p>
      </section>

      {/* Parameters */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">YouTube Embed Code Parameters Explained</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">YouTube&apos;s iFrame embed accepts over 20 parameters. Here are the ones that actually matter — with current, accurate behavior.</p>

        <div className="bg-[#EBF4FF] border border-[#B8D4FE] rounded-xl px-5 py-4 mb-6">
          <p className="text-sm text-[#2563EB]">📋 Reference: All parameters documented at{' '}
            <a href="https://developers.google.com/youtube/player_parameters" target="_blank" rel="noopener noreferrer" className="underline">developers.google.com/youtube/player_parameters</a>
          </p>
        </div>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">autoplay — Does It Actually Work?</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          Autoplay with sound is blocked by all major browsers unless the user has previously interacted with the site. The only reliable way: <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">autoplay=1&amp;mute=1</code> — muted autoplay works across all browsers.
        </p>
        <Code>{`<iframe src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1"
  allow="autoplay; encrypted-media" allowfullscreen>
</iframe>`}</Code>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">rel=0 — What It Actually Does Now</h3>
        <div className="bg-[#FEF6E8] border border-[#F5DFA8] rounded-xl px-5 py-4 mb-4">
          <p className="text-sm text-[#A06B00]"><strong>⚠️ Most articles say rel=0 removes related videos entirely. This has not been true since September 2018.</strong></p>
        </div>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          <strong>Before 2018:</strong> rel=0 prevented ANY related videos at the end. <strong>Since September 2018:</strong> rel=0 shows related videos from the <em>same channel only</em> — not from other channels. There is no parameter that completely removes the related videos endscreen. Any guide saying otherwise is outdated.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">loop, controls, mute, modestbranding</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          <strong>loop=1:</strong> Requires adding <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">playlist=VIDEO_ID</code> with the same ID — without this, loop does nothing on single videos.
        </p>
        <Code>{`?loop=1&playlist=VIDEO_ID`}</Code>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          <strong>controls=0:</strong> Hides player controls. <strong>mute=1:</strong> Starts muted, required for autoplay. <strong>modestbranding=1:</strong> Reduces YouTube branding (effect limited since 2023, may be deprecated).
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">start &amp; end — Custom Time Range</h3>
        <Code>{`<!-- Embed from 1:30 to 3:00 -->
<iframe src="https://www.youtube.com/embed/VIDEO_ID?start=90&end=180"
  allowfullscreen>
</iframe>`}</Code>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Privacy-Enhanced Mode (GDPR Compliance)</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          Using <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">youtube-nocookie.com</code> prevents YouTube from tracking viewers with cookies until they click play — important for GDPR compliance.
        </p>
        <Code>{`<!-- Privacy-enhanced: no cookies until play -->
<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID">
</iframe>`}</Code>

        {/* Parameter Table */}
        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3 mt-6">Complete Parameter Reference</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden min-w-[550px]">
            <thead><tr className="bg-[#F5F0E8]">
              <th className="px-3 py-2 text-left font-semibold text-[#1A1612]">Parameter</th>
              <th className="px-3 py-2 text-left font-semibold text-[#1A1612]">Values</th>
              <th className="px-3 py-2 text-left font-semibold text-[#1A1612]">Default</th>
              <th className="px-3 py-2 text-left font-semibold text-[#1A1612]">What It Does</th>
            </tr></thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr><td className="px-3 py-2">autoplay</td><td className="px-3 py-2">0, 1</td><td className="px-3 py-2">0</td><td className="px-3 py-2 text-[#8A7F72]">Auto-starts video. Must use with mute=1</td></tr>
              <tr><td className="px-3 py-2">mute</td><td className="px-3 py-2">0, 1</td><td className="px-3 py-2">0</td><td className="px-3 py-2 text-[#8A7F72]">Starts muted. Required for autoplay</td></tr>
              <tr><td className="px-3 py-2">loop</td><td className="px-3 py-2">0, 1</td><td className="px-3 py-2">0</td><td className="px-3 py-2 text-[#8A7F72]">Loops video. Requires playlist=VIDEO_ID</td></tr>
              <tr><td className="px-3 py-2">controls</td><td className="px-3 py-2">0, 1</td><td className="px-3 py-2">1</td><td className="px-3 py-2 text-[#8A7F72]">Shows/hides player controls</td></tr>
              <tr className="bg-[#FEF6E8]/50"><td className="px-3 py-2 font-medium">rel</td><td className="px-3 py-2">0, 1</td><td className="px-3 py-2">1</td><td className="px-3 py-2 text-[#A06B00]">0 = same-channel related only (NOT zero related)</td></tr>
              <tr><td className="px-3 py-2">start</td><td className="px-3 py-2">integer</td><td className="px-3 py-2">0</td><td className="px-3 py-2 text-[#8A7F72]">Start time in seconds</td></tr>
              <tr><td className="px-3 py-2">end</td><td className="px-3 py-2">integer</td><td className="px-3 py-2">—</td><td className="px-3 py-2 text-[#8A7F72]">End time in seconds</td></tr>
              <tr><td className="px-3 py-2">fs</td><td className="px-3 py-2">0, 1</td><td className="px-3 py-2">1</td><td className="px-3 py-2 text-[#8A7F72]">Enables/disables fullscreen button</td></tr>
              <tr><td className="px-3 py-2">cc_load_policy</td><td className="px-3 py-2">1</td><td className="px-3 py-2">—</td><td className="px-3 py-2 text-[#8A7F72]">Forces captions on by default</td></tr>
              <tr><td className="px-3 py-2">playsinline</td><td className="px-3 py-2">0, 1</td><td className="px-3 py-2">0</td><td className="px-3 py-2 text-[#8A7F72]">iOS: 1 = plays inline, 0 = fullscreen</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Responsive */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">How to Make Your YouTube Embed Responsive</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">YouTube&apos;s default embed outputs fixed 560×315 pixels. On mobile, this overflows or appears tiny. Two methods to fix it:</p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Method 1 — CSS Wrapper (Works Everywhere)</h3>
        <p className="text-[#1A1612] text-sm mb-2">CSS:</p>
        <Code>{`.video-wrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
}
.video-wrapper iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}`}</Code>
        <p className="text-[#1A1612] text-sm mb-2">HTML:</p>
        <Code>{`<div class="video-wrapper">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID"
    frameborder="0" allowfullscreen>
  </iframe>
</div>`}</Code>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Method 2 — Modern CSS aspect-ratio</h3>
        <Code>{`iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
}`}</Code>
        <p className="text-[#8A7F72] text-sm">Cleaner, no wrapper needed. Not supported in IE11 — fine for all modern browsers in 2026.</p>
      </section>

      {/* Playlists & Shorts */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">How to Embed YouTube Playlists and Shorts</h2>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Embedding a YouTube Playlist</h3>
        <Code>{`<iframe src="https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID"
  allowfullscreen>
</iframe>`}</Code>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">Find your Playlist ID in the URL after <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">list=</code>. The embed starts at the first video with a playlist navigation panel.</p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Embedding YouTube Shorts — Vertical 9:16</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">Shorts are 9:16 vertical. Standard 16:9 wrappers show heavy black bars. Use a vertical wrapper instead:</p>
        <Code>{`.shorts-wrapper {
  position: relative;
  padding-bottom: 177.78%; /* 9:16 ratio */
  height: 0;
  overflow: hidden;
  max-width: 315px;
}
.shorts-wrapper iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}`}</Code>
        <Code>{`<div class="shorts-wrapper">
  <iframe src="https://www.youtube.com/embed/SHORTS_VIDEO_ID"
    allowfullscreen>
  </iframe>
</div>`}</Code>
        <p className="text-[#8A7F72] text-sm">Use max-width: 315px to prevent Shorts from stretching too wide on desktop.</p>
      </section>

      {/* Platforms */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">How to Embed YouTube Videos on Different Platforms</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-[#2563EB] bg-white rounded-r-xl px-5 py-4">
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-1">WordPress</h3>
            <p className="text-sm text-[#8A7F72]">Use Custom HTML block — NOT the YouTube embed block. Gutenberg: + → Custom HTML → paste code. Classic Editor: switch to Text tab. The YouTube block doesn&apos;t support custom parameters.</p>
          </div>
          <div className="border-l-4 border-[#1A1612] bg-white rounded-r-xl px-5 py-4">
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-1">Squarespace</h3>
            <p className="text-sm text-[#8A7F72]">Add Block → Code Block (not Embed Block). Paste iFrame code → Apply.</p>
          </div>
          <div className="border-l-4 border-[#0EA5E9] bg-white rounded-r-xl px-5 py-4">
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-1">Wix</h3>
            <p className="text-sm text-[#8A7F72]">Add Elements → Embed & Social → Embed HTML. Note: Wix sandboxes HTML — autoplay may not work reliably.</p>
          </div>
          <div className="border-l-4 border-[#0891B2] bg-white rounded-r-xl px-5 py-4">
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-1">Webflow</h3>
            <p className="text-sm text-[#8A7F72]">Add Embed element → double-click → paste code → Save. Use parent div for responsive sizing.</p>
          </div>
          <div className="border-l-4 border-[#8A7F72] bg-white rounded-r-xl px-5 py-4">
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-1">HTML / Static Sites</h3>
            <p className="text-sm text-[#8A7F72]">Paste directly into your HTML file. Apply responsive CSS via your stylesheet.</p>
          </div>
        </div>
      </section>

      {/* SEO */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">Does Embedding YouTube Videos Help SEO?</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">Yes — with one significant caveat most guides ignore.</p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Time on Page and Engagement</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Visitors watching embedded videos spend more time on your page — a positive engagement signal. For YouTube creators, embedding your own videos on your website also increases view count and watch time within YouTube.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Core Web Vitals — The Hidden Cost</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          A single YouTube iFrame loads 11–19 additional HTTP requests, adding 500KB–1MB to page weight before anyone plays anything. If above the fold, it becomes the LCP element — slowing your score significantly.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          <strong>Solution — Facade / Lazy Loading:</strong> Render a static thumbnail instead of the full iFrame. Load the iFrame only when the visitor clicks play. See{' '}
          <a href="https://github.com/paulirish/lite-youtube-embed" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline">lite-youtube-embed</a> for the best implementation.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Lazy Loading with loading=&quot;lazy&quot;</h3>
        <Code>{`<iframe src="https://www.youtube.com/embed/VIDEO_ID"
  loading="lazy" allowfullscreen>
</iframe>`}</Code>
        <p className="text-[#8A7F72] text-sm">Defers iFrame until near viewport. Simpler than facade pattern but less effective — still loads full iFrame on scroll.</p>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">YouTube Embed Code Troubleshooting</h2>
        <div className="space-y-4">
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4">
            <p className="text-sm font-bold text-[#1A1612] mb-1">Black Screen or Error</p>
            <p className="text-sm text-[#8A7F72]">Video is private, embedding disabled by creator, or browser extension blocking content. Test in incognito.</p>
          </div>
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4">
            <p className="text-sm font-bold text-[#1A1612] mb-1">Autoplay Not Working</p>
            <p className="text-sm text-[#8A7F72]">Add mute=1 alongside autoplay=1. Also add allow=&quot;autoplay; encrypted-media&quot; to the iFrame tag.</p>
          </div>
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4">
            <p className="text-sm font-bold text-[#1A1612] mb-1">&ldquo;Video Unavailable&rdquo;</p>
            <p className="text-sm text-[#8A7F72]">Creator disabled embedding. No workaround exists.</p>
          </div>
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4">
            <p className="text-sm font-bold text-[#1A1612] mb-1">Breaks on Mobile</p>
            <p className="text-sm text-[#8A7F72]">Fixed width/height attributes. Apply responsive CSS wrapper. Add playsinline=1 for iOS inline playback.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I get the embed code for a YouTube video?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Paste the URL into the generator above for custom code. Or on YouTube: Share → Embed for basic default code. Or build manually: youtube.com/embed/VIDEO_ID with parameters as query strings.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I make a YouTube embed responsive?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Wrap the iFrame in a div with position: relative; padding-bottom: 56.25%; height: 0. Set iFrame to position: absolute; width: 100%; height: 100%. Or use CSS aspect-ratio: 16 / 9 with width: 100%.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I embed without showing related videos?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Add rel=0 to your embed URL. Since September 2018, this shows related videos from the same channel only — not zero related videos. Complete removal of related videos is no longer possible.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Can I autoplay a YouTube video on my website?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes, but only muted. Use autoplay=1&amp;mute=1 and add allow=&quot;autoplay; encrypted-media&quot; to the iFrame tag. All browsers block autoplay with sound.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I embed a YouTube playlist?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Use: youtube.com/embed/videoseries?list=PLAYLIST_ID. Find the Playlist ID after &ldquo;list=&rdquo; in the playlist URL.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Why is my YouTube embed not working?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Common causes: video is private or embedding disabled, autoplay blocked (add mute=1), browser extension blocking iFrame, or fixed dimensions breaking on mobile.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I embed in WordPress?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Use Custom HTML block — NOT the YouTube embed block. The YouTube block doesn&apos;t support custom parameters. In Classic Editor, switch to the Text tab.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Does embedding help SEO?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes — increases time on page. But standard iFrames hurt Core Web Vitals (500KB–1MB page weight). Use lazy loading or facade pattern for performance-critical pages.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I embed YouTube Shorts?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Use youtube.com/embed/VIDEO_ID with the Shorts video ID. Shorts are 9:16 vertical — use padding-bottom: 177.78% and max-width: 315px on the wrapper.</p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          YouTube&apos;s default embed code is a starting point — not a finished solution. This YouTube embed code generator handles responsive sizing, custom parameters, and privacy-enhanced mode automatically. The two things most guides get wrong: autoplay requires mute=1 to work in modern browsers, and rel=0 hasn&apos;t removed all related videos since 2018 — it shows same-channel videos only.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link href="/youtube-thumbnail-download" className="inline-flex items-center justify-center px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors">
            Download Thumbnails →
          </Link>
          <Link href="/tools" className="inline-flex items-center justify-center px-6 py-3 border border-[#E0D9CE] text-[#1A1612] rounded-full text-sm font-semibold hover:bg-[#F5F0E8] transition-colors">
            Explore All Free Tools →
          </Link>
        </div>
      </section>

    </article>
  )
}
