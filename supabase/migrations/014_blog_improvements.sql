-- Add new columns to blog_posts
alter table public.blog_posts
  add column if not exists category text default 'General',
  add column if not exists read_time integer default 5,
  add column if not exists is_featured boolean default false,
  add column if not exists views integer default 0,
  add column if not exists author_name text default 'YTNiches Team',
  add column if not exists author_avatar text default '';

-- tags column already exists per existing schema, skip
-- cover_image already exists per existing schema, skip
-- excerpt already exists per existing schema, skip

-- Only one featured post at a time
create unique index if not exists idx_blog_posts_featured
  on public.blog_posts(is_featured)
  where is_featured = true;

create index if not exists idx_blog_posts_published_date
  on public.blog_posts(published, created_at desc);

-- ==========================================
-- SEED 7 BLOG POSTS (HTML content)
-- ==========================================
insert into public.blog_posts (
  title, slug, excerpt, content, cover_image,
  category, read_time, is_featured, published,
  author, author_name, tags, views
) values

(
  '50 Best YouTube Niches in 2025 — The Complete Guide',
  'best-youtube-niches-2025',
  'We analyzed 1,200+ YouTube niches to find the ones with the highest CPM, lowest competition, and fastest growth in 2025. Here are the top 50 you should consider.',
  '<h2>What Makes a Great YouTube Niche?</h2><p>Starting a YouTube channel is one of the best decisions you can make in 2025. But picking the wrong niche can waste months of your life.</p><p>We analyzed over 1,200 YouTube niches, looking at CPM rates, competition levels, growth trends, and audience size to bring you this definitive list. Before we dive in, here is what we looked for:</p><ul><li><strong>High CPM</strong> — advertisers pay more in some niches</li><li><strong>Low competition</strong> — easier to rank and get discovered</li><li><strong>Growing audience</strong> — not a dying trend</li><li><strong>Content sustainability</strong> — you can make 100+ videos</li></ul><h2>Top Finance Niches</h2><h3>1. Budget Investing for Beginners</h3><p>CPM: $18–$32 | Competition: Low | Growth: Rising</p><p>This niche targets the massive audience of people who want to start investing but feel intimidated by the stock market. Videos on index funds, Roth IRAs, and compound interest consistently pull high CPM from financial advertisers.</p><h3>2. Personal Finance for Young Professionals</h3><p>CPM: $22–$38 | Competition: Medium | Growth: Steady</p><p>Young professionals in their 20s and 30s are actively searching for help with budgeting, debt payoff, and building wealth. This audience has disposable income and advertisers are willing to pay premium rates to reach them.</p><h2>Top Tech Niches</h2><h3>3. AI Tools for Small Business</h3><p>CPM: $25–$45 | Competition: Low | Growth: Explosive</p><p>AI tool tutorials are one of the fastest growing categories on YouTube right now. Small business owners want to learn how to use ChatGPT, Midjourney, and other AI tools to save time and money.</p><h3>4. Cybersecurity for Beginners</h3><p>CPM: $28–$50 | Competition: Low | Growth: Rising</p><p>With data breaches in the news constantly, there is massive demand for cybersecurity content aimed at non-technical viewers. This niche commands some of the highest CPM rates on the platform.</p><h2>Top Health and Wellness Niches</h2><h3>5. Gut Health and Microbiome</h3><p>CPM: $15–$28 | Competition: Low | Growth: Rising</p><p>Gut health has exploded as a topic with research connecting it to mental health, immunity, and overall wellness. This is still a relatively uncrowded space with a passionate audience.</p><blockquote><p>The best niche is not necessarily the one with the highest CPM — it is the one you can create 200 videos about without burning out.</p></blockquote><h2>How to Choose Your Niche</h2><p>Here is a simple framework for picking your YouTube niche in 2025:</p><ol><li>List 5–10 topics you genuinely enjoy talking about</li><li>Check the CPM range for each niche using our database</li><li>Search YouTube and assess how saturated each niche is</li><li>Pick the intersection of passion, profitability, and low competition</li></ol><p>Use our <strong>Niche Library</strong> to browse 1,200+ researched niches with full CPM data, competition scores, and AI-generated content kits.</p>',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
  'Niche Research', 12, true, true,
  'YTNiches Team', 'YTNiches Team',
  ARRAY['YouTube Niches', 'CPM', '2025', 'Niche Research'],
  8420
),

