-- Down:
-- drop function if exists public.suggest_niche(text, text, text, uuid);
-- drop table if exists public.niche_suggestions;
-- alter table public.niches drop column if exists seed_keywords;
-- alter table public.niches drop column if exists category;
-- (The replaced AI niches and channel classifications are not restored;
-- re-running classify rebuilds classifications from the curated list.)

-- D-080: a curated niche taxonomy replaces AI-created niches (supersedes
-- the auto-create part of D-074). The classifier picks up to 3 niches from
-- this list or leaves a channel unclassified; it never creates one. It may
-- suggest a missing niche, which a super admin approves or rejects on
-- /admin/discovery. Language and format are filters, never part of a name.

alter table public.niches
  add column category text
    check (category in (
      'History & Mythology', 'Geography & World', 'Mystery & Crime', 'Science & Space',
      'Nature & Animals', 'Facts & Knowledge', 'Tech & AI', 'Money & Business',
      'Self-Improvement', 'Relaxation & Sleep', 'Entertainment & Stories',
      'Sports & Games', 'Food'
    )),
  add column seed_keywords text[] not null default '{}';

-- Replace the 71 niches the classifier invented on 2026-09-28. Deleting
-- cascades to channel_niches and niche_snapshots and nulls
-- channels.niche_id / outliers_feed.niche_id.
delete from public.niches;

