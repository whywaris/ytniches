-- ─── Activity log ─────────────────────────────────────────────────────────────
create table if not exists public.activity_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  action text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_activity_log_user_id on public.activity_log(user_id);
create index if not exists idx_activity_log_created_at on public.activity_log(created_at desc);
alter table public.activity_log enable row level security;
create policy "users_read_own_activity" on public.activity_log
  for select using (auth.uid() = user_id);
create policy "users_insert_own_activity" on public.activity_log
  for insert with check (auth.uid() = user_id);

-- ─── Tool usage ────────────────────────────────────────────────────────────────
create table if not exists public.tool_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  tool_name text not null,
  created_at timestamptz default now()
);
create index if not exists idx_tool_usage_user_id on public.tool_usage(user_id);
alter table public.tool_usage enable row level security;
create policy "users_own_tool_usage" on public.tool_usage
  for all using (auth.uid() = user_id);

-- ─── Prompts ───────────────────────────────────────────────────────────────────
create table if not exists public.prompts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  prompt_text text not null,
  tags text[] default '{}',
  is_premium boolean default false,
  created_at timestamptz default now()
);
alter table public.prompts enable row level security;
create policy "public_read_free_prompts" on public.prompts
  for select using (is_premium = false);
create policy "pro_read_all_prompts" on public.prompts
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and plan in ('pro', 'lifetime')
    )
  );
create policy "admin_all_prompts" on public.prompts
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- ─── Prompts seed data ─────────────────────────────────────────────────────────
insert into public.prompts (title, category, prompt_text, tags) values
-- Video Scripts
('Hook Opening Script', 'Video Scripts', 'Write a 30-second hook opening for a YouTube video about [TOPIC]. Start with a shocking statistic or provocative question. Make viewers feel like they NEED to keep watching. End with a clear promise of what they will learn.', array['hooks','scripts','retention']),
('Full Tutorial Script', 'Video Scripts', 'Write a complete YouTube tutorial script for [TOPIC]. Structure: 1) Hook (30 sec), 2) Intro with credentials (1 min), 3) Step-by-step tutorial (main content), 4) Common mistakes to avoid, 5) Call to action. Use conversational language, include natural transitions.', array['tutorial','scripts','long-form']),
('Storytelling Script', 'Video Scripts', 'Write a YouTube video script using the storytelling format for [TOPIC]. Start in the middle of an action (in medias res). Build tension. Deliver a lesson or insight. Include dialogue where appropriate. End with a reflection or call to action.', array['story','scripts','engagement']),
('Reaction/Commentary Script', 'Video Scripts', 'Write a YouTube commentary script reacting to [TOPIC/EVENT]. Structure: Brief intro → present the topic → share your take → analyze why it matters → ask audience for their opinion. Keep it conversational and opinionated.', array['commentary','reaction','scripts']),
('Listicle Script', 'Video Scripts', 'Write a YouTube script for a "Top [NUMBER] [TOPIC]" video. Include a compelling hook, brief intro, then each list item with: a descriptive name, 2-3 sentences of explanation, and one surprising fact. End with the best item last for maximum retention.', array['listicle','scripts','seo']),
('Day in My Life Vlog Script', 'Video Scripts', 'Write a "Day in My Life" vlog script for a [NICHE] creator. Include natural transitions between activities, personality-driven commentary, product mentions that feel organic, and an engaging ending that teases the next video.', array['vlog','scripts','lifestyle']),

-- Thumbnail Prompts
('Bold Text Thumbnail', 'Thumbnail Prompts', 'Create a YouTube thumbnail with: bold white text with black stroke saying "[TITLE]", a high-energy facial expression of a person looking shocked/excited, bright red or yellow background, and one key visual element related to [TOPIC]. Text should take up 40% of the thumbnail.', array['thumbnail','text','bold']),
('Before/After Thumbnail', 'Thumbnail Prompts', 'Design a split-screen YouTube thumbnail showing before (left, dark/sad colors) and after (right, bright/happy colors) for [TRANSFORMATION]. Include an arrow pointing right, "BEFORE" and "AFTER" labels, and a person showing visible emotional contrast.', array['thumbnail','before-after','transformation']),
('Income Proof Thumbnail', 'Thumbnail Prompts', 'Create a YouTube thumbnail showing: a screenshot of revenue/earnings (blurred for privacy but visible), a person pointing at the number with excited expression, text overlay saying "[INCOME AMOUNT]", and green color scheme to suggest money/success.', array['thumbnail','income','proof']),
('Tutorial Thumbnail', 'Thumbnail Prompts', 'Design a step-by-step tutorial thumbnail for [TOPIC]. Include: numbered steps (1-2-3) visible, a clean before/after result, blue or purple professional color scheme, and text "How To [ACTION] in [TIME]". Use screenshots or illustrations.', array['thumbnail','tutorial','how-to']),
('Curiosity Gap Thumbnail', 'Thumbnail Prompts', 'Create a thumbnail that builds maximum curiosity about [TOPIC]. Use: a partial reveal (hide the answer), question mark overlay, person with confused/intrigued expression, dark background with spotlight on key element, and text "Why [MYSTERIOUS CLAIM]?".', array['thumbnail','curiosity','mystery']),
('Comparison Thumbnail', 'Thumbnail Prompts', 'Design a VS comparison thumbnail for [OPTION A] vs [OPTION B]. Include both logos or representations side by side, a large "VS" in the center, neutral professional background, and your face/opinion element. Make both sides visually balanced.', array['thumbnail','comparison','vs']),

