import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n/LangContext'
import PropBlazeProviders from '@/components/providers/AuthProviders'
import PropBlazeAssistant from '@/components/assistant/PropBlazeAssistant'

const geistSans = { variable: '--font-geist-sans' }
const geistMono = { variable: '--font-geist-mono' }

const BASE_URL = process.env.NEXT_PUBLIC_DOMAIN || 'https://propblaze.com'

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'PropBlaze — AI Property Distribution to Real Estate Agencies',
    template: '%s | PropBlaze',
  },
  description:
    'PropBlaze is an AI-powered property distribution platform. We match your property to verified real estate agencies most likely to sell it — and send them a professional offer with your approval.',
  keywords: [
    'property distribution platform',
    'AI agency matching',
    'sell property through agencies',
    'real estate AI Europe',
    'property marketing automation',
    'owner approved offer',
    'sell property Montenegro',
    'sell property Serbia',
    'sell property EU',
    'AI real estate platform',
  ],
  authors: [{ name: 'PropBlaze', url: BASE_URL }],
  creator: 'PropBlaze',
  publisher: 'PropBlaze',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'PropBlaze',
    title: 'PropBlaze — AI Property Distribution to Real Estate Agencies',
    description:
      'AI matches your property to the agencies most likely to sell it. You approve the offer. PropBlaze distributes it automatically. Used by property owners across the EU.',
    images: [
      {
        url: `${BASE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: 'PropBlaze — AI Property Distribution Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropBlaze — AI Property Distribution to Real Estate Agencies',
    description:
      'AI matches your property to verified agencies. You approve. PropBlaze distributes. Leads come to you.',
    images: [`${BASE_URL}/og-default.png`],
    creator: '@propblaze',
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': BASE_URL,
      'ru': `${BASE_URL}/ru`,
      'sr': `${BASE_URL}/sr`,
      'x-default': BASE_URL,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
  category: 'technology',
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PropBlaze',
  url: BASE_URL,
  logo: `${BASE_URL}/propblaze-logo.svg`,
  description:
    'AI-powered property distribution platform that matches property owners to real estate agencies most likely to sell their property.',
  foundingDate: '2026',
  areaServed: {
    '@type': 'Place',
    name: 'European Union and neighboring countries',
  },
  sameAs: [
    'https://facebook.com/propblaze',
    'https://linkedin.com/company/propblaze',
    'https://twitter.com/propblaze',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English', 'Russian', 'Serbian'],
    email: 'support@propblaze.com',
  },
}

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PropBlaze',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: BASE_URL,
  description:
    'AI property distribution platform for property owners in Europe. Automatically matches properties to real estate agencies and distributes packaged offers.',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '49',
    highPrice: '499',
    offerCount: '3',
  },
  featureList: [
    'AI Agency Matching',
    'Owner-Approved Offer Distribution',
    'Wave-based outreach automation',
    'Multi-channel notifications (Email, Telegram, WhatsApp)',
    'GDPR-compliant document handling',
    'Multilingual property packages',
  ],
  inLanguage: ['en', 'ru', 'sr'],
  audience: {
    '@type': 'Audience',
    audienceType: 'Property owners in Europe',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PropBlaze',
  url: BASE_URL,
  description: 'AI-powered property distribution platform for EU property owners.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/listings?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/propblaze-logo.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">
        <PropBlazeProviders>
          <LangProvider>
            {children}
            {/* Global AI assistant — shows on all public pages */}
            <PropBlazeAssistant />
          </LangProvider>
        </PropBlazeProviders>
      </body>
    </html>
  )
}
