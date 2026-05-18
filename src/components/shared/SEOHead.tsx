// Server component — use via generateMetadata() in pages instead of rendering this
// This component is provided for use in legacy or custom head scenarios.

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  noIndex?: boolean
}

export function SEOHead({
  title,
  description,
  canonical,
  ogImage = '/og-image.png',
  noIndex = false,
}: SEOHeadProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ytniches.com'
  const fullTitle = `${title}`
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:url" content={fullCanonical} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
    </>
  )
}