(
  'YouTube CPM Rates by Niche in 2025',
  'youtube-cpm-rates-by-niche-2025',
  'A complete breakdown of YouTube CPM rates across every major niche. Find out which niches pay the most per 1,000 views.',
  '<h2>What is CPM on YouTube?</h2><p>CPM (Cost Per Mille) is the amount advertisers pay per 1,000 ad impressions on YouTube videos. Understanding CPM by niche is crucial for choosing a profitable channel topic.</p><p>CPM varies dramatically by niche because advertisers in different industries have different budgets. Finance and business niches command $15–$40 CPM while gaming niches average $2–$5.</p><h2>Highest CPM Niches in 2025</h2><p>Here are the niches with the highest average CPM rates:</p><ol><li><strong>Finance &amp; Investing</strong> — $18–$45 CPM</li><li><strong>Cybersecurity</strong> — $22–$50 CPM</li><li><strong>B2B Software / SaaS</strong> — $20–$42 CPM</li><li><strong>Legal &amp; Law</strong> — $15–$38 CPM</li><li><strong>Real Estate</strong> — $12–$30 CPM</li><li><strong>Health &amp; Medical</strong> — $10–$25 CPM</li><li><strong>Education &amp; Online Courses</strong> — $8–$20 CPM</li></ol><h2>Lowest CPM Niches</h2><p>These niches get massive views but earn less per thousand:</p><ul><li><strong>Gaming</strong> — $1–$5 CPM</li><li><strong>Entertainment / Vlogs</strong> — $1–$4 CPM</li><li><strong>Music</strong> — $0.50–$3 CPM</li><li><strong>Kids Content</strong> — $2–$6 CPM (restricted ad categories)</li></ul><h2>Why CPM Matters More Than Views</h2><p>A channel with 100,000 monthly views in the finance niche can earn more than a gaming channel with 1,000,000 monthly views. Here is a real comparison:</p><blockquote><p>Finance channel: 100,000 views × $25 CPM ÷ 1,000 = <strong>$2,500/month</strong><br/>Gaming channel: 1,000,000 views × $3 CPM ÷ 1,000 = <strong>$3,000/month</strong></p></blockquote><p>The finance channel earns nearly as much with 10× fewer views. That is the power of choosing a high-CPM niche.</p><h2>How to Use CPM Data</h2><p>CPM is just one factor. You also need to consider competition level, content sustainability, and your own expertise. Use our niche database to find the sweet spot between high CPM and low competition.</p>',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  'CPM & Revenue', 8, false, true,
  'YTNiches Team', 'YTNiches Team',
  ARRAY['CPM', 'Revenue', 'Monetization'],
  5230
),

