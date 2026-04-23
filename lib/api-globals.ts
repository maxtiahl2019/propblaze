/**
 * Shared in-memory stores across /api/* routes.
 * All route files should import from here to avoid TS global redeclaration conflicts.
 *
 * IMPORTANT: seedOffers() uses FIXED IDs so that agency-feed and agency-chat
 * always reference the same objects even on serverless (Vercel) where each
 * route may start a fresh process.
 */

// ─── Registered Agency Store ───────────────────────────────────────────────────
// Agencies self-register via /api/agency-portal/register → stored here.
// APEX reads from this store in real-time.
// Supabase-aware: syncs when SUPABASE_* env vars are configured.

export type AgencyStatus = 'pending_review' | 'active' | 'suspended'
export type DeliveryChannel = 'email' | 'whatsapp' | 'telegram' | 'phone'

export interface RegisteredAgency {
  // Identity
  id: string                      // PB-AG-XXXX-XXXX
  company_name: string
  agent_name?: string
  email: string
  phone?: string
  website?: string
  vat_number?: string

  // Location
  country: string                 // ISO-2: 'RS', 'DE', etc.
  city: string
  flag: string

  // Matching fields (APEX-compatible)
  property_types: string[]        // 'apartment' | 'villa' | 'house' | 'land' | 'commercial' | 'new_build'
  price_bands: string[]           // 'budget' | 'mid' | 'premium' | 'luxury' | 'ultra'
  buyer_markets: string[]         // ISO-2 market codes: 'DE', 'RU', 'US', ...
  languages: string[]             // ISO-639-1: 'en', 'de', 'ru', ...
  specializations: string[]       // 'residential' | 'luxury' | 'investment' | 'commercial' | 'new_build'
  delivery_channels: DeliveryChannel[]

  // Performance (starts at defaults, updated from real campaign feedback)
  quality_score: number           // 0–100
  historical: {
    response_rate: number
    conversion_rate: number
    avg_response_hours: number
    owner_direct_success_rate: number
    cross_border_deals_12m: number
    luxury_deals_12m: number
  }

  // Platform
  status: AgencyStatus
  is_active: boolean
  registered_at: string           // ISO timestamp
  approved_at?: string
  last_contacted?: string         // ISO: last time we sent them a lead
  contact_policy: 'open' | 'invite_only' | 'blacklisted'
}

const PB_AGENCIES_STORE = '__PB_REGISTERED_AGENCIES__'

export function registeredAgenciesStore(): RegisteredAgency[] {
  const g = global as any
  if (!g[PB_AGENCIES_STORE]) g[PB_AGENCIES_STORE] = []
  return g[PB_AGENCIES_STORE]
}

/** Active agencies only — used by APEX for real-time matching */
export function activeAgencies(): RegisteredAgency[] {
  return registeredAgenciesStore().filter(a => a.is_active && a.status === 'active')
}

/** Convert RegisteredAgency to APEX RealAgency shape */
export function toApexAgency(a: RegisteredAgency) {
  return {
    id: a.id,
    name: a.company_name,
    country: a.country,
    regions: [a.city],
    cities: [a.city],
    city: a.city,
    flag: a.flag,
    website: a.website ?? '',
    email: a.email,
    phone: a.phone,
    property_types: a.property_types as any[],
    price_bands: a.price_bands as any[],
    specializations: a.specializations,
    buyer_markets: a.buyer_markets,
    languages: a.languages,
    historical: a.historical,
    delivery_channels: a.delivery_channels as any[],
    contact_policy: a.contact_policy,
    quality_score: a.quality_score,
    is_active: a.is_active,
    created_at: a.registered_at,
    last_contacted: a.last_contacted,
  }
}

