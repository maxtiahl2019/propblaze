export const dynamic = "force-static";
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'https://propblaze.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/how-it-works',
          '/features',
          '/pricing',
          '/listings/',
          '/sell-property/',
          '/guides/',
          '/glossary',
          '/blog/',
          '/agencies',
          '/about',
          '/contact',
          '/register',
          '/ru/',
          '/sr/',
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/login',
          '/_next/',
          '/properties/new',
          '/billing/',
          '/demo',
          '/distribution/',
          '/leads/',
          '/settings/',
          '/*?*',      // Block all URL query params (filter/search result pages)
        ],
      },
      {
        // Allow Googlebot full access to public content
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: ['/dashboard/', '/admin/', '/api/', '/login', '/_next/', '/billing/', '/demo'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
