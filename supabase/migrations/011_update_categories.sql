-- Add category_slug and content_type columns
ALTER TABLE niches ADD COLUMN IF NOT EXISTS category_slug TEXT;
ALTER TABLE niches ADD COLUMN IF NOT EXISTS content_type TEXT;

-- Finance → Finance & Business
UPDATE niches SET category = 'Finance & Business', category_slug = 'finance-business'
WHERE category = 'Finance';

-- Business → Finance & Business
UPDATE niches SET category = 'Finance & Business', category_slug = 'finance-business'
WHERE category = 'Business';

-- Tech / Technology / AI → Science & Technology
UPDATE niches SET category = 'Science & Technology', category_slug = 'science-technology'
WHERE category IN ('Tech', 'Technology', 'AI');

-- Health → Health & Fitness
UPDATE niches SET category = 'Health & Fitness', category_slug = 'health-fitness'
WHERE category = 'Health';

-- Gaming (name stays, add slug)
UPDATE niches SET category_slug = 'gaming'
WHERE category = 'Gaming';

-- Education / Facts → Education
UPDATE niches SET category = 'Education', category_slug = 'education'
WHERE category IN ('Education', 'Facts');

-- Lifestyle → People & Blogs
UPDATE niches SET category = 'People & Blogs', category_slug = 'people-blogs'
WHERE category = 'Lifestyle';

-- Motivation → Motivation & Self-help
UPDATE niches SET category = 'Motivation & Self-help', category_slug = 'motivation-self-help'
WHERE category = 'Motivation';

-- News → News & Politics
UPDATE niches SET category = 'News & Politics', category_slug = 'news-politics'
WHERE category = 'News';

-- Entertainment (name stays, add slug)
UPDATE niches SET category_slug = 'entertainment'
WHERE category = 'Entertainment';

-- Food & Cooking (name stays, add slug)
UPDATE niches SET category_slug = 'food-cooking'
WHERE category = 'Food & Cooking';

-- Handle any niches already using new category names (add slugs)
UPDATE niches SET category_slug = 'autos-vehicles'       WHERE category = 'Autos & Vehicles'       AND category_slug IS NULL;
UPDATE niches SET category_slug = 'comedy'               WHERE category = 'Comedy'                  AND category_slug IS NULL;
UPDATE niches SET category_slug = 'film-animation'       WHERE category = 'Film & Animation'        AND category_slug IS NULL;
UPDATE niches SET category_slug = 'how-to-style'         WHERE category = 'How-to & Style'          AND category_slug IS NULL;
UPDATE niches SET category_slug = 'music'                WHERE category = 'Music'                   AND category_slug IS NULL;
UPDATE niches SET category_slug = 'nonprofits-activism'  WHERE category = 'Nonprofits & Activism'   AND category_slug IS NULL;
UPDATE niches SET category_slug = 'pets-animals'         WHERE category = 'Pets & Animals'          AND category_slug IS NULL;
UPDATE niches SET category_slug = 'sports'               WHERE category = 'Sports'                  AND category_slug IS NULL;
UPDATE niches SET category_slug = 'travel-events'        WHERE category = 'Travel & Events'         AND category_slug IS NULL;
UPDATE niches SET category_slug = 'beauty-fashion'       WHERE category = 'Beauty & Fashion'        AND category_slug IS NULL;
UPDATE niches SET category_slug = 'spirituality-religion' WHERE category = 'Spirituality & Religion' AND category_slug IS NULL;
UPDATE niches SET category_slug = 'kids-family'          WHERE category = 'Kids & Family'           AND category_slug IS NULL;
UPDATE niches SET category_slug = 'documentaries'        WHERE category = 'Documentaries'           AND category_slug IS NULL;
UPDATE niches SET category_slug = 'language-learning'    WHERE category = 'Language Learning'       AND category_slug IS NULL;
UPDATE niches SET category_slug = 'architecture-design'  WHERE category = 'Architecture & Design'   AND category_slug IS NULL;
UPDATE niches SET category_slug = 'paranormal-mystery'   WHERE category = 'Paranormal & Mystery'    AND category_slug IS NULL;
UPDATE niches SET category_slug = 'science-technology'   WHERE category = 'Science & Technology'    AND category_slug IS NULL;
UPDATE niches SET category_slug = 'health-fitness'       WHERE category = 'Health & Fitness'        AND category_slug IS NULL;
UPDATE niches SET category_slug = 'finance-business'     WHERE category = 'Finance & Business'      AND category_slug IS NULL;
UPDATE niches SET category_slug = 'motivation-self-help' WHERE category = 'Motivation & Self-help'  AND category_slug IS NULL;
UPDATE niches SET category_slug = 'news-politics'        WHERE category = 'News & Politics'         AND category_slug IS NULL;
UPDATE niches SET category_slug = 'people-blogs'         WHERE category = 'People & Blogs'          AND category_slug IS NULL;