insert into public.niches (slug, name, category, description, seed_keywords) values
  -- History & Mythology
  ('ancient-history', 'Ancient History', 'History & Mythology', 'Ancient civilisations, empires and archaeology', '{"ancient history documentary","lost civilizations"}'),
  ('medieval-history', 'Medieval History', 'History & Mythology', 'Knights, castles, kingdoms and daily life in the Middle Ages', '{"medieval history explained"}'),
  ('war-history', 'War History', 'History & Mythology', 'Battles, wars and soldiers'' stories from WW1 to the Cold War', '{"ww2 stories","cold war history"}'),
  ('dark-history', 'Dark History', 'History & Mythology', 'The grim, strange and disturbing side of the past', '{"dark history"}'),
  ('royal-history', 'Royal History', 'History & Mythology', 'Monarchies, dynasties and royal scandals', '{"royal family history"}'),
  ('mythology', 'Mythology', 'History & Mythology', 'Gods, heroes and myths from Greek, Norse and world traditions', '{"greek mythology","norse mythology","mythology explained"}'),
  ('bible-stories', 'Bible Stories', 'History & Mythology', 'Scripture stories retold and explained', '{"bible stories"}'),
  ('islamic-history-stories', 'Islamic History & Stories', 'History & Mythology', 'Islamic history and the stories of the prophets', '{"islamic history","stories of the prophets"}'),
  ('biographies', 'Biographies', 'History & Mythology', 'Life stories of famous people', '{"biography documentary","life story of"}'),
  ('map-history', 'Map History', 'History & Mythology', 'History told through animated maps and changing borders', '{"animated maps","maps and borders","historical mapping"}'),
  -- Geography & World
  ('geography-explained', 'Geography Explained', 'Geography & World', 'Why places are the way they are: borders, rivers, cities, climate', '{"geography explained","indian geography","geography fun"}'),
  ('country-comparisons', 'Country Comparisons', 'Geography & World', 'Countries compared by size, economy, military and culture', '{"countries compared","country challenges","true size comparison"}'),
  ('geopolitics', 'Geopolitics', 'Geography & World', 'Conflicts, alliances and world power explained', '{"geopolitical insights"}'),
  ('countryball-animation', 'Countryball Animation', 'Geography & World', 'Countryball-style animated stories about nations', '{"countryballs"}'),
  ('travel-documentaries', 'Travel Documentaries', 'Geography & World', 'Places, cultures and journeys around the world', '{"travel documentary"}'),
  ('abandoned-places', 'Abandoned Places', 'Geography & World', 'Exploring abandoned buildings, towns and ruins', '{"abandoned places","urban exploration"}'),
  ('architecture', 'Architecture', 'Geography & World', 'Famous buildings, megaprojects and how cities are built', '{"architecture documentary"}'),
  -- Mystery & Crime
  ('true-crime', 'True Crime', 'Mystery & Crime', 'Real criminal cases, investigations and killers', '{"true crime documentary","serial killer documentary"}'),
  ('organised-crime', 'Organised Crime', 'Mystery & Crime', 'Mafia, cartels and gangs through history', '{"mafia history"}'),
  ('unsolved-mysteries', 'Unsolved Mysteries', 'Mystery & Crime', 'Disappearances, unexplained events and cold cases', '{"unsolved mysteries"}'),
  ('conspiracy-theories', 'Conspiracy Theories', 'Mystery & Crime', 'Popular conspiracy theories examined', '{"conspiracy theories explained"}'),
  ('horror-stories', 'Horror Stories', 'Mystery & Crime', 'Scary stories and creepy narrations', '{"scary stories"}'),
  ('survival-stories', 'Survival Stories', 'Mystery & Crime', 'Real stories of people surviving against the odds', '{"survival stories"}'),
  -- Science & Space
  ('space-universe', 'Space & Universe', 'Science & Space', 'Planets, black holes, cosmology and space missions', '{"space documentary","universe explained","black holes explained","space facts"}'),
  ('science-explained', 'Science Explained', 'Science & Space', 'Everyday and big-picture science made simple', '{"science facts","3d animation science"}'),
  ('engineering-how-its-made', 'Engineering & How It''s Made', 'Science & Space', 'How machines, products and structures are made and work', '{"engineering explained","how it''s made"}'),
  ('future-technology', 'Future Technology', 'Science & Space', 'Emerging tech and what the future may look like', '{"future technology"}'),
  ('health-nutrition', 'Health & Nutrition', 'Science & Space', 'Body facts, health myths and nutrition science', '{"health facts","nutrition myths"}'),
  ('psychology', 'Psychology', 'Science & Space', 'How the mind works, behaviour and persuasion', '{"dark psychology"}'),
  -- Nature & Animals
  ('animal-facts', 'Animal Facts', 'Nature & Animals', 'Surprising facts about animals', '{"animal facts"}'),
  ('wildlife-documentaries', 'Wildlife Documentaries', 'Nature & Animals', 'Nature and wildlife documentaries', '{"wildlife documentary"}'),
  ('animal-rescue', 'Animal Rescue', 'Nature & Animals', 'Rescue and rehabilitation stories', '{"animal rescue"}'),
  ('funny-animals', 'Funny Animals', 'Nature & Animals', 'Funny animal clips with commentary', '{"funny animals"}'),
  ('ocean-deep-sea', 'Ocean & Deep Sea', 'Nature & Animals', 'Sea creatures, the deep ocean and its mysteries', '{"ocean mysteries"}'),
  -- Facts & Knowledge
  ('did-you-know-facts', 'Did You Know Facts', 'Facts & Knowledge', 'Quick, surprising facts on any topic', '{"did you know facts","quick facts","knowledge shorts"}'),
  ('top-10-lists', 'Top 10 Lists', 'Facts & Knowledge', 'Ranked countdowns on any subject', '{"top 10 facts"}'),
  ('trivia-quizzes', 'Trivia & Quizzes', 'Facts & Knowledge', 'General-knowledge quizzes and trivia', '{"gk quiz","trivia quiz"}'),
  ('exam-preparation', 'Exam Preparation', 'Facts & Knowledge', 'Civil-services and government-exam preparation', '{"upsc exam","current affairs"}'),
  ('news-explainers', 'News Explainers', 'Facts & Knowledge', 'Current events explained', '{"current affairs","news explained"}'),
  -- Tech & AI
  ('ai-tools-tutorials', 'AI Tools & Tutorials', 'Tech & AI', 'How to use AI tools and prompts', '{"ai tools tutorial","chatgpt tips"}'),
  ('ai-news', 'AI News', 'Tech & AI', 'Latest AI releases and industry news', '{"ai news"}'),
  ('tech-explained', 'Tech Explained', 'Tech & AI', 'How technology and gadgets work', '{"tech explained"}'),
  ('aviation', 'Aviation', 'Tech & AI', 'Aircraft, airlines and aviation history', '{"aviation documentary"}'),
  ('car-history', 'Car History', 'Tech & AI', 'Cars, brands and automotive history', '{"car history"}'),
  ('military-technology', 'Military Technology', 'Tech & AI', 'Weapons, vehicles and defence tech', '{"military technology"}'),
  -- Money & Business
  ('personal-finance', 'Personal Finance', 'Money & Business', 'Budgeting, saving and money habits', '{"personal finance tips"}'),
  ('investing', 'Investing', 'Money & Business', 'Stocks, index funds and real estate for beginners', '{"stock market explained","real estate investing for beginners"}'),
  ('crypto', 'Crypto', 'Money & Business', 'Cryptocurrency explained', '{"crypto explained"}'),
  ('side-hustles', 'Side Hustles', 'Money & Business', 'Side hustles and passive-income ideas', '{"side hustle ideas","passive income ideas"}'),
  ('business-case-studies', 'Business Case Studies', 'Money & Business', 'How companies rise, fail and make money', '{"business case study","how brands make money"}'),
  ('economics-explained', 'Economics Explained', 'Money & Business', 'Economies, inflation and markets explained', '{"economics explained"}'),
  ('luxury-wealth', 'Luxury & Wealth', 'Money & Business', 'Billionaire lifestyles and celebrity net worth', '{"luxury lifestyle billionaire","celebrity net worth"}'),
  -- Self-Improvement
  ('self-improvement', 'Self Improvement', 'Self-Improvement', 'Habits, productivity and personal growth', '{"self improvement tips","productivity tips"}'),
  ('motivation', 'Motivation', 'Self-Improvement', 'Motivational speeches and mindset', '{"motivation speech"}'),
  ('philosophy-stoicism', 'Philosophy & Stoicism', 'Self-Improvement', 'Philosophical ideas and Stoic practice', '{"stoicism","philosophy explained"}'),
  ('book-summaries', 'Book Summaries', 'Self-Improvement', 'Key ideas from popular books', '{"book summary"}'),
  ('minimalism', 'Minimalism', 'Self-Improvement', 'Minimalist living and decluttering', '{"minimalism lifestyle"}'),
  ('language-learning', 'Language Learning', 'Self-Improvement', 'Tips and lessons for learning languages', '{"language learning tips"}'),
  -- Relaxation & Sleep
  ('sleep-meditation-music', 'Sleep & Meditation Music', 'Relaxation & Sleep', 'Music for sleep, meditation and calm', '{"sleep music","meditation music"}'),
  ('rain-ambient-sounds', 'Rain & Ambient Sounds', 'Relaxation & Sleep', 'Rain, nature and ambient soundscapes', '{"rain sounds for sleeping","relaxing ambience"}'),
  ('lofi-study-music', 'Lofi & Study Music', 'Relaxation & Sleep', 'Lofi beats for studying and focus', '{"lofi study music"}'),
  ('sleep-stories', 'Sleep Stories', 'Relaxation & Sleep', 'Calm stories read for falling asleep', '{"bedtime stories for adults"}'),
  ('asmr', 'ASMR', 'Relaxation & Sleep', 'ASMR triggers and relaxation', '{"asmr no talking"}'),
  -- Entertainment & Stories
  ('movie-recaps', 'Movie Recaps', 'Entertainment & Stories', 'Films explained and recapped', '{"movie explained"}'),
  ('anime-recaps', 'Anime Recaps', 'Entertainment & Stories', 'Anime series explained and recapped', '{"anime recap"}'),
  ('video-game-lore', 'Video Game Lore', 'Entertainment & Stories', 'Stories and worlds of video games', '{"video game lore"}'),
  ('reddit-stories', 'Reddit Stories', 'Entertainment & Stories', 'Reddit posts narrated', '{"reddit stories"}'),
  ('pop-culture-rankings', 'Pop Culture Rankings', 'Entertainment & Stories', 'Celebrities, music and pop-culture rankings', '{"kpop rankings","celebrity facts"}'),
  ('art-explained', 'Art Explained', 'Entertainment & Stories', 'Famous paintings and artists explained', '{"famous paintings explained"}'),
  -- Sports & Games
  ('football', 'Football', 'Sports & Games', 'Football history, players and comparisons', '{"football history"}'),
  ('sports-documentaries', 'Sports Documentaries', 'Sports & Games', 'Sports stories and athlete documentaries', '{"sports documentary"}'),
  ('chess', 'Chess', 'Sports & Games', 'Chess games, strategy and history', '{"chess explained"}'),
  -- Food
  ('cooking-recipes', 'Cooking & Recipes', 'Food', 'Recipes and cooking videos', '{"cooking without talking"}'),
  ('food-around-the-world', 'Food Around the World', 'Food', 'Food cultures, comparisons and facts', '{"food around the world"}');

