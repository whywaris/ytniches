import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/api/',
          '/auth/',
          '/payment/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://ytniches.com/sitemap.xml',
    host: 'https://ytniches.com',
  }
}
