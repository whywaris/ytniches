import Link from 'next/link'

export function RSSFeedGeneratorContent() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">

      {/* What Is YouTube RSS */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">What Is a YouTube RSS Feed? (And Why It Matters)</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          YouTube has supported RSS feeds since the beginning — but in 2013, they removed the visible &ldquo;Subscribe via RSS&rdquo; button from channel pages. The feeds still work. YouTube just stopped advertising them.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          RSS (Really Simple Syndication) is a standardized web format that lets you subscribe to content updates from any website or platform. When a YouTube channel publishes a new video, its RSS feed updates automatically within 15–60 minutes. Unlike YouTube&apos;s built-in subscription system (controlled by the algorithm), RSS gives you a chronological, unfiltered list of every video a channel publishes.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">What Data Is Included in a YouTube RSS Feed?</h3>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden min-w-[400px]">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-4 py-3 text-left font-semibold text-[#2A7A4B]">✓ Included</th>
                <th className="px-4 py-3 text-left font-semibold text-[#8A7F72]">✗ NOT Included</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr><td className="px-4 py-2 text-[#1A1612]">Video title</td><td className="px-4 py-2 text-[#8A7F72]">View count</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Video URL</td><td className="px-4 py-2 text-[#8A7F72]">Like/dislike count</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Publish date</td><td className="px-4 py-2 text-[#8A7F72]">Subscriber count</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Channel name</td><td className="px-4 py-2 text-[#8A7F72]">Watch time data</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Description snippet</td><td className="px-4 py-2 text-[#8A7F72]">Comment count</td></tr>
              <tr><td className="px-4 py-2 text-[#1A1612]">Thumbnail URL</td><td className="px-4 py-2 text-[#8A7F72]">Revenue data</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* How to Get RSS Feed */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">How to Get a YouTube Channel&apos;s RSS Feed (3 Methods)</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">Three ways to get a YouTube channel&apos;s RSS feed URL. Pick the one that matches your technical comfort level.</p>

        {/* Method 1 */}
        <div className="border-l-4 border-[#2A7A4B] bg-white rounded-r-xl px-5 py-4 mb-5">
          <p className="text-xs font-bold text-[#2A7A4B] uppercase tracking-wider mb-1">Method 1 — No Coding (30 seconds)</p>
          <h3 className="font-display text-lg font-bold text-[#1A1612] mb-2">Use This YouTube RSS Feed Generator</h3>
          <p className="text-sm text-[#1A1612] leading-relaxed">
            Copy any YouTube channel URL (youtube.com/@handle, youtube.com/channel/ID, or any video URL), paste it into the generator above, and click Generate. Your RSS feed URL appears instantly — click Copy. Works with all input formats including @handles.
          </p>
        </div>

        {/* Method 2 */}
        <div className="border-l-4 border-[#2563EB] bg-white rounded-r-xl px-5 py-4 mb-5">
          <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">Method 2 — For Developers</p>
          <h3 className="font-display text-lg font-bold text-[#1A1612] mb-2">Build the URL Manually with Your Channel ID</h3>
          <div className="bg-[#1A1612] rounded-lg p-4 mb-3 overflow-x-auto">
            <code className="text-sm text-[#F5F0E8] font-mono">https://www.youtube.com/feeds/videos.xml?channel_id=<span className="text-[#E8402A]">CHANNEL_ID</span></code>
          </div>
          <p className="text-sm text-[#1A1612] leading-relaxed mb-2">
            Replace CHANNEL_ID with your 24-character Channel ID (starts with &ldquo;UC&rdquo;). Find it in YouTube Studio → Settings → Channel → Basic Info.
          </p>
          <div className="bg-[#1A1612] rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-[#F5F0E8] font-mono">https://www.youtube.com/feeds/videos.xml?channel_id=UC295-Dw0tDd-hoAmrNv4e-A</code>
          </div>
        </div>

        {/* Method 3 */}
        <div className="border-l-4 border-[#A06B00] bg-white rounded-r-xl px-5 py-4">
          <p className="text-xs font-bold text-[#A06B00] uppercase tracking-wider mb-1">Method 3 — Power Users</p>
          <h3 className="font-display text-lg font-bold text-[#1A1612] mb-2">Find It in the Page Source</h3>
          <p className="text-sm text-[#1A1612] leading-relaxed mb-2">
            Open any YouTube channel page → Right-click → View Page Source → Ctrl+F → search for <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">application/rss+xml</code>
          </p>
          <div className="bg-[#1A1612] rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-[#F5F0E8] font-mono">&lt;link rel=&quot;alternate&quot; type=&quot;application/rss+xml&quot; href=&quot;https://www.youtube.com/feeds/videos.xml?channel_id=UC295-Dw0tDd-hoAmrNv4e-A&quot;&gt;</code>
          </div>
        </div>
      </section>

      {/* Playlists, Shorts, Live */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">YouTube RSS Feed for Playlists, Shorts, and Live Streams</h2>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Playlist RSS Feed</h3>
        <div className="bg-[#1A1612] rounded-lg p-4 mb-3 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">https://www.youtube.com/feeds/videos.xml?playlist_id=<span className="text-[#E8402A]">PLAYLIST_ID</span></code>
        </div>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Find the Playlist ID in the playlist URL after <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">list=</code>. This feed ONLY shows videos in that specific playlist — not the channel&apos;s full upload history.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">YouTube Shorts and RSS</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          YouTube does NOT have a separate RSS feed for Shorts. Shorts appear in the channel&apos;s main RSS feed alongside regular videos. There is no way to filter the RSS feed to show ONLY Shorts or to exclude them. For channels that exclusively publish Shorts, their channel RSS feed is effectively a Shorts-only feed.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Live Streams and RSS</h3>
        <p className="text-[#1A1612] text-base leading-relaxed">
          Live streams appear in the channel RSS feed when a stream goes live — as a standard video entry. The RSS entry is created when the stream starts, not when scheduled. There is no RSS-based way to get notified about upcoming live streams before they begin.
        </p>
      </section>

      {/* 15-Video Limit */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">The 15-Video Limit — What It Is and How to Get Around It</h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          YouTube&apos;s native RSS feed has a hard limit of 15 videos. It always shows the 15 most recent uploads from a channel — no more. If a channel publishes 16+ videos after you subscribe, the oldest video falls off the feed.
        </p>

        <div className="bg-[#EBF4FF] border border-[#B8D4FE] rounded-xl px-5 py-4 mb-6">
          <p className="text-sm text-[#2563EB] leading-relaxed">
            <strong>ℹ️</strong> For most creators and marketers using RSS for daily monitoring, 15 videos is never an issue. The limit only matters for archival, research, or very high-frequency channels publishing 15+ videos per day.
          </p>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>Workarounds:</strong></p>
        <ol className="list-decimal list-inside space-y-2 text-[#1A1612] text-base leading-relaxed">
          <li><strong>Increase polling frequency</strong> — Set your RSS reader to check every 15 minutes for high-frequency channels.</li>
          <li><strong>Use the YouTube Data API v3</strong> — No 15-video limit, returns full paginated results. Requires a free Google API key.</li>
          <li><strong>Use a third-party aggregator</strong> — Tools like RSS.app can pull more than 15 videos on initial import using their own API access.</li>
        </ol>
      </section>

      {/* Use Cases */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">How to Use Your YouTube RSS Feed (5 Practical Use Cases)</h2>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Add to an RSS Reader (Feedly, Inoreader, NewsBlur)</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          In{' '}<a href="https://feedly.com" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline">Feedly</a>: click &ldquo;Add Content&rdquo; → &ldquo;RSS Feed&rdquo; → paste your YouTube RSS URL → click Follow. New videos appear within 15–60 minutes of publishing. Works identically with Inoreader, NewsBlur, and any RSS reader.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Automate with Zapier, Make.com, or IFTTT</h3>
        <div className="bg-white border border-[#E0D9CE] rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="bg-[#FEF6E8] text-[#A06B00] font-bold px-3 py-1.5 rounded-lg">Trigger</span>
            <span className="text-[#8A7F72]">→</span>
            <span className="text-[#1A1612]">New item in YouTube RSS Feed</span>
            <span className="text-[#8A7F72]">→</span>
            <span className="bg-[#EBF5EF] text-[#2A7A4B] font-bold px-3 py-1.5 rounded-lg">Action</span>
            <span className="text-[#1A1612]">Slack message / Google Sheet row / Email</span>
          </div>
        </div>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          In{' '}<a href="https://zapier.com/apps/rss/integrations" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline">Zapier</a>: create a Zap → Trigger: RSS by Zapier → paste your YouTube RSS URL → connect any action app. No API keys or OAuth needed — just the RSS URL from this tool.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Monitor Competitor Upload Frequency</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Add competitor channel RSS feeds to a spreadsheet tracker via Zapier. Each new video triggers a row — over time, you see their publishing cadence, title patterns, and topic choices.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Add Your Channel to Newsletters</h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Many newsletter platforms (Substack, Beehiiv, ConvertKit) support RSS-based content aggregation. Your YouTube RSS URL distributes new videos to subscribers who prefer RSS over algorithmic discovery.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">Embed Fresh Videos on Your Website</h3>
        <p className="text-[#1A1612] text-base leading-relaxed">
          Using plugins like WP RSS Aggregator or RSS-to-HTML scripts, your YouTube RSS feed can automatically display your latest videos on any website — no manual embedding needed.
        </p>
      </section>

      {/* Comparison */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">Free YouTube RSS Feed Tools — Honest Comparison</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden min-w-[550px]">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">Feature</th>
                <th className="px-3 py-3 text-left font-semibold text-[#E8402A]">YTNiches</th>
                <th className="px-3 py-3 text-left font-semibold text-[#8A7F72]">RSS.app</th>
                <th className="px-3 py-3 text-left font-semibold text-[#8A7F72]">TubePilot</th>
                <th className="px-3 py-3 text-left font-semibold text-[#8A7F72]">FetchRSS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr><td className="px-3 py-2 text-[#1A1612]">Free tier</td><td className="px-3 py-2 text-[#2A7A4B] font-medium">Unlimited</td><td className="px-3 py-2 text-[#8A7F72]">3 feeds</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td></tr>
              <tr><td className="px-3 py-2 text-[#1A1612]">Signup required</td><td className="px-3 py-2 text-[#2A7A4B] font-medium">No</td><td className="px-3 py-2 text-[#E8402A]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">No</td><td className="px-3 py-2 text-[#2A7A4B]">No</td></tr>
              <tr><td className="px-3 py-2 text-[#1A1612]">Channel RSS</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td></tr>
              <tr><td className="px-3 py-2 text-[#1A1612]">Playlist RSS</td><td className="px-3 py-2 text-[#2A7A4B] font-medium">Yes</td><td className="px-3 py-2 text-[#E8402A]">Paid</td><td className="px-3 py-2 text-[#E8402A]">No</td><td className="px-3 py-2 text-[#E8402A]">No</td></tr>
              <tr><td className="px-3 py-2 text-[#1A1612]">@handle support</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#8A7F72]">Limited</td></tr>
              <tr><td className="px-3 py-2 text-[#1A1612]">Instant copy</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td><td className="px-3 py-2 text-[#2A7A4B]">Yes</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          <strong>When this tool wins:</strong> You need a channel or playlist RSS link right now, with no account, no credit card, and no limit on how many times you use it.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed">
          <strong>When to use the native URL pattern:</strong> If you&apos;re a developer embedding YouTube RSS into your own application, skip all third-party tools and use the direct URL format from Method 2 above. No dependency, no rate limits.
        </p>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I get the RSS feed for a YouTube channel?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Paste the channel URL into the generator above and click Generate — instant result, no signup. Or find your Channel ID in YouTube Studio → Settings → Channel → Basic Info, then use: youtube.com/feeds/videos.xml?channel_id=YOUR_ID.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Does YouTube still support RSS feeds in 2026?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes — YouTube&apos;s RSS feeds are fully functional. YouTube removed the visible RSS button in 2013, but the underlying feed infrastructure was never shut down. Every public channel has a working RSS feed.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">What is the YouTube RSS feed URL format?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Channel: youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID (24-character ID starting with &ldquo;UC&rdquo;). Playlist: youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID. The generator above converts any URL or @handle to this format automatically.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I find my YouTube channel ID for RSS?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">YouTube Studio → Settings → Channel → Basic Info. Your Channel ID starts with &ldquo;UC&rdquo; and is exactly 24 characters. The generator above extracts it automatically from any channel URL.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Can I get an RSS feed for a YouTube playlist?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes. Use: youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID. Find the Playlist ID in the playlist URL after &ldquo;list=&rdquo;. The 15-video limit applies to playlist feeds as well.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I add a YouTube RSS feed to Feedly?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">In Feedly, click &ldquo;Add Content&rdquo; → &ldquo;RSS Feed&rdquo; → paste your YouTube RSS URL → click Follow. New videos appear within 15–60 minutes. Works identically with Inoreader, NewsBlur, and most RSS readers.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">What is the difference between YouTube RSS and YouTube subscription?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">YouTube subscriptions are algorithm-controlled — you don&apos;t see every video. RSS gives you a chronological, unfiltered feed of every video a channel publishes. No algorithm, no ranking, no suppression.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Can I use YouTube RSS with Zapier or IFTTT?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes — YouTube RSS feeds work as triggers in Zapier, Make.com, and IFTTT without any API key. In Zapier: Trigger → RSS by Zapier → paste your YouTube RSS URL → connect any action app.</p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          YouTube RSS feeds have been quietly working since 2005 — hidden but never removed. Every public channel has one, playlists have them, and they work in every RSS reader and automation platform that exists. RSS gives you an unfiltered, chronological view of any channel&apos;s uploads — without YouTube&apos;s algorithm deciding what you see.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link href="/niches" className="inline-flex items-center justify-center px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors">
            Find Your YouTube Niche →
          </Link>
          <Link href="/tools" className="inline-flex items-center justify-center px-6 py-3 border border-[#E0D9CE] text-[#1A1612] rounded-full text-sm font-semibold hover:bg-[#F5F0E8] transition-colors">
            Explore All Free YouTube Tools →
          </Link>
        </div>
      </section>

    </article>
  )
}
