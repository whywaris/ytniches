import Link from 'next/link'

export function DislikeViewerContent() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">

      {/* How to Use */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">How to Use the YouTube Dislike Viewer</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">It takes under 10 seconds — here&apos;s the exact process.</p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Step 1 — Copy the YouTube Video URL</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          On desktop, copy from the browser address bar. On mobile, tap Share → Copy link. Works with all formats: <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">youtube.com/watch?v=</code>, <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">youtu.be/</code>, and <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">youtube.com/shorts/</code>. Does NOT work with private, age-restricted, or deleted videos.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Step 2 — Paste Into the Tool Above</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Paste the URL and click &ldquo;View Dislikes.&rdquo; The tool calls the Return YouTube Dislike API to retrieve current estimates. Results appear within 1–3 seconds. If a video shows 0 dislikes, it may genuinely have zero reported dislikes or be too new for sufficient extension user data.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Step 3 — Read Your Results</h3>
        <p className="text-[#1A1612] text-base leading-relaxed">
          <strong>Dislike count:</strong> estimated number based on archived data + extrapolation. <strong>Like count:</strong> exact, from YouTube&apos;s public API. <strong>Like-to-dislike ratio:</strong> displayed as a percentage — a healthy tutorial typically sits at 95%+ likes. <strong>View count:</strong> exact, from YouTube&apos;s public API.
        </p>
      </section>

      {/* Why YouTube Removed Dislikes */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">Why YouTube Removed the Dislike Count</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">In November 2021, YouTube made one of its most controversial decisions.</p>

        {/* Timeline */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#E8402A] shrink-0"></span>
            <p className="text-sm text-[#1A1612]"><strong>Nov 10, 2021</strong> — Public dislike count hidden from all videos</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#1A1612] shrink-0"></span>
            <p className="text-sm text-[#1A1612]"><strong>Dec 13, 2021</strong> — Dislike data removed from YouTube Data API v3</p>
          </div>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          YouTube stated the decision was to &ldquo;protect creators from coordinated dislike attacks.&rdquo; The community response was largely negative — hiding dislikes removes a key transparency signal viewers use to judge content quality, particularly for tutorials, product reviews, and news commentary.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed">
          What still exists: creators see their exact dislike count in YouTube Studio → Analytics → Engagement. Third-party tools like this one show estimated counts via the{' '}
          <a href="https://returnyoutubedislike.com" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline">Return YouTube Dislike</a> API.
        </p>
      </section>

      {/* Accuracy */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">How Accurate Is the Dislike Count?</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">The honest answer: it depends entirely on when the video was uploaded.</p>

        <div className="bg-[#FEF6E8] border border-[#F5DFA8] rounded-xl px-5 py-4 mb-6">
          <p className="text-sm text-[#A06B00] leading-relaxed">
            <strong>⚠️ Accuracy note:</strong> Pre-December 2021 videos = high accuracy (archived data). Post-December 2021 videos = estimated range (extrapolated from extension users). Your own exact count: YouTube Studio → Analytics → Engagement.
          </p>
        </div>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Videos Before December 2021 — High Accuracy</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Before YouTube removed dislike data from its API, the Return YouTube Dislike project archived dislike counts for millions of videos. For pre-December 2021 videos, accuracy is high — within a few percent of the actual count. These are snapshots that don&apos;t change retroactively.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Videos After December 2021 — Estimated Range</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          For newer videos, the RYD API collects dislike data from millions of browser extension users who opted in to data sharing. When an extension user dislikes a video, that data is sent to the API, which extrapolates from this sample to estimate the total count.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed">
          <strong>High-traffic viral videos:</strong> better accuracy (larger sample). <strong>Niche videos under 50K views:</strong> lower accuracy (small sample). <strong>Non-English regions:</strong> lower accuracy (extension adoption is lower outside US/EU).
        </p>
      </section>

      {/* Mobile */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">How to See YouTube Dislikes on Mobile</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          This is the #1 reason people search for a web-based dislike viewer — browser extensions don&apos;t work on mobile YouTube apps.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">iPhone / iOS</h3>
        <ol className="list-decimal list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>In the YouTube app, tap Share → Copy Link</li>
          <li>Open Safari or Chrome</li>
          <li>Go to this page and paste the URL</li>
          <li>Tap &ldquo;View Dislikes&rdquo; — results in seconds</li>
        </ol>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Android</h3>
        <p className="text-[#1A1612] text-base leading-relaxed">
          Identical steps — works in Chrome, Firefox, or any Android browser. No extension, no APK, no ReVanced required. The web tool works in any mobile browser in under 10 seconds.
        </p>
      </section>

      {/* Comparison */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">YouTube Dislike Viewer vs. Return YouTube Dislike Extension</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden min-w-[450px]">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Feature</th>
                <th className="px-4 py-3 text-left font-semibold text-[#E8402A]">This Web Tool</th>
                <th className="px-4 py-3 text-left font-semibold text-[#8A7F72]">RYD Extension</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr><td className="px-4 py-2 text-[#1A1612]">Installation required</td><td className="px-4 py-2 text-[#2A7A4B] font-medium">No</td><td className="px-4 py-2 text-[#8A7F72]">Yes</td></tr>
              <tr className="bg-[#f0fdf4]/50"><td className="px-4 py-2 text-[#1A1612]">Works on mobile</td><td className="px-4 py-2 text-[#2A7A4B] font-medium">Yes</td><td className="px-4 py-2 text-[#E8402A]">No</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Works on Shorts</td><td className="px-4 py-2 text-[#2A7A4B]">Yes</td><td className="px-4 py-2 text-[#2A7A4B]">Yes (desktop)</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Auto-shows on every video</td><td className="px-4 py-2 text-[#8A7F72]">No (paste URL)</td><td className="px-4 py-2 text-[#2A7A4B] font-medium">Yes</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Data accuracy</td><td className="px-4 py-2 text-[#1A1612]">Same (RYD API)</td><td className="px-4 py-2 text-[#1A1612]">Same (RYD API)</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Privacy</td><td className="px-4 py-2 text-[#2A7A4B]">No data stored</td><td className="px-4 py-2 text-[#8A7F72]">Opt-in sharing</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Free</td><td className="px-4 py-2 text-[#2A7A4B]">Yes</td><td className="px-4 py-2 text-[#2A7A4B]">Yes</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          <strong>Web tool wins:</strong> You&apos;re on mobile, can&apos;t install extensions, or need a quick one-off check without installing anything.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed">
          <strong>Extension wins:</strong> You&apos;re on desktop and check YouTube regularly — it shows dislikes automatically on every video without extra steps. <a href="https://returnyoutubedislike.com" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline">Install the RYD extension →</a>
        </p>
      </section>

      {/* Shorts */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">Does It Work on YouTube Shorts?</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          Yes — paste any <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">youtube.com/shorts/VIDEO_ID</code> URL into the tool. Results show the same data: estimated dislikes, like count, ratio, and view count.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed">
          Most Shorts were uploaded after December 2021, so the archived exact data that makes pre-2021 estimates reliable doesn&apos;t exist for most Shorts. Treat Shorts dislike estimates as a rough directional signal. The like count and view count are always exact — pulled directly from YouTube&apos;s public API.
        </p>
      </section>

      {/* Creator Research */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">Using Dislike Data for Creator Research and Brand Safety</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">Checking dislikes isn&apos;t just for curious viewers — it&apos;s a practical research tool for creators and marketers.</p>

        <div className="space-y-4">
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4">
            <p className="text-sm font-bold text-[#1A1612] mb-1">1. Vet tutorial content before following it</p>
            <p className="text-sm text-[#8A7F72]">Before spending 3 hours on a tutorial, check the like-to-dislike ratio. A tutorial with 95%+ likes has been validated by thousands. One with 60% likes likely has significant issues.</p>
          </div>
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4">
            <p className="text-sm font-bold text-[#1A1612] mb-1">2. Competitor content research</p>
            <p className="text-sm text-[#8A7F72]">Videos with poor like-to-dislike ratios represent audience pain points your content could address better. A competitor&apos;s most-disliked video is a blueprint for what NOT to do.</p>
          </div>
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4">
            <p className="text-sm font-bold text-[#1A1612] mb-1">3. Influencer vetting for brand partnerships</p>
            <p className="text-sm text-[#8A7F72]">Check a YouTuber&apos;s most recent 10–15 videos for dislike patterns. Consistently high dislike ratios (above 10%) can signal audience trust issues or declining channel health.</p>
          </div>
          <div className="bg-white border border-[#E0D9CE] rounded-xl p-4">
            <p className="text-sm font-bold text-[#1A1612] mb-1">4. Spotting misinformation or low-quality content</p>
            <p className="text-sm text-[#8A7F72]">High-view videos with high dislike ratios often indicate misleading thumbnails, clickbait titles, or content that failed to deliver on its premise.</p>
          </div>
        </div>
      </section>

      {/* ToS */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">Is Using a YouTube Dislike Viewer Against YouTube&apos;s Terms of Service?</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          No — using a YouTube dislike viewer does not violate YouTube&apos;s Terms of Service. This tool accesses data through the Return YouTube Dislike API, which uses archived pre-2021 data and voluntarily shared extension user data. It does not scrape YouTube directly or bypass any access restrictions.
        </p>

        <div className="bg-[#EBF5EF] border border-[#C2E0CE] rounded-xl px-5 py-4">
          <p className="text-sm text-[#2A7A4B] font-medium">
            ✓ No data stored · ✓ No login required · ✓ No YouTube ToS violation · ✓ Free forever
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I see dislikes on YouTube without an extension?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Paste the YouTube video URL into the dislike viewer tool at the top of this page and click &ldquo;View Dislikes.&rdquo; Results appear within 1–3 seconds — no extension, no login, no account needed. Works on desktop, iPhone, and Android.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Is Return YouTube Dislike accurate?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Highly accurate for pre-December 2021 videos (archived exact data). For newer videos, estimates are extrapolated from extension user data — accuracy is good for high-traffic videos, lower for niche videos under 50K views.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Can you still see dislikes on YouTube in 2026?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes — via third-party tools and the Return YouTube Dislike browser extension. YouTube hid the public count in November 2021, but the data is accessible through the RYD API. Creators always see their exact count in YouTube Studio.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I see dislikes on YouTube mobile?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Use this web tool — it works in any mobile browser. Copy the video URL from the YouTube app via Share → Copy Link, open this page in your browser, paste the URL, and tap View Dislikes. No app or extension needed.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Why did YouTube remove the dislike count?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">YouTube cited protection of smaller creators from &ldquo;coordinated dislike attacks.&rdquo; The dislike button still exists; only the public count was hidden. Creators still see their exact count in YouTube Studio Analytics.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Can creators see their own dislikes?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes — exactly. YouTube Studio → Analytics → Engagement tab shows your precise dislike count, like count, and ratio. This data was never removed from Studio — only the public-facing count was hidden.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Does the YouTube dislike viewer work on Shorts?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes — paste any youtube.com/shorts/VIDEO_ID URL. For post-2021 Shorts (most of them), estimates are based on RYD extension data — treat as directional rather than exact, especially for Shorts under 1 million views.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Is using a YouTube dislike viewer against YouTube&apos;s Terms of Service?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">No. This tool accesses data through the Return YouTube Dislike API — archived pre-2021 data and voluntarily shared extension user data. It does not scrape YouTube directly or bypass any access restrictions.</p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          YouTube hiding dislikes removed a key transparency signal — but the data is still accessible. For desktop users, the Return YouTube Dislike extension is the most convenient option. For mobile users or anyone who doesn&apos;t want to install anything, this YouTube dislike viewer works in any browser in under 10 seconds. For your own videos, your exact dislike count is always in YouTube Studio — no estimates needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link href="/tools" className="inline-flex items-center justify-center px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors">
            Explore All Free YouTube Tools →
          </Link>
          <Link href="/niches" className="inline-flex items-center justify-center px-6 py-3 border border-[#E0D9CE] text-[#1A1612] rounded-full text-sm font-semibold hover:bg-[#F5F0E8] transition-colors">
            Research Your Niche →
          </Link>
        </div>
      </section>

    </article>
  )
}
