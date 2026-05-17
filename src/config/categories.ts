export interface Category {
  name: string
  slug: string
  color: string
  intro: string
  types: string[]
}

export const CATEGORIES: Category[] = [
  {
    name: 'Autos & Vehicles',
    slug: 'autos-vehicles',
    color: 'bg-[#DC2626]',
    intro:
      'Autos & Vehicles is one of YouTube\'s most passionate communities, with audiences ranging from everyday drivers to hardcore enthusiasts. CPMs typically range from $5–$20, driven by high-value advertisers like dealerships, insurance companies, and auto parts brands. Whether you focus on car reviews, electric vehicles, restoration projects, or motorcycle culture, this category rewards authentic enthusiasm and detailed knowledge. The audience is loyal, male-skewing, and highly likely to engage with sponsored content.',
    types: ['Car Reviews', 'Drag Racing', 'Off-Road Adventures', 'Car Restoration', 'EV & Hybrid Reviews', 'Motorcycle Content', 'Car Comparisons', 'Auto DIY', 'Supercar Spotting', 'Car Culture', 'Truck Content', 'Performance Tuning'],
  },
  {
    name: 'Comedy',
    slug: 'comedy',
    color: 'bg-[#F59E0B]',
    intro:
      'Comedy YouTube niches have produced some of the platform\'s biggest channels, with content ranging from stand-up clips and sketch comedy to pranks, parody, and dark humor. While CPMs ($3–$10) are moderate, comedy channels typically build massive, engaged audiences that monetize well through merchandise, brand deals, and live events. Comedy is one of the most shareable content formats on the internet, giving well-crafted videos enormous viral potential that can catapult a channel from zero to millions overnight.',
    types: ['Stand-up Comedy', 'Sketch Comedy', 'Pranks & Challenges', 'Parody', 'Reaction Comedy', 'Improv', 'Roasts', 'Comedy Shorts', 'Storytelling', 'Commentary', 'Satirical News', 'Dark Humor'],
  },
  {
    name: 'Education',
    slug: 'education',
    color: 'bg-[#D97706]',
    intro:
      'Education YouTube niches cover academic subjects, skill development, language learning, history, and practical how-to content. Educational channels benefit from strong search traffic — people are actively looking for tutorials and explanations — and consistent long-term viewership that keeps videos earning for years. CPMs range from $5–$20, and educational creators often find success with course sales, affiliate revenue, and Patreon memberships on top of ad income. The best education channels teach difficult concepts simply and build trust with their audience over time.',
    types: ['Explainers', 'Tutorials', 'Study Tips', 'History Lessons', 'Science Experiments', 'Math Lessons', 'Philosophy', 'Literature Analysis', 'Geography', 'Study With Me', 'Exam Prep', 'Fact-based Content'],
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    color: 'bg-[#7C3AED]',
    intro:
      'Entertainment YouTube niches cover the full spectrum of pop culture — celebrity news, movie reviews, TV show recaps, fan theories, and behind-the-scenes content. With CPMs of $4–$15, entertainment channels attract both general audiences and dedicated fandoms. The key to success is speed and personality: entertainment audiences want fresh takes on trending topics delivered by engaging hosts. This category has strong viral potential and benefits from YouTube\'s recommendation algorithm, which tends to surface trending entertainment content to new viewers.',
    types: ['Celebrity News', 'Movie Reviews', 'TV Show Recaps', 'Fan Theories', 'Pop Culture Commentary', 'Entertainment News', 'Talent & Reality TV', 'Behind the Scenes', 'Music Videos', 'Interviews', 'Award Coverage', 'Fandom Content'],
  },
  {
    name: 'Film & Animation',
    slug: 'film-animation',
    color: 'bg-[#9333EA]',
    intro:
      'Film & Animation niches on YouTube attract creators who love the craft of moving images — from independent short films and animation tutorials to film analysis essays and VFX breakdowns. CPMs range from $5–$18, with particularly strong performance in filmmaking tutorials as audiences include aspiring professionals who actively invest in gear, courses, and software. Animation content, from 2D to 3D to motion graphics, is increasingly in demand as brands need animated content for ads and social media.',
    types: ['Film Reviews', 'Animated Shorts', 'Fan Films', 'Filmmaking Tips', 'Animation Tutorials', 'Film Analysis', 'Cinematography', 'VFX Breakdowns', 'Independent Films', 'Screenplay Writing', 'Storyboarding', 'Film History'],
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    color: 'bg-[#EA580C]',
    intro:
      'Gaming is one of the largest content categories on YouTube with over 200 billion gaming-related views per year. While CPMs ($2–$10) are lower than other niches, gaming audiences are incredibly engaged, loyal, and willing to spend on games, merchandise, and subscriptions. The biggest opportunity is in niching within gaming — speedrunning specific titles, retro gaming nostalgia, gaming news analysis, or game development. Gaming channels often grow fastest through short clips and community-driven content, with Shorts being particularly powerful for discoverability.',
    types: ['Gameplay Walkthroughs', 'Game Reviews', "Let's Plays", 'Speedruns', 'Gaming News', 'eSports', 'Game Lore', 'Retro Gaming', 'Mobile Gaming', 'Gaming Tips & Tricks', 'Modding', 'Game Comparisons'],
  },
  {
    name: 'How-to & Style',
    slug: 'how-to-style',
    color: 'bg-[#EC4899]',
    intro:
      'How-to & Style is one of YouTube\'s most practical and evergreen categories, covering DIY projects, home organization, life hacks, and personal style tips. CPMs range from $5–$20, driven by advertisers in home improvement, fashion, and lifestyle brands. How-to content is search-driven and long-lasting — a well-optimized tutorial can continue generating views and revenue for years after it\'s published. This category rewards clear instructions, good production value, and consistent publishing, making it accessible to creators at all experience levels.',
    types: ['DIY Projects', 'Home Decor', 'Life Hacks', 'Organization Tips', 'Budgeting Basics', 'Cooking Basics', 'Fashion Tips', 'Beauty Tutorials', 'Gardening', 'Car Maintenance', 'Tech How-tos', 'Craft Projects'],
  },
  {
    name: 'Music',
    slug: 'music',
    color: 'bg-[#8B5CF6]',
    intro:
      'Music YouTube niches span a wide spectrum — from cover songs and original compositions to music theory education, instrument tutorials, and production content. While music content faces some unique monetization challenges, channels focused on music education, production, and commentary earn strong CPMs of $5–$18. Music audiences are intensely passionate and often follow creators for years, creating strong conditions for merchandise sales, Patreon memberships, and live event revenue.',
    types: ['Music Reviews', 'Cover Songs', 'Original Songs', 'Music Theory', 'Instrument Tutorials', 'Music History', 'Music Production', 'Song Reactions', 'Album Reviews', 'Genre Explorations', 'Concert Footage', 'Behind the Music'],
  },
  {
    name: 'News & Politics',
    slug: 'news-politics',
    color: 'bg-[#0EA5E9]',
    intro:
      'News & Politics channels on YouTube have seen explosive growth as audiences move away from traditional media in search of independent voices and alternative perspectives. CPMs in this space range from $5–$18, with strong demand from financial, legal, and advocacy advertisers. The best channels offer genuine analysis and clear points of view rather than simply repeating headlines. While this niche requires diligence to maintain accuracy and audience trust, channels that build credibility can develop highly engaged, subscription-driven audiences.',
    types: ['Political Commentary', 'News Analysis', 'Investigative Journalism', 'Policy Debates', 'World News', 'Local News', 'Political Satire', 'Election Coverage', 'Geopolitics', 'Economic News', 'Legal Analysis', 'Social Issues'],
  },
  {
    name: 'Nonprofits & Activism',
    slug: 'nonprofits-activism',
    color: 'bg-[#16A34A]',
    intro:
      'Nonprofits & Activism channels on YouTube are driven by mission rather than profit, but they can still generate substantial revenue through ad income, donations, and grant funding. CPMs range from $4–$12, with strong performance in content related to environmental issues, social justice, and humanitarian causes. This niche attracts deeply committed audiences who are more likely than average to support creators financially through platforms like Patreon or direct donations. Authenticity and genuine commitment to the cause are the keys to building trust in this space.',
    types: ['Social Justice', 'Environmental Activism', 'Charity Fundraising', 'Community Outreach', 'Animal Rights', 'Human Rights', 'Climate Change', 'Poverty Awareness', 'Mental Health Advocacy', 'Educational Access', 'Political Activism', 'Volunteer Stories'],
  },
  {
    name: 'People & Blogs',
    slug: 'people-blogs',
    color: 'bg-[#F97316]',
    intro:
      'People & Blogs is the most personal category on YouTube, encompassing daily vlogs, life updates, challenge videos, Q&As, and day-in-the-life content. While CPMs ($3–$10) are moderate, this category offers the most flexibility — any life experience or personality can become compelling content. The strongest channels succeed by making audiences feel like they\'re watching a close friend, creating the kind of parasocial bond that translates into loyal subscribers, Patreon supporters, and merchandise buyers. Consistency and authentic personality are the primary growth drivers.',
    types: ['Daily Vlogs', 'Story Time', 'Life Updates', 'Family Life', 'College Life', 'Work Life', 'Moving & Travel', 'Q&As', 'Day in My Life', 'Monthly Favorites', 'Challenges', 'Personal Growth'],
  },
  {
    name: 'Pets & Animals',
    slug: 'pets-animals',
    color: 'bg-[#10B981]',
    intro:
      'Pets & Animals is one of YouTube\'s most universally appealing categories — virtually everyone loves watching animals. CPMs range from $5–$15, supported by advertisers in pet food, supplies, veterinary services, and pet insurance. The category spans dog training tutorials, cat behavior content, exotic pet care, wildlife documentaries, and funny animal compilations. Pet channels often build incredibly loyal communities of fellow animal lovers who support creators through merchandise, memberships, and brand partnerships. The content is inherently shareable and cross-platform.',
    types: ['Dog Training', 'Cat Content', 'Exotic Pets', 'Animal Rescues', 'Pet Care Tips', 'Wildlife', 'Aquariums', 'Bird Content', 'Farm Animals', 'Funny Pet Videos', 'Animal Facts', 'Pet Product Reviews'],
  },
  {
    name: 'Science & Technology',
    slug: 'science-technology',
    color: 'bg-[#2563EB]',
    intro:
      'Science & Technology YouTube niches span software tutorials, hardware reviews, AI tools, developer content, and science explainers. Tech audiences are highly educated and financially active, making this category extremely attractive to advertisers — CPMs range from $8–$30 depending on the specific focus. The niche rewards creators who can explain complex topics clearly and stay current with rapidly evolving fields like AI, cybersecurity, and software development. Educational tech channels often find multiple revenue streams through affiliate links, sponsored content, and courses.',
    types: ['Tech Reviews', 'Science Experiments', 'Space Exploration', 'AI & Machine Learning', 'Coding Tutorials', 'Engineering', 'Biology', 'Chemistry', 'Physics', 'Tech News', 'Robotics', 'Innovation'],
  },
  {
    name: 'Sports',
    slug: 'sports',
    color: 'bg-[#EF4444]',
    intro:
      'Sports YouTube channels tap into one of the most passionate and engaged audiences on the platform. CPMs range from $5–$18 depending on the sport and audience demographics, with premium rates for golf, tennis, and combat sports content. The category spans highlights and commentary, training tutorials, sports news, fantasy sports analysis, and athlete profiles. Sports channels benefit from consistent content demand throughout seasons and the extraordinary loyalty of sports fans, who follow their favorite channels for years and readily engage with merchandise and membership programs.',
    types: ['Sports Highlights', 'Game Analysis', 'Sports News', 'Athlete Profiles', 'Training Tips', 'Sports History', 'Fantasy Sports', 'Extreme Sports', 'Fitness & Training', 'Sports Reactions', 'Behind the Scenes', 'Sports Motivation'],
  },
  {
    name: 'Travel & Events',
    slug: 'travel-events',
    color: 'bg-[#0891B2]',
    intro:
      'Travel & Events channels capture some of the most aspirational content on YouTube — exotic destinations, cultural experiences, budget travel tips, and event coverage that takes viewers places they\'ve never been. CPMs range from $5–$18, with strong demand from travel brands, airlines, hotels, and credit card companies. Travel content is highly search-driven and has enormous shelf life — a video about visiting a destination stays relevant for years. The category rewards stunning visuals, genuine storytelling, and practical information that helps viewers plan their own adventures.',
    types: ['Travel Vlogs', 'City Guides', 'Budget Travel', 'Luxury Travel', 'Solo Travel', 'Adventure Travel', 'Event Coverage', 'Cultural Experiences', 'Travel Tips', 'Food Travel', 'Local Experiences', 'Destination Guides'],
  },
  {
    name: 'Health & Fitness',
    slug: 'health-fitness',
    color: 'bg-[#DC2626]',
    intro:
      'Health and fitness is one of the most evergreen categories on YouTube. With CPMs ranging from $5–$20 and audience sizes in the hundreds of millions, there is room for creators at every level. From workout routines to mental health content, nutrition guides to chronic illness support — health audiences are highly engaged and return frequently for new content. The category has excellent monetization potential through supplement affiliates, fitness equipment partnerships, online coaching programs, and branded merchandise.',
    types: ['Workout Routines', 'Nutrition & Diet', 'Mental Health', 'Weight Loss', 'Yoga & Meditation', 'Running', 'Strength Training', 'Healthy Recipes', 'Wellness Tips', 'Body Transformation', 'Sports Medicine', 'Recovery'],
  },
  {
    name: 'Beauty & Fashion',
    slug: 'beauty-fashion',
    color: 'bg-[#EC4899]',
    intro:
      'Beauty & Fashion is one of the highest-earning YouTube categories, with CPMs ranging from $8–$25 driven by premium beauty brands, luxury fashion advertisers, and high-ticket skincare companies. The category spans makeup tutorials, skincare routines, fashion hauls, outfit ideas, and trend analysis. Beauty and fashion audiences are primarily female, highly engaged, and actively looking for product recommendations — making this category exceptional for affiliate marketing and brand partnerships. The best channels build authority in a specific niche rather than trying to cover everything.',
    types: ['Makeup Tutorials', 'Skincare Routines', 'Fashion Hauls', 'Outfit Ideas', 'Product Reviews', 'Hair Care', 'Nail Art', 'Luxury Fashion', 'Thrift Shopping', 'Seasonal Trends', 'Beauty Hacks', 'Style Guides'],
  },
  {
    name: 'Food & Cooking',
    slug: 'food-cooking',
    color: 'bg-[#F59E0B]',
    intro:
      'Food & Cooking is one of YouTube\'s most universally engaging categories — everyone eats, and watching people prepare delicious food is genuinely satisfying. CPMs range from $5–$15, with strong monetization through kitchen equipment affiliates, cookbook deals, and food brand sponsorships. The category spans recipe tutorials, restaurant reviews, food travel, cooking challenges, and diet-specific content. Food channels with a strong visual style and clear recipes tend to build very loyal audiences who return weekly for new ideas.',
    types: ['Recipe Tutorials', 'Restaurant Reviews', 'Food Challenges', 'Cooking Tips', 'Baking', 'International Cuisine', 'Street Food', 'Meal Prep', 'Diet-Specific Recipes', 'Food Science', 'Chef Interviews', 'Kitchen Tours'],
  },
  {
    name: 'Finance & Business',
    slug: 'finance-business',
    color: 'bg-[#16A34A]',
    intro:
      'Finance & Business YouTube niches cover personal finance, investing, entrepreneurship, and wealth-building strategies. Advertisers in this space pay some of the highest CPMs on YouTube — often $15–$50 per 1,000 views — because viewers are actively researching financial decisions and are valuable to banks, brokerages, and fintech companies. Business channels attract entrepreneurs, freelancers, and aspiring founders who are actively spending money on tools, courses, and services. The best channels teach real, actionable skills and build trust through consistent, transparent advice.',
    types: ['Personal Finance', 'Investing', 'Entrepreneurship', 'Passive Income', 'Real Estate', 'Stock Market', 'Cryptocurrency', 'Business Strategy', 'Career Advice', 'Side Hustles', 'Financial Independence', 'Budgeting'],
  },
  {
    name: 'Spirituality & Religion',
    slug: 'spirituality-religion',
    color: 'bg-[#8B5CF6]',
    intro:
      'Spirituality & Religion channels serve one of YouTube\'s most dedicated and consistent audiences. People who seek spiritual content return regularly, watch for extended periods, and are highly likely to support creators through memberships, donations, and merchandise. CPMs range from $4–$15, with the strongest performance in meditation, mindfulness, and practical spirituality content. This niche rewards authenticity, depth, and consistency above all else — channels that build genuine communities around shared beliefs develop the kind of loyal following that sustains long-term creator businesses.',
    types: ['Meditation', 'Prayer & Devotion', 'Spiritual Growth', 'Religious Education', 'Philosophy of Life', 'Mindfulness', 'Yoga Philosophy', 'Interfaith Dialogue', 'Bible Study', 'Spiritual Healing', 'Mysticism', 'Astrology'],
  },
  {
    name: 'Kids & Family',
    slug: 'kids-family',
    color: 'bg-[#10B981]',
    intro:
      'Kids & Family is one of YouTube\'s largest and most consistent categories, with audiences spanning children, parents, and educators. CPMs range from $3–$12, but the audience scale is enormous — top kids\' channels regularly accumulate billions of views. Content spans educational videos for children, parenting advice, family vlog adventures, toy reviews, and craft activities. This category requires careful attention to YouTube\'s COPPA compliance and family-safe content policies, but channels that get it right can build extraordinarily loyal family audiences with very high brand deal potential.',
    types: ["Children's Education", 'Family Adventures', 'Parenting Tips', 'Kids Activities', 'Toy Reviews', 'Storytime', 'School Tips', 'Family Vlogs', 'Kids Crafts', 'Nursery Rhymes', 'Science for Kids', 'Learning Through Play'],
  },
  {
    name: 'Documentaries',
    slug: 'documentaries',
    color: 'bg-[#6B7280]',
    intro:
      'Documentaries on YouTube have found a thriving home as audiences seek in-depth storytelling beyond traditional TV and streaming. CPMs range from $6–$18, with particularly strong performance in true crime, history, and nature documentary content. YouTube documentaries benefit from long watch times (which the algorithm rewards), deep audience engagement, and strong searchability around true events and public figures. Independent documentary creators can build significant audiences by covering subjects that mainstream media ignores, creating content that feels urgent and authentic.',
    types: ['True Crime Docs', 'Historical Documentaries', 'Nature Documentaries', 'Social Issue Docs', 'Political Documentaries', 'Mini-Docs', 'Environmental Docs', 'Biography Docs', 'Science Documentaries', 'Cultural Documentaries', 'War Documentaries', 'Sports Documentaries'],
  },
  {
    name: 'Motivation & Self-help',
    slug: 'motivation-self-help',
    color: 'bg-[#F97316]',
    intro:
      'Motivation & Self-help is one of YouTube\'s most searched and consistently growing categories, driven by audiences seeking personal growth, productivity improvement, and mindset transformation. CPMs range from $8–$20, supported by strong advertiser interest from coaching platforms, online courses, and productivity tools. The best channels in this space offer practical, actionable advice rather than generic inspiration, and they build communities of like-minded individuals pursuing growth. This category is exceptionally well-suited to multi-channel strategies, with content repurposing well to Shorts, podcasts, and online courses.',
    types: ['Motivational Speeches', 'Success Stories', 'Productivity Tips', 'Goal Setting', 'Mindset & Beliefs', 'Overcoming Fear', 'Leadership', 'Confidence Building', 'Morning Routines', 'Life Advice', 'Self-Improvement', 'Vision & Planning'],
  },
  {
    name: 'Language Learning',
    slug: 'language-learning',
    color: 'bg-[#2563EB]',
    intro:
      'Language Learning is a rapidly growing YouTube niche fueled by millions of people worldwide seeking to learn new languages for travel, career advancement, and cultural connection. CPMs range from $6–$20, with strong advertiser interest from language learning apps, travel companies, and education platforms. The best language learning channels combine practical lessons with cultural context and entertaining delivery. This niche benefits from excellent international reach — a channel teaching English can attract audiences from dozens of countries simultaneously, massively expanding the potential viewer base.',
    types: ['Grammar Lessons', 'Vocabulary Building', 'Pronunciation Practice', 'Conversation Practice', 'Language Immersion', 'Culture & Language', 'Travel Phrases', 'Beginner Courses', 'Advanced Grammar', 'Polyglot Tips', 'Language Challenges', 'Native Speaker Content'],
  },
  {
    name: 'Architecture & Design',
    slug: 'architecture-design',
    color: 'bg-[#6366F1]',
    intro:
      'Architecture & Design channels attract visually sophisticated audiences interested in built environments, interior spaces, graphic design, and creative craft. CPMs range from $8–$22, supported by premium advertisers in home furnishings, software tools, and luxury brands. This niche has excellent YouTube and Pinterest cross-platform potential, as design content is inherently visual and shareable. The category spans architectural history and theory, interior design tutorials, graphic design education, home renovation projects, and sustainable design.',
    types: ['Interior Design', 'Architecture Tours', 'Home Renovation', 'Sustainable Design', 'Urban Planning', 'Design History', 'Product Design', 'Graphic Design', 'Typography', 'Color Theory', 'Space Design', 'Design Portfolios'],
  },
  {
    name: 'Paranormal & Mystery',
    slug: 'paranormal-mystery',
    color: 'bg-[#4B5563]',
    intro:
      'Paranormal & Mystery channels tap into one of the internet\'s most engaged and curious audiences — people who love exploring the unexplained, the unsolved, and the uncanny. CPMs range from $4–$12, with audience scale often compensating for lower rates. This niche covers ghost stories and paranormal investigations, UFO and alien phenomena, true crime mysteries, conspiracy theories, ancient mysteries, and cryptozoology. The content is highly binge-worthy, with audiences watching multiple videos in sequence, driving strong session metrics that YouTube\'s algorithm rewards.',
    types: ['Ghost Stories', 'UFO & Aliens', 'True Crime Mysteries', 'Conspiracy Theories', 'Unexplained Events', 'Paranormal Investigations', 'Cryptozoology', 'Psychic Phenomena', 'Ancient Mysteries', 'Haunted Places', 'Dark History', 'Cold Cases'],
  },
]

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name)

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find((c) => c.name === name)
}

export function getCategoryTypes(name: string): string[] {
  return getCategoryByName(name)?.types ?? []
}

export function nameToSlug(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}