/** Country ISO to emoji flag */
export function countryFlag(iso: string): string {
  const flags: Record<string, string> = {
    RS:'🇷🇸', ME:'🇲🇪', HR:'🇭🇷', BA:'🇧🇦', SI:'🇸🇮', MK:'🇲🇰', AL:'🇦🇱',
    DE:'🇩🇪', AT:'🇦🇹', CH:'🇨🇭', FR:'🇫🇷', IT:'🇮🇹', ES:'🇪🇸', PT:'🇵🇹',
    GR:'🇬🇷', NL:'🇳🇱', BE:'🇧🇪', PL:'🇵🇱', CZ:'🇨🇿', HU:'🇭🇺', RO:'🇷🇴', BG:'🇧🇬',
    GB:'🇬🇧', IE:'🇮🇪', SE:'🇸🇪', NO:'🇳🇴', DK:'🇩🇰', FI:'🇫🇮',
    AE:'🇦🇪', SA:'🇸🇦', QA:'🇶🇦', TR:'🇹🇷', IL:'🇮🇱',
    RU:'🇷🇺', UA:'🇺🇦', BY:'🇧🇾', KZ:'🇰🇿',
    US:'🇺🇸', CA:'🇨🇦', MX:'🇲🇽', BR:'🇧🇷',
    SG:'🇸🇬', HK:'🇭🇰', CN:'🇨🇳', JP:'🇯🇵', AU:'🇦🇺', NZ:'🇳🇿', IN:'🇮🇳',
    ZA:'🇿🇦',
  }
  return flags[iso.toUpperCase()] ?? '🏳️'
}

export type OfferStatus =
  | 'new' | 'accepted' | 'in_progress' | 'pending_docs' | 'closed' | 'declined'

export interface DocItem {
  id: string
  name: string
  requestedAt: string
  receivedAt?: string
  url?: string
}

export interface Offer {
  id: string
  ref: string
  receivedAt: string
  property: {
    type: string; address: string; city: string; country: string; flag: string
    sqm: number; beds: number; price: number; currency: string
    description: string; photos: number; photoUrls?: string[]
  }
  seller: { name: string; lang: string; respondsIn: string; email?: string }
  match: { score: number; wave: 1 | 2 | 3; reasons: string[] }
  status: OfferStatus
  statusHistory: { at: string; status: OfferStatus; note?: string }[]
  docs: DocItem[]
}

export interface FeedbackEvent {
  at: string
  offerId: string
  ref: string
  event: 'routed' | 'accepted' | 'declined' | 'in_progress' | 'pending_docs' | 'closed' | 'docs_requested' | 'docs_received' | 'new'
  score?: number
  city?: string
  country?: string
  note?: string
}

export interface Msg {
  id: string
  offerId: string
  from: 'agency' | 'owner' | 'seller'
  text: string
  at: string
}

export interface StoredUser {
  id: string
  email: string
  passwordHash: string
  full_name: string
  role: 'owner' | 'agency' | 'staff'
  status: 'active'
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __PB_OFFERS__: Offer[] | undefined
  // eslint-disable-next-line no-var
  var __PB_FEEDBACK__: FeedbackEvent[] | undefined
  // eslint-disable-next-line no-var
  var __PB_MSGS__: Record<string, Msg[]> | undefined
  // eslint-disable-next-line no-var
  var __PB_USERS__: StoredUser[] | undefined
  // eslint-disable-next-line no-var
  var __PB_TOKENS__: Record<string, string> | undefined
}

export function offersStore(): Offer[] {
  if (!global.__PB_OFFERS__) global.__PB_OFFERS__ = []
  return global.__PB_OFFERS__
}

export function feedbackStore(): FeedbackEvent[] {
  if (!global.__PB_FEEDBACK__) global.__PB_FEEDBACK__ = []
  return global.__PB_FEEDBACK__
}

export function msgsStore(): Record<string, Msg[]> {
  if (!global.__PB_MSGS__) global.__PB_MSGS__ = {}
  return global.__PB_MSGS__
}

export function usersStore(): StoredUser[] {
  if (!global.__PB_USERS__) global.__PB_USERS__ = []
  return global.__PB_USERS__
}

