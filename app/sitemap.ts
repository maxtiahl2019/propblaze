import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'https://propblaze.com'

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: '', priority: 1.0, changeFreq: 'weekly' as const },
  { path: '/how-it-works', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/features', priority: 0.9, changeFreq: 'monthly' as const },
  { path: '/pricing', priority: 0.9, changeFreq: 'weekly' as const },
  { path: '/listings', priority: 0.8, changeFreq: 'daily' as const },
  { path: '/agencies', priority: 0.7, changeFreq: 'monthly' as const },
  { path: '/glossary', priority: 0.7, changeFreq: 'monthly' as const },
  { path: '/about', priority: 0.6, changeFreq: 'monthly' as const },
  { path: '/contact', priority: 0.6, changeFreq: 'monthly' as const },
  { path: '/blog', priority: 0.8, changeFreq: 'daily' as const },
  { path: '/register', priority: 0.8, changeFreq: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
]

// Programmatic SEO: Sell property in [country]
const countries = [
  'montenegro', 'serbia', 'croatia', 'bulgaria', 'greece',
  'spain', 'portugal', 'italy', 'germany', 'austria',
  'france', 'netherlands', 'poland', 'hungary', 'czech-republic',
]

// Programmatic SEO: Property types
const propertyTypes = ['apartment', 'villa', 'house', 'land', 'commercial']

// Languages
const languages = ['', '/ru', '/sr']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  // Static pages × 3 languages
  for (const page of staticPages) {
    for (const lang of languages) {
      entries.push({
        url: `${BASE_URL}${lang}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFreq,
        priority: lang === '' ? page.priority : page.priority * 0.9,
      })
    }
  }

  // Sell property hub + country pages
  for (const country of countries) {
    entries.push({
      url: `${BASE_URL}/sell-property/${country}/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
    // Russian versions for top markets
    if (['montenegro', 'serbia', 'croatia', 'bulgaria', 'greece'].includes(country)) {
      entries.push({
        url: `${BASE_URL}/ru/prodat-nedvizhimost/${country}/`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.75,
      })
    }
  }

  // Property type hubs
  for (const type of propertyTypes) {
    entries.push({
      url: `${BASE_URL}/sell-property/${type}/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.75,
    })
  }

  // Sell property hub root
  entries.push({
    url: `${BASE_URL}/sell-property/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  })

  // Guides hub
  entries.push({
    url: `${BASE_URL}/guides/`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  })

  return entries
}
