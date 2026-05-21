import Link from 'next/link'

export function SubscribeLinkGeneratorContent() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16">



      {/* H2: What Is a YouTube Subscribe Link? */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          What Is a YouTube Subscribe Link?
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          A YouTube subscribe link is a channel URL with <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">?sub_confirmation=1</code> appended
          to the end. When someone clicks it, YouTube shows a native confirmation popup asking them to subscribe — instead of just
          dropping them onto your channel page where most visitors leave without subscribing.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          The Difference It Makes
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          A regular channel link (youtube.com/@YourChannel) takes visitors to your channel page — they have to find the Subscribe
          button themselves. A subscribe link (youtube.com/@YourChannel?sub_confirmation=1) opens a popup that puts the Subscribe
          button front and center, reducing the steps from click to subscriber. That one-click subscribe experience is the difference
          between a casual visitor and a new subscriber.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          What the Subscribe Popup Looks Like
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          The confirmation popup shows your channel name, avatar, and subscriber count with a prominent Subscribe button.
          Visitors can dismiss it or subscribe — but the prompt is impossible to miss. It&apos;s an official YouTube feature,
          not a hack or workaround, and it works with every YouTube channel regardless of size.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Supported URL Formats
        </h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">URL Format</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Example</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Subscribe Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">@handle</td>
                <td className="px-4 py-3 text-[#8A7F72]">youtube.com/@YourHandle</td>
                <td className="px-4 py-3 text-[#8A7F72]">youtube.com/@YourHandle?sub_confirmation=1</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Channel ID</td>
                <td className="px-4 py-3 text-[#8A7F72]">youtube.com/channel/UCxxxxxx</td>
                <td className="px-4 py-3 text-[#8A7F72]">youtube.com/channel/UCxxxxxx?sub_confirmation=1</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">Custom name</td>
                <td className="px-4 py-3 text-[#8A7F72]">youtube.com/c/YourName</td>
                <td className="px-4 py-3 text-[#8A7F72]">youtube.com/c/YourName?sub_confirmation=1</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Warning Callout */}
        <div className="bg-[#FEF6E8] border border-[#F5D78E] rounded-xl p-4 mb-4">
          <p className="text-[#1A1612] text-sm leading-relaxed">
            <span className="font-bold">⚠️ Important:</span> <code className="bg-white/60 px-1.5 py-0.5 rounded text-xs text-[#E8402A]">?sub_confirmation=1</code> only
            works on channel URLs — NOT on individual video URLs (youtube.com/watch?v=...). This is the most common mistake creators make.
            The YouTube subscribe link generator above automatically detects and corrects this.
          </p>
        </div>
      </section>

      {/* H2: How to Create a YouTube Subscribe Link */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          How to Create a YouTube Subscribe Link (2 Methods)
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Two ways to create your subscribe link — the YouTube subscribe link generator above handles both cases automatically.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Method 1 — Use the Generator (Recommended, 30 Seconds)
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Go to your YouTube channel page and copy the URL from your browser&apos;s address bar — any format works (@handle, /channel/, /c/, /user/)</li>
          <li>Paste the URL into the generator above and click Generate</li>
          <li>Your subscribe link appears instantly — click Copy</li>
          <li>Optional: generate a{' '}
            <Link href="/youtube-qr-code-generator" className="text-[#E8402A] hover:underline font-medium">QR code for your channel</Link>
            {' '}or an{' '}
            <Link href="/youtube-embed-code-generator" className="text-[#E8402A] hover:underline font-medium">HTML subscribe button for your website</Link>
          </li>
        </ol>
        <p className="text-[#1A1612] text-base leading-relaxed mb-8">
          Why the generator over manual: it handles all URL format variations automatically and validates that the link will actually
          trigger the YouTube subscribe popup — so you don&apos;t share a broken link to your audience.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Method 2 — Create It Manually (No Tool Needed)
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Go to your YouTube channel and find your channel URL in the browser address bar</li>
          <li>Copy the exact URL — use the @handle format if available, it&apos;s the cleanest</li>
          <li>Append <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">?sub_confirmation=1</code> directly to the end</li>
        </ol>

        <p className="text-[#1A1612] text-sm font-medium mb-2">Before:</p>
        <div className="bg-[#1A1612] rounded-lg p-4 mb-3 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://www.youtube.com/@YourHandle
          </code>
        </div>
        <p className="text-[#1A1612] text-sm font-medium mb-2">After:</p>
        <div className="bg-[#1A1612] rounded-lg p-4 mb-6 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://www.youtube.com/@YourHandle?sub_confirmation=1
          </code>
        </div>

        <p className="text-[#1A1612] text-sm font-medium mb-2">Before:</p>
        <div className="bg-[#1A1612] rounded-lg p-4 mb-3 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxxxx
          </code>
        </div>
        <p className="text-[#1A1612] text-sm font-medium mb-2">After:</p>
        <div className="bg-[#1A1612] rounded-lg p-4 mb-6 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxxxx?sub_confirmation=1
          </code>
        </div>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          How to Find Your YouTube Channel ID
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Sign in to YouTube → click your profile picture → YouTube Studio</li>
          <li>Go to Settings → Channel → Basic Info</li>
          <li>Your Channel ID starts with &ldquo;UC&rdquo; — 24 characters total</li>
        </ol>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Optional — Shorten with Bitly
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          The raw subscribe URL is long. For Instagram bio or printed materials, use{' '}
          <a href="https://bitly.com" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">
            Bitly
          </a>
          {' '}to create a short branded link like <code className="bg-[#F5F0E8] px-2 py-0.5 rounded text-sm text-[#E8402A]">bit.ly/subscribe-yourname</code>.
          Track clicks directly in Bitly&apos;s dashboard — no Google Analytics setup needed.
        </p>
      </section>

      {/* H2: Where to Share Your YouTube Subscribe Link */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Where to Share Your YouTube Subscribe Link
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Generating the link is step one. Placing it where your target audience actually sees it is what drives YouTube subscriber
          growth. Here are the highest-converting placements — ordered by impact.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Social Media Bios (Highest Impact)
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-3">
          <strong>Instagram bio:</strong> Instagram allows one clickable link in bio. Your YouTube subscribe link — not your channel
          URL — should be it if YouTube growth is your priority. Alternatively, use a link-in-bio tool:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>
            <a href="https://linktr.ee" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">Linktree</a>
            {' '}— create a page with multiple links, put your subscribe link at the top
          </li>
          <li>Beacons (beacons.ai) — similar to Linktree with more customization</li>
          <li>Stan Store (stan.store) — popular with creators who also sell products</li>
        </ul>

        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Whatever link-in-bio tool you use, label your YouTube subscribe link clearly: &ldquo;Subscribe on YouTube 🔔&rdquo;
          outperforms generic labels like &ldquo;My YouTube Channel.&rdquo;
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          <strong>TikTok bio:</strong> Same principle — one link slot, use your channel subscription link or a Linktree that includes it prominently.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-8">
          <strong>Twitter/X profile:</strong> Add your auto subscribe link to your website field in Twitter/X bio settings.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Email Marketing (Consistent, Compounding Impact)
        </h3>
        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-8">
          <li><strong>Newsletter footer:</strong> add &ldquo;Subscribe on YouTube →&rdquo; with your subscribe link as a standard footer element — every email you send becomes a subscriber acquisition opportunity</li>
          <li><strong>Email signature:</strong> add a one-line &ldquo;Watch on YouTube&rdquo; CTA with your subscribe link to your personal email signature</li>
          <li><strong>Welcome email:</strong> when someone joins your email list, the welcome email is your highest open-rate email — include your subscribe link with a CTA like &ldquo;Join X subscribers on YouTube&rdquo;</li>
        </ul>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Your Own YouTube Content
        </h3>
        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-8">
          <li><strong>Video descriptions:</strong> include your subscribe link in every video description — viewers who find you through search can subscribe from the description without going to your channel page</li>
          <li><strong>Pinned comment:</strong> pin a comment with your subscribe link on your most-viewed videos</li>
          <li><strong>End screen CTA text:</strong> mention &ldquo;Subscribe link in description&rdquo; in your outro</li>
        </ul>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Collaboration and Cross-Promotion
        </h3>
        <ul className="list-disc list-inside space-y-2 text-[#1A1612] text-base leading-relaxed mb-4">
          <li>Ask collaboration partners to include your subscribe link (not just your channel URL) in their video descriptions</li>
          <li>Guest blog post author bios — if you write for other creators&apos; blogs or newsletters</li>
          <li>Podcast guest appearances — request the subscribe link in show notes</li>
        </ul>
      </section>

      {/* H2: Does the YouTube Subscribe Link Work on Mobile? */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Does the YouTube Subscribe Link Work on Mobile?
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Yes — but with an important nuance that most guides don&apos;t explain. The behavior differs depending on whether the
          viewer has the YouTube app installed.
        </p>

        {/* Desktop */}
        <div className="border-l-4 border-[#16A34A] bg-[#F0FDF4] rounded-r-xl p-4 mb-4">
          <p className="text-[#1A1612] text-sm font-bold mb-1">✓ Desktop — Works Perfectly</p>
          <p className="text-[#1A1612] text-sm leading-relaxed">
            On any desktop browser (Chrome, Firefox, Safari, Edge): clicking the subscribe link opens YouTube in that browser and
            shows the subscription confirmation popup immediately. No app, no redirect — it just works.
          </p>
        </div>

        {/* Mobile with App */}
        <div className="border-l-4 border-[#16A34A] bg-[#F0FDF4] rounded-r-xl p-4 mb-4">
          <p className="text-[#1A1612] text-sm font-bold mb-1">✓ Mobile with YouTube App Installed (Most Common)</p>
          <p className="text-[#1A1612] text-sm leading-relaxed">
            When someone clicks your subscribe link on mobile and the YouTube app is installed: the link opens the YouTube app and
            shows the subscribe confirmation popup inside the app. This is the ideal mobile experience and works on both iOS and Android.
          </p>
        </div>

        {/* Mobile without App */}
        <div className="border-l-4 border-[#F59E0B] bg-[#FEF6E8] rounded-r-xl p-4 mb-4">
          <p className="text-[#1A1612] text-sm font-bold mb-1">⚠️ Mobile Browser Without the YouTube App — Variable</p>
          <p className="text-[#1A1612] text-sm leading-relaxed">
            When someone clicks your subscribe link on mobile and the YouTube app is NOT installed (or the link opens in a browser
            instead of the app): they&apos;re taken to the YouTube mobile site. The subscribe popup may or may not appear depending
            on whether they&apos;re signed in to YouTube in that browser.
          </p>
        </div>

        {/* Testing Tip Callout */}
        <div className="bg-[#EBF4FF] border border-[#BFDBFE] rounded-xl p-4 mb-4">
          <p className="text-[#1A1612] text-sm leading-relaxed">
            <span className="font-bold">💡 Testing tip:</span> Always test your subscribe link in a private/incognito window — logged
            out of YouTube. Your own account suppresses the popup because YouTube knows you&apos;re the channel owner. What you see
            isn&apos;t what your audience sees.
          </p>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed">
          For the vast majority of your audience — who have the YouTube app installed — your subscribe link will work exactly as
          intended on mobile. The edge case only affects viewers without the app who aren&apos;t signed in, which is a small minority.
        </p>
      </section>

      {/* H2: How to Track Clicks on Your Subscribe Link */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          How to Track Clicks on Your YouTube Subscribe Link
        </h2>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Sharing your subscribe link without tracking it is like running ads without checking conversions. Here&apos;s how to know
          exactly which placements drive the most subscribers using UTM tracking.
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Method 1 — UTM Parameters (Free, Works with GA4)
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Append UTM parameters to your subscribe link before sharing. Each placement gets its own UTM-tagged version — so you can
          see in Google Analytics 4 exactly where your clicks come from.
        </p>

        <p className="text-[#1A1612] text-sm font-medium mb-2">The UTM-tagged subscribe link format:</p>
        <div className="bg-[#1A1612] rounded-lg p-4 mb-6 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://www.youtube.com/@YourHandle?sub_confirmation=1&amp;utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=subscribe_growth
          </code>
        </div>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          UTM Parameter Breakdown
        </h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-[#E0D9CE] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F5F0E8]">
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Parameter</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">Example Value</th>
                <th className="px-4 py-3 text-left font-semibold text-[#1A1612]">What It Tracks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CE]">
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">utm_source</td>
                <td className="px-4 py-3 text-[#8A7F72]">instagram, email, tiktok</td>
                <td className="px-4 py-3 text-[#8A7F72]">Which platform sent the click</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">utm_medium</td>
                <td className="px-4 py-3 text-[#8A7F72]">bio, newsletter, description</td>
                <td className="px-4 py-3 text-[#8A7F72]">The specific placement on that platform</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-[#1A1612] font-medium">utm_campaign</td>
                <td className="px-4 py-3 text-[#8A7F72]">subscribe_growth, collab_jan26</td>
                <td className="px-4 py-3 text-[#8A7F72]">The campaign or initiative</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[#1A1612] text-sm font-medium mb-2">Instagram bio version:</p>
        <div className="bg-[#1A1612] rounded-lg p-4 mb-4 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://www.youtube.com/@YourHandle?sub_confirmation=1&amp;utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=subscribe
          </code>
        </div>

        <p className="text-[#1A1612] text-sm font-medium mb-2">Email newsletter version:</p>
        <div className="bg-[#1A1612] rounded-lg p-4 mb-4 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://www.youtube.com/@YourHandle?sub_confirmation=1&amp;utm_source=email&amp;utm_medium=newsletter&amp;utm_campaign=subscribe
          </code>
        </div>

        <p className="text-[#1A1612] text-sm font-medium mb-2">TikTok bio version:</p>
        <div className="bg-[#1A1612] rounded-lg p-4 mb-6 overflow-x-auto">
          <code className="text-sm text-[#F5F0E8] font-mono">
            https://www.youtube.com/@YourHandle?sub_confirmation=1&amp;utm_source=tiktok&amp;utm_medium=bio&amp;utm_campaign=subscribe
          </code>
        </div>

        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          In GA4: go to Reports → Acquisition → Traffic Acquisition → filter by Session source to see clicks from each platform.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-8">
          <a href="https://ga.google.com/analytics/web/template?type=campaign_url_builder" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">
            Use Google&apos;s Campaign URL Builder to generate UTM links →
          </a>
        </p>

        <h3 className="font-display text-lg font-bold text-[#1A1612] mb-3">
          Method 2 — Bitly Click Tracking (Simpler, No GA4 Needed)
        </h3>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          If UTM parameters feel too technical, use Bitly: shorten your subscribe link through Bitly, and Bitly&apos;s dashboard
          shows total clicks, geographic breakdown, and device split — no GA4 setup required.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          <a href="https://bitly.com" target="_blank" rel="noopener noreferrer" className="text-[#E8402A] hover:underline font-medium">
            Track clicks with Bitly →
          </a>
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed">
          Bitly&apos;s free tier allows up to 10 short links with basic analytics. For creators managing one channel&apos;s subscribe
          link, the free tier is sufficient for tracking your UTM subscribe link performance.
        </p>
      </section>

      {/* H2: Frequently Asked Questions */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-[#1A1612] mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              How do I create a subscribe link for YouTube?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Two ways: (1) Paste your channel URL into the YouTube subscribe link generator above — your subscribe link is ready in
              seconds. (2) Manually append <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">?sub_confirmation=1</code> to
              your channel URL. Example: youtube.com/@YourHandle becomes youtube.com/@YourHandle?sub_confirmation=1. The generator is
              faster and validates the URL format automatically.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              What is the YouTube subscribe link format?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Your channel URL with <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">?sub_confirmation=1</code> added
              to the end. Works with all YouTube channel URL formats: @handle (youtube.com/@handle?sub_confirmation=1), channel ID
              (youtube.com/channel/UCxxxx?sub_confirmation=1), and custom URL (youtube.com/c/name?sub_confirmation=1). The parameter
              does NOT work on video URLs — only channel URLs.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              Does the YouTube subscribe link work on mobile?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Yes — with a nuance. On mobile with the YouTube app installed, the link opens the app and shows the subscribe popup
              correctly. On mobile without the app (or if it opens in a browser), the experience varies by whether the user is signed
              in. For most viewers with the YouTube app, it works perfectly.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              What is ?sub_confirmation=1?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              It&apos;s a YouTube URL parameter that triggers a subscribe confirmation popup when someone clicks your channel link.
              Instead of just landing on your channel page, visitors see a &ldquo;Subscribe to [Channel Name]?&rdquo; prompt with a
              prominent Subscribe button. It&apos;s an official YouTube feature — not a hack or workaround.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              How do I add a subscribe link to my Instagram bio?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Instagram allows one clickable URL in bio. Go to Edit Profile → Website → paste your subscribe link. Alternatively, use
              a link-in-bio tool (Linktree, Beacons) to include your subscribe link alongside other links, then put the Linktree URL
              in your Instagram bio. Label it clearly: &ldquo;Subscribe on YouTube 🔔&rdquo;
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              Can I create a subscribe link without a tool?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Yes — just append <code className="bg-[#F5F0E8] px-1.5 py-0.5 rounded text-xs text-[#E8402A]">?sub_confirmation=1</code> to
              your YouTube channel URL manually. The full link format is:
              https://www.youtube.com/@YourHandle?sub_confirmation=1. The generator above handles this automatically and validates the
              URL format, which is useful if you&apos;re unsure which URL format your channel uses.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-[#1A1612] mb-2">
              Why isn&apos;t the subscribe popup appearing?
            </h3>
            <p className="text-[#8A7F72] text-sm leading-relaxed">
              Four common causes: (1) You&apos;re testing it while logged into YouTube as the channel owner — YouTube suppresses the
              popup for channel owners. Test in an incognito/private window while logged out. (2) The link uses a video URL instead of
              a channel URL — ?sub_confirmation=1 only works on channel URLs. (3) The viewer is already subscribed — YouTube
              doesn&apos;t show the popup to existing subscribers. (4) The viewer is not signed in to YouTube — they&apos;ll see the
              channel page instead of a popup.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <p className="text-[#1A1612] text-base leading-relaxed mb-4">
          Your subscribe link is the single highest-leverage change you can make to your channel promotion strategy today. This free
          YouTube subscribe link generator takes 30 seconds to use and works everywhere your channel URL currently works — with one
          key difference: visitors actually subscribe instead of bouncing.
        </p>
        <p className="text-[#1A1612] text-base leading-relaxed mb-6">
          Test it in an incognito window before sharing. UTM-tag each placement so you know what&apos;s working. Shorten with Bitly
          if you need a clean URL for your link in bio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/tools" className="inline-flex items-center justify-center px-6 py-3 bg-[#E8402A] text-white rounded-full text-sm font-semibold hover:bg-[#c42e2e] transition-colors">
            Explore All Free YouTube Tools →
          </Link>
          <Link href="/niches" className="inline-flex items-center justify-center px-6 py-3 border border-[#E0D9CE] text-[#1A1612] rounded-full text-sm font-semibold hover:bg-[#F5F0E8] transition-colors">
            Research Your Niche Before Growing →
          </Link>
        </div>
      </section>

    </article>
  )
}