export function tokensStore(): Record<string, string> {
  if (!global.__PB_TOKENS__) global.__PB_TOKENS__ = {}
  return global.__PB_TOKENS__
}

export function logFeedback(ev: FeedbackEvent) {
  const fb = feedbackStore()
  fb.unshift(ev)
  if (fb.length > 500) fb.length = 500
}

/* ═══════════════════════════════════════════════════════════════════
 * DEMO SEED DATA — SINGLE SOURCE OF TRUTH
 * Both agency-feed and agency-chat import from here.
 * IDs are FIXED strings so they match across serverless instances.
 * ═══════════════════════════════════════════════════════════════════ */

const DEMO_PHOTOS: Record<string, string[]> = {
  Villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  ],
  Apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  ],
  Land: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800&q=80',
  ],
  _default: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  ],
}

export function photosForType(type: string): string[] {
  return DEMO_PHOTOS[type] || DEMO_PHOTOS._default
}

// ─── Fixed offer IDs (deterministic, same across all routes) ─────────────────
export const OFFER_IDS = {
  villa: 'PB-DEMO-VILLA-001',
  apartment: 'PB-DEMO-APT-002',
  land: 'PB-DEMO-LAND-003',
} as const

/**
 * Seeds 3 demo offers into offersStore if empty.
 * Called from BOTH agency-feed and agency-chat — always produces same data.
 */
export function seedOffers(): Offer[] {
  const s = offersStore()
  if (s.length > 0) return s

  const now = new Date()
  const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600_000).toISOString()

  s.push(
    {
      id: OFFER_IDS.villa,
      ref: 'PB-2026-0041',
      receivedAt: h(1),
      property: {
        type: 'Villa', address: 'Kneza Miloša 42', city: 'Belgrade', country: 'Serbia', flag: '🇷🇸',
        sqm: 210, beds: 4, price: 485000, currency: 'EUR',
        description: 'Luxury villa with panoramic city views, private garden, 3 levels. Fully renovated 2025, premium fixtures throughout. Quiet residential area, 10 min to center.',
        photos: 12, photoUrls: DEMO_PHOTOS.Villa,
      },
      seller: { name: 'M. Kovačević', lang: 'EN', respondsIn: '2h', email: 'm.kovacevic@seller.propblaze' },
      match: { score: 94, wave: 1, reasons: ['Geo: Belgrade ✓', 'Luxury segment ✓', 'International buyer profile ✓'] },
      status: 'new',
      statusHistory: [{ at: h(1), status: 'new' }],
      docs: [],
    },
    {
      id: OFFER_IDS.apartment,
      ref: 'PB-2026-0038',
      receivedAt: h(24),
      property: {
        type: 'Apartment', address: 'Bulevar Oslobođenja 15', city: 'Novi Sad', country: 'Serbia', flag: '🇷🇸',
        sqm: 85, beds: 2, price: 175000, currency: 'EUR',
        description: 'Modern 2-bedroom apartment in city center. New building, underground parking, balcony with river view. Energy class A.',
        photos: 8, photoUrls: DEMO_PHOTOS.Apartment,
      },
      seller: { name: 'D. Jovanović', lang: 'EN', respondsIn: '4h', email: 'd.jovanovic@seller.propblaze' },
      match: { score: 87, wave: 1, reasons: ['Geo: Novi Sad ✓', 'Mid-range segment ✓', 'High demand area ✓'] },
      status: 'accepted',
      statusHistory: [
        { at: h(24), status: 'new' },
        { at: h(20), status: 'accepted' },
      ],
      docs: [],
    },
    {
      id: OFFER_IDS.land,
      ref: 'PB-2026-0035',
      receivedAt: h(48),
      property: {
        type: 'Land', address: 'Niška Banja area', city: 'Niš', country: 'Serbia', flag: '🇷🇸',
        sqm: 1200, beds: 0, price: 95000, currency: 'EUR',
        description: 'Development plot with all permits, flat terrain, utility connections ready. Zoned for residential, up to 3 floors.',
        photos: 4, photoUrls: DEMO_PHOTOS.Land,
      },
      seller: { name: 'S. Nikolić', lang: 'SR', respondsIn: '6h', email: 's.nikolic@seller.propblaze' },
      match: { score: 79, wave: 2, reasons: ['Geo: Niš region ✓', 'Land specialist ✓', 'Development potential ✓'] },
      status: 'in_progress',
      statusHistory: [
        { at: h(48), status: 'new' },
        { at: h(44), status: 'accepted' },
        { at: h(33), status: 'in_progress' },
      ],
      docs: [],
    },
  )

  return s
}