-- Community Posts
('Engagement Question Post', 'Community Posts', 'Write a YouTube Community post to boost engagement for a [NICHE] channel. Ask a polarizing but friendly question related to [TOPIC]. Include 2-3 poll options. End with "Comment your answer below!" Keep it under 100 words.', array['community','engagement','polls']),
('Behind the Scenes Post', 'Community Posts', 'Write a YouTube Community post sharing behind-the-scenes of creating [VIDEO TYPE]. Include: what went wrong, what you learned, a sneak peek of upcoming content, and a genuine question asking followers what they want to see next.', array['community','bts','authentic']),
('Milestone Celebration Post', 'Community Posts', 'Write a heartfelt YouTube Community post celebrating [MILESTONE] subscribers. Thank specific types of viewers, share a personal story from the journey, announce something special for subscribers, and ask them to share their favorite video.', array['community','milestone','gratitude']),
('Poll Post', 'Community Posts', 'Create a YouTube Community poll post for a [NICHE] channel. Topic: [TOPIC]. Write the poll question and 4 answer options. Add 2-3 lines of context before the poll. End with a comment prompt for people who choose "Other".', array['community','poll','interaction']),

-- YouTube Shorts
('Shorts Hook Script', 'YouTube Shorts', 'Write a 15-second YouTube Shorts script for [TOPIC]. First 3 seconds: shocking statement or visual hook. Next 10 seconds: quick value delivery or story. Last 2 seconds: call to action ("Follow for more [TOPIC] tips"). No intro, zero fluff.', array['shorts','hooks','viral']),
('Shorts Tutorial Script', 'YouTube Shorts', 'Write a 60-second YouTube Shorts tutorial script teaching [SKILL/TOPIC]. Use: "Watch me [DO X] in 60 seconds" opener, numbered steps on screen, fast transitions, text overlays for key points, and "Save this for later" CTA at the end.', array['shorts','tutorial','educational']),
('Shorts Storytime Script', 'YouTube Shorts', 'Write a 45-second YouTube Shorts storytime script about [TOPIC/EXPERIENCE]. Start mid-action, build to a twist or surprising revelation, end with a relatable lesson. Use casual language, first-person perspective, and conversational pacing.', array['shorts','story','entertainment']),
('Shorts Myth-Busting Script', 'YouTube Shorts', 'Write a YouTube Shorts script busting the myth that [COMMON MISCONCEPTION]. Structure: state the myth (5 sec) → "But actually..." pivot → quick evidence/proof → correct belief. Use text overlays. End with "Share this with someone who needs to see it."', array['shorts','myths','educational']),

-- Channel Description
('About Page Creator Story', 'Channel Description', 'Write a YouTube channel About page for a [NICHE] creator named [NAME]. Include: their backstory and why they started, who the channel is for, what viewers will gain, posting schedule, and contact/collaboration info. Make it personal, warm, and SEO-friendly with keywords for [NICHE].', array['about','description','seo']),
('Business/Professional Channel', 'Channel Description', 'Write a professional YouTube channel description for a [BUSINESS TYPE] channel. Include: company mission, types of content published, credentials/expertise, call to subscribe, and links to website and social media. Keep it authoritative but approachable. Under 250 words.', array['about','business','professional']),
('Educational Channel Description', 'Channel Description', 'Write a YouTube About page for an educational channel teaching [SUBJECT]. Include: the creator''s qualifications, the specific transformation viewers will experience, grade/experience level targeted, posting frequency, and 3-5 keyword-rich phrases for discoverability.', array['about','educational','credibility']),

-- About Page
('Relatable Creator About Page', 'About Page', 'Write a YouTube About page in first person for a creator in [NICHE]. Tone: authentic, relatable, slightly humorous. Include: who you are (no formal bio), why you started (the real story), what makes your channel different, who should subscribe, and a personal sign-off.', array['about','personal','authentic']),
('Authority About Page', 'About Page', 'Write an authority-positioning YouTube About page for an expert in [FIELD]. Include: impressive credentials stated naturally, the specific problem you solve for viewers, notable achievements or features, a content promise, and a strong CTA to subscribe.', array['about','authority','expert']),
('Niche Community About Page', 'About Page', 'Write a YouTube About page for a niche community channel about [TOPIC]. Focus on building tribe identity: "If you love [X], you''re in the right place." Include what makes this community special, inside references, posting schedule, and community rules/values.', array['about','community','niche']),
('Gaming Channel About Page', 'About Page', 'Write a YouTube About page for a gaming channel focused on [GAME/GENRE]. Include: gaming background and style, content types (walkthroughs, reviews, highlights), streaming schedule if applicable, community vibe, and how to join the community Discord or other platforms.', array['about','gaming','community']),
('Finance/Money Channel About', 'About Page', 'Write a compliant YouTube About page for a personal finance channel covering [TOPICS]. Include required disclaimer that content is not financial advice, creator''s background with money, what topics are covered, audience (beginners vs advanced), and posting schedule.', array['about','finance','disclaimer']);
