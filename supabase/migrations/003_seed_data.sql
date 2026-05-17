-- ============================================================
-- 003_seed_data.sql
-- 5 FREE + 10 PREMIUM niches, all published = true
-- ============================================================

-- ==========================================
-- FREE NICHE 1: Budget Investing for Beginners
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Budget Investing for Beginners',
  'budget-investing-beginners',
  'Finance', 18.00, 32.00, 'Low', 'rising',
  '45,000–180,000', 'Tuesday', '10–15 min', 'First-time investors, millennials', '22–35', '28M+',
  false, true,
  ARRAY[
    'How I started investing with just $50 a month',
    'Index funds explained in 8 minutes',
    'The biggest investing mistakes beginners make',
    'Roth IRA vs 401k: which one should you pick first?',
    'Dollar-cost averaging: the lazy strategy that beats pros',
    'How to invest your first $1,000 step by step',
    'What is an ETF and should you buy one?',
    'The 3-fund portfolio: simplest way to build wealth',
    'Why most people never start investing (and how to fix it)',
    'Compound interest explained with real numbers',
    'How to read a stock chart for absolute beginners',
    'Fidelity vs Vanguard vs Schwab: honest comparison',
    'Should you pay off debt or invest first?',
    'How to invest on a $30,000 salary',
    'My investing journey: $0 to $10,000',
    'The truth about robo-advisors (are they worth it?)',
    'Emergency fund first: why the order matters',
    'Fractional shares explained: own Apple for $1',
    'What happens to your money if a brokerage goes bankrupt?',
    'Bond basics: do beginners even need them?',
    'The 4% rule: how to know when you can retire',
    'How inflation destroys savings (and how to fight back)',
    'DRIP investing: letting dividends work for you',
    'How to automate your investments completely',
    'Stocks vs real estate: which builds more wealth?',
    'What I wish I knew before buying my first stock',
    'HSA: the secret triple tax-advantaged account',
    'How to invest a tax refund wisely',
    'Common investing myths that cost beginners money',
    'Building a $1M portfolio on an average salary'
  ],
  '[
    {"label": "Relatable opener", "text": "I remember staring at a brokerage app for 20 minutes, terrified to press buy — today I''ll show you exactly what I wish someone had told me."},
    {"label": "Stat hook", "text": "The average millionaire has 7 income streams — but 90% of them started with one boring index fund."},
    {"label": "Myth buster", "text": "You''ve been told you need thousands of dollars to start investing. That''s flat-out wrong, and today I''m proving it."},
    {"label": "Future pain", "text": "If you don''t start investing this year, inflation will quietly steal 30% of your savings over the next decade — let''s stop that."},
    {"label": "Question hook", "text": "What if putting $200 a month into one fund could make you a millionaire by 60? Let me show you the math."},
    {"label": "Contrast hook", "text": "Your parents saved money in a bank account earning 0.01% interest. There''s a smarter way — and it takes 10 minutes to set up."}
  ]'::jsonb,
  ARRAY[
    'How to Start Investing With [AMOUNT] (Step-by-Step for Beginners)',
    'I Invested [AMOUNT] Every Month for [TIME] — Here''s What Happened',
    'The [NUMBER] Investing Mistakes That Cost Beginners Thousands',
    '[ACCOUNT TYPE] Explained: Everything You Need to Know in [TIME]',
    'How to Build a $[AMOUNT] Portfolio on a [SALARY] Salary',
    'Why I Chose [FUND/STRATEGY] Over Everything Else',
    '[STRATEGY] vs [STRATEGY]: Which Is Better for Beginners?',
    'The Honest Truth About [INVESTING TOPIC] Nobody Tells You',
    'How Compound Interest Turns $[AMOUNT] Into $[AMOUNT]',
    'My [TIME] Investing Journey: What I Learned Starting From Zero'
  ],
  ARRAY[
    'Bold red text "I STARTED WITH $50" on left, shocked face on right, green stock chart in background, clean white card layout',
    'Split screen: "SAVINGS ACCOUNT 0.01%" vs "INDEX FUND 10%/yr", money bags on pro side, sad piggy bank on other',
    'Person holding phone showing brokerage app with green numbers, text overlay "FINALLY MAKING MONEY WORK FOR ME"',
    'Simple pie chart thumbnail showing 3-fund portfolio split, clean minimal design, "THE ONLY PORTFOLIO YOU NEED" text',
    'Before/after: empty wallet photo vs dollar bills fanned out, "6 MONTHS OF INVESTING" label between them',
    'Chalkboard style showing compound interest curve going exponential, "$200/mo → $1,000,000" highlighted',
    'Side-by-side broker logos (Fidelity, Vanguard, Schwab) with checkmarks and stars, "WHICH ONE WINS?" text',
    'Calendar graphic showing "TUESDAY — AUTO-INVEST DAY", green checkmark, "SET IT AND FORGET IT" subtitle'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Foundations Week",
        "days": [
          {"day": 1, "title": "How I started investing with just $50 a month"},
          {"day": 2, "title": "Index funds explained in 8 minutes"},
          {"day": 3, "title": "The biggest investing mistakes beginners make"},
          {"day": 4, "title": "Roth IRA vs 401k: which one should you pick first?"},
          {"day": 5, "title": "Dollar-cost averaging: the lazy strategy that beats pros"}
        ]
      },
      {
        "week_number": 2,
        "label": "Action Week",
        "days": [
          {"day": 8, "title": "How to invest your first $1,000 step by step"},
          {"day": 9, "title": "What is an ETF and should you buy one?"},
          {"day": 10, "title": "The 3-fund portfolio: simplest way to build wealth"},
          {"day": 11, "title": "Fidelity vs Vanguard vs Schwab: honest comparison"},
          {"day": 12, "title": "How to invest on a $30,000 salary"}
        ]
      },
      {
        "week_number": 3,
        "label": "Strategy Week",
        "days": [
          {"day": 15, "title": "Should you pay off debt or invest first?"},
          {"day": 16, "title": "The truth about robo-advisors (are they worth it?)"},
          {"day": 17, "title": "Fractional shares explained: own Apple for $1"},
          {"day": 18, "title": "How to automate your investments completely"},
          {"day": 19, "title": "The 4% rule: how to know when you can retire"}
        ]
      },
      {
        "week_number": 4,
        "label": "Growth Week",
        "days": [
          {"day": 22, "title": "How inflation destroys savings (and how to fight back)"},
          {"day": 23, "title": "DRIP investing: letting dividends work for you"},
          {"day": 24, "title": "HSA: the secret triple tax-advantaged account"},
          {"day": 25, "title": "Building a $1M portfolio on an average salary"},
          {"day": 26, "title": "What I wish I knew before buying my first stock"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- FREE NICHE 2: AI Tools for Productivity
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'AI Tools for Productivity',
  'ai-tools-productivity',
  'Technology', 12.00, 24.00, 'Medium', 'rising',
  '60,000–250,000', 'Wednesday', '8–14 min', 'Knowledge workers, freelancers, students', '20–38', '45M+',
  false, true,
  ARRAY[
    'The 5 AI tools I use every single day to save 3 hours',
    'ChatGPT prompts that actually work for productivity',
    'Notion AI vs ChatGPT: which one runs my life better?',
    'How I automated my email with AI (full walkthrough)',
    'Claude vs ChatGPT vs Gemini: honest 2024 comparison',
    'Building a second brain with AI tools',
    'AI writing tools that don''t sound like robots',
    'How to use AI for research without hallucinations',
    'My AI-powered morning routine that saves 2 hours',
    'Perplexity AI: the Google killer I switched to',
    'Using AI to plan a full content calendar in 10 minutes',
    'The AI note-taking setup that changed how I work',
    'Zapier + AI: automations that run my business on autopilot',
    'How I use AI to summarize 50-page documents instantly',
    'AI for freelancers: tools that replaced my VA',
    'The dark side of AI productivity tools (what nobody says)',
    'Otter.ai vs Fireflies: best AI meeting notes tool',
    'How to build a personal AI assistant for free',
    'Midjourney for thumbnails: my exact workflow',
    'AI tools for students: study smarter not harder',
    'Cursor AI: I coded a whole app without knowing how to code',
    'How AI reads my emails and drafts replies in my voice',
    'The best free AI tools in 2024 (no subscription needed)',
    'Using AI to create a week of social content in one hour',
    'Grammarly vs ProWritingAid vs ChatGPT for writing',
    'How I use AI to never run out of video ideas',
    'AI for project management: Asana meets GPT',
    'Voice-to-text AI tools that actually work',
    'How AI is changing the way I do research (good and bad)',
    '10 AI tools under $20/month worth every penny'
  ],
  '[
    {"label": "Time hook", "text": "I saved 14 hours last week using AI tools — and I''m going to show you exactly which ones and how."},
    {"label": "Relatability hook", "text": "I was drowning in emails, tasks, and tabs — then I found the AI workflow that changed everything."},
    {"label": "Controversy hook", "text": "Most AI productivity content is just people reading feature lists. I''m actually going to show you my real workflow."},
    {"label": "FOMO hook", "text": "While you''re doing tasks manually, your competitors are using AI to do them 10x faster. Let me close that gap for you."},
    {"label": "Comparison hook", "text": "I tested 23 AI tools so you don''t have to. Here are the 5 that actually survived my workflow."},
    {"label": "Outcome hook", "text": "I went from 60-hour weeks to 40-hour weeks without reducing output — AI tools made that possible. Here''s how."}
  ]'::jsonb,
  ARRAY[
    'The [NUMBER] AI Tools That Saved Me [HOURS] Hours Every Week',
    'I Replaced [TASK] With AI — Here''s What Happened',
    '[TOOL] vs [TOOL]: Which AI Tool Actually Wins in [YEAR]?',
    'How to Automate [TASK] With AI (No Coding Required)',
    'My Honest Review of [AI TOOL] After [TIME] of Daily Use',
    'The AI Workflow That Runs My [Business/Life/Job] on Autopilot',
    '[NUMBER] ChatGPT Prompts for [PROFESSION/TASK] That Actually Work',
    'How I Use AI to Do [TASK] in [TIME] Instead of [LONGER TIME]',
    'The Best Free AI Tools for [AUDIENCE] in [YEAR]',
    'I Tried Every AI [TOOL TYPE] — Here''s the Winner'
  ],
  ARRAY[
    'Person at clean desk with multiple screens glowing, text "I SAVED 14 HOURS THIS WEEK" in bold, AI tool logos floating around',
    'ChatGPT logo vs other AI logos in a VS battle graphic, "WHICH ONE WINS?" in bold red, dramatic lighting',
    'Before/after split: messy overwhelmed desk vs clean productive setup, "AI CHANGED EVERYTHING" text overlay',
    'Phone screen showing AI chat interface with quick replies, hand holding phone, "MY EMAIL WRITES ITSELF NOW" caption',
    'Robot assistant graphic in productivity context, checkboxes being ticked automatically, "AUTOPILOT MODE" text',
    'Countdown graphic "10 MINUTES TO PLAN A FULL MONTH OF CONTENT" with calendar filling up with AI help',
    'Side by side: person looking stressed at computer vs same person relaxed, both with same amount of work done',
    'Top-down flat lay of laptop, coffee, notepad, with AI tool interfaces open, "MY AI WORKFLOW" title text'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "AI Essentials",
        "days": [
          {"day": 1, "title": "The 5 AI tools I use every single day to save 3 hours"},
          {"day": 2, "title": "ChatGPT prompts that actually work for productivity"},
          {"day": 3, "title": "Claude vs ChatGPT vs Gemini: honest comparison"},
          {"day": 4, "title": "How I automated my email with AI (full walkthrough)"},
          {"day": 5, "title": "Perplexity AI: the Google killer I switched to"}
        ]
      },
      {
        "week_number": 2,
        "label": "Deep Workflow",
        "days": [
          {"day": 8, "title": "Building a second brain with AI tools"},
          {"day": 9, "title": "Zapier + AI: automations that run my business"},
          {"day": 10, "title": "My AI-powered morning routine that saves 2 hours"},
          {"day": 11, "title": "The AI note-taking setup that changed how I work"},
          {"day": 12, "title": "How to use AI for research without hallucinations"}
        ]
      },
      {
        "week_number": 3,
        "label": "Tool Reviews",
        "days": [
          {"day": 15, "title": "Notion AI vs ChatGPT: which one runs my life better?"},
          {"day": 16, "title": "Otter.ai vs Fireflies: best AI meeting notes tool"},
          {"day": 17, "title": "Cursor AI: I coded a whole app without knowing how"},
          {"day": 18, "title": "Grammarly vs ProWritingAid vs ChatGPT for writing"},
          {"day": 19, "title": "10 AI tools under $20/month worth every penny"}
        ]
      },
      {
        "week_number": 4,
        "label": "Advanced Automation",
        "days": [
          {"day": 22, "title": "AI for freelancers: tools that replaced my VA"},
          {"day": 23, "title": "How to build a personal AI assistant for free"},
          {"day": 24, "title": "Using AI to create a week of social content in one hour"},
          {"day": 25, "title": "The best free AI tools in 2024 (no subscription needed)"},
          {"day": 26, "title": "The dark side of AI productivity tools"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- FREE NICHE 3: Gut Health and Microbiome
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Gut Health and Microbiome',
  'gut-health-microbiome',
  'Health & Fitness', 22.00, 40.00, 'Low', 'rising',
  '35,000–140,000', 'Thursday', '10–18 min', 'Health-conscious adults, chronic illness sufferers', '25–50', '22M+',
  false, true,
  ARRAY[
    'Signs your gut health is destroying your mental health',
    'The gut-brain connection: what science actually says',
    'Best probiotic foods vs probiotic supplements (which wins?)',
    'How I healed my leaky gut in 90 days',
    'The microbiome diet: what to eat and what to avoid',
    '5 foods that are silently destroying your gut lining',
    'Why antibiotics wreck your gut (and how to recover)',
    'Fermented foods ranked: kefir, kimchi, sauerkraut and more',
    'How long does it take to heal your gut? (honest answer)',
    'Prebiotic vs probiotic: most people get this wrong',
    'Does stress really cause gut problems? (the research)',
    'My elimination diet experience: what I learned in 30 days',
    'Gut health for weight loss: the missing piece nobody talks about',
    'Best gut health tests: Viome vs Thryve vs DIY',
    'How sleep destroys or builds your microbiome',
    'SIBO symptoms nobody warns you about',
    'Histamine intolerance explained (and what to eat)',
    'How I fixed my bloating permanently (what worked)',
    'Fiber types your gut bacteria actually need',
    'The truth about gut health supplements on Amazon',
    'Digestive enzymes: do you actually need them?',
    'IBS vs SIBO vs IBD: what is the actual difference?',
    'Gut healing bone broth: does it actually work?',
    'My microbiome test results: what shocked me',
    'Foods to eat every day for a healthier gut',
    'How alcohol affects your microbiome (the science)',
    'Polyphenols: the gut health superfoods hiding in your kitchen',
    'Why your probiotics might not be working',
    'Gut health for kids: what parents need to know',
    'The 4R protocol: the functional medicine approach to gut healing'
  ],
  '[
    {"label": "Symptom hook", "text": "If you have brain fog, anxiety, or constant bloating — your gut is probably the reason, and it''s fixable."},
    {"label": "Science hook", "text": "Your gut has more neurons than your spinal cord. It''s not called the second brain for nothing — and today we''re exploring why."},
    {"label": "Personal story", "text": "For 3 years I had crippling bloating and no doctor could explain it. Then I discovered my microbiome was the problem."},
    {"label": "Myth buster", "text": "You''ve been sold the wrong probiotics your entire life. Most don''t survive past your stomach — here''s what actually works."},
    {"label": "Urgency hook", "text": "The average person has lost 30% of their microbiome diversity compared to our ancestors — and it''s making us sicker."},
    {"label": "Question hook", "text": "What if your anxiety, your weight gain, and your constant fatigue all have the same root cause? Today we''re going to find out."}
  ]'::jsonb,
  ARRAY[
    'How I [HEALED/FIXED] My Gut in [NUMBER] Days (What Actually Worked)',
    '[NUMBER] Signs Your Gut Health Is Ruining Your [SYMPTOM/LIFE]',
    'The Truth About [GUT HEALTH TOPIC] Nobody Is Telling You',
    '[FOOD/SUPPLEMENT] for Gut Health: Does It Actually Work?',
    'I Tried [DIET/PROTOCOL] for [TIME] — Here''s What Happened to My Gut',
    'Probiotic vs [ALTERNATIVE]: Which One Heals Your Gut Faster?',
    'The [NUMBER]-Step [PROTOCOL] to Heal Your Gut Naturally',
    'What [NUMBER] Weeks of [DIET CHANGE] Did to My Microbiome',
    'Why Your [SUPPLEMENT] Isn''t Working (And What to Take Instead)',
    'The Gut-[BRAIN/SKIN/WEIGHT] Connection Explained Simply'
  ],
  ARRAY[
    'Diagram of gut with glowing healthy bacteria vs inflamed sick gut, split comparison, "IS YOUR GUT HEALTHY?" text',
    'Person holding stomach with pained expression on left, same person smiling and energetic on right, "90 DAY TRANSFORMATION"',
    'Array of fermented foods (kimchi, kefir, sauerkraut) flat lay with ratings overlay, "RANKED BY SCIENCE" text',
    'Brain and gut connected by glowing line illustration, "YOUR GUT IS YOUR SECOND BRAIN" in bold',
    'Supplement bottle crossed out vs whole foods photo, "STOP WASTING MONEY" text, high contrast colors',
    'Microbiome diversity chart showing depleted vs healthy, alarming red vs green colors, "YOUR GUT IN 2024" title',
    'Before/after food plate: processed junk on left, colorful whole foods on right, "I CHANGED THIS ONE THING"',
    'Doctor-style illustration of gut lining healthy vs leaky, educational diagram aesthetic, "LEAKY GUT EXPLAINED"'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Gut Foundations",
        "days": [
          {"day": 1, "title": "Signs your gut health is destroying your mental health"},
          {"day": 2, "title": "The gut-brain connection: what science actually says"},
          {"day": 3, "title": "Best probiotic foods vs probiotic supplements"},
          {"day": 4, "title": "5 foods that are silently destroying your gut lining"},
          {"day": 5, "title": "Why antibiotics wreck your gut (and how to recover)"}
        ]
      },
      {
        "week_number": 2,
        "label": "Healing Protocols",
        "days": [
          {"day": 8, "title": "How I healed my leaky gut in 90 days"},
          {"day": 9, "title": "The microbiome diet: what to eat and avoid"},
          {"day": 10, "title": "My elimination diet experience: 30 day results"},
          {"day": 11, "title": "Prebiotic vs probiotic: most people get this wrong"},
          {"day": 12, "title": "The 4R protocol: functional medicine approach"}
        ]
      },
      {
        "week_number": 3,
        "label": "Food and Supplements",
        "days": [
          {"day": 15, "title": "Fermented foods ranked: kefir, kimchi, sauerkraut"},
          {"day": 16, "title": "Fiber types your gut bacteria actually need"},
          {"day": 17, "title": "Polyphenols: the gut superfoods in your kitchen"},
          {"day": 18, "title": "The truth about gut health supplements on Amazon"},
          {"day": 19, "title": "Digestive enzymes: do you actually need them?"}
        ]
      },
      {
        "week_number": 4,
        "label": "Testing and Conditions",
        "days": [
          {"day": 22, "title": "Best gut health tests: Viome vs Thryve vs DIY"},
          {"day": 23, "title": "IBS vs SIBO vs IBD: what is the actual difference?"},
          {"day": 24, "title": "SIBO symptoms nobody warns you about"},
          {"day": 25, "title": "How sleep destroys or builds your microbiome"},
          {"day": 26, "title": "My microbiome test results: what shocked me"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- FREE NICHE 4: Home Workout No Equipment
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Home Workout No Equipment',
  'home-workout-no-equipment',
  'Health & Fitness', 10.00, 20.00, 'Medium', 'stable',
  '80,000–400,000', 'Monday', '15–30 min', 'Busy adults, beginners, parents', '25–45', '60M+',
  false, true,
  ARRAY[
    '30-minute full body workout (no equipment, no excuses)',
    '10-minute morning routine to wake up your body',
    'Beginner bodyweight workout plan for complete newbies',
    'How to build muscle at home without weights',
    '7-day no-equipment challenge: before and after',
    'Upper body workout at home: arms, chest, back',
    'Core workout that actually works (no crunches)',
    'How many push-ups a day to see real results?',
    '20-minute HIIT at home for fat loss',
    'Lower body burn: glutes and legs, no weights needed',
    'The perfect push-up: form breakdown for beginners',
    'Can you actually build a good body without a gym?',
    'Apartment-friendly workout (no jumping, no noise)',
    '5 bodyweight exercises that replace the whole gym',
    'My 90-day home workout transformation',
    'Progressive overload at home: how to keep getting stronger',
    'Stretching routine to fix tight hips from sitting all day',
    'How to stay consistent with home workouts (what actually helps)',
    'Workout schedule for beginners: how often to train',
    'No equipment back workout to fix posture',
    'Full body circuit for weight loss at home',
    'Calisthenics for beginners: pull-ups and dips from zero',
    'How to do a proper plank (most people do it wrong)',
    'Mobility routine for desk workers',
    '15-minute workout when you have zero motivation',
    'Bodyweight shoulder workout for round defined shoulders',
    'How I lost 20 lbs with only home workouts',
    'Night workout routine: calm, effective, sleep-friendly',
    'The workout split that works best for home training',
    'How to track progress with no gym equipment'
  ],
  '[
    {"label": "No-excuse hook", "text": "No gym membership, no equipment, no commute — you need nothing but your bodyweight and 20 minutes. Let''s go."},
    {"label": "Empathy hook", "text": "I know exactly what it''s like to want to get fit but feel like the gym isn''t an option. This channel is built for you."},
    {"label": "Result hook", "text": "I built more muscle in 3 months of home training than in a year of inconsistent gym visits. Here''s the program I used."},
    {"label": "Challenge hook", "text": "I want you to do this workout every day for 7 days and tell me you don''t feel a difference. I promise you will."},
    {"label": "Science hook", "text": "Research shows bodyweight training is equally effective as weight training for muscle growth when done right. Let me show you how."},
    {"label": "Busy person hook", "text": "You have 20 minutes. That''s all this takes. No drive, no locker room, no excuses — just results in your living room."}
  ]'::jsonb,
  ARRAY[
    '[TIME]-Minute [BODY PART] Workout at Home (No Equipment)',
    'I Did [EXERCISE] Every Day for [TIME] — Here''s What Changed',
    'Beginner Home Workout Plan for [GOAL] (Week-by-Week)',
    'Can You Build [MUSCLE/FITNESS GOAL] Without a Gym? (Honest Answer)',
    'The Only [NUMBER] Exercises You Need for a Full Body Home Workout',
    'How to Get [RESULT] Working Out at Home in [TIME]',
    '[WORKOUT TYPE] at Home: [TIME]-Minute [BODY PART] Burn',
    'No Equipment [BODY PART] Workout That Actually Builds Muscle',
    'My [TIME] Home Workout Transformation (Before and After)',
    'The [NUMBER]-Day Home Workout Challenge for [GOAL]'
  ],
  ARRAY[
    'Person mid-push-up in living room, determined face, "NO GYM NEEDED" bold text overlay, clean bright background',
    'Before/after transformation photo pair with "90 DAYS OF HOME WORKOUTS" banner across middle',
    'Flat lay of yoga mat, water bottle, phone with workout app, "EVERYTHING YOU NEED" minimalist aesthetic',
    'Animated exercise demonstration collage showing 4 moves, numbered, "FULL BODY IN 20 MIN" header',
    'Person doing bodyweight squat in apartment, city visible through window, "YOUR LIVING ROOM IS YOUR GYM" text',
    'Clock showing 20 minutes with muscle arm icon, bold text "THAT''S ALL IT TAKES", red accent color',
    'Split: gym photo crossed out vs home workout photo with green checkmark, "SAVE $80/MONTH" text below',
    'Physique photo showing lean muscle, "BUILT WITH ZERO EQUIPMENT" caption, inspirational color grade'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Beginner Foundations",
        "days": [
          {"day": 1, "title": "30-minute full body workout (no equipment, no excuses)"},
          {"day": 2, "title": "10-minute morning routine to wake up your body"},
          {"day": 3, "title": "Beginner bodyweight workout plan for complete newbies"},
          {"day": 4, "title": "Core workout that actually works (no crunches)"},
          {"day": 5, "title": "The perfect push-up: form breakdown for beginners"}
        ]
      },
      {
        "week_number": 2,
        "label": "Build the Base",
        "days": [
          {"day": 8, "title": "Upper body workout at home: arms, chest, back"},
          {"day": 9, "title": "Lower body burn: glutes and legs, no weights needed"},
          {"day": 10, "title": "20-minute HIIT at home for fat loss"},
          {"day": 11, "title": "Apartment-friendly workout (no jumping, no noise)"},
          {"day": 12, "title": "Stretching routine to fix tight hips from sitting"}
        ]
      },
      {
        "week_number": 3,
        "label": "Level Up",
        "days": [
          {"day": 15, "title": "How to build muscle at home without weights"},
          {"day": 16, "title": "Progressive overload at home: keep getting stronger"},
          {"day": 17, "title": "5 bodyweight exercises that replace the whole gym"},
          {"day": 18, "title": "Calisthenics for beginners: pull-ups and dips from zero"},
          {"day": 19, "title": "No equipment back workout to fix posture"}
        ]
      },
      {
        "week_number": 4,
        "label": "Consistency and Results",
        "days": [
          {"day": 22, "title": "7-day no-equipment challenge: before and after"},
          {"day": 23, "title": "How to stay consistent with home workouts"},
          {"day": 24, "title": "My 90-day home workout transformation"},
          {"day": 25, "title": "Workout schedule for beginners: how often to train"},
          {"day": 26, "title": "How I lost 20 lbs with only home workouts"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- FREE NICHE 5: Personal Finance for Students
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Personal Finance for Students',
  'personal-finance-students',
  'Finance', 15.00, 28.00, 'Low', 'rising',
  '40,000–160,000', 'Sunday', '8–14 min', 'College students, recent grads', '18–26', '18M+',
  false, true,
  ARRAY[
    'How to budget in college when you have no money',
    'Student loan strategy: pay off fast vs invest instead',
    'How I graduated with $0 in credit card debt',
    'Best student credit cards for building credit',
    'How to make money in college (that actually works)',
    'FAFSA mistakes that cost students thousands',
    'How to save money as a broke college student',
    'Opening your first investment account in college',
    'Side hustles for college students that pay well',
    'How I paid off my student loans in 2 years',
    'The 50/30/20 budget rule for college students',
    'How to negotiate financial aid (and actually win)',
    'Best free budgeting apps for students',
    'Roth IRA in college: why starting early matters so much',
    'How to avoid lifestyle inflation after graduation',
    'Grocery budget hacks for college students',
    'Understanding your first pay stub (taxes explained simply)',
    'How to get internship pay and still save money',
    'Student emergency fund: how much do you really need?',
    'How to use student discounts to save $200+ a month',
    'Credit score explained for people who have none yet',
    'The real cost of a college degree (is it worth it?)',
    'How to negotiate your first salary after graduation',
    'Passive income ideas realistic for college students',
    'How one student paid their way through college debt-free',
    'Rent vs dorms: financial breakdown for students',
    'Understanding compound interest before you turn 22',
    'How to build wealth on your first entry-level salary',
    'Tax returns for students: are you leaving money on the table?',
    'Financial mistakes I made in college (so you don''t have to)'
  ],
  '[
    {"label": "Peer hook", "text": "Nobody taught us this in school — so I learned it the hard way so you don''t have to. Here''s the money stuff they skipped."},
    {"label": "Stakes hook", "text": "The financial habits you form in the next 4 years will either cost you a decade or make you wealthy by 30. No pressure."},
    {"label": "Myth buster", "text": "You''ve been told you can''t invest while in college. You absolutely can — and starting now is worth more than you think."},
    {"label": "Story hook", "text": "I graduated with $45,000 in student loans. Three years later I was debt-free. Here''s exactly what I did."},
    {"label": "Relatable hook", "text": "Being broke in college is normal. Staying broke after college doesn''t have to be — and it starts with what we cover today."},
    {"label": "Quick win hook", "text": "In the next 10 minutes I''m going to show you 5 things you can do today that your future self will thank you for."}
  ]'::jsonb,
  ARRAY[
    'How to [FINANCIAL GOAL] as a Broke College Student',
    'Student [FINANCIAL TOPIC] Explained Simply (No Finance Degree Needed)',
    'I [FINANCIAL ACHIEVEMENT] in College — Here''s Exactly How',
    'The [NUMBER] Money Mistakes College Students Always Make',
    'How to [BUILD/START/OPEN] [FINANCIAL THING] While Still in School',
    'Best [FINANCIAL PRODUCT] for Students in [YEAR] (Honest Picks)',
    '[FINANCIAL CONCEPT] for Students Who Have No Idea What They''re Doing',
    'How One [STUDENT TYPE] [FINANCIAL ACHIEVEMENT] on a Student Budget',
    'The Only [FINANCIAL THING] Guide You Need as a [YEAR] Student',
    'Why [FINANCIAL HABIT] in College Sets You Up for Life'
  ],
  ARRAY[
    'Stressed student holding empty wallet with "BROKE IN COLLEGE?" text, followed by solution arrow to happy graduation photo',
    'Ramen noodles crossed out, stock chart and savings graph on right side, "YOUR COLLEGE MONEY GUIDE" header',
    'Phone showing budgeting app with clear categories, student desk background, "HOW I BUDGET $800/MONTH IN COLLEGE" overlay',
    'Split screen: student with loan debt stress vs debt-free grad smiling, "I PAID IT ALL OFF IN 2 YEARS"',
    'Credit card floating with "YOUR FIRST CREDIT CARD" label, green checkmarks for student-friendly features listed',
    'Compound interest graph starting at age 20 vs 30, dramatic gap shown, "THE COST OF WAITING" in bold red',
    'College campus background, student with laptop showing investment account with small but real balance, hopeful vibe',
    'Before diploma/after diploma timeline with financial milestones marked, clean infographic thumbnail style'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Money Basics",
        "days": [
          {"day": 1, "title": "How to budget in college when you have no money"},
          {"day": 2, "title": "Best free budgeting apps for students"},
          {"day": 3, "title": "The 50/30/20 budget rule for college students"},
          {"day": 4, "title": "Student emergency fund: how much do you really need?"},
          {"day": 5, "title": "Understanding your first pay stub (taxes explained simply)"}
        ]
      },
      {
        "week_number": 2,
        "label": "Credit and Debt",
        "days": [
          {"day": 8, "title": "Best student credit cards for building credit"},
          {"day": 9, "title": "Credit score explained for people who have none yet"},
          {"day": 10, "title": "Student loan strategy: pay off fast vs invest instead"},
          {"day": 11, "title": "FAFSA mistakes that cost students thousands"},
          {"day": 12, "title": "How to negotiate financial aid (and actually win)"}
        ]
      },
      {
        "week_number": 3,
        "label": "Earning and Saving",
        "days": [
          {"day": 15, "title": "Side hustles for college students that pay well"},
          {"day": 16, "title": "How to make money in college (that actually works)"},
          {"day": 17, "title": "Grocery budget hacks for college students"},
          {"day": 18, "title": "How to use student discounts to save $200+ a month"},
          {"day": 19, "title": "Rent vs dorms: financial breakdown for students"}
        ]
      },
      {
        "week_number": 4,
        "label": "Building Wealth Early",
        "days": [
          {"day": 22, "title": "Opening your first investment account in college"},
          {"day": 23, "title": "Roth IRA in college: why starting early matters so much"},
          {"day": 24, "title": "Understanding compound interest before you turn 22"},
          {"day": 25, "title": "How to negotiate your first salary after graduation"},
          {"day": 26, "title": "Financial mistakes I made in college (so you don''t have to)"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 1: Micro SaaS Building
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Micro SaaS Building',
  'micro-saas-building',
  'Business', 28.00, 55.00, 'Medium', 'rising',
  '30,000–120,000', 'Tuesday', '12–20 min', 'Developers, indie hackers, entrepreneurs', '22–40', '8M+',
  true, true,
  ARRAY[
    'How I built a $3,000/month SaaS in 30 days',
    'Finding micro SaaS ideas nobody else is building',
    'Building a SaaS without writing any code (no-code tools)',
    'My first SaaS: from idea to first paying customer',
    'How to validate a SaaS idea before writing a line of code',
    'Stripe Atlas vs LLC: what I wish I knew before incorporating',
    'Cold email strategy that got me 50 SaaS trial signups',
    'Pricing your SaaS: the psychology behind $29 vs $49',
    'How I acquired my first 100 users with $0 marketing',
    'Building in public: lessons from 6 months of transparency',
    'Micro SaaS vs big SaaS: why small wins',
    'How to find pain points worth $10k/month solving',
    'My $0 → $1,000 MRR journey in detail',
    'Technical vs non-technical founders: can you build SaaS without coding?',
    'The tools I use to run a SaaS solo',
    'How I use AI to build features 10x faster',
    'Churn rate explained: what is acceptable for micro SaaS?',
    'Landing page teardown: why people bounce without converting',
    'App Store vs self-hosted: which distribution wins?',
    'How to handle customer support solo without burning out',
    'SEO for SaaS: content that brings in paying users',
    'My biggest SaaS failure and exactly what went wrong',
    'Micro acquisitions: buying a SaaS instead of building one',
    'How to onboard users so they actually stick around',
    'Annual pricing: why I switched and how MRR changed',
    'Building a waitlist before you have a product',
    'How to use Reddit to find SaaS customers ethically',
    'The metrics every micro SaaS founder must track',
    'When to quit your job for your SaaS (the honest answer)',
    'Selling my first SaaS: the acquisition story'
  ],
  '[
    {"label": "Income hook", "text": "This SaaS makes $3,200 a month while I sleep — I built it in 30 days. Let me show you exactly how."},
    {"label": "Validation hook", "text": "Before writing a single line of code, I had 40 people ready to pay. Validation first, building second — here''s how."},
    {"label": "Small is better hook", "text": "Forget billion-dollar unicorns. A $5,000/month micro SaaS can change your life more than chasing funding ever will."},
    {"label": "No-code hook", "text": "I built my first SaaS without knowing how to code. The product has 200 paying users. Here''s what I used."},
    {"label": "Failure hook", "text": "My first SaaS failed in 3 months. My second one hit $2k MRR. Here''s the one thing I changed."},
    {"label": "Solo founder hook", "text": "Just me, my laptop, and a $20/month server — here''s how I run a five-figure annual revenue SaaS completely solo."}
  ]'::jsonb,
  ARRAY[
    'How I Built a $[MRR]/Month SaaS in [NUMBER] Days (Full Story)',
    'From [START] to $[MRR] MRR: My Micro SaaS Journey',
    'Finding Micro SaaS Ideas Worth [AMOUNT]: My Exact Process',
    'I Built a SaaS Without [CODING/FUNDING/TEAM] — Here''s How',
    'How to Validate a SaaS Idea in [TIME] Before You Build Anything',
    'The [NUMBER] Tools I Use to Run My SaaS Completely Solo',
    'My Micro SaaS [SUCCEEDED/FAILED]: Here''s Everything That Happened',
    'How I Got My First [NUMBER] Paying SaaS Customers With $0',
    '[TOPIC] for Micro SaaS Founders: What Actually Works in [YEAR]',
    'Building in Public: [TIME] Update — MRR, Churn, and Lessons'
  ],
  ARRAY[
    'Laptop with SaaS dashboard showing MRR graph going up, "$3,200/MO WHILE I SLEEP" text, indie hacker aesthetic',
    'Code editor on one side, Stripe dashboard with revenue on other, "BUILT THIS IN 30 DAYS" connecting text',
    'Solo founder at coffee shop, phone showing customer notification, "JUST ME AND MY LAPTOP" caption',
    'Ideation whiteboard photo with sticky notes, circles and connections, "HOW I FIND $10K/MO IDEAS" overlay',
    'Before: job application form. After: Stripe MRR dashboard. "I QUIT MY JOB FOR THIS" dramatic split',
    'Building in public tweet thread screenshot with engagement, "TRANSPARENCY → CUSTOMERS" thesis shown',
    'No-code tool logos (Bubble, Webflow, Zapier) arranged around lightbulb, "BUILT WITHOUT CODE" center text',
    'MRR timeline graph from $0 to target, key milestones marked with flags, clean business chart aesthetic'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Ideation and Validation",
        "days": [
          {"day": 1, "title": "Finding micro SaaS ideas nobody else is building"},
          {"day": 2, "title": "How to validate a SaaS idea before writing any code"},
          {"day": 3, "title": "Building a waitlist before you have a product"},
          {"day": 4, "title": "Technical vs non-technical founders: can you build SaaS without coding?"},
          {"day": 5, "title": "Micro SaaS vs big SaaS: why small wins"}
        ]
      },
      {
        "week_number": 2,
        "label": "Building and Launching",
        "days": [
          {"day": 8, "title": "How I built a $3,000/month SaaS in 30 days"},
          {"day": 9, "title": "My first SaaS: from idea to first paying customer"},
          {"day": 10, "title": "Building a SaaS without writing any code"},
          {"day": 11, "title": "How I use AI to build features 10x faster"},
          {"day": 12, "title": "Landing page teardown: why people bounce without converting"}
        ]
      },
      {
        "week_number": 3,
        "label": "Growth and Revenue",
        "days": [
          {"day": 15, "title": "How I acquired my first 100 users with $0 marketing"},
          {"day": 16, "title": "Cold email strategy that got me 50 SaaS trial signups"},
          {"day": 17, "title": "Pricing your SaaS: the psychology behind $29 vs $49"},
          {"day": 18, "title": "SEO for SaaS: content that brings in paying users"},
          {"day": 19, "title": "My $0 to $1,000 MRR journey in detail"}
        ]
      },
      {
        "week_number": 4,
        "label": "Operating Solo",
        "days": [
          {"day": 22, "title": "The tools I use to run a SaaS solo"},
          {"day": 23, "title": "Churn rate explained: what is acceptable for micro SaaS?"},
          {"day": 24, "title": "How to onboard users so they actually stick around"},
          {"day": 25, "title": "The metrics every micro SaaS founder must track"},
          {"day": 26, "title": "Building in public: lessons from 6 months of transparency"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 2: Dividend Investing 101
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Dividend Investing 101',
  'dividend-investing-101',
  'Finance', 20.00, 38.00, 'Low', 'stable',
  '35,000–150,000', 'Tuesday', '10–16 min', 'Income-seeking investors, pre-retirees', '30–55', '20M+',
  true, true,
  ARRAY[
    'What are dividends and how do they actually work?',
    'My dividend portfolio paying me $500/month passively',
    'Best dividend ETFs for beginners (VYM vs SCHD vs HDV)',
    'How dividend reinvestment (DRIP) builds wealth automatically',
    'Dividend yield trap: the danger of chasing high yields',
    'How I pick dividend stocks: my exact criteria',
    'Dividend aristocrats: the stocks that never cut their dividend',
    'How much you need invested to live off dividends',
    'Monthly dividend stocks: getting paid every month',
    'Covered calls on dividend stocks: boosting income further',
    'How dividend growth investing beats the S&P 500 long term',
    'REITs explained: real estate dividends without owning property',
    'Tax treatment of dividends: qualified vs ordinary explained',
    'Building a dividend snowball from $1,000',
    'My watchlist: 10 dividend stocks I''m watching right now',
    'Payout ratio explained: is a dividend safe or risky?',
    'How to build a dividend calendar for monthly income',
    'Dividend investing in a Roth IRA: the perfect combination',
    'International dividend stocks: are they worth the risk?',
    'How inflation affects your dividend income',
    'When companies cut dividends: what to do',
    'My dividend income journey: year 1 to year 5 results',
    'Dividend ETFs vs individual dividend stocks: which is better?',
    'The best brokerage for dividend investors',
    'Building a $10,000/year dividend income stream',
    'Ex-dividend date explained: when you must own shares',
    'How to screen for dividend stocks using free tools',
    'Dividend income vs rental income: honest comparison',
    'Hidden risks of dividend investing nobody warns about',
    'How I track my dividend income (free spreadsheet)'
  ],
  '[
    {"label": "Income dream hook", "text": "Imagine getting a paycheck deposited into your account every single month without working for it. That''s what dividend investing feels like."},
    {"label": "Math hook", "text": "If you invest $500 a month into dividend stocks starting today, here''s exactly how much passive income you''ll have in 20 years."},
    {"label": "Simplicity hook", "text": "Dividend investing sounds complicated. It isn''t. You buy stocks, companies pay you a share of their profits. Let me show you how simple this actually is."},
    {"label": "Warning hook", "text": "The #1 mistake dividend investors make is chasing yield — and it silently destroys their portfolio. Don''t make this mistake."},
    {"label": "Journey hook", "text": "5 years ago I started with $5,000. Today my dividend portfolio pays me over $600 a month. Here''s every step of how I did it."},
    {"label": "Goal hook", "text": "What would $2,000 a month in passive income change about your life? Today I''m showing you exactly how to build that."}
  ]'::jsonb,
  ARRAY[
    'How I Built a Dividend Portfolio Paying Me $[AMOUNT]/Month',
    'Best Dividend [ETFs/STOCKS] for Beginners in [YEAR] (Honest Rankings)',
    'How Much You Need to Live Off Dividends: The Real Math',
    '[NUMBER] Dividend Stocks I''m Buying Every Month in [YEAR]',
    'DRIP Investing: How Dividend Reinvestment Builds Wealth Automatically',
    'Dividend Yield Trap: The [NUMBER] Red Flags to Avoid',
    'From $[AMOUNT] to $[INCOME]/Month: My Dividend Journey',
    'REITs vs Dividend Stocks: Which Pays You More?',
    'The [NUMBER] Dividend [ETFs/Stocks] Worth Owning Forever',
    'How to Build a $[AMOUNT]/Year Dividend Income Stream'
  ],
  ARRAY[
    'Piggy bank overflowing with coins, calendar showing monthly deposits, "GETTING PAID EVERY MONTH" bold text overlay',
    'Dividend income tracker spreadsheet screenshot with growing numbers, "MY PASSIVE INCOME JOURNEY" header',
    'SCHD vs VYM logos side by side in comparison bracket, "WHICH DIVIDEND ETF WINS?" dramatic text',
    'Stack of cash with snowball growing larger behind it, "THE DIVIDEND SNOWBALL" concept visual',
    'Luxury lifestyle photo (coffee on balcony, relaxed setting) with "$600/MONTH FROM DIVIDENDS" text overlay',
    'Stock ticker showing dividend payment notification on phone, "JUST GOT PAID $47.82" caption, excited reaction',
    'High yield % sign with warning triangle, "AVOID THIS TRAP" text, cautionary red color scheme',
    'Timeline graphic: 5 years of dividend growth with compounding shown, "YEAR 1 vs YEAR 5" milestone markers'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Dividend Foundations",
        "days": [
          {"day": 1, "title": "What are dividends and how do they actually work?"},
          {"day": 2, "title": "How dividend reinvestment (DRIP) builds wealth automatically"},
          {"day": 3, "title": "Dividend yield trap: the danger of chasing high yields"},
          {"day": 4, "title": "Payout ratio explained: is a dividend safe or risky?"},
          {"day": 5, "title": "Tax treatment of dividends: qualified vs ordinary explained"}
        ]
      },
      {
        "week_number": 2,
        "label": "Picking Stocks and ETFs",
        "days": [
          {"day": 8, "title": "Best dividend ETFs for beginners (VYM vs SCHD vs HDV)"},
          {"day": 9, "title": "How I pick dividend stocks: my exact criteria"},
          {"day": 10, "title": "Dividend aristocrats: stocks that never cut their dividend"},
          {"day": 11, "title": "REITs explained: real estate dividends without owning property"},
          {"day": 12, "title": "How to screen for dividend stocks using free tools"}
        ]
      },
      {
        "week_number": 3,
        "label": "Building Income",
        "days": [
          {"day": 15, "title": "My dividend portfolio paying me $500/month passively"},
          {"day": 16, "title": "Monthly dividend stocks: getting paid every month"},
          {"day": 17, "title": "How to build a dividend calendar for monthly income"},
          {"day": 18, "title": "Building a dividend snowball from $1,000"},
          {"day": 19, "title": "Dividend investing in a Roth IRA: the perfect combination"}
        ]
      },
      {
        "week_number": 4,
        "label": "Advanced and Tracking",
        "days": [
          {"day": 22, "title": "How much you need invested to live off dividends"},
          {"day": 23, "title": "When companies cut dividends: what to do"},
          {"day": 24, "title": "My dividend income journey: year 1 to year 5 results"},
          {"day": 25, "title": "Building a $10,000/year dividend income stream"},
          {"day": 26, "title": "How I track my dividend income (free spreadsheet)"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 3: No-Code App Building
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'No-Code App Building',
  'no-code-app-building',
  'Technology', 16.00, 30.00, 'Low', 'rising',
  '25,000–100,000', 'Wednesday', '12–20 min', 'Entrepreneurs, non-technical founders, freelancers', '22–42', '12M+',
  true, true,
  ARRAY[
    'I built an app with no code and it makes $2k/month',
    'Bubble.io for beginners: build your first web app today',
    'Glide vs Adalo vs Bubble: which no-code tool should you use?',
    'Building a booking app without code (step by step)',
    'How to build a marketplace with Sharetribe in a weekend',
    'Webflow vs Framer: which no-code website builder wins?',
    'How I built a SaaS landing page in 2 hours with no code',
    'Airtable as a backend: how far can it actually go?',
    'Make vs Zapier: automation showdown for no-coders',
    'Building a directory website with no code: full walkthrough',
    'How to build a membership site with Memberstack',
    'No-code AI tools: adding GPT to your app without code',
    'Supabase for no-coders: database without the complexity',
    'How to build a job board with no code and monetize it',
    'Shipping your first no-code product in 48 hours',
    'Client work with no-code: charging $3,000 for Webflow sites',
    'FlutterFlow vs Adalo: building mobile apps without code',
    'Retool for internal tools: build faster than traditional dev',
    'How to accept payments in your no-code app',
    'Limitations of no-code: when to bring in a developer',
    'SEO for no-code websites: does Webflow actually rank?',
    'Building a real estate listing site with no-code tools',
    'How to add authentication to a no-code app',
    'No-code for agencies: scaling client delivery with templates',
    'The best free no-code tools to start with in 2024',
    'How to connect no-code tools with APIs (no coding required)',
    'Turning a spreadsheet into an app with Glide',
    'Building a course platform without code',
    'My no-code stack: tools I use for every project',
    'From idea to launched app in one weekend: live build'
  ],
  '[
    {"label": "Access hook", "text": "You don''t need to know how to code to build an app. In 2024, the tools exist — and today I''m going to prove it."},
    {"label": "Income hook", "text": "I built an app in a weekend using no-code tools. It makes $2,000 a month. Not bad for zero programming knowledge."},
    {"label": "Empowerment hook", "text": "Every idea you''ve ever had for an app but couldn''t build because you don''t code — today that changes."},
    {"label": "Speed hook", "text": "A traditional developer would charge $50,000 and take 6 months to build what you can launch this weekend with no-code tools."},
    {"label": "Frustration hook", "text": "I spent 3 months learning to code before discovering no-code tools could do everything I needed. Don''t waste that time like I did."},
    {"label": "Comparison hook", "text": "I tested 12 no-code platforms to build the same app. Here''s what each one is actually good at — and which ones to skip."}
  ]'::jsonb,
  ARRAY[
    'I Built [APP TYPE] With No Code in [TIME] — Full Walkthrough',
    '[NO-CODE TOOL] for Beginners: Build Your First [APP TYPE] Today',
    '[TOOL] vs [TOOL]: Which No-Code Platform Actually Wins?',
    'How to Build [APP TYPE] Without Coding (Step-by-Step [YEAR])',
    'My No-Code [APP/BUSINESS] Makes $[AMOUNT]/Month — Here''s How',
    'From Idea to Launched App in [TIME] With Zero Coding',
    'The [NUMBER] No-Code Tools I Use for Every [Project/Client]',
    'Building a [TYPE] App With [NO-CODE TOOL]: Complete Tutorial',
    'No-Code vs Code: When to Use Each (Honest Answer)',
    'How I Charge $[AMOUNT] for [APP TYPE] Built With No-Code Tools'
  ],
  ARRAY[
    'Split: intimidating code on left vs clean no-code interface on right, "BUILD APPS WITHOUT CODE" bridging text',
    'Bubble.io interface screenshot building real app, "I BUILT THIS IN 48 HOURS" overlaid in bold',
    'Revenue dashboard showing app income, no-code tool logos underneath, "MADE $2K/MONTH WITH ZERO CODE"',
    'No-code tool logos arranged as building blocks (Bubble, Webflow, Make, Airtable), "YOUR NO-CODE STACK" title',
    'Frustrated person looking at code vs same person excited looking at no-code drag-and-drop, before/after',
    'Phone mockup showing launched app, "FROM IDEA TO APP IN 48 HOURS" countdown timer graphic',
    'Invoice showing $3,000 for Webflow site, "WHAT I CHARGE FOR NO-CODE WORK" revealing caption',
    'App store icon with no-code tools inside it, "SHIPPED TO 200 USERS" celebration graphic'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "No-Code Foundations",
        "days": [
          {"day": 1, "title": "I built an app with no code and it makes $2k/month"},
          {"day": 2, "title": "Bubble.io for beginners: build your first web app today"},
          {"day": 3, "title": "Glide vs Adalo vs Bubble: which no-code tool should you use?"},
          {"day": 4, "title": "Make vs Zapier: automation showdown for no-coders"},
          {"day": 5, "title": "The best free no-code tools to start with in 2024"}
        ]
      },
      {
        "week_number": 2,
        "label": "Build Real Projects",
        "days": [
          {"day": 8, "title": "Building a booking app without code (step by step)"},
          {"day": 9, "title": "How to build a directory website with no code"},
          {"day": 10, "title": "Building a membership site with Memberstack"},
          {"day": 11, "title": "Turning a spreadsheet into an app with Glide"},
          {"day": 12, "title": "Shipping your first no-code product in 48 hours"}
        ]
      },
      {
        "week_number": 3,
        "label": "Advanced Capabilities",
        "days": [
          {"day": 15, "title": "No-code AI tools: adding GPT to your app without code"},
          {"day": 16, "title": "Supabase for no-coders: database without the complexity"},
          {"day": 17, "title": "How to connect no-code tools with APIs (no coding required)"},
          {"day": 18, "title": "How to accept payments in your no-code app"},
          {"day": 19, "title": "How to add authentication to a no-code app"}
        ]
      },
      {
        "week_number": 4,
        "label": "Monetize and Scale",
        "days": [
          {"day": 22, "title": "Client work with no-code: charging $3,000 for Webflow sites"},
          {"day": 23, "title": "No-code for agencies: scaling client delivery with templates"},
          {"day": 24, "title": "How to build a job board with no code and monetize it"},
          {"day": 25, "title": "Limitations of no-code: when to bring in a developer"},
          {"day": 26, "title": "My no-code stack: tools I use for every project"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 4: Credit Card Hacking
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Credit Card Hacking',
  'credit-card-hacking',
  'Finance', 24.00, 45.00, 'Medium', 'rising',
  '50,000–200,000', 'Monday', '10–18 min', 'Travel enthusiasts, points hobbyists, deal seekers', '25–45', '25M+',
  true, true,
  ARRAY[
    'How I got $4,000 in free travel from credit card points',
    'Best travel credit cards in 2024: honest rankings',
    'Chase Sapphire Preferred vs Reserve: which one to get first?',
    'How to hit a credit card welcome bonus without overspending',
    'The credit card trifecta strategy that earns the most points',
    'How points and miles actually work (beginner guide)',
    'Business credit cards you can get without a real business',
    'How churning credit cards affects your credit score',
    'Airport lounge access: cards that get you in for free',
    'Amex Platinum: is it worth the $695 annual fee?',
    'How to transfer points to airlines and hotels (step by step)',
    'Best no-fee travel credit cards for beginners',
    'How I flew business class to Europe for $200 in taxes',
    'Category bonuses explained: where each card earns most',
    'How to use travel portals vs transfer partners (what earns more)',
    'Global Entry and TSA PreCheck: getting it free with cards',
    'How to redeem points for maximum value',
    'The dark side of credit card rewards nobody talks about',
    'Hotel credit cards: free nights and elite status explained',
    'Authorized user trick to earn more points',
    'How credit card referral bonuses work',
    'Best credit cards for groceries and gas in 2024',
    'Chase Ultimate Rewards vs Amex Membership Rewards vs Capital One Miles',
    'How I planned a $12,000 trip for $800 out of pocket',
    'Credit card sign-up bonus rules: what the banks won''t tell you',
    'Is the Capital One Venture worth it?',
    'How to manufacture spending ethically (and when not to)',
    'Credit card minimum spend strategies that don''t hurt your budget',
    'What happens when you cancel a credit card (the truth)',
    'Building a points portfolio for long-term travel freedom'
  ],
  '[
    {"label": "Dream hook", "text": "I flew my family of four to Japan in business class and paid less than $600 total. Credit card points made that possible."},
    {"label": "Value hook", "text": "Last year my credit cards gave me $4,000 in travel value. I didn''t overspend. I didn''t do anything illegal. Here''s the system."},
    {"label": "Myth buster", "text": "People think credit card rewards are a scam or a trap. They''re right — unless you know the game. Today I''m teaching you the game."},
    {"label": "FOMO hook", "text": "If you''re not earning points on every dollar you spend, you''re leaving thousands of dollars of free travel on the table every single year."},
    {"label": "Beginner welcome", "text": "I was completely overwhelmed by points and miles 3 years ago. Now I travel in business class for free. Let me make this as simple as I wish someone had for me."},
    {"label": "Specific result", "text": "This one credit card welcome bonus got me a round-trip flight to Europe for free. I''m going to show you exactly how to get it."}
  ]'::jsonb,
  ARRAY[
    'How I Got $[AMOUNT] in Free Travel From Credit Card Points',
    'Best [CARD TYPE] Credit Cards in [YEAR]: Honest Rankings',
    '[CARD] vs [CARD]: Which Travel Card Should You Get First?',
    'How to Hit a Credit Card Welcome Bonus Without Overspending',
    'I Flew [DESTINATION] in [CLASS] for [AMOUNT] — Here''s How',
    'Is the [CARD NAME] Worth the Annual Fee? ([YEAR] Honest Review)',
    'The Credit Card [STRATEGY] That Earns [NUMBER]x More Points',
    '[POINTS CURRENCY] vs [POINTS CURRENCY]: Which Is More Valuable?',
    'How to Redeem [POINTS TYPE] for Maximum Value (My Exact Method)',
    'The [NUMBER] Credit Cards I Use to Earn [AMOUNT] Points a Year'
  ],
  ARRAY[
    'Passport with credit cards fanned out, airplane ticket showing $0, "I FLEW FREE" bold dramatic text',
    'Business class seat photo, champagne in hand, "POINTS GOT ME HERE" overlaid with dollar amount saved',
    'Chase Sapphire vs Amex Platinum cards side by side on luxury surface, "WHICH ONE WINS?" verdict text',
    'Points balance screenshot showing large number, smiling person, "MY POINTS ARE WORTH $4,000" caption',
    'Boarding pass to exotic destination with "PAID: $11.20" circled, "HOW I DID IT" arrow pointing to card',
    'Airport lounge interior photo, "I GET IN FREE WITH THIS CARD" text, aspirational travel aesthetic',
    'Welcome bonus offer highlighted on card marketing, "$750 BONUS — HERE''S HOW TO GET IT" overlay',
    'World map with flight routes drawn, destinations marked, "ALL PAID WITH POINTS" title across top'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Points Basics",
        "days": [
          {"day": 1, "title": "How points and miles actually work (beginner guide)"},
          {"day": 2, "title": "Best no-fee travel credit cards for beginners"},
          {"day": 3, "title": "How to hit a credit card welcome bonus without overspending"},
          {"day": 4, "title": "Category bonuses explained: where each card earns most"},
          {"day": 5, "title": "Chase Ultimate Rewards vs Amex vs Capital One Miles"}
        ]
      },
      {
        "week_number": 2,
        "label": "Card Selection",
        "days": [
          {"day": 8, "title": "Chase Sapphire Preferred vs Reserve: which one first?"},
          {"day": 9, "title": "Amex Platinum: is it worth the $695 annual fee?"},
          {"day": 10, "title": "Best travel credit cards in 2024: honest rankings"},
          {"day": 11, "title": "Business credit cards you can get without a real business"},
          {"day": 12, "title": "Best credit cards for groceries and gas in 2024"}
        ]
      },
      {
        "week_number": 3,
        "label": "Earning More",
        "days": [
          {"day": 15, "title": "The credit card trifecta strategy that earns the most points"},
          {"day": 16, "title": "Authorized user trick to earn more points"},
          {"day": 17, "title": "How credit card referral bonuses work"},
          {"day": 18, "title": "Global Entry and TSA PreCheck: getting it free with cards"},
          {"day": 19, "title": "Airport lounge access: cards that get you in for free"}
        ]
      },
      {
        "week_number": 4,
        "label": "Redeeming and Results",
        "days": [
          {"day": 22, "title": "How to transfer points to airlines and hotels (step by step)"},
          {"day": 23, "title": "How to redeem points for maximum value"},
          {"day": 24, "title": "How I flew business class to Europe for $200 in taxes"},
          {"day": 25, "title": "How I got $4,000 in free travel from credit card points"},
          {"day": 26, "title": "Building a points portfolio for long-term travel freedom"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 5: Remote Work Setup and Tips
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Remote Work Setup and Tips',
  'remote-work-setup-tips',
  'Lifestyle', 14.00, 26.00, 'Medium', 'stable',
  '30,000–120,000', 'Monday', '10–16 min', 'Remote workers, digital nomads, WFH employees', '24–40', '35M+',
  true, true,
  ARRAY[
    'My $2,000 home office setup that changed how I work',
    'Best monitors for remote work in 2024 (tested and ranked)',
    'The perfect morning routine for remote workers',
    'How to separate work from life when your office is your home',
    'Best ergonomic chair under $500 (I tested 6)',
    'How I stay productive working from home (no more distractions)',
    'Standing desk review: is it actually worth it?',
    'Best webcam for video calls in 2024',
    'How to look professional on Zoom calls (quick wins)',
    'Working from cafes: the full setup I travel with',
    'Best noise-cancelling headphones for remote work',
    'How to negotiate a permanent remote work arrangement',
    'Time zone management for remote teams',
    'My cable management setup for a clean desk',
    'Home office lighting: how to look great on camera',
    'Best microphone for video calls and content creation',
    'How I built a dual monitor setup for under $300',
    'Remote work burnout: signs and how to recover',
    'The home office tax deduction explained simply',
    'How to stay social when working alone all day',
    'Best apps for remote team communication in 2024',
    'Digital nomad starter kit: everything you actually need',
    'Working from an Airbnb: tips for temporary office setups',
    'How to build a portable office setup for travel',
    'Pomodoro technique: does it actually work for deep work?',
    'How to run great remote meetings (and cut the bad ones)',
    'Best desk accessories for productivity under $50 each',
    'My 6-month review of working fully remote',
    'How to get promoted working remotely (it''s different)',
    'The biggest remote work mistakes I made (and fixed)'
  ],
  '[
    {"label": "Setup reveal hook", "text": "This $2,000 desk setup made me 40% more productive — and I''m going to show you exactly what to buy and what to skip."},
    {"label": "Problem hook", "text": "I spent 18 months working from a kitchen table. It destroyed my back, my focus, and my work-life balance. Here''s what I changed."},
    {"label": "Aspirational hook", "text": "Your home office should make you excited to sit down and work. Here''s how to build one that actually does that."},
    {"label": "Budget hook", "text": "You don''t need to spend $5,000 on a home office. These 5 purchases under $200 each will transform how you work from home."},
    {"label": "WFH veteran hook", "text": "I''ve worked fully remote for 4 years across 6 countries. Here are the 10 things I''d tell my first-day remote self."},
    {"label": "Camera quality hook", "text": "You can have the best ideas in the room and still lose credibility if your video call looks like a potato. Let me fix that for you."}
  ]'::jsonb,
  ARRAY[
    'My $[AMOUNT] [HOME OFFICE/DESK] Setup That Changed How I Work',
    'Best [PRODUCT CATEGORY] for Remote Work in [YEAR] (I Tested [NUMBER])',
    'How to [PRODUCTIVITY GOAL] Working From Home',
    '[NUMBER] Home Office Upgrades That Actually Made Me More Productive',
    'The Perfect [Morning/Evening] Routine for Remote Workers',
    'Work From Home [TOPIC]: Everything I Wish I Knew Starting Out',
    'How I [SOLVED REMOTE WORK PROBLEM] After [TIME] of WFH',
    'Remote Work [PRODUCT] Under $[AMOUNT]: Best Picks in [YEAR]',
    'How to Look [PROFESSIONAL/GREAT] on [ZOOM/VIDEO CALLS] (Easy Fixes)',
    'Digital Nomad [TOPIC]: What [TIME] of Working Remotely Taught Me'
  ],
  ARRAY[
    'Clean minimal desk setup top-down flat lay, all equipment labeled with prices, "MY WFH SETUP" title',
    'Before: messy kitchen table with laptop. After: clean professional home office. "THE UPGRADE" transformation',
    'Person on sharp crisp video call vs blurry low quality webcam, "THIS IS THE DIFFERENCE" comparison',
    'Standing desk in mid-adjustment position, "IS IT WORTH IT?" verdict text overlay, product rating graphic',
    'Laptop bag opened showing compact remote work kit, "MY TRAVEL OFFICE" caption, digital nomad aesthetic',
    'Dual monitor setup with cable management hidden behind desk, "CLEAN DESK = CLEAR MIND" minimalist photo',
    'Morning routine timeline graphic showing WFH morning habits with clock times and task icons',
    'Noise cancelling headphones on desk with focus/concentration visual elements, "DEEP WORK MODE ON"'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Build Your Setup",
        "days": [
          {"day": 1, "title": "My $2,000 home office setup that changed how I work"},
          {"day": 2, "title": "Best monitors for remote work in 2024 (tested and ranked)"},
          {"day": 3, "title": "Standing desk review: is it actually worth it?"},
          {"day": 4, "title": "Best ergonomic chair under $500 (I tested 6)"},
          {"day": 5, "title": "My cable management setup for a clean desk"}
        ]
      },
      {
        "week_number": 2,
        "label": "Look and Sound Great",
        "days": [
          {"day": 8, "title": "Best webcam for video calls in 2024"},
          {"day": 9, "title": "Best microphone for video calls and content creation"},
          {"day": 10, "title": "Home office lighting: how to look great on camera"},
          {"day": 11, "title": "How to look professional on Zoom calls (quick wins)"},
          {"day": 12, "title": "Best noise-cancelling headphones for remote work"}
        ]
      },
      {
        "week_number": 3,
        "label": "Productivity and Routine",
        "days": [
          {"day": 15, "title": "The perfect morning routine for remote workers"},
          {"day": 16, "title": "How I stay productive working from home (no distractions)"},
          {"day": 17, "title": "How to separate work from life when home is your office"},
          {"day": 18, "title": "Pomodoro technique: does it actually work for deep work?"},
          {"day": 19, "title": "Remote work burnout: signs and how to recover"}
        ]
      },
      {
        "week_number": 4,
        "label": "Remote Career and Travel",
        "days": [
          {"day": 22, "title": "How to negotiate a permanent remote work arrangement"},
          {"day": 23, "title": "How to get promoted working remotely (it''s different)"},
          {"day": 24, "title": "Digital nomad starter kit: everything you actually need"},
          {"day": 25, "title": "Working from cafes: the full setup I travel with"},
          {"day": 26, "title": "The biggest remote work mistakes I made (and fixed)"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 6: Python for Beginners
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Python for Beginners',
  'python-for-beginners',
  'Education', 8.00, 16.00, 'High', 'stable',
  '70,000–350,000', 'Wednesday', '15–30 min', 'Career changers, students, developers', '18–35', '80M+',
  true, true,
  ARRAY[
    'Python for beginners: complete crash course in 1 hour',
    'How I learned Python in 30 days (realistic study plan)',
    'Python vs JavaScript: which should beginners learn first?',
    'Building your first Python project (beginner-friendly)',
    'Python data types explained simply (with examples)',
    'For loops in Python: everything beginners need to know',
    'Python functions explained: write code once, use it forever',
    'How to install Python and set up VS Code correctly',
    'Working with files in Python (read, write, manipulate)',
    'Python list comprehensions: write less, do more',
    'Error handling in Python: try, except, finally explained',
    'APIs in Python: how to fetch real data from the internet',
    'Python for data analysis with pandas: beginner intro',
    'Web scraping with Python and BeautifulSoup',
    'Building a simple Python GUI app with tkinter',
    'Python OOP explained simply (classes and objects)',
    'Automate boring tasks with Python: real examples',
    'Python project ideas for beginners that actually teach you',
    'How to read Python error messages without panicking',
    'Virtual environments in Python: why you need them',
    'Python dictionaries: the most useful data structure explained',
    'How to use Python libraries: pip install and imports',
    'Building a simple web app with Flask in Python',
    'Python for beginners: common mistakes and how to fix them',
    'How Python is used in AI and machine learning (overview)',
    'Regular expressions in Python: not as scary as they look',
    'How to write clean Python code (best practices)',
    'Python challenges to level up from beginner to intermediate',
    'Getting a job with Python: what skills actually matter',
    'My Python learning roadmap from zero to employed'
  ],
  '[
    {"label": "Beginner empathy", "text": "Learning to code felt impossible — until I found Python. It reads almost like English and it''s the most in-demand language for jobs right now."},
    {"label": "Career hook", "text": "Python is the #1 skill employers want in 2024. In this video I''m going to show you how to go from complete beginner to writing real code today."},
    {"label": "Speed hook", "text": "Most Python tutorials are 10 hours long. In the next 20 minutes, I''ll teach you everything you need to build your first working program."},
    {"label": "Automation hook", "text": "What if you could save 5 hours a week by automating your most boring tasks with just 10 lines of Python? I''ll show you exactly how."},
    {"label": "Fear buster", "text": "You don''t need a computer science degree, you don''t need to be good at math, and you don''t need expensive courses. You just need this video."},
    {"label": "Project hook", "text": "The best way to learn Python isn''t watching tutorials — it''s building things. Today I''m showing you a beginner project that teaches you everything that matters."}
  ]'::jsonb,
  ARRAY[
    'Python for Beginners: [TOPIC] Explained Simply (With Examples)',
    'I Learned Python in [TIME] Using This [METHOD/RESOURCE]',
    'Build Your First Python [PROJECT TYPE] in [TIME] (Beginner Tutorial)',
    'Python [CONCEPT] Explained in [TIME] — Even If You''ve Never Coded',
    'How to [AUTOMATE/BUILD/ANALYZE] With Python (Complete Beginner Guide)',
    '[NUMBER] Python Projects for Beginners That Actually Teach You to Code',
    'Python vs [LANGUAGE]: Which Should Beginners Learn First in [YEAR]?',
    'Complete Python [TOPIC] Tutorial for Absolute Beginners ([YEAR])',
    'How I Got a [JOB/FREELANCE WORK] With [TIME] of Learning Python',
    'Python [CONCEPT]: The Simple Explanation That Finally Made It Click'
  ],
  ARRAY[
    'Python snake logo with "FOR BEGINNERS" text, beginner-friendly warm colors, "START HERE" arrow',
    'VS Code editor showing clean Python code, "YOUR FIRST PROGRAM IN 20 MINUTES" overlay text',
    'Before: confusion emoji. After: working code. "I FINALLY UNDERSTAND PYTHON" transformation thumbnail',
    'Job listings screenshot showing Python requirements, salary numbers visible, "THIS SKILL = THIS SALARY" concept',
    'Python code on screen automating spreadsheet, time saved counter graphic, "5 HOURS SAVED PER WEEK"',
    'Beginner roadmap graphic: Week 1 to Month 3 to Employed, clean milestone path design',
    'Side by side: 10-hour course vs 20-min focused video, "JUST LEARN WHAT MATTERS" verdict',
    'Error message on screen with red X, same fixed code with green checkmark, "HOW TO FIX PYTHON ERRORS"'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Python Fundamentals",
        "days": [
          {"day": 1, "title": "How to install Python and set up VS Code correctly"},
          {"day": 2, "title": "Python data types explained simply (with examples)"},
          {"day": 3, "title": "For loops in Python: everything beginners need to know"},
          {"day": 4, "title": "Python functions explained: write code once, use it forever"},
          {"day": 5, "title": "Python dictionaries: the most useful data structure explained"}
        ]
      },
      {
        "week_number": 2,
        "label": "Intermediate Concepts",
        "days": [
          {"day": 8, "title": "Python list comprehensions: write less, do more"},
          {"day": 9, "title": "Error handling in Python: try, except, finally explained"},
          {"day": 10, "title": "Working with files in Python (read, write, manipulate)"},
          {"day": 11, "title": "Python OOP explained simply (classes and objects)"},
          {"day": 12, "title": "How to use Python libraries: pip install and imports"}
        ]
      },
      {
        "week_number": 3,
        "label": "Real World Projects",
        "days": [
          {"day": 15, "title": "APIs in Python: how to fetch real data from the internet"},
          {"day": 16, "title": "Web scraping with Python and BeautifulSoup"},
          {"day": 17, "title": "Automate boring tasks with Python: real examples"},
          {"day": 18, "title": "Building a simple web app with Flask in Python"},
          {"day": 19, "title": "Python for data analysis with pandas: beginner intro"}
        ]
      },
      {
        "week_number": 4,
        "label": "Career and Growth",
        "days": [
          {"day": 22, "title": "Python project ideas for beginners that actually teach you"},
          {"day": 23, "title": "How to write clean Python code (best practices)"},
          {"day": 24, "title": "How I learned Python in 30 days (realistic study plan)"},
          {"day": 25, "title": "Getting a job with Python: what skills actually matter"},
          {"day": 26, "title": "My Python learning roadmap from zero to employed"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 7: Stoic Philosophy for Modern Life
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Stoic Philosophy for Modern Life',
  'stoic-philosophy-modern-life',
  'Education', 14.00, 24.00, 'Low', 'rising',
  '40,000–180,000', 'Sunday', '10–18 min', 'Self-improvement seekers, professionals, readers', '22–45', '15M+',
  true, true,
  ARRAY[
    'Stoicism explained in 10 minutes: the practical philosophy',
    'Marcus Aurelius: daily habits of the philosopher emperor',
    'How Stoicism helps with anxiety (what it actually says)',
    'The dichotomy of control: stop worrying about what you can''t change',
    'Meditations by Marcus Aurelius: most important lessons',
    'Epictetus: the slave who became the greatest Stoic teacher',
    'Memento mori: how thinking about death makes you live better',
    'Seneca on time: you have enough of it, here''s why you feel you don''t',
    'The daily Stoic journal: how Marcus Aurelius used writing',
    'Amor fati: loving everything that happens to you',
    'How to practice negative visualization in daily life',
    'Stoic morning routine you can start tomorrow',
    'What Stoics say about relationships and social media',
    'How I used Stoicism to get through the worst year of my life',
    'The Stoic view on money and wealth (it''s not what you think)',
    'Ryan Holiday and modern Stoicism: does it hold up?',
    'How to respond instead of react (the Stoic pause)',
    'Stoicism vs Buddhism: the key differences and similarities',
    'What is virtue? The Stoic answer that changes everything',
    'How Stoics dealt with anger (and what we can learn)',
    'Voluntary discomfort: why Stoics chose to suffer sometimes',
    'The inner citadel: Marcus Aurelius''s concept explained',
    'Stoic quotes that changed how I see my problems',
    'How to use the view from above Stoic meditation',
    'Stoicism at work: how to deal with difficult colleagues',
    'The obstacle is the way: applying it to real problems',
    'How Stoicism views failure and what we can do with it',
    'Evening reflection: the Stoic daily review practice',
    'Stoicism for parents: raising resilient children',
    'The Stoic approach to social media and modern distractions'
  ],
  '[
    {"label": "Relevance hook", "text": "A Roman emperor wrote a private journal 2,000 years ago about controlling his emotions and living well. We still read it because it still works."},
    {"label": "Problem hook", "text": "Most of what you worry about is completely outside your control. Stoicism has a 2,000-year-old solution to that — and it takes 5 minutes to understand."},
    {"label": "Personal hook", "text": "When everything in my life fell apart, I found Stoicism. Not as a cure, but as a framework for getting through it. Here''s what actually helped."},
    {"label": "Practical hook", "text": "Forget philosophy as an academic subject. Stoicism is a practical operating system for your mind — and it''s the most useful thing I''ve ever learned."},
    {"label": "Quote hook", "text": "Marcus Aurelius wrote: ''You have power over your mind, not outside events. Realize this and you will find strength.'' That one sentence changed how I live."},
    {"label": "Modern relevance", "text": "Marcus Aurelius led an empire during pandemics, wars, and constant political chaos. What he learned about keeping his mind steady is exactly what we need right now."}
  ]'::jsonb,
  ARRAY[
    'How [STOIC CONCEPT] Changed the Way I [LIFE AREA] Forever',
    '[STOIC PHILOSOPHER]: [NUMBER] Lessons for [MODERN PROBLEM]',
    'The Stoic Guide to [MODERN CHALLENGE] (2,000-Year-Old Wisdom)',
    'How Stoicism Helped Me [PERSONAL RESULT/CHALLENGE]',
    'Marcus Aurelius on [TOPIC]: What He Actually Said (And Why It Matters)',
    '[STOIC CONCEPT] Explained Simply: The Idea That Changes Everything',
    'Stoicism vs [MODERN PHILOSOPHY]: Which Actually Works Better?',
    '[NUMBER] Stoic Habits I Practice Every Day (And What Changed)',
    'Why [STOIC TEACHING] Is the Most Practical Life Advice You''ll Hear',
    'The [NUMBER]-Minute Stoic [Practice/Technique] That Rewires Your Thinking'
  ],
  ARRAY[
    'Bust of Marcus Aurelius in moody dramatic lighting, modern city background composite, "2000 YEARS LATER STILL WORKS"',
    'Open journal with handwritten Stoic quote, morning coffee beside it, "THE PHILOSOPHY THAT CHANGED MY MORNINGS"',
    'Calm person in storm (literal or metaphorical), eye of the storm peaceful, "STOICISM IN CHAOS" concept',
    'Marcus Aurelius quote card in clean typography on parchment texture, "THE MOST IMPORTANT QUOTE" framing',
    'Split: anxious person scrolling phone vs calm person journaling, "WHICH STOIC ARE YOU?" with Marcus overlay',
    'Ancient Rome architectural background, modern person in modern clothes walking through it, timeless concept visual',
    'Iceberg diagram showing "WHAT PEOPLE THINK STOICISM IS" (suppress emotions) vs "WHAT IT ACTUALLY IS" (much more)',
    'Book cover of Meditations with "I READ THIS EVERY MORNING" personal endorsement thumbnail style'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Core Stoic Concepts",
        "days": [
          {"day": 1, "title": "Stoicism explained in 10 minutes: the practical philosophy"},
          {"day": 2, "title": "The dichotomy of control: stop worrying about what you can''t change"},
          {"day": 3, "title": "Memento mori: how thinking about death makes you live better"},
          {"day": 4, "title": "Amor fati: loving everything that happens to you"},
          {"day": 5, "title": "What is virtue? The Stoic answer that changes everything"}
        ]
      },
      {
        "week_number": 2,
        "label": "The Great Stoics",
        "days": [
          {"day": 8, "title": "Marcus Aurelius: daily habits of the philosopher emperor"},
          {"day": 9, "title": "Meditations by Marcus Aurelius: most important lessons"},
          {"day": 10, "title": "Epictetus: the slave who became the greatest Stoic teacher"},
          {"day": 11, "title": "Seneca on time: you have enough of it, here''s why you don''t feel so"},
          {"day": 12, "title": "Ryan Holiday and modern Stoicism: does it hold up?"}
        ]
      },
      {
        "week_number": 3,
        "label": "Daily Practices",
        "days": [
          {"day": 15, "title": "Stoic morning routine you can start tomorrow"},
          {"day": 16, "title": "The daily Stoic journal: how Marcus Aurelius used writing"},
          {"day": 17, "title": "How to practice negative visualization in daily life"},
          {"day": 18, "title": "Voluntary discomfort: why Stoics chose to suffer sometimes"},
          {"day": 19, "title": "Evening reflection: the Stoic daily review practice"}
        ]
      },
      {
        "week_number": 4,
        "label": "Applied Stoicism",
        "days": [
          {"day": 22, "title": "How Stoicism helps with anxiety (what it actually says)"},
          {"day": 23, "title": "How to respond instead of react (the Stoic pause)"},
          {"day": 24, "title": "Stoicism at work: how to deal with difficult colleagues"},
          {"day": 25, "title": "How I used Stoicism to get through the worst year of my life"},
          {"day": 26, "title": "The Stoic approach to social media and modern distractions"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 8: Van Life and Travel
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Van Life and Travel',
  'van-life-travel',
  'Lifestyle', 8.00, 15.00, 'Medium', 'stable',
  '50,000–250,000', 'Friday', '12–25 min', 'Adventure seekers, remote workers, freedom chasers', '22–38', '30M+',
  true, true,
  ARRAY[
    'How I converted a cargo van into a home in 3 weeks',
    'Van life budget: what I spend every month living in a van',
    'My van tour: tiny home with everything I need',
    'Best van for van life: conversion van vs cargo van vs sprinter',
    'How to sleep comfortably in a van (full setup)',
    'Working remotely from a van: my full setup',
    'Van life shower solutions that actually work',
    'Finding free camping: best apps and strategies',
    'Cooking in a van: my kitchen setup and favorite meals',
    'Van life safety: how to stay safe as a solo traveler',
    'Cost comparison: van life vs renting an apartment',
    'How I get reliable WiFi living in my van',
    'First week of van life: honest reality check',
    'Van life in winter: how to stay warm (without dying)',
    'How I shower and stay clean living in a van',
    'Van life community: how to find your people on the road',
    'The van build mistakes I wish I avoided',
    'Van life with a dog: what nobody tells you',
    'How to make money while traveling full-time',
    'Best national parks to visit for van life',
    'Van life vlogging: how I make money from this lifestyle',
    'Stealth camping in cities: how to not get caught',
    'Van life in summer: how to stay cool without AC',
    'My vanlife power setup: solar and batteries explained',
    'Is van life actually cheaper than renting? (real numbers)',
    '6 months of van life: what changed about me',
    'Van life in rainy weather: how to deal with condensation',
    'Water system in my van: how I get and store water',
    'Best van life YouTube channels worth watching',
    'Selling everything and moving into a van: was it worth it?'
  ],
  '[
    {"label": "Freedom hook", "text": "I wake up every morning in a different place. My backyard changes daily. My monthly costs are less than my old rent. This is van life."},
    {"label": "Contrast hook", "text": "Two years ago I had a 9-5, a lease, and a 90-minute commute. Today I live in a van and have never been happier. Here''s what changed."},
    {"label": "Reality hook", "text": "Van life isn''t always sunsets and freedom. It''s also wet socks, broken heaters, and parking lot anxiety. Here''s the real story."},
    {"label": "Cost hook", "text": "I spent $800 last month to live and travel full time. My friend in LA spent $2,400 just on rent. Let me show you the math."},
    {"label": "Build hook", "text": "I turned a bare cargo van into a full home in 3 weeks with no woodworking experience and $4,000. Here''s exactly what I did."},
    {"label": "Question hook", "text": "What if your home could drive you to a mountain lake on Tuesday and a desert canyon on Friday? That''s not a dream — here''s how it works."}
  ]'::jsonb,
  ARRAY[
    'My [TIME/COST] Van Conversion: Full Tour of My Tiny Home on Wheels',
    'Van Life Budget: What I Actually Spend Every Month ([YEAR] Update)',
    'Van Life [CHALLENGE]: How I Deal With [PROBLEM] Living in My Van',
    'Best [VAN TYPE] for Van Life in [YEAR]: Honest Comparison',
    '[NUMBER] Things I Wish I Knew Before Starting Van Life',
    'Van Life vs [APARTMENT/HOUSE]: The Real Cost Comparison',
    'How I [WORK/EARN MONEY] Full-Time While Living in My Van',
    'My Van Life [TOPIC] Setup: Everything I Use and Why',
    '[TIME] of Van Life: What Changed, What I Learned, What I''d Change',
    'Selling Everything and Moving Into a Van: [TIME] Later, Was It Worth It?'
  ],
  ARRAY[
    'Van parked at stunning mountain or coastal location at golden hour, "MY HOME" hand-lettered on van door',
    'Interior van tour thumbnail showing cozy converted space, fairy lights, "TOUR MY TINY HOME ON WHEELS"',
    'Monthly budget breakdown infographic overlay on travel photo, "$800/MONTH TOTAL" highlighted',
    'Split: NYC apartment lease ($2,400/mo) vs van life expenses ($800/mo), "I CHOSE THIS" arrow to van',
    'Solar panel install on van roof, hands working, "MY POWER SETUP EXPLAINED" technical-looking overlay',
    'Dog looking out van window at scenic view, "VAN LIFE WITH A DOG" text, high vibes travel aesthetic',
    'Before: empty cargo van interior. After: fully converted cozy home. "3 WEEK BUILD" time label',
    'Map with route drawn across it, van overlay, "6 MONTHS ON THE ROAD" milestone celebration thumbnail'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "Getting Started",
        "days": [
          {"day": 1, "title": "How I converted a cargo van into a home in 3 weeks"},
          {"day": 2, "title": "Best van for van life: cargo van vs sprinter vs conversion"},
          {"day": 3, "title": "Van life budget: what I spend every month living in a van"},
          {"day": 4, "title": "Cost comparison: van life vs renting an apartment"},
          {"day": 5, "title": "Selling everything and moving into a van: was it worth it?"}
        ]
      },
      {
        "week_number": 2,
        "label": "Living Systems",
        "days": [
          {"day": 8, "title": "My van tour: tiny home with everything I need"},
          {"day": 9, "title": "My vanlife power setup: solar and batteries explained"},
          {"day": 10, "title": "Water system in my van: how I get and store water"},
          {"day": 11, "title": "Cooking in a van: my kitchen setup and favorite meals"},
          {"day": 12, "title": "How to sleep comfortably in a van (full setup)"}
        ]
      },
      {
        "week_number": 3,
        "label": "Daily Realities",
        "days": [
          {"day": 15, "title": "How I get reliable WiFi living in my van"},
          {"day": 16, "title": "Van life shower solutions that actually work"},
          {"day": 17, "title": "Finding free camping: best apps and strategies"},
          {"day": 18, "title": "Van life safety: how to stay safe as a solo traveler"},
          {"day": 19, "title": "Stealth camping in cities: how to not get caught"}
        ]
      },
      {
        "week_number": 4,
        "label": "Life and Work on the Road",
        "days": [
          {"day": 22, "title": "Working remotely from a van: my full setup"},
          {"day": 23, "title": "How to make money while traveling full-time"},
          {"day": 24, "title": "Van life vlogging: how I make money from this lifestyle"},
          {"day": 25, "title": "6 months of van life: what changed about me"},
          {"day": 26, "title": "The van build mistakes I wish I avoided"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 9: Amazon FBA for Beginners
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Amazon FBA for Beginners',
  'amazon-fba-beginners',
  'Business', 22.00, 40.00, 'Medium', 'stable',
  '35,000–150,000', 'Tuesday', '12–20 min', 'Entrepreneurs, side hustle seekers, e-commerce beginners', '22–42', '20M+',
  true, true,
  ARRAY[
    'Amazon FBA explained: how it actually works (no hype)',
    'How to find your first product to sell on Amazon',
    'Jungle Scout vs Helium 10: which product research tool wins?',
    'How much money you actually need to start Amazon FBA',
    'Private label vs wholesale vs retail arbitrage: which to start with?',
    'My first Amazon product: what I chose and why',
    'How to find suppliers on Alibaba (step by step)',
    'Amazon FBA fees explained: what you actually pay',
    'How to write a listing that converts (title, bullets, description)',
    'Amazon PPC for beginners: getting your first sales',
    'How I got my first 50 Amazon reviews ethically',
    'Amazon FBA profit margins: what''s realistic?',
    'My $0 to $10,000/month Amazon FBA journey',
    'How to order your first sample from a supplier',
    'Brand registry on Amazon: what it is and why you need it',
    'Shipping to Amazon FBA warehouses: complete guide',
    'How to read your Amazon Seller Central dashboard',
    'Amazon FBA vs Shopify: which is better for beginners?',
    'Product photography for Amazon: DIY vs hiring',
    'How to handle negative Amazon reviews professionally',
    'Inventory management for Amazon FBA (avoid stockouts)',
    'How to launch a product on Amazon with no reviews',
    'My biggest Amazon FBA mistake (and what it cost me)',
    'Is Amazon FBA still worth it in 2024? (honest answer)',
    'Amazon FBA tax basics: what you need to know',
    'Scaling from $5k to $50k/month on Amazon',
    'How to find a profitable niche for Amazon FBA',
    'Product validation: how I know a product will sell before buying inventory',
    'The Amazon FBA tools I use every single day',
    'What happened when my Amazon account got suspended'
  ],
  '[
    {"label": "Income hook", "text": "I sell $15,000 a month on Amazon and I never touch the inventory. Amazon stores it, ships it, and handles returns. Here''s how."},
    {"label": "Skeptic hook", "text": "I know what you''re thinking — Amazon FBA is saturated. I thought that too until I found a product making $8k a month in a ''crowded'' category."},
    {"label": "Simple hook", "text": "You find a product, you source it from a supplier, Amazon sells it for you. That''s it. Today I''m showing you every step."},
    {"label": "Failure hook", "text": "My first Amazon product flopped. I lost $2,000. My second product made $40,000 in year one. The difference was one research mistake I''ll show you how to avoid."},
    {"label": "Cost hook", "text": "Most people think you need $10,000 to start Amazon FBA. You can start for $1,500 if you pick the right product. Let me show you how."},
    {"label": "Passive hook", "text": "While I''m filming this video, Amazon is selling my products in 12 countries. I have no warehouse, no shipping team, and no customer service headaches."}
  ]'::jsonb,
  ARRAY[
    'Amazon FBA for Beginners: [TOPIC] Explained (No Hype, Just Facts)',
    'How I Make $[AMOUNT]/Month Selling on Amazon (Full Breakdown)',
    'How to Find Your First Amazon Product Using [TOOL/METHOD]',
    'I Started Amazon FBA With $[AMOUNT] — Here''s What Happened',
    '[TOOL] vs [TOOL]: Best Amazon [Research/FBA] Tool in [YEAR]?',
    'Amazon FBA [TOPIC]: The Beginner Guide That Actually Works',
    'My $[AMOUNT] Amazon FBA Mistake (And How to Avoid It)',
    'Is Amazon FBA Worth It in [YEAR]? (Honest Answer After [TIME])',
     'How to [SOURCE/FIND/LAUNCH] Your Amazon Product (Step-by-Step)',
    'Amazon FBA Profit Margins: What''s Realistic in [YEAR]?'
  ],
  ARRAY[
    'Amazon box with money flying out, "I SELL $15K/MONTH AND NEVER TOUCH IT" dramatic reveal text',
    'Alibaba supplier page on screen with product selected, "HOW I FIND SUPPLIERS" walkthrough thumbnail',
    'Before: clueless person. After: Amazon seller dashboard showing sales. "90 DAY RESULTS" caption',
    'Jungle Scout vs Helium 10 battle graphic, "WHICH TOOL FINDS BETTER PRODUCTS?" verdict text',
    'Product packaging on white background with "MY AMAZON PRODUCT" label, branded professional shot',
    'Amazon Seller Central dashboard showing revenue graph, blurred numbers for privacy, "REAL RESULTS"',
    'Alibaba website showing MOQ and prices, calculator beside it, "THE EXACT MATH I USE" overlay',
    'Warning sign with common FBA mistake listed, "$2,000 LESSON" caption, cautionary thumbnail'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "FBA Foundations",
        "days": [
          {"day": 1, "title": "Amazon FBA explained: how it actually works (no hype)"},
          {"day": 2, "title": "How much money you actually need to start Amazon FBA"},
          {"day": 3, "title": "Private label vs wholesale vs retail arbitrage: which to start?"},
          {"day": 4, "title": "Amazon FBA fees explained: what you actually pay"},
          {"day": 5, "title": "Is Amazon FBA still worth it in 2024? (honest answer)"}
        ]
      },
      {
        "week_number": 2,
        "label": "Product Research",
        "days": [
          {"day": 8, "title": "How to find your first product to sell on Amazon"},
          {"day": 9, "title": "Jungle Scout vs Helium 10: which product research tool wins?"},
          {"day": 10, "title": "How to find a profitable niche for Amazon FBA"},
          {"day": 11, "title": "Product validation: how I know a product will sell before buying"},
          {"day": 12, "title": "How to find suppliers on Alibaba (step by step)"}
        ]
      },
      {
        "week_number": 3,
        "label": "Launching Your Product",
        "days": [
          {"day": 15, "title": "How to order your first sample from a supplier"},
          {"day": 16, "title": "Shipping to Amazon FBA warehouses: complete guide"},
          {"day": 17, "title": "How to write a listing that converts"},
          {"day": 18, "title": "Product photography for Amazon: DIY vs hiring"},
          {"day": 19, "title": "How to launch a product on Amazon with no reviews"}
        ]
      },
      {
        "week_number": 4,
        "label": "Growing and Scaling",
        "days": [
          {"day": 22, "title": "Amazon PPC for beginners: getting your first sales"},
          {"day": 23, "title": "How I got my first 50 Amazon reviews ethically"},
          {"day": 24, "title": "My $0 to $10,000/month Amazon FBA journey"},
          {"day": 25, "title": "Brand registry on Amazon: what it is and why you need it"},
          {"day": 26, "title": "My biggest Amazon FBA mistake (and what it cost me)"}
        ]
      }
    ]
  }'::jsonb
);

-- ==========================================
-- PREMIUM NICHE 10: Minimalist Living Abroad
-- ==========================================
insert into public.niches (
  name, slug, category, cpm_min, cpm_max, competition_level, growth_trend,
  avg_views, best_upload_day, ideal_video_length, top_audience, age_group, audience_size,
  is_premium, published,
  video_ideas, script_hooks, title_templates, thumbnail_prompts, content_calendar
) values (
  'Minimalist Living Abroad',
  'minimalist-living-abroad',
  'Lifestyle', 10.00, 18.00, 'Low', 'rising',
  '30,000–120,000', 'Thursday', '10–20 min', 'Expats, remote workers, freedom seekers', '25–45', '12M+',
  true, true,
  ARRAY[
    'How I moved abroad with one suitcase and never looked back',
    'Living in [Lisbon/Bali/Medellín] for $1,500/month: full cost breakdown',
    'Minimalism and moving abroad: why they go together perfectly',
    'My apartment tour: living minimally in [city]',
    'Best countries for minimalist expat living in 2024',
    'How to ship your life abroad or leave it behind',
    'Digital nomad vs expat: what''s the real difference?',
    'How I reduced my possessions to 50 items',
    'Cost of living abroad: what $2,000/month gets you vs US/UK',
    'How to find a furnished apartment abroad as a foreigner',
    'Banking abroad: best accounts for expats and nomads',
    'Health insurance when living abroad: what I actually use',
    'How minimalism made moving abroad much easier',
    'My daily routine living minimally in [city]',
    'What I got rid of before moving abroad (and don''t miss)',
    'Visa options for living abroad long term: a real overview',
    'How to stay connected with family while living abroad',
    'Remote work visa countries: where to apply in 2024',
    'Minimalist wardrobe for living abroad in any climate',
    'The psychological shift that happens when you own less',
    'Is it lonely living abroad as an expat? (honest answer)',
    'How to build a social life in a new country from scratch',
    'What I spend monthly living minimally in Southeast Asia',
    'Things I wish I knew before moving abroad',
    'How to handle taxes as an expat or digital nomad',
    'Furnished vs unfurnished: renting abroad as a minimalist',
    'Slow travel vs fast travel: which is actually cheaper?',
    'How learning the local language changes everything abroad',
    'Minimalism abroad: the things I kept and why they matter',
    '1 year living minimally abroad: was it worth it?'
  ],
  '[
    {"label": "Freedom hook", "text": "Everything I own fits in one bag. My rent is $600 a month. My life is in a city I chose because I actually want to be here. Let me show you how."},
    {"label": "Cost hook", "text": "I live better in Lisbon than I did in London — and I pay 60% less. Minimalism and geography changed everything about my finances."},
    {"label": "Clarity hook", "text": "When I got rid of 80% of my possessions and moved abroad, I expected to feel loss. I felt relief. Today I''m explaining why."},
    {"label": "Before/after", "text": "Three years ago I had a storage unit, a car payment, and a lease I hated. Today I have one bag, a passport with stamps, and real savings."},
    {"label": "Practical hook", "text": "Moving abroad doesn''t require being rich. It requires owning less and choosing where to live intentionally. I''m going to show you the numbers."},
    {"label": "Community hook", "text": "I thought living abroad would be isolating. It''s the most connected I''ve ever felt — and I''m going to tell you exactly why."}
  ]'::jsonb,
  ARRAY[
    'I Moved Abroad With [NUMBER] Items — Here''s What [HAPPENED/CHANGED]',
    'Living in [CITY/COUNTRY] on $[AMOUNT]/Month: Full Cost Breakdown',
    'My Minimalist Apartment Tour in [CITY] ($[RENT]/Month)',
    'How I Reduced My Possessions to [NUMBER] Items Before Moving Abroad',
    '[NUMBER] Things I Got Rid of Before Moving Abroad (And Don''t Miss)',
    'Best Countries for [MINIMALIST/BUDGET] Expat Living in [YEAR]',
    '[TIME] Living Abroad Minimally: Honest Review of Everything',
    'Digital Nomad vs Expat: Which Lifestyle Actually Makes More Sense?',
    'How to Move Abroad With [NUMBER] Suitcases (Or Less)',
    'Cost of Living in [CITY]: What $[AMOUNT] Gets You as an Expat'
  ],
  ARRAY[
    'Single open suitcase on apartment floor with whole life inside it, "[CITY] BOUND" destination tag visible',
    'Minimalist apartment interior in foreign city, "MY $600/MONTH HOME ABROAD" caption, warm aesthetic',
    'Side-by-side: cluttered home before vs one-bag life after, "I GOT RID OF EVERYTHING" dramatic reveal',
    'Cost of living comparison table: US city vs expat city, savings highlighted in green, "THE MATH IS CLEAR"',
    'Person walking cobblestone street in European city with single backpack, "EVERYTHING I OWN" caption',
    'Tiny but beautiful furnished apartment in popular expat city, "THIS IS WHAT $700 BUYS IN LISBON" overlay',
    'Passport and rental agreement with city backdrop, "HOW I FOUND AN APARTMENT ABROAD" walkthrough',
    'Before pile of possessions on left, single suitcase on right, "THE BEFORE AND AFTER" of minimalism'
  ],
  '{
    "weeks": [
      {
        "week_number": 1,
        "label": "The Minimalist Move",
        "days": [
          {"day": 1, "title": "How I moved abroad with one suitcase and never looked back"},
          {"day": 2, "title": "Minimalism and moving abroad: why they go together perfectly"},
          {"day": 3, "title": "How I reduced my possessions to 50 items"},
          {"day": 4, "title": "What I got rid of before moving abroad (and don''t miss)"},
          {"day": 5, "title": "The psychological shift that happens when you own less"}
        ]
      },
      {
        "week_number": 2,
        "label": "Where and How to Go",
        "days": [
          {"day": 8, "title": "Best countries for minimalist expat living in 2024"},
          {"day": 9, "title": "Remote work visa countries: where to apply in 2024"},
          {"day": 10, "title": "Visa options for living abroad long term: a real overview"},
          {"day": 11, "title": "How to find a furnished apartment abroad as a foreigner"},
          {"day": 12, "title": "Cost of living abroad: what $2,000/month gets you vs US/UK"}
        ]
      },
      {
        "week_number": 3,
        "label": "Expat Practicalities",
        "days": [
          {"day": 15, "title": "Banking abroad: best accounts for expats and nomads"},
          {"day": 16, "title": "Health insurance when living abroad: what I actually use"},
          {"day": 17, "title": "How to handle taxes as an expat or digital nomad"},
          {"day": 18, "title": "Minimalist wardrobe for living abroad in any climate"},
          {"day": 19, "title": "How to stay connected with family while living abroad"}
        ]
      },
      {
        "week_number": 4,
        "label": "Life and Reflection",
        "days": [
          {"day": 22, "title": "My daily routine living minimally in [city]"},
          {"day": 23, "title": "Is it lonely living abroad as an expat? (honest answer)"},
          {"day": 24, "title": "How to build a social life in a new country from scratch"},
          {"day": 25, "title": "Things I wish I knew before moving abroad"},
          {"day": 26, "title": "1 year living minimally abroad: was it worth it?"}
        ]
      }
    ]
  }'::jsonb
);
