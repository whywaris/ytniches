import { Niche, BlogPost } from '@/types'

export function WebsiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'YTNiches',
          url: 'https://ytniches.com',
          description: 'YouTube Niche Research Platform',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://ytniches.com/niches?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        }),
      }}
    />
  )
}

export function NicheJsonLd({ niche }: { niche: Niche }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: `${niche.name} YouTube Niche`,
          description: `Complete guide for the ${niche.name} YouTube niche including video ideas, templates and content calendar.`,
          url: `https://ytniches.com/niches/${niche.slug}`,
          publisher: {
            '@type': 'Organization',
            name: 'YTNiches',
            url: 'https://ytniches.com',
          },
          datePublished: niche.created_at,
          dateModified: niche.updated_at,
        }),
      }}
    />
  )
}

export function BlogPostJsonLd({ post }: { post: BlogPost }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          url: `https://ytniches.com/blog/${post.slug}`,
          datePublished: post.created_at,
          dateModified: post.updated_at,
          publisher: {
            '@type': 'Organization',
            name: 'YTNiches',
            url: 'https://ytniches.com',
          },
        }),
      }}
    />
  )
}

export function FaqJsonLd({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }),
      }}
    />
  )
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url,
          })),
        }),
      }}
    />
  )
}

export function PricingJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'YTNiches Pro',
          description: 'Full access to 1,200+ YouTube niches with video ideas and templates',
          url: 'https://ytniches.com/pricing',
          offers: [
            {
              '@type': 'Offer',
              name: 'Pro Monthly',
              price: '7.00',
              priceCurrency: 'USD',
              priceValidUntil: '2026-12-31',
              availability: 'https://schema.org/InStock',
              url: 'https://ytniches.com/pricing',
            },
            {
              '@type': 'Offer',
              name: 'Lifetime Access',
              price: '49.00',
              priceCurrency: 'USD',
              priceValidUntil: '2026-12-31',
              availability: 'https://schema.org/InStock',
              url: 'https://ytniches.com/pricing',
            },
          ],
        }),
      }}
    />
  )
}