(
  'How to Start a YouTube Channel in 2025 — Step by Step',
  'how-to-start-youtube-channel-2025',
  'Everything you need to know to start a successful YouTube channel from scratch in 2025. From picking a niche to your first 1000 subscribers.',
  '<h2>Step 1: Pick Your Niche</h2><p>Starting a YouTube channel has never been more accessible — but it has also never been more competitive. The single most important decision you will make is choosing your niche.</p><p>A great niche has three things:</p><ul><li>You can talk about it for years without getting bored</li><li>There is a real audience searching for this content</li><li>Advertisers are willing to pay to reach that audience</li></ul><h2>Step 2: Set Up Your Channel</h2><p>Once you have your niche, setting up a channel takes about 30 minutes:</p><ol><li>Create a Google account or use your existing one</li><li>Go to YouTube and click your profile icon → Create a channel</li><li>Choose a channel name that reflects your niche</li><li>Upload a professional banner and profile picture</li><li>Write a channel description with your target keywords</li></ol><h2>Step 3: Plan Your First 10 Videos</h2><p>New creators make the mistake of planning one video at a time. Instead, plan your first 10 videos before you record anything. This helps you:</p><ul><li>Build a consistent posting schedule from day one</li><li>Create a logical content progression for subscribers</li><li>Identify gaps in your knowledge before you go live</li></ul><h2>Step 4: Record and Edit</h2><p>You do not need expensive equipment to start. Here is what actually matters:</p><ul><li><strong>Audio</strong> — bad audio kills channels. Get a $50 USB microphone at minimum.</li><li><strong>Lighting</strong> — a $30 ring light makes a huge difference if you are on camera.</li><li><strong>Editing</strong> — use DaVinci Resolve (free) or CapCut for beginners.</li></ul><blockquote><p>Your first 50 videos will be your worst. The goal is to publish them anyway and get better with each one.</p></blockquote><h2>Step 5: Optimize for Search</h2><p>YouTube is the second largest search engine in the world. Every video needs:</p><ul><li>A keyword-rich title</li><li>A detailed description with timestamps</li><li>Relevant tags</li><li>A custom thumbnail with clear text</li></ul><h2>Step 6: Stay Consistent</h2><p>The algorithm rewards consistency more than perfection. Pick a posting schedule you can maintain — even once a week — and stick to it for at least 6 months before evaluating results.</p>',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
  'Getting Started', 10, false, true,
  'YTNiches Team', 'YTNiches Team',
  ARRAY['Beginners', 'YouTube Tips', 'Growth'],
  12400
),

(
  'Low Competition YouTube Niches That Still Pay Well',
  'low-competition-youtube-niches',
  'You do not need to compete with MrBeast. These low competition niches have small audiences but high CPM and growing demand.',
  '<h2>Why Low Competition Beats High Views</h2><p>Everyone wants high views. But smart creators target high CPM with low competition. A niche with 10,000 loyal viewers paying $30 CPM earns more than a viral niche with 500,000 views paying $2 CPM.</p><p>Here are the best low competition niches that still generate significant revenue.</p><h2>Top Low Competition Niches for 2025</h2><h3>1. Estate Planning for Families</h3><p>CPM: $28–$45 | Search Volume: Medium | Competition: Very Low</p><p>Almost nobody is creating quality content about wills, trusts, and estate planning for regular families. The audience is smaller but incredibly loyal, and financial advertisers pay top dollar.</p><h3>2. Niche Language Learning (Rare Languages)</h3><p>CPM: $8–$18 | Search Volume: Low-Medium | Competition: Very Low</p><p>Learning Japanese has thousands of channels. But learning Romanian, Hungarian, or Czech? Almost nobody covers these. Dedicated learners will watch every video you publish.</p><h3>3. Industrial Machinery Maintenance</h3><p>CPM: $15–$35 | Search Volume: Low | Competition: Extremely Low</p><p>Factory managers and maintenance workers need tutorial content desperately. Almost no creators serve this audience despite high B2B advertiser spend.</p><h3>4. Rural Homesteading and Permaculture</h3><p>CPM: $10–$22 | Search Volume: Medium | Competition: Low</p><p>The homesteading trend exploded during COVID and never fully died. Specific topics like food forest design, water catchment, and small-scale farming remain uncrowded.</p><h3>5. Specific Medical Conditions (Patient Perspective)</h3><p>CPM: $12–$30 | Search Volume: Medium | Competition: Low</p><p>People newly diagnosed with conditions like Crohn&apos;s disease, POTS, or ankylosing spondylitis search desperately for personal experience content. Medical advertisers pay high CPM.</p><h2>How to Find More Low Competition Niches</h2><p>Use our niche database to filter by competition level. Every niche in our library includes a competition score, so you can find hidden opportunities before everyone else discovers them.</p>',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  'Niche Research', 7, false, true,
  'YTNiches Team', 'YTNiches Team',
  ARRAY['Low Competition', 'Niche Research', 'Strategy'],
  3870
),

