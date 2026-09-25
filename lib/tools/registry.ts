// PRD.md §10.3 free tools (final list: D-014). Slugs for the first four
// are the old site's exact URLs, so their rankings carry over (D-054).
// Copy follows Landing-Copy.md §1.2–1.5.

export type ToolSlug =
  | "youtube-subscribe-link-generator"
  | "rss-feed-generator"
  | "youtube-embed-code-generator"
  | "thumbnail-resizer"
  | "youtube-channel-id-finder"
  | "youtube-outlier-checker";

export interface Tool {
  slug: ToolSlug;
  name: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  howTo: [string, string, string];
  faq: { question: string; answer: string }[];
  related: ToolSlug[];
}

export const TOOLS: Tool[] = [
  {
    slug: "youtube-outlier-checker",
    name: "YouTube Outlier Checker",
    tagline: "Paste a video. See if it's beating its own channel's average.",
    seoTitle: "YouTube Outlier Checker — Is This Video Beating Its Channel?",
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
    name: "YouTube Subscribe Link Generator",
    tagline: "A link that opens your channel with the subscribe prompt already up.",
    seoTitle: "YouTube Subscribe Link Generator — Free, Works on Every Device",
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
    name: "YouTube RSS Feed Generator",
    tagline: "Get the RSS feed for any YouTube channel or playlist.",
    seoTitle: "YouTube RSS Feed Generator — Free, Instant, No Login",
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
    name: "YouTube Embed Code Generator",
    tagline: "Embed code with a start time, autoplay, controls and privacy mode.",
    seoTitle: "YouTube Embed Code Generator — Free & Responsive",
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
    name: "YouTube Thumbnail Resizer",
    tagline: "Resize any image to 1280×720, under 2MB. It never leaves your browser.",
    seoTitle: "YouTube Thumbnail Resizer — 1280×720, Under 2MB, Free",
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
    name: "YouTube Channel ID Finder",
    tagline: "Turn any @handle or channel link into its permanent channel ID.",
    seoTitle: "YouTube Channel ID Finder — Get Any Channel's ID Free",
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
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}
