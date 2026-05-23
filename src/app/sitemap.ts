import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/config/categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch all published niches
  const { data: niches } = await supabase
    .from('niches')
    .select('slug, updated_at')
    .eq('published', true)
    .not('slug', 'is', null)
    .order('created_at', { ascending: false })

  // Fetch all published blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, is_featured')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const nicheUrls = (niches ?? []).map((niche) => ({
    url: `https://ytniches.com/niches/${niche.slug}`,
    lastModified: new Date(niche.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogUrls = (posts ?? []).map((post) => ({
    url: `https://ytniches.com/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly' as const,
    priority: (post as { is_featured?: boolean }).is_featured ? 0.9 : 0.6,
  }))

  const categoryUrls = CATEGORIES.map((cat) => ({
    url: `https://ytniches.com/niches/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const categoriesPageUrls = [
    {
      url: 'https://ytniches.com/categories',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...CATEGORIES.map((cat) => ({
      url: `https://ytniches.com/categories/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  const toolUrls = [
    '/tag-extractor',
    '/watch-time-calculator',
    '/rss-feed-generator',
    '/dislike-viewer',
    '/random-comment-picker',
    '/thumbnail-resizer',
  ].map((path) => ({
    url: `https://ytniches.com${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const automationToolsUrl = {
    url: 'https://ytniches.com/youtube-automation-tools',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }

  const legalUrls = [
    '/legal', '/privacy', '/terms', '/refund', '/cookies', '/disclaimer', '/gdpr',
  ].map((path) => ({
    url: `https://ytniches.com${path}`,
    lastModified: new Date('2025-01-15'),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }))

  return [
    {
      url: 'https://ytniches.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://ytniches.com/niches',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categoryUrls,
    ...categoriesPageUrls,
    {
      url: 'https://ytniches.com/tools',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: 'https://ytniches.com/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://ytniches.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...nicheUrls,
    ...blogUrls,
    ...toolUrls,
    automationToolsUrl,
    ...legalUrls,
  ]
}