(
  'Faceless YouTube Channel Ideas That Actually Work',
  'faceless-youtube-channel-ideas',
  'You do not need to show your face to build a successful YouTube channel. Here are 20 proven faceless channel ideas with real earning potential.',
  '<h2>Why Go Faceless?</h2><p>Faceless channels are one of the fastest growing trends on YouTube in 2025. You can build a six-figure channel without ever showing your face — and without the anxiety of being a public figure.</p><p>The best faceless channels succeed because they focus entirely on the content. No personal drama, no appearance-based criticism, just value delivery.</p><h2>Best Faceless Channel Formats</h2><h3>1. Narrated Listicle Videos</h3><p>Voiceover + stock footage + text on screen. Channels like Bright Side built massive audiences with this format. Works in nearly any niche.</p><h3>2. Screen Recording Tutorials</h3><p>Record your screen while you teach software, coding, or productivity tools. No face needed — just a clear voice and useful content.</p><h3>3. AI-Generated Explainer Videos</h3><p>Use tools like Pictory, InVideo, or HeyGen to turn scripts into polished videos. Pair with a voiceover (yours or AI-generated) for a fully automated pipeline.</p><h3>4. Animated Educational Content</h3><p>Tools like Vyond or Canva let you create professional animations without artistic skills. This format works especially well for finance, history, and science topics.</p><h3>5. Compilation Channels</h3><p>Curated, commentary-free compilations of public domain footage, historical events, or nature footage. Low production cost, high watch time.</p><h2>Top Faceless Niches by Revenue Potential</h2><ol><li><strong>Personal Finance Tips</strong> — high CPM, evergreen content, easy to script</li><li><strong>AI &amp; Tech News</strong> — exploding growth, broad audience, sponsorship-friendly</li><li><strong>True Crime &amp; Mysteries</strong> — massive audience, loyal viewers, strong retention</li><li><strong>History Documentaries</strong> — timeless content, reusable footage, solid CPM</li><li><strong>Motivational / Self-Improvement</strong> — global audience, easy to produce at scale</li></ol><blockquote><p>The best faceless channels pick a niche and master the format, rather than chasing trends across different topics.</p></blockquote><h2>Getting Started with a Faceless Channel</h2><p>Start with a clear niche, a consistent script format, and one video format you can repeat 100 times. Consistency beats production quality in the early days.</p>',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
  'Channel Ideas', 9, false, true,
  'YTNiches Team', 'YTNiches Team',
  ARRAY['Faceless', 'Channel Ideas', 'Privacy'],
  6750
),

