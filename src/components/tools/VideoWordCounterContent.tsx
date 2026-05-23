import Link from 'next/link'

export function VideoWordCounterContent() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">

      {/* H2: How to Use the YouTube Video Word Counter */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          How to Use the YouTube Video Word Counter
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Results appear in under 10 seconds. Here&apos;s what each step does and what the tool returns.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Step 1 — Paste Any YouTube URL
        </h3>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-6">
          <li>Copy from browser address bar (<code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">youtube.com/watch?v=VIDEO_ID</code>) or Share → Copy link on mobile</li>
          <li>Works with all public YouTube videos that have captions or auto-generated transcripts</li>
          <li>Does NOT work with: private videos, videos with captions disabled, very new videos where YouTube hasn&apos;t generated a transcript yet</li>
        </ul>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Step 2 — What the Tool Analyzes
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li><strong>Total word count</strong> — the number of spoken words in the video, extracted from the YouTube transcript</li>
          <li><strong>Character count</strong> — total characters including spaces (useful for translation pricing per character)</li>
          <li><strong>Speaking rate (WPM)</strong> — words per minute calculated from word count ÷ video duration</li>
          <li><strong>Estimated reading time</strong> — how long it takes to read the transcript at average reading pace (238 WPM)</li>
          <li><strong>Unique word count</strong> — number of distinct vocabulary words (measures vocabulary richness)</li>
        </ol>

        {/* Tip Callout */}
        <div className="bg-[#EBF4FF] border border-[#BFDBFE] rounded-xl p-4 mb-6">
          <p className="text-[#1A1612] text-sm leading-relaxed">
            <span className="font-bold">💡 Tip:</span> The tool uses YouTube&apos;s auto-generated captions as its
            transcript source. If a video has manually added captions, those are used instead — which are typically
            more accurate than auto-generated ones.
          </p>
        </div>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Step 3 — What to Do With Your Results
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          Once you have the data, here&apos;s how each persona uses it:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Persona</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Uses the data to...</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr><td className="px-4 py-3 text-[#1A1612] font-medium">Creators</td><td className="px-4 py-3 text-[#8A7F72]">Plan scripts for target video lengths</td></tr>
              <tr><td className="px-4 py-3 text-[#1A1612] font-medium">Translators</td><td className="px-4 py-3 text-[#8A7F72]">Calculate project quotes by word count</td></tr>
              <tr><td className="px-4 py-3 text-[#1A1612] font-medium">Content teams</td><td className="px-4 py-3 text-[#8A7F72]">Estimate blog post length from video repurposing</td></tr>
              <tr><td className="px-4 py-3 text-[#1A1612] font-medium">Researchers</td><td className="px-4 py-3 text-[#8A7F72]">Compare information density across videos</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* H2: YouTube Video Word Count by Length */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          YouTube Video Word Count by Length — The Benchmark Table
        </h2>

        {/* Featured Snippet Target */}
        <div className="border-l-4 border-[#16A34A] bg-[#F0FDF4] rounded-r-xl p-4 mb-6">
          <p className="text-[#1A1612] text-base leading-relaxed">
            The number of words in a YouTube video depends on two factors: video length and the creator&apos;s
            speaking pace. At the average YouTube speaking rate of 130–150 words per minute, a 10-minute video
            contains approximately 1,300–1,500 words. Here&apos;s the complete breakdown by video length and
            speaking speed.
          </p>
        </div>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-4">
          Word Count by Video Length (at 3 Speaking Speeds)
        </h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">Video Length</th>
                <th className="px-3 py-3 text-left font-semibold text-[#A06B00]">Slow (110 WPM)</th>
                <th className="px-3 py-3 text-left font-semibold text-[#16A34A]">Average (140 WPM)</th>
                <th className="px-3 py-3 text-left font-semibold text-[#2563EB]">Fast (170 WPM)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr><td className="px-3 py-3 text-[#1A1612]">1 minute</td><td className="px-3 py-3 text-[#8A7F72]">110</td><td className="px-3 py-3 text-[#8A7F72]">140</td><td className="px-3 py-3 text-[#8A7F72]">170</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612]">2 minutes</td><td className="px-3 py-3 text-[#8A7F72]">220</td><td className="px-3 py-3 text-[#8A7F72]">280</td><td className="px-3 py-3 text-[#8A7F72]">340</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612]">3 minutes</td><td className="px-3 py-3 text-[#8A7F72]">330</td><td className="px-3 py-3 text-[#8A7F72]">420</td><td className="px-3 py-3 text-[#8A7F72]">510</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612]">5 minutes</td><td className="px-3 py-3 text-[#8A7F72]">550</td><td className="px-3 py-3 text-[#8A7F72]">700</td><td className="px-3 py-3 text-[#8A7F72]">850</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612]">7 minutes</td><td className="px-3 py-3 text-[#8A7F72]">770</td><td className="px-3 py-3 text-[#8A7F72]">980</td><td className="px-3 py-3 text-[#8A7F72]">1,190</td></tr>
              <tr className="bg-[#F0FDF4]/50"><td className="px-3 py-3 text-[#1A1612] font-medium">10 minutes ★</td><td className="px-3 py-3 text-[#1A1612] font-medium">1,100</td><td className="px-3 py-3 text-[#16A34A] font-bold">1,400</td><td className="px-3 py-3 text-[#1A1612] font-medium">1,700</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612]">15 minutes</td><td className="px-3 py-3 text-[#8A7F72]">1,650</td><td className="px-3 py-3 text-[#8A7F72]">2,100</td><td className="px-3 py-3 text-[#8A7F72]">2,550</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612]">20 minutes</td><td className="px-3 py-3 text-[#8A7F72]">2,200</td><td className="px-3 py-3 text-[#8A7F72]">2,800</td><td className="px-3 py-3 text-[#8A7F72]">3,400</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612]">30 minutes</td><td className="px-3 py-3 text-[#8A7F72]">3,300</td><td className="px-3 py-3 text-[#8A7F72]">4,200</td><td className="px-3 py-3 text-[#8A7F72]">5,100</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612]">45 minutes</td><td className="px-3 py-3 text-[#8A7F72]">4,950</td><td className="px-3 py-3 text-[#8A7F72]">6,300</td><td className="px-3 py-3 text-[#8A7F72]">7,650</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612]">60 minutes</td><td className="px-3 py-3 text-[#8A7F72]">6,600</td><td className="px-3 py-3 text-[#8A7F72]">8,400</td><td className="px-3 py-3 text-[#8A7F72]">10,200</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          These figures represent spoken words extracted from transcripts — they exclude filler sounds, music
          sections, and silent periods. Actual word counts for any specific video may vary by ±15% from these
          estimates.{' '}
          <a href="https://www.ncvs.org" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">
            Source: National Center for Voice and Speech →
          </a>
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-4">
          Word Count by YouTube Video Category
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Speaking pace varies significantly by content category. Here&apos;s the typical word count range by
          video type for the same 10-minute runtime:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">Category</th>
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">Typical WPM</th>
                <th className="px-3 py-3 text-left font-semibold text-[#1A1612]">Words / 10 Min</th>
                <th className="px-3 py-3 text-left font-semibold text-[#8A7F72]">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr><td className="px-3 py-3 text-[#1A1612] font-medium">Educational tutorials</td><td className="px-3 py-3 text-[#8A7F72]">120–140</td><td className="px-3 py-3 text-[#8A7F72]">1,200–1,400</td><td className="px-3 py-3 text-[#8A7F72]">Deliberate pace, pauses for comprehension</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612] font-medium">News &amp; commentary</td><td className="px-3 py-3 text-[#8A7F72]">150–170</td><td className="px-3 py-3 text-[#8A7F72]">1,500–1,700</td><td className="px-3 py-3 text-[#8A7F72]">Scripted, faster delivery</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612] font-medium">Vlogs &amp; lifestyle</td><td className="px-3 py-3 text-[#8A7F72]">110–130</td><td className="px-3 py-3 text-[#8A7F72]">1,100–1,300</td><td className="px-3 py-3 text-[#8A7F72]">Conversational, unscripted</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612] font-medium">Podcast-style</td><td className="px-3 py-3 text-[#8A7F72]">130–150</td><td className="px-3 py-3 text-[#8A7F72]">1,300–1,500</td><td className="px-3 py-3 text-[#8A7F72]">Natural conversation pace</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612] font-medium">Gaming commentary</td><td className="px-3 py-3 text-[#8A7F72]">150–180</td><td className="px-3 py-3 text-[#8A7F72]">1,500–1,800</td><td className="px-3 py-3 text-[#8A7F72]">Rapid, reactive</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612] font-medium">Meditation &amp; ASMR</td><td className="px-3 py-3 text-[#8A7F72]">60–90</td><td className="px-3 py-3 text-[#8A7F72]">600–900</td><td className="px-3 py-3 text-[#8A7F72]">Very deliberate, low density</td></tr>
              <tr><td className="px-3 py-3 text-[#1A1612] font-medium">Long-form documentary</td><td className="px-3 py-3 text-[#8A7F72]">120–140</td><td className="px-3 py-3 text-[#8A7F72]">1,200–1,400</td><td className="px-3 py-3 text-[#8A7F72]">Narration pace</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* H2: What Is Speaking Rate and Why It Matters */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          What Is Speaking Rate and Why It Matters for Your Channel
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Speaking rate — measured in words per minute (WPM) — is one of the most underused metrics in YouTube
          analytics. Here&apos;s what it tells you about your content and your audience retention.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Average WPM for YouTube Creators by Content Type
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          The average adult speaks at 130–150 WPM in natural conversation. On YouTube, speaking rate varies widely
          by content type and creator style:
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          <strong>Scripted educational content (120–140 WPM):</strong> Channels like TED-Ed and Khan Academy speak
          deliberately — slower than natural conversation — to give viewers time to process complex information.
          This pace works for concepts that need to sink in, but risks feeling slow for entertainment-focused audiences.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          <strong>Natural conversational vlogs (130–150 WPM):</strong> The sweet spot for most YouTube content.
          Matches natural conversation pace — fast enough to feel energetic, slow enough to follow without rewinding.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          <strong>High-energy entertainment and gaming (150–180 WPM):</strong> MrBeast-style editing removes all
          pauses, pushing effective WPM above 160. This works for short-attention-span entertainment but would
          exhaust listeners in a 60-minute podcast.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          How Speaking Rate Affects Watch Time
        </h3>
        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Videos where speaking rate drops below 100 WPM see higher audience drop-off in the first 2 minutes — the pace signals &ldquo;slow content&rdquo; to the algorithm early</li>
          <li>Very high WPM (above 180) correlates with shorter watch sessions — viewers can&apos;t keep up and disengage</li>
          <li>The optimal WPM range for maximum average view duration: 130–160 WPM</li>
          <li>Checking your own WPM with the YouTube video word counter above gives you an actionable metric — if your calculated WPM is outside 120–165, consider adjusting your delivery or editing pace</li>
        </ul>
      </section>

      {/* H2: Why You Need a YouTube Video Word Counter — 4 Use Cases */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Why You Need a YouTube Video Word Counter — 4 Use Cases
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          The word count from a YouTube video is more useful than most creators realize. Here&apos;s how each
          audience uses this data.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          For Creators — Script Planning and Video Length Optimization
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          The most common creator question: &ldquo;How many words should I write for a 10-minute video?&rdquo;
          The answer depends on your natural speaking pace — which varies significantly by creator.
        </p>
        <ol className="list-decimal list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Record a 5-minute test video and analyze it with the word counter</li>
          <li>Your actual WPM = words in transcript ÷ 5</li>
          <li>Multiply your WPM by your target video length to get your script word count target</li>
          <li>Example: a creator who speaks at 145 WPM writing a 15-minute video should write approximately 2,175 words</li>
        </ol>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Shorter scripts don&apos;t always mean shorter videos — pauses, B-roll, and demonstrations reduce your
          effective WPM. Use the word counter on your existing videos to calibrate your personal WPM baseline before
          planning new scripts. Then{' '}
          <Link href="/youtube-timestamp-generator" className="text-[#E8402A] hover:underline font-medium">add timestamps to your video</Link>
          {' '}for better retention.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          For Translators — Calculating Accurate Project Quotes
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          Translation is typically priced by source word count. A YouTube video word counter removes the need to
          manually count or estimate — you get the exact word count in seconds.
        </p>
        <ol className="list-decimal list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Paste the video URL into the word counter — get exact word count</li>
          <li>Multiply by your per-word rate (industry standard: $0.08–$0.18 per word depending on language pair and complexity)</li>
          <li>Factor in: technical vocabulary density, speaking pace, and subtitle line length requirements</li>
        </ol>

        {/* Translation Pricing Example */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 mb-6">
          <p className="text-[#1A1612] text-sm leading-relaxed">
            <span className="font-bold">Example:</span> A 10-minute tech tutorial at 145 WPM = ~1,450 words.
            At $0.12/word = <strong>$174 translation quote</strong>. Without a word counter, most translators
            estimate by video length — which undercharges for fast-paced, high-density content.
          </p>
        </div>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          <a href="https://www.proz.com" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">
            ProZ.com — professional translator rates reference →
          </a>
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          For Content Teams — Repurposing Video into Blog Posts and Social Content
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          A 10-minute YouTube video contains enough material for a 1,200–1,500 word blog post — a full article —
          with zero additional research. The word counter tells you how much raw content exists before you commit
          to the repurposing workflow.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Video word count × 0.7 = approximate blog post length (accounting for transcript cleanup and editorial condensing)</li>
          <li>A 20-minute video (≈2,800 words) → 1 full blog post (1,960 words) + 3 LinkedIn posts + 8–10 Twitter/X threads</li>
          <li>A 60-minute video (≈8,400 words) → 3–4 blog posts + 1 email newsletter + 20+ social posts</li>
        </ul>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          The word counter gives content teams a quick way to triage which videos are worth repurposing before
          starting the transcript extraction process.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          For Researchers and Students — Measuring Information Density
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          For academic researchers, students, and journalists, word count and unique word count together measure a
          video&apos;s information density — how much distinct information is packed into a given length.
        </p>
        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li><strong>Lecture analysis:</strong> comparing word density across professors or courses to identify which content requires more cognitive load</li>
          <li><strong>Media studies:</strong> analyzing speaking rate and vocabulary richness across news channels, political speeches, or creator comparisons</li>
          <li><strong>Accessibility research:</strong> measuring whether fast-paced educational content creates barriers for non-native English speakers (high WPM + low pause frequency = harder to follow)</li>
        </ul>
      </section>

      {/* H2: How to Count Words in a YouTube Video Transcript — Manual Method */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          How to Count Words in a YouTube Video Transcript — Manual Method
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          If you need the YouTube transcript word count without a tool, here&apos;s how to do it manually using
          YouTube&apos;s built-in transcript feature. It takes about 5 minutes.
        </p>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>Step 1: Open the YouTube transcript</strong></p>
        <ol className="list-decimal list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Open any YouTube video in a desktop browser</li>
          <li>Click the three-dot menu (⋯) below the video → select &ldquo;Open transcript&rdquo;</li>
          <li>The transcript panel opens to the right of the video with timestamped text</li>
        </ol>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>Step 2: Copy the transcript text</strong></p>
        <ol className="list-decimal list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Click anywhere in the transcript panel</li>
          <li>Press Ctrl+A (Windows) or Cmd+A (Mac) to select all transcript text</li>
          <li>Press Ctrl+C / Cmd+C to copy</li>
        </ol>

        <p className="text-[#1A1612] text-base leading-relaxed mb-2"><strong>Step 3: Paste into a word counter</strong></p>
        <ol className="list-decimal list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Open Google Docs, Microsoft Word, or any text editor</li>
          <li>Paste the copied text</li>
          <li>In Google Docs: Tools → Word count. In Word: the word count shows in the status bar.</li>
        </ol>

        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          <strong>The limitation:</strong> Manual counting via YouTube transcript includes timestamp text in the
          word count, adding approximately 3–5% to the actual spoken word count. The YouTube video word counter
          tool above strips timestamps automatically and returns only the spoken word count.
        </p>

        {/* Tip Callout */}
        <div className="bg-[#EBF4FF] border border-[#BFDBFE] rounded-xl p-4 mb-4">
          <p className="text-[#1A1612] text-sm leading-relaxed">
            <span className="font-bold">💡 For automatic transcript extraction and word counting without any manual
            steps:</span> use the tool above — paste the YouTube URL and get results in under 10 seconds.
          </p>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          <a href="https://support.google.com/youtube/answer/2734796" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">
            YouTube Help Center — transcripts and captions →
          </a>
        </p>
      </section>

      {/* H2: Frequently Asked Questions */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How many words are in a 10-minute YouTube video?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">A 10-minute YouTube video typically contains 1,100–1,700 words, depending on the creator&apos;s speaking pace. At the average speaking rate of 130–150 WPM: approximately 1,300–1,500 words. Fast-speaking gaming and commentary channels reach 1,500–1,700 words per 10 minutes. Scripted educational content typically lands at 1,200–1,400 words.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I count words spoken in a YouTube video?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Two methods: (1) Use the free YouTube video word counter at the top of this page — paste the video URL and get the exact word count from the transcript in seconds. (2) Manually: open the YouTube transcript via the three-dot menu → Open transcript → copy the text → paste into Google Docs and use Tools → Word count.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">What is the average speaking rate for YouTube videos?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">The average YouTube creator speaks at 130–160 words per minute. Educational channels typically speak at 120–140 WPM. Gaming and commentary channels speak at 150–180 WPM. Vlogs and lifestyle content land at 110–140 WPM. The fastest YouTube speakers exceed 200 WPM in highly edited content with pauses removed.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How long should a YouTube video script be?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Multiply your target video length in minutes by your personal speaking rate in WPM. Example: a 10-minute video at 140 WPM = 1,400-word script. Use the word counter on your existing videos to calculate your actual WPM baseline. A 5-minute video typically needs 600–800 scripted words; a 15-minute video needs 1,800–2,400 words.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How many words is a 5-minute video?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">A 5-minute YouTube video typically contains 550–850 spoken words. At average speaking pace (130–150 WPM): approximately 650–750 words. Slow-paced content (educational, ASMR): 450–600 words. Fast-paced gaming commentary: 800–900 words. For script planning: write 650–750 words and record at a natural pace to hit a 5-minute runtime.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">Can I count words in a YouTube video for free?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Yes — the YouTube video word counter at the top of this page is completely free. Paste any public YouTube video URL and get word count, speaking rate, reading time, and character count instantly. No signup, no login, no credit card required.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How many words per minute do YouTubers speak?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">YouTube creators average 130–160 WPM across all content types. By category: educational channels 120–140 WPM, news/commentary 150–170 WPM, vlogs 110–140 WPM, gaming/entertainment 150–180 WPM, podcasts 130–150 WPM, ASMR and meditation 60–90 WPM. The average for all human speech is 130–150 WPM according to the National Center for Voice and Speech.</p>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">How do I get a transcript word count from YouTube?</h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">Fastest method: paste the YouTube URL into the free word counter above — it automatically extracts the transcript and returns the word count in seconds. Manual method: on any YouTube video, click the three-dot menu → Open transcript → copy all text → paste into Google Docs → Tools → Word count. Subtract approximately 5% for timestamps included in the copy.</p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          YouTube videos are content-dense in a way most creators underestimate. A 10-minute tutorial contains as
          many words as a full blog post. A 1-hour documentary contains enough material for a short book chapter.
          The YouTube video word counter above gives you the exact numbers in seconds.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Use the word counter to set script length targets before recording</li>
          <li>Check your speaking rate — the 130–160 WPM range optimizes for retention</li>
          <li>Every video is a content asset with repurposing potential — the word count tells you how much</li>
        </ul>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Need to{' '}
          <Link href="/tag-extractor" className="text-[#E8402A] hover:underline font-medium">optimize your video tags</Link>
          {' '}or{' '}
          <Link href="/youtube-revenue-calculator" className="text-[#E8402A] hover:underline font-medium">estimate your earnings</Link>?
          Check out the full toolkit.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/tools" className="inline-flex items-center justify-center px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors">
            Explore All Free YouTube Tools →
          </Link>
          <Link href="/niches" className="inline-flex items-center justify-center px-6 py-3 border border-[#E0D9CE] text-[#1A1612] rounded-full text-sm font-semibold hover:bg-[#F5F0E8] transition-colors">
            Find Your YouTube Niche →
          </Link>
        </div>
      </section>

    </article>
  )
}
