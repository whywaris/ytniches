// PRD.md §10.3 free tools (D-014, D-054, D-055). Every tool the old site
// had keeps its exact URL, so rankings carry over.
// Copy follows Landing-Copy.md §1.2–1.5.

export type ToolSlug =
  | "youtube-subscribe-link-generator"
  | "rss-feed-generator"
  | "youtube-embed-code-generator"
  | "thumbnail-resizer"
  | "youtube-channel-id-finder"
  | "youtube-outlier-checker"
  | "youtube-thumbnail-download"
  | "watch-time-calculator"
  | "youtube-revenue-calculator"
  | "youtube-timestamp-generator"
  | "tag-extractor"
  | "youtube-qr-code-generator";

export interface Tool {
  slug: ToolSlug;
  name: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  howTo: [string, string, string];
  faq: { question: string; answer: string }[];
  related: ToolSlug[];
  // Shows data fetched from YouTube, so the page carries YouTube attribution
  // (Developer Policies III.F.2.a, D-067d).
  youtubeData?: true;
}

export const TOOLS: Tool[] = [
  {
    slug: "youtube-outlier-checker",
    youtubeData: true,
    name: "Outlier Checker for YouTube",
    tagline: "Paste a video. See if it's beating its own channel's average.",
    seoTitle: "Outlier Checker for YouTube — Is a Video Beating Its Channel?",
    seoDescription:
      "Check if any YouTube video is an outlier: its views against the channel's last 10 uploads, the multiplier, and a clear verdict. Free, no signup.",
    howTo: [
      "Copy a video link from YouTube.",
      "Paste it above and press Check.",
      "Read the verdict: views, the channel's baseline and the multiplier.",
    ],
    faq: [
      {
        question: "What is an outlier video?",
        answer:
          "A video that got far more views than its channel usually gets. We compare it to the channel's own recent uploads, not to other channels.",
      },
      {
        question: "How do you decide if a video is an outlier?",
        answer:
          "We average the views of the channel's 10 uploads published just before the video. If the video has at least 3 times that average, it's an outlier. It's the same rule YTNiches uses inside the app.",
      },
      {
        question: "Why does it say the channel doesn't have enough history?",
        answer:
          "We need at least 5 earlier uploads to trust an average. With fewer, one lucky video would skew everything.",
      },
      {
        question: "Why can't I check an older video?",
        answer:
          "We look at a channel's 50 most recent uploads. If the video is older than that, we can't see the uploads just before it, so we don't guess.",
      },
      {
        question: "Are the view counts live?",
        answer:
          "They come from YouTube and can be up to 6 hours old, because we cache results to stay within YouTube's limits.",
      },
    ],
    related: ["youtube-channel-id-finder", "thumbnail-resizer", "youtube-subscribe-link-generator"],
  },
  {
    slug: "youtube-subscribe-link-generator",
    youtubeData: true,
    name: "Subscribe Link Generator for YouTube",
    tagline: "A link that opens your channel with the subscribe prompt already up.",
    seoTitle: "Subscribe Link Generator for YouTube — Free, Any Device",
    seoDescription:
      "Turn any channel URL or @handle into a subscribe link that opens the subscribe prompt. Free, instant, no signup.",
    howTo: [
      "Paste your channel URL, @handle or channel ID.",
      "Press Generate.",
      "Copy the link and put it in your descriptions, bio or emails.",
    ],
    faq: [
      {
        question: "What does a subscribe link do?",
        answer:
          "It opens your channel with YouTube's subscribe confirmation already showing. Viewers subscribe in one tap instead of hunting for the button.",
      },
      {
        question: "Why does the link use my channel ID instead of my @handle?",
        answer:
          "Your channel ID never changes. If you ever rename your handle, a handle-based link breaks. This one keeps working.",
      },
      {
        question: "Does it work on phones?",
        answer:
          "Yes. On mobile it opens the YouTube app when it's installed, and the website when it isn't.",
      },
      {
        question: "Where should I use it?",
        answer:
          "Video descriptions, pinned comments, your link-in-bio page, email signatures and end screens that allow links.",
      },
    ],
    related: ["youtube-channel-id-finder", "rss-feed-generator", "youtube-embed-code-generator"],
  },
  {
    slug: "rss-feed-generator",
    youtubeData: true,
    name: "RSS Feed Generator for YouTube",
    tagline: "Get the RSS feed for any YouTube channel or playlist.",
    seoTitle: "RSS Feed Generator for YouTube — Free, Instant, No Login",
    seoDescription:
      "Convert any YouTube channel, playlist or @handle into an RSS feed link. Follow uploads in any RSS reader. Free, no account needed.",
    howTo: [
      "Paste a channel URL, @handle, channel ID or playlist link.",
      "Press Generate.",
      "Copy the feed URL into your RSS reader.",
    ],
    faq: [
      {
        question: "Does YouTube still have RSS feeds?",
        answer:
          "Yes. Every channel and playlist has one. YouTube just doesn't show the link anywhere, which is why this tool exists.",
      },
      {
        question: "How many videos does the feed include?",
        answer: "YouTube's feeds list the 15 most recent videos.",
      },
      {
        question: "Can I get a feed for a playlist?",
        answer: "Yes. Paste the playlist link, or any video link that has ?list= in it.",
      },
      {
        question: "What can I do with the feed?",
        answer:
          "Follow competitors in an RSS reader, or trigger automations when a channel uploads, without checking YouTube by hand.",
      },
    ],
    related: [
      "youtube-channel-id-finder",
      "youtube-subscribe-link-generator",
      "youtube-outlier-checker",
    ],
  },
  {
    slug: "youtube-embed-code-generator",
    name: "Embed Code Generator for YouTube",
    tagline: "Embed code with a start time, autoplay, controls and privacy mode.",
    seoTitle: "Embed Code Generator for YouTube — Free & Responsive",
    seoDescription:
      "Generate YouTube embed code with a start time, autoplay, hidden controls, responsive sizing and privacy-enhanced mode. Free, no signup.",
    howTo: [
      "Paste the video link.",
      "Pick your options: start time, autoplay, controls, privacy mode, responsive.",
      "Copy the code into your site.",
    ],
    faq: [
      {
        question: "Why does autoplay also mute the video?",
        answer:
          "Browsers block videos that autoplay with sound. Muting is the only way autoplay works reliably.",
      },
      {
        question: "What is privacy-enhanced mode?",
        answer:
          "The embed loads from youtube-nocookie.com, so YouTube doesn't set tracking cookies until the viewer presses play.",
      },
      {
        question: "What does responsive do?",
        answer:
          "The player fills the width of its container and keeps a 16:9 shape on any screen, instead of a fixed 560×315 box.",
      },
      {
        question: "Can I start the video at a specific time?",
        answer:
          "Yes. Type a time like 1:30 or 90, or paste a link that already has ?t= in it and we'll pick it up.",
      },
    ],
    related: ["thumbnail-resizer", "youtube-subscribe-link-generator", "youtube-outlier-checker"],
  },
  {
    slug: "thumbnail-resizer",
    name: "Thumbnail Resizer for YouTube",
    tagline: "Resize any image to 1280×720, under 2MB. It never leaves your browser.",
    seoTitle: "Thumbnail Resizer for YouTube — 1280×720, Under 2MB",
    seoDescription:
      "Resize and crop any image to YouTube's 1280×720 thumbnail size, under the 2MB limit. Runs in your browser; nothing is uploaded.",
    howTo: [
      "Choose an image from your device.",
      "We crop it to 16:9 from the center and resize it to 1280×720.",
      "Download it and upload it to YouTube.",
    ],
    faq: [
      {
        question: "What size should a YouTube thumbnail be?",
        answer: "1280×720 pixels, a 16:9 shape, under 2MB, as JPG, PNG or GIF.",
      },
      {
        question: "Is my image uploaded anywhere?",
        answer: "No. The resizing happens in your browser. Your image never reaches our servers.",
      },
      {
        question: "Why did my PNG come out as a JPG?",
        answer:
          "Some PNGs are too big to fit under 2MB at 1280×720. When that happens we save a JPG instead, so YouTube accepts it.",
      },
      {
        question: "What if my image isn't 16:9?",
        answer:
          "We crop the largest 16:9 area from the center. Nothing gets stretched. For full control, crop it yourself first.",
      },
      {
        question: "Why won't my iPhone photo load?",
        answer:
          "Most browsers can't open HEIC photos. Export it as JPG or PNG first (on iPhone, set Camera Formats to Most Compatible).",
      },
    ],
    related: [
      "youtube-outlier-checker",
      "youtube-embed-code-generator",
      "youtube-subscribe-link-generator",
    ],
  },
  {
    slug: "youtube-channel-id-finder",
    youtubeData: true,
    name: "Channel ID Finder for YouTube",
    tagline: "Turn any @handle or channel link into its permanent channel ID.",
    seoTitle: "Channel ID Finder for YouTube — Any Channel's ID, Free",
    seoDescription:
      "Find the channel ID (UC…) for any YouTube @handle or channel URL. Free, instant, no signup.",
    howTo: ["Paste an @handle or channel link.", "Press Find.", "Copy the channel ID."],
    faq: [
      {
        question: "What is a YouTube channel ID?",
        answer:
          "A permanent ID that starts with UC and is 24 characters long. Handles can change. The ID never does.",
      },
      {
        question: "When do I need a channel ID?",
        answer:
          "RSS feeds, subscribe links that never break, the YouTube API, and many automation tools all ask for it.",
      },
      {
        question: "Why doesn't my /c/ or /user/ link work?",
        answer:
          "Those are old-style links. Open the channel on YouTube and copy its @handle or its current URL instead.",
      },
      {
        question: "Where does the answer come from?",
        answer: "Straight from YouTube's own data. We cache lookups for a day.",
      },
    ],
    related: ["rss-feed-generator", "youtube-subscribe-link-generator", "youtube-outlier-checker"],
  },
  {
    slug: "youtube-thumbnail-download",
    youtubeData: true,
    name: "Thumbnail Viewer for YouTube",
    tagline: "See any video's thumbnail in every size YouTube stores.",
    seoTitle: "Thumbnail Viewer for YouTube — See Every Size, Free",
    seoDescription:
      "Paste a video link and see its thumbnail in every size YouTube stores, up to 1280×720 HD. Free, instant, no signup.",
    howTo: [
      "Paste a YouTube video link.",
      "Compare the sizes side by side.",
      "Open any size full screen.",
    ],
    faq: [
      {
        question: "Why is there no HD version for some videos?",
        answer:
          "YouTube only stores the 1280×720 size when the uploader gave it a big enough image. When it's missing, we say so and you can use the next size down.",
      },
      {
        question: "Can I reuse someone else's thumbnail?",
        answer:
          "Thumbnails belong to the channel that made them. Study them for ideas, but don't upload another creator's thumbnail as your own.",
      },
      {
        question: "Does this use the YouTube API?",
        answer:
          "No. YouTube serves thumbnails at fixed image addresses, so we build the links straight from the video ID.",
      },
      {
        question: "Does it work for Shorts?",
        answer: "Yes. Paste the Shorts link; it has a video ID like any other video.",
      },
    ],
    related: ["thumbnail-resizer", "tag-extractor", "youtube-outlier-checker"],
  },
  {
    slug: "watch-time-calculator",
    name: "Watch Time Calculator for YouTube",
    tagline: "Turn views and average view duration into watch hours.",
    seoTitle: "Watch Time Calculator for YouTube — Your 4,000 Hours",
    seoDescription:
      "Work out your watch hours from views and average view duration, and how close you are to the 4,000 hours YouTube's Partner Program asks for.",
    howTo: [
      "Enter your views.",
      "Enter your average view duration from YouTube Studio.",
      "See your watch hours and how far you are from 4,000.",
    ],
    faq: [
      {
        question: "How many watch hours do I need to monetize?",
        answer:
          "YouTube's Partner Program asks for 4,000 valid public watch hours in the last 12 months, plus 1,000 subscribers. There's also a Shorts route based on Shorts views.",
      },
      {
        question: "Do Shorts views count toward the 4,000 hours?",
        answer: "No. Only watch time on long-form videos counts toward the 4,000 hours.",
      },
      {
        question: "Is this my exact number?",
        answer:
          "No, it's an estimate from the two numbers you enter. YouTube Studio shows your real, counted watch hours.",
      },
      {
        question: "Where do I find my average view duration?",
        answer: "In YouTube Studio, under Analytics, on the Overview or Engagement tab.",
      },
    ],
    related: [
      "youtube-revenue-calculator",
      "youtube-outlier-checker",
      "youtube-timestamp-generator",
    ],
  },
  {
    slug: "youtube-revenue-calculator",
    name: "Revenue Estimate Calculator for YouTube",
    tagline: "Estimate your earnings from your views and your own RPM.",
    seoTitle: "Revenue Estimate Calculator for YouTube — From Your RPM",
    seoDescription:
      "Estimate YouTube earnings from your views and your own RPM from YouTube Studio. No made-up niche averages. Free, no signup.",
    howTo: [
      "Enter your views (for example, last month's).",
      "Enter your RPM from YouTube Studio.",
      "See your estimated earnings for those views, plus a yearly figure at the same pace.",
    ],
    faq: [
      {
        question: "Why do I have to enter my own RPM?",
        answer:
          'RPM varies hugely by audience, country, topic and time of year. Published "RPM by niche" lists are mostly guesses, so we don\'t show any. Your own RPM is the only number worth using.',
      },
      {
        question: "What's the difference between RPM and CPM?",
        answer:
          "CPM is what advertisers pay per 1,000 ad impressions. RPM is what you actually earn per 1,000 views, after YouTube's share and counting views with no ads. RPM is the one that predicts your income.",
      },
      {
        question: "Where do I find my RPM?",
        answer:
          "In YouTube Studio, under Analytics, then the Revenue tab. It only appears once you're monetized.",
      },
      {
        question: "Why is my real payout different?",
        answer:
          "RPM changes month to month, and some revenue (memberships, Super Thanks, Premium) moves with it. Treat this as an estimate, not a promise.",
      },
    ],
    related: ["watch-time-calculator", "youtube-outlier-checker", "tag-extractor"],
  },
  {
    slug: "youtube-timestamp-generator",
    name: "Timestamp Generator for YouTube",
    tagline: "Turn your notes into chapters YouTube will actually show.",
    seoTitle: "Timestamp Generator for YouTube — Chapters That Work",
    seoDescription:
      "Format video chapters for your YouTube description and check them against YouTube's rules: starts at 0:00, 3+ chapters, 10 seconds each. Free.",
    howTo: [
      "Write one chapter per line with its time, like 1:30 Setup.",
      "Fix anything we flag: YouTube skips chapters that break its rules.",
      "Copy the list into your video description.",
    ],
    faq: [
      {
        question: "Why aren't my chapters showing on YouTube?",
        answer:
          "YouTube only shows chapters when the first one starts at 0:00, there are at least 3, and each is at least 10 seconds long. This tool checks all three.",
      },
      {
        question: "Where do the timestamps go?",
        answer: "In the video description, one per line, in order.",
      },
      {
        question: "Does this generate chapters with AI?",
        answer:
          "No. You write the chapter names and times; we format and check them. Nothing leaves your browser.",
      },
      {
        question: "What time formats work?",
        answer:
          "1:30, 01:30 or 1:02:03 for videos over an hour. Put the time at the start or the end of the line.",
      },
    ],
    related: ["youtube-embed-code-generator", "watch-time-calculator", "tag-extractor"],
  },
  {
    slug: "tag-extractor",
    youtubeData: true,
    name: "Tag Extractor for YouTube",
    tagline: "See the tags on any public YouTube video.",
    seoTitle: "Tag Extractor for YouTube — See Any Video's Tags Free",
    seoDescription:
      "Paste a video link and see the tags the uploader added. Copy them in one click. Free, no signup.",
    howTo: ["Paste a YouTube video link.", "Press Extract.", "Copy the tags you want."],
    faq: [
      {
        question: "Do tags help a video rank?",
        answer:
          "Not much. YouTube says tags play a minimal role in discovery and mainly help with commonly misspelled searches. Titles, thumbnails and the video itself matter far more.",
      },
      {
        question: "Why does this video have no tags?",
        answer: "Many uploaders don't add any. When there are none, we say so.",
      },
      {
        question: "Where do the tags come from?",
        answer:
          "From YouTube's own data for that video. We cache results for a few hours to stay within YouTube's limits.",
      },
      {
        question: "Is there a limit?",
        answer:
          "Yes, a fair-use limit per visitor each hour and day, so the tool stays free for everyone.",
      },
    ],
    related: ["youtube-outlier-checker", "youtube-thumbnail-download", "youtube-channel-id-finder"],
  },
  {
    slug: "youtube-qr-code-generator",
    name: "QR Code Generator for YouTube",
    tagline: "A QR code for any YouTube video, Short, channel or playlist.",
    seoTitle: "QR Code Generator for YouTube — Free PNG & SVG",
    seoDescription:
      "Make a QR code for any YouTube video, channel or playlist link. Download it as PNG or SVG. Free, no signup, nothing tracked.",
    howTo: ["Paste a YouTube link.", "Pick a size.", "Download it as PNG or SVG."],
    faq: [
      {
        question: "Does the QR code expire?",
        answer:
          "No. The link is stored in the code itself, so it works for as long as the YouTube link works.",
      },
      {
        question: "Do you track scans?",
        answer:
          "No. The code points straight at YouTube, with no redirect through us, so there's nothing to track.",
      },
      {
        question: "PNG or SVG?",
        answer: "PNG for screens and quick use. SVG for print: it stays sharp at any size.",
      },
      {
        question: "What happens when someone scans it on a phone?",
        answer: "It opens the link, usually in the YouTube app if it's installed.",
      },
    ],
    related: [
      "youtube-subscribe-link-generator",
      "youtube-embed-code-generator",
      "thumbnail-resizer",
    ],
  },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}