(
  'YouTube Monetization Requirements in 2025 — Everything Changed',
  'youtube-monetization-requirements-2025',
  'YouTube updated its monetization requirements. Here is exactly what you need to qualify for the YouTube Partner Program in 2025.',
  '<h2>The New YouTube Partner Program Requirements</h2><p>YouTube has made significant changes to its monetization program. There are now two tiers — and the lower tier is accessible much earlier than before.</p><h2>YPP Tier 1 — Fan Funding Only</h2><p>To access Channel Memberships and Super Thanks (but not ad revenue), you need:</p><ul><li><strong>500 subscribers</strong></li><li><strong>3 public uploads in the last 90 days</strong></li><li><strong>3,000 watch hours</strong> in the last 12 months, OR <strong>3 million Shorts views</strong> in the last 90 days</li></ul><p>This tier lets you monetize through fan support but does not include ad revenue.</p><h2>YPP Tier 2 — Full Ad Revenue</h2><p>To unlock AdSense revenue sharing, you need:</p><ul><li><strong>1,000 subscribers</strong></li><li><strong>4,000 watch hours</strong> in the last 12 months, OR <strong>10 million Shorts views</strong> in the last 90 days</li></ul><h2>How Long Does It Take to Qualify?</h2><p>The timeline varies enormously by niche and posting frequency. Here is what realistic timelines look like:</p><ol><li><strong>Fast track (6–12 months)</strong> — posting 2–3 times per week in a growing niche</li><li><strong>Average (12–24 months)</strong> — posting once per week consistently</li><li><strong>Slow (2+ years)</strong> — inconsistent posting or oversaturated niche</li></ol><blockquote><p>The creators who hit 1,000 subscribers fastest are not the ones with the best production quality — they are the ones who post the most consistently in a specific niche.</p></blockquote><h2>What Happens After You Join YPP?</h2><p>Once approved, your channel earns a share of ad revenue from every video view. YouTube keeps 45% and gives you 55%. Your actual earnings depend on your CPM, which varies by niche, season, and audience demographics.</p><h2>Tips for Reaching Monetization Faster</h2><ul><li>Choose a niche with high search demand so your videos surface in search</li><li>Post on a consistent schedule — the algorithm rewards regularity</li><li>Optimize every title and thumbnail for click-through rate</li><li>Build watch time by creating longer, structured videos (10–20 minutes)</li></ul>',
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
  'Monetization', 6, false, true,
  'YTNiches Team', 'YTNiches Team',
  ARRAY['Monetization', 'YPP', 'Requirements'],
  9100
),

(
  'The Best YouTube Niches for Beginners With No Experience',
  'best-youtube-niches-for-beginners',
  'Starting from zero? These niches are perfect for beginners — no special skills, no expensive equipment, and high earning potential.',
  '<h2>You Do Not Need to Be an Expert</h2><p>One of the biggest myths about YouTube is that you need to be an expert to start a channel. The truth is, documenting your learning journey often performs better than expert-level tutorials.</p><p>These niches are perfect if you are starting from zero — they require no special skills, no expensive equipment, and they have proven audience demand.</p><h2>Best Niches for Absolute Beginners</h2><h3>1. Learning in Public</h3><p>CPM: $5–$15 | Difficulty: Very Easy</p><p>Pick a skill you want to learn — coding, a language, a musical instrument, investing — and document your progress. Your audience grows alongside your skills. Authenticity beats expertise in this format.</p><h3>2. Budget Cooking and Meal Prep</h3><p>CPM: $4–$12 | Difficulty: Easy</p><p>You do not need culinary school. You need a phone camera and recipes you enjoy making. Budget cooking content has massive evergreen demand and a loyal audience.</p><h3>3. Local Travel and Hidden Gems</h3><p>CPM: $6–$18 | Difficulty: Easy</p><p>Your own city or region is full of content other people would love to see. Local travel channels can build strong communities and attract tourism advertisers.</p><h3>4. Productivity and Study With Me</h3><p>CPM: $8–$20 | Difficulty: Very Easy</p><p>Just point a camera at your desk and study or work. Millions of people use these videos as background motivation. No talking required — just ambient focus content.</p><h3>5. Thrift Flipping and Secondhand Finds</h3><p>CPM: $4–$10 | Difficulty: Easy</p><p>Document buying items at thrift stores and reselling them for profit. This content is naturally engaging, requires almost no investment, and has a passionate community.</p><h2>What Every Beginner Needs to Know</h2><blockquote><p>Your first 20 videos exist to learn the craft. Do not judge your channel&apos;s potential until you have posted at least 50 times.</p></blockquote><p>Every successful creator had a terrible first video. The difference between those who succeed and those who quit is simply consistency over time.</p><h2>Your Action Plan</h2><ol><li>Pick one niche from this list that genuinely interests you</li><li>Commit to posting once per week for 6 months</li><li>Study your analytics after each video and improve one thing</li><li>Never compare your beginning to someone else&apos;s middle</li></ol>',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
  'Beginners', 8, false, true,
  'YTNiches Team', 'YTNiches Team',
  ARRAY['Beginners', 'No Experience', 'Easy Start'],
  4320
);