/* ── Demo conversation seeds ─────────────────────────────────────── */
const DEMO_CONVOS: Record<string, { from: 'agency' | 'owner'; text: string; hoursAgo: number }[]> = {
  [OFFER_IDS.villa]: [
    { from: 'owner',  text: "Hello! I'm ready to discuss the villa. All documents are prepared, happy to answer any questions.", hoursAgo: 5 },
    { from: 'agency', text: "Thank you for listing with us. We have 3 qualified buyers looking for premium Belgrade properties. Could we schedule a viewing this week?", hoursAgo: 4.5 },
    { from: 'owner',  text: "Of course! Thursday or Friday afternoon works best. The property is fully staged and ready.", hoursAgo: 3.5 },
    { from: 'agency', text: "Perfect, let's confirm Thursday at 15:00. One client is a Vienna-based investor — very interested in the panoramic views. Can you share the floor plans in advance?", hoursAgo: 3 },
    { from: 'owner',  text: "Floor plans attached to the sales pack. The top floor terrace is 45m² with 270° views — that's usually the selling point. Parking for 3 cars included.", hoursAgo: 2 },
    { from: 'agency', text: "Excellent. We'll prepare our client brief. What's your flexibility on the asking price? Our investor client is serious but typically negotiates.", hoursAgo: 1 },
  ],
  [OFFER_IDS.apartment]: [
    { from: 'owner',  text: "Hi! The apartment is available for viewings. Energy class A, underground parking included in price.", hoursAgo: 20 },
    { from: 'agency', text: "Great listing. We noticed the river view — is it unobstructed? We have two young professional couples looking in this area.", hoursAgo: 18 },
    { from: 'owner',  text: "Yes, 5th floor with direct Danube view, nothing blocking it. The balcony is 12m². Building is from 2024, still under warranty.", hoursAgo: 16 },
    { from: 'agency', text: "That's a strong selling point. Could we arrange a viewing for both clients next Monday? Also, is the parking spot deeded or assigned?", hoursAgo: 12 },
  ],
  [OFFER_IDS.land]: [
    { from: 'owner',  text: "Hello. The plot has all permits ready — residential zoning, up to 3 floors. Utilities are at the boundary.", hoursAgo: 40 },
    { from: 'agency', text: "Interesting opportunity. We have a developer client looking for plots in this area. Can you confirm the exact zoning regulations and any building restrictions?", hoursAgo: 36 },
    { from: 'owner',  text: "Zoned R3 — residential up to 3 floors, max 60% ground coverage. No heritage restrictions. I can provide the full urban planning certificate.", hoursAgo: 30 },
  ],
}

/**
 * Seeds chat threads for all demo offers if they don't exist yet.
 * Uses the same OFFER_IDS so threads always match offers.
 */
export function seedChatThreads() {
  seedOffers() // ensure offers exist first
  const s = msgsStore()
  const now = Date.now()

  for (const [offerId, convo] of Object.entries(DEMO_CONVOS)) {
    if (s[offerId] && s[offerId].length > 0) continue // already has messages
    s[offerId] = convo.map((msg, i) => ({
      id: `m-demo-${offerId}-${i}`,
      offerId,
      from: msg.from,
      text: msg.text,
      at: new Date(now - msg.hoursAgo * 3600_000).toISOString(),
    }))
  }
}
