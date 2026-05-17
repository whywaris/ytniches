-- ==========================================
-- PROMPT STEPS TABLE (left sidebar tabs)
-- ==========================================
create table public.prompt_steps (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  icon text not null default 'search',
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- PROMPT SUBTABS TABLE (sub-tabs per step)
-- ==========================================
create table public.prompt_subtabs (
  id uuid default gen_random_uuid() primary key,
  step_id uuid references public.prompt_steps(id) on delete cascade not null,
  label text not null,
  title text not null default '',
  subtitle text not null default '',
  content text not null default '',
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_prompt_steps_position on public.prompt_steps(position);
create index idx_prompt_subtabs_step_id on public.prompt_subtabs(step_id);
create index idx_prompt_subtabs_position on public.prompt_subtabs(position);

-- Updated at triggers
create trigger handle_prompt_steps_updated_at
  before update on public.prompt_steps
  for each row execute function public.handle_updated_at();

create trigger handle_prompt_subtabs_updated_at
  before update on public.prompt_subtabs
  for each row execute function public.handle_updated_at();

-- RLS — Admin only
alter table public.prompt_steps enable row level security;
alter table public.prompt_subtabs enable row level security;

create policy "admin_all_prompt_steps" on public.prompt_steps
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "admin_all_prompt_subtabs" on public.prompt_subtabs
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- ==========================================
-- SEED DEFAULT DATA
-- ==========================================
do $$
declare
  step1_id uuid := gen_random_uuid();
  step2_id uuid := gen_random_uuid();
  step3_id uuid := gen_random_uuid();
begin
  -- Step 1: Niche Research
  insert into public.prompt_steps (id, label, icon, position)
  values (step1_id, 'Step 1 — Niche Research', 'search', 0);

  insert into public.prompt_subtabs (step_id, label, title, subtitle, content, position)
  values
  (step1_id, 'Keyword Ideas', 'YouTube Keyword Ideas Generator',
   'Generate high-potential keyword ideas for a YouTube niche',
   'You are a YouTube SEO expert. Generate 20 high-potential keyword ideas for the following niche: [NICHE NAME]

For each keyword include:
- Search intent (informational / commercial / navigational)
- Estimated competition level (Low / Medium / High)
- Content angle suggestion
- Sample video title using this keyword

Focus on:
- Long-tail keywords with clear search intent
- Keywords where existing videos have under 100k views
- Trending topics in this niche in 2025
- Questions people are actively searching for

Format your response as a numbered list with all details for each keyword.', 0),

  (step1_id, 'Competitor Analysis', 'YouTube Competitor Channel Analyzer',
   'Analyze top channels in a niche to find content gaps',
   'You are a YouTube content strategist. Analyze the top channels in the following niche: [NICHE NAME]

Based on what you know about successful channels in this space:

1. CONTENT PATTERNS
- What content formats perform best?
- What video lengths work well?
- What posting frequency is common?

2. CONTENT GAPS
- What topics are underserved?
- What angles are missing?
- What audience needs are not being met?

3. TITLE PATTERNS
- What title structures get the most clicks?
- What emotional triggers are used?
- What power words appear frequently?

4. THUMBNAIL PATTERNS
- What visual styles dominate?
- What color schemes work best?
- What human expression types are common?

5. OPPORTUNITY SCORE
- Rate this niche 1-10 for a new creator
- Explain your reasoning
- Give 3 specific recommendations to stand out', 1);

  -- Step 2: Script Writing
  insert into public.prompt_steps (id, label, icon, position)
  values (step2_id, 'Step 2 — Script Writing', 'pencil', 1);

  insert into public.prompt_subtabs (step_id, label, title, subtitle, content, position)
  values
  (step2_id, 'Hook Formula', 'Scroll-Stopping Hook Writer',
   'Write powerful video hooks that retain viewers in the first 30 seconds',
   'You are a top YouTube scriptwriter. Write 5 different hook variations for the following video topic: [VIDEO TOPIC]

Each hook must be under 30 seconds when spoken (approximately 75 words).

Hook types to write:
1. SHOCKING STAT HOOK — Open with a surprising statistic
2. QUESTION HOOK — Ask a question the viewer desperately wants answered
3. STORY HOOK — Begin with a personal anecdote or story
4. BOLD CLAIM HOOK — Make a controversial or counterintuitive statement
5. VISUAL HOOK — Describe an attention-grabbing opening visual or action

Rules for each hook:
- No slow introductions — start with the most interesting thing
- Create an open loop (tease what is coming without revealing it)
- Speak directly to the viewer using "you"
- End the hook with a clear reason to keep watching

Format: Write each hook fully, then explain why it works in 1 sentence.', 0),

  (step2_id, 'Full Script', 'Complete Video Script Generator',
   'Generate a full structured video script with hook, body, and CTA',
   'You are a professional YouTube scriptwriter. Write a complete video script for the following:

VIDEO TOPIC: [TOPIC]
NICHE: [NICHE]
TARGET LENGTH: [LENGTH] minutes
STYLE: [Educational / Storytelling / Listicle / Documentary]
TARGET AUDIENCE: [AUDIENCE DESCRIPTION]

Script structure to follow:

[HOOK — 0:00 to 0:30]
Write an attention-grabbing opening. No slow intro. Start with the most interesting element.

[INTRO — 0:30 to 1:00]
Tell viewers exactly what they will learn and why it matters to them.

[SECTION 1 — Title]
Main point with supporting evidence, examples, and transitions.

[SECTION 2 — Title]
Main point with supporting evidence, examples, and transitions.

[SECTION 3 — Title]
Main point with supporting evidence, examples, and transitions.

[OUTRO — Last 30 seconds]
Summarize key takeaways. Ask viewers to subscribe with a specific reason. Suggest a related video.

Formatting rules:
- Write exactly as it should be spoken
- Add [PAUSE] markers where the speaker should pause
- Add [B-ROLL: description] where visuals should change
- Keep sentences short and conversational
- Avoid academic or formal language', 1);

  -- Step 3: Thumbnails
  insert into public.prompt_steps (id, label, icon, position)
  values (step3_id, 'Step 3 — Thumbnails', 'image', 2);

  insert into public.prompt_subtabs (step_id, label, title, subtitle, content, position)
  values
  (step3_id, 'Thumbnail Prompt', 'AI Thumbnail Idea Generator',
   'Generate detailed AI image prompts for high-CTR YouTube thumbnails',
   'You are a YouTube thumbnail designer. Generate 5 different thumbnail concepts for the following video: [VIDEO TITLE]

For each concept provide:

CONCEPT NAME: (e.g. "The Shocked Reaction", "The Bold Text Takeover")

LAYOUT DESCRIPTION:
- Subject placement (left / center / right / split)
- Background description
- Text overlay (exact words, max 5 words)
- Color scheme

AI IMAGE PROMPT:
Write a detailed prompt ready to use in Midjourney or DALL-E.
Include: subject description, expression, pose, lighting, background, style, camera angle.

DESIGN ELEMENTS:
- Font style recommendation
- Arrow or graphic elements to add
- Border or frame suggestion

WHY IT WILL WORK:
- Which psychological trigger it uses
- What makes it stand out in the feed
- Estimated CTR impact (Low / Medium / High)

Focus on concepts that would work as actual YouTube thumbnails — not artistic illustrations.', 0);

end $$;