-- Every curated niche has a category from here on.
alter table public.niches alter column category set not null;

-- New seed keywords from the taxonomy join the crawl (existing ones keep
-- their source and priority).
insert into public.discovery_seeds (keyword, source, priority)
select distinct unnest(seed_keywords), 'manual', 5 from public.niches
on conflict (keyword) do nothing;

-- Reclassify every stored channel against the new list (no YouTube quota).
update public.channels set niche_id = null, classified_at = null
where classified_at is not null or niche_id is not null;

-- Niches the classifier thought were missing, for super-admin review.
-- Internal: RLS on, zero policies (service role only), like discovery_seeds.
create table public.niche_suggestions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  example_channel_id uuid references public.channels (id) on delete set null,
  times_suggested int not null default 1,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index niche_suggestions_pending_idx
  on public.niche_suggestions (times_suggested desc) where status = 'pending';

alter table public.niche_suggestions enable row level security;

-- One row per suggested slug; repeats of a pending suggestion count up.
-- A rejected or approved slug is not re-opened.
create or replace function public.suggest_niche(
  p_slug text,
  p_name text,
  p_description text,
  p_channel_id uuid
) returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.niche_suggestions (slug, name, description, example_channel_id)
  values (p_slug, p_name, p_description, p_channel_id)
  on conflict (slug) do update
    set times_suggested = public.niche_suggestions.times_suggested + 1
    where public.niche_suggestions.status = 'pending';
$$;

revoke execute on function public.suggest_niche(text, text, text, uuid) from public;
revoke execute on function public.suggest_niche(text, text, text, uuid) from anon;
revoke execute on function public.suggest_niche(text, text, text, uuid) from authenticated;
