/**
 * PropBlaze APEX Matching Engine v3.0
 * Autonomous Property Exchange Intelligence
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PROPRIETARY ALGORITHMS IN THIS VERSION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. PropertyFIT™ Score
 *    Five-dimension scoring model (replaces single weighted sum):
 *    • DNA Resonance Score (DRS)     — buyer-profile-to-property-DNA alignment
 *    • Transaction Velocity Index (TVI) — recency-weighted deal momentum
 *    • Market Penetration Rate (MPR) — % of target markets covered by agency
 *    • Channel Authority Score (CAS) — multi-channel reach quality
 *    • Strategic Alignment Score (SA)  — agency strategy ↔ listing type fit
 *    Each dimension has channel-specific weights (local ≠ cross-border ≠ stealth).
 *
 * 2. AgencyDNA™ Profiling
 *    Computes a deterministic agency tier (PLATINUM → GOLD → SILVER → EMERGING)
 *    from historical performance data. Tier drives a score multiplier and
 *    influences wave assignment.
 *
 * 3. SoldSense™ Detection
 *    Multi-signal flow to determine whether a property is sold or active.
 *    Seven signal sources: engagement silence, interest-without-action,
 *    explicit-sold reply, owner confirmation, price reduction, time decay,
 *    zero-engagement composite.
 *
 * 4. Agency DB Formation Utilities
 *    Functions for importing, scoring, and tiering raw agency data into
 *    the PropBlaze verified agency database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Three-channel architecture (unchanged):
 *   LOCAL CHANNEL      — agencies with local buyer base
 *   CROSS-BORDER       — agencies with foreign buyer pipeline
 *   STEALTH NETWORK    — private / off-market / HNW access
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Agency } from './engine'
import { DEMO_AGENCY_POOL, type RealAgency } from './demo-agencies'

// ─── Input from wizard ─────────────────────────────────────────────────────────

export interface WizardProperty {
  // Core (required)
  type: string            // 'Apartment' | 'Villa' | 'House' | 'Land' | 'Commercial' | 'New Build'
  city: string
  country: string
  price: number
  currency: string
  mode: 'sale' | 'rent'

  // Basic details (optional but strongly recommended)
  address?: string
  areaSqm?: number
  bedrooms?: number
  bathrooms?: number

  // Extended wizard fields (v2.0+)
  condition?: 'new' | 'good' | 'renovation' | string
  floor?: number
  total_floors?: number
  furnished?: 'unfurnished' | 'partial' | 'full' | string
  exclusiveAgreement?: 'yes' | 'no' | 'maybe' | string
  remoteViewing?: boolean
  features?: string[]          // e.g. ['pool', 'sea_view', 'garage', 'garden']
  proximityTags?: string[]     // e.g. ['beach', 'ski_resort', 'city_center']
  targetBuyerTypes?: string[]  // e.g. ['investor', 'expat', 'north_american']
  description?: string
  isOffMarket?: boolean
  ownerLanguages?: string[]    // ISO 639-1 e.g. ['ru', 'en']
}

// ─── AgencyDNA™ — computed performance profile ─────────────────────────────────

export type AgencyTier = 'platinum' | 'gold' | 'silver' | 'emerging'

export interface AgencyDNA {
  tier: AgencyTier
  tier_multiplier: number          // 1.25 / 1.10 / 1.00 / 0.85
  sell_through_rate: number        // % listings sold within 90 days (estimated)
  network_reach_score: number      // 0–100: estimated HNW buyer pool size
  speed_index: number              // 0–100: how fast this agency typically moves
  cross_market_authority: number   // 0–100: international reach quality
  exclusivity_affinity: number     // 0–100: how well agency handles exclusive mandates
  verified: boolean
  verified_at?: string
}

// ─── PropertyFIT™ dimensions ───────────────────────────────────────────────────

export interface PropertyFITDimensions {
  dna_resonance: number        // DRS: 0–100
  transaction_velocity: number // TVI: 0–100
  market_penetration: number   // MPR: 0–100
  channel_authority: number    // CAS: 0–100
  strategic_alignment: number  // SA: 0–100
  property_fit_score: number   // final PropertyFIT™ composite (0–100)
}

// ─── Output types ──────────────────────────────────────────────────────────────

export type AgencyChannel = 'local' | 'cross_border' | 'stealth'

export interface APEXAgencyResult {
  agency: RealAgency
  agency_dna: AgencyDNA
  channel: AgencyChannel
  apex_score: number
  // PropertyFIT™ dimensions
  fit_dimensions: PropertyFITDimensions
  // Legacy individual scores (kept for UI backward compatibility)
  local_score: number
  cross_border_score: number
  stealth_score: number
  wave: 1 | 2 | 3
  send_at: string
  why_matched: string[]
  deal_signals: string[]
  fatigue_penalty: number
}

export interface APEXResult {
  property_dna: PropertyDNA
  total_scanned: number
  passed_filter: number
  results: APEXAgencyResult[]
  wave_breakdown: {
    wave1: APEXAgencyResult[]
    wave2: APEXAgencyResult[]
    wave3: APEXAgencyResult[]
  }
  channel_breakdown: {
    local: APEXAgencyResult[]
    cross_border: APEXAgencyResult[]
    stealth: APEXAgencyResult[]
  }
  send_schedule: WaveTiming[]
  warnings: string[]
}

export interface PropertyDNA {
  price_band: 'budget' | 'mid' | 'premium' | 'luxury' | 'ultra'
  price_eur: number
  seller_urgency: number
  liquidity_score: number
  demand_markets: string[]
  buyer_archetypes: string[]
  seasonal_peak_months: number[]
  is_off_market: boolean
  channel_weights: { local: number; cross_border: number; stealth: number }
  // v2.0+ DNA fields
  type_key: string
  is_rental: boolean
  is_penthouse: boolean
  has_luxury_features: boolean
  has_seaside: boolean
  has_mountain: boolean
  is_urban: boolean
  target_buyer_override: string[]
  exclusive: boolean
}

export interface WaveTiming {
  wave: 1 | 2 | 3
  send_at: string
  agencies_count: number
  channel: string
  rationale: string
}

// ─── SoldSense™ types ──────────────────────────────────────────────────────────

export type SoldSignalType =
  | 'owner_confirmed'           // owner manually confirms sale
  | 'explicit_sold_reply'       // agency reply contains "sold", "closed", "off market"
  | 'engagement_silence'        // wave sent, zero opens after 72h
  | 'interest_without_action'   // opens across waves but zero replies
  | 'time_decay_90d'            // property on market > 90 days
  | 'time_decay_180d'           // property on market > 180 days (dead listing)
  | 'price_reduction'           // owner reduced price → still no engagement
  | 'zero_engagement_composite' // all 3 waves sent, all metrics at zero
  | 'agency_said_already_sold'  // agency explicitly said property sold by someone else

export type ListingStatus = 'active' | 'likely_sold' | 'sold' | 'withdrawn' | 'dead_listing' | 'needs_attention'

export interface SoldSenseSignal {
  signal_type: SoldSignalType
  confidence: number           // 0–100 for this signal alone
  detected_at: string          // ISO timestamp
  source: 'system' | 'agency_reply' | 'owner' | 'campaign_stats'
  metadata?: Record<string, string | number | boolean>
  recommended_action: 'mark_sold' | 'mark_likely_sold' | 'escalate' | 'pause' | 'price_reduce' | 'stealth_switch' | 'contact_owner' | 'investigate'
}

export interface SoldSenseResult {
  listing_status: ListingStatus
  composite_confidence: number  // 0–100 overall confidence
  signals: SoldSenseSignal[]
  primary_signal: SoldSignalType
  recommended_action: string
  owner_message: string
  next_step: string
  auto_close: boolean           // should system auto-close the listing?
  escalation_required: boolean  // needs human review?
}

// Campaign data input for SoldSense™
export interface CampaignWaveStats {
  wave: 1 | 2 | 3
  sent_at: string
  emails_sent: number
  opens: number
  open_rate: number
  replies: number
  reply_rate: number
  bounces: number
  negative_replies: number
}

export interface CampaignData {
  days_since_launch: number
  waves: CampaignWaveStats[]
  // Optional enrichment signals
  agency_reply_texts?: string[]          // raw agency reply content for NLP parsing
  owner_marked_sold?: boolean            // owner clicked "Mark as Sold"
  owner_marked_withdrawn?: boolean       // owner withdrew listing
  price_history?: { price: number; changed_at: string }[]
  last_owner_login_days_ago?: number     // owner engagement signal
}

// ─── Legacy CampaignStats (kept for runDiagnosis backward compat) ──────────────

export interface CampaignStats {
  days_since_launch: number
  emails_sent: number
  open_rate: number
  reply_rate: number
  negative_replies: number
}

// ─── Dead Listing Detection (backward compat) ─────────────────────────────────

export type DiagnosisType =
  | 'price_outlier' | 'wrong_channel_mix' | 'agency_fatigue'
  | 'wrong_market_target' | 'seasonal_mismatch' | 'description_weak' | 'stealth_needed'

export type RecampaignStrategy = 'A' | 'B' | 'C' | 'D'

export interface DeadListingDiagnosis {
  days_since_launch: number
  open_rate: number
  reply_rate: number
  diagnosis: DiagnosisType[]
  primary_diagnosis: DiagnosisType
  confidence: number
  recommended_strategy: RecampaignStrategy
  strategy_description: string
  owner_message: string
  action_items: string[]
  price_adjustment_suggested?: number
}

// ─── Money Flow Matrix ────────────────────────────────────────────────────────

const MONEY_FLOW: Record<string, { market: string; share: number }[]> = {
  // ── EU / Balkan source countries ──────────────────────────────────────────────
  RS: [
    { market: 'DE', share: 0.27 }, { market: 'RU', share: 0.22 },
    { market: 'US', share: 0.14 }, { market: 'GB', share: 0.12 },
    { market: 'AE', share: 0.10 }, { market: 'CH', share: 0.08 },
    { market: 'CA', share: 0.04 }, { market: 'AT', share: 0.03 },
  ],
  ME: [
    { market: 'RU', share: 0.30 }, { market: 'DE', share: 0.20 },
    { market: 'US', share: 0.12 }, { market: 'SA', share: 0.11 },
    { market: 'GB', share: 0.10 }, { market: 'AE', share: 0.08 },
    { market: 'CA', share: 0.05 }, { market: 'CH', share: 0.04 },
  ],
  HR: [
    { market: 'DE', share: 0.33 }, { market: 'AT', share: 0.16 },
    { market: 'US', share: 0.13 }, { market: 'NL', share: 0.11 },
    { market: 'GB', share: 0.10 }, { market: 'CH', share: 0.07 },
    { market: 'CA', share: 0.06 }, { market: 'BE', share: 0.04 },
  ],
  GR: [
    { market: 'DE', share: 0.22 }, { market: 'US', share: 0.20 },
    { market: 'GB', share: 0.18 }, { market: 'AE', share: 0.12 },
    { market: 'CA', share: 0.10 }, { market: 'FR', share: 0.10 },
    { market: 'CN', share: 0.05 }, { market: 'AU', share: 0.03 },
  ],
  PT: [
    { market: 'GB', share: 0.26 }, { market: 'US', share: 0.18 },
    { market: 'FR', share: 0.16 }, { market: 'DE', share: 0.14 },
    { market: 'CA', share: 0.10 }, { market: 'BR', share: 0.08 },
    { market: 'NL', share: 0.05 }, { market: 'CH', share: 0.03 },
  ],
  ES: [
    { market: 'GB', share: 0.24 }, { market: 'DE', share: 0.18 },
    { market: 'US', share: 0.14 }, { market: 'FR', share: 0.14 },
    { market: 'NL', share: 0.09 }, { market: 'CA', share: 0.08 },
    { market: 'BE', share: 0.07 }, { market: 'SE', share: 0.04 },
    { market: 'NO', share: 0.02 },
  ],
  DE: [
    { market: 'DE', share: 0.42 }, { market: 'AT', share: 0.14 },
    { market: 'CH', share: 0.12 }, { market: 'US', share: 0.10 },
    { market: 'NL', share: 0.08 }, { market: 'GB', share: 0.07 },
    { market: 'CA', share: 0.04 }, { market: 'FR', share: 0.03 },
  ],
  BG: [
    { market: 'RU', share: 0.30 }, { market: 'DE', share: 0.20 },
    { market: 'GB', share: 0.16 }, { market: 'US', share: 0.12 },
    { market: 'UA', share: 0.10 }, { market: 'CA', share: 0.07 },
    { market: 'IL', share: 0.05 },
  ],
  TR: [
    { market: 'RU', share: 0.28 }, { market: 'DE', share: 0.18 },
    { market: 'US', share: 0.14 }, { market: 'GB', share: 0.12 },
    { market: 'AE', share: 0.11 }, { market: 'CA', share: 0.06 },
    { market: 'UA', share: 0.06 }, { market: 'SA', share: 0.05 },
  ],
  IT: [
    { market: 'DE', share: 0.20 }, { market: 'US', share: 0.18 },
    { market: 'GB', share: 0.16 }, { market: 'FR', share: 0.12 },
    { market: 'CH', share: 0.10 }, { market: 'CA', share: 0.09 },
    { market: 'NL', share: 0.08 }, { market: 'AU', share: 0.07 },
  ],
  // ── North American source countries ──────────────────────────────────────────
  US: [
    { market: 'US', share: 0.50 }, { market: 'CA', share: 0.16 },
    { market: 'GB', share: 0.10 }, { market: 'DE', share: 0.07 },
    { market: 'MX', share: 0.07 }, { market: 'CN', share: 0.05 },
    { market: 'AU', share: 0.03 }, { market: 'IN', share: 0.02 },
  ],
  CA: [
    { market: 'CA', share: 0.44 }, { market: 'US', share: 0.22 },
    { market: 'GB', share: 0.11 }, { market: 'HK', share: 0.08 },
    { market: 'IN', share: 0.07 }, { market: 'FR', share: 0.05 },
    { market: 'DE', share: 0.03 },
  ],
}

function getTargetMarkets(countryISO: string): string[] {
  const flows = MONEY_FLOW[countryISO] ?? [
    { market: 'DE', share: 0.26 }, { market: 'GB', share: 0.20 },
    { market: 'US', share: 0.18 }, { market: 'RU', share: 0.14 },
    { market: 'CA', share: 0.10 }, { market: 'AE', share: 0.08 },
    { market: 'FR', share: 0.04 },
  ]
  return flows.sort((a, b) => b.share - a.share).map(f => f.market)
}

// ─── Buyer type → market override ─────────────────────────────────────────────

const BUYER_TYPE_MARKETS: Record<string, string[]> = {
  investor:         ['DE', 'AE', 'GB', 'CH', 'NL', 'US', 'CA', 'AT'],
  expat:            ['DE', 'AT', 'CH', 'GB', 'NL', 'SE', 'NO', 'US', 'CA'],
  russian_buyer:    ['RU', 'UA', 'KZ', 'BY', 'AZ', 'GE'],
  family:           [],
  developer:        [],
  vacation_home:    ['DE', 'GB', 'NO', 'SE', 'DK', 'NL', 'BE', 'CH', 'US', 'CA'],
  luxury:           ['AE', 'CH', 'GB', 'SG', 'HK', 'US', 'CA', 'DE'],
  local:            [],
  north_american:   ['US', 'CA', 'GB', 'AU'],
  us_diaspora:      ['US', 'CA'],
  canadian:         ['CA', 'US', 'GB'],
  golden_visa:      ['US', 'CA', 'GB', 'CN', 'HK', 'SG', 'AE', 'BR'],
  commercial_buyer: ['US', 'CA', 'DE', 'GB', 'NL', 'AE', 'SG'],
}

function buildOverrideMarkets(targetBuyerTypes: string[], countryISO: string): string[] {
  if (!targetBuyerTypes.length) return []
  const markets: string[] = []
  for (const t of targetBuyerTypes) {
    const key = t.toLowerCase().replace(/[- ]/g, '_')
    const list = BUYER_TYPE_MARKETS[key]
    if (!list) continue
    if (list.length === 0) {
      const NEIGHBOURS: Record<string, string[]> = {
        RS: ['ME','HR','BA','BG','RO'], ME: ['RS','HR','BA','AL'],
        HR: ['RS','ME','BA','SI','AT'], DE: ['AT','CH','NL','FR','PL'],
        AT: ['DE','CH','IT','HU','SI'], US: ['CA','MX'], CA: ['US','GB'],
      }
      markets.push(countryISO, ...(NEIGHBOURS[countryISO] ?? []))
      if (key === 'developer') markets.push('DE', 'AT', 'US')
    } else {
      markets.push(...list)
    }
  }
  return [...new Set(markets)]
}

// ─── Country ISO normalizer ───────────────────────────────────────────────────

function normalizeCountryToISO(country: string): string {
  const map: Record<string, string> = {
    'serbia': 'RS', 'montenegro': 'ME', 'croatia': 'HR', 'slovenia': 'SI',
    'bosnia': 'BA', 'bosnia and herzegovina': 'BA', 'north macedonia': 'MK',
    'germany': 'DE', 'austria': 'AT', 'switzerland': 'CH',
    'france': 'FR', 'italy': 'IT', 'spain': 'ES', 'portugal': 'PT',
    'greece': 'GR', 'netherlands': 'NL', 'belgium': 'BE',
    'poland': 'PL', 'czech republic': 'CZ', 'czechia': 'CZ', 'hungary': 'HU',
    'romania': 'RO', 'bulgaria': 'BG', 'albania': 'AL',
    'united kingdom': 'GB', 'uk': 'GB', 'england': 'GB', 'great britain': 'GB',
    'uae': 'AE', 'united arab emirates': 'AE', 'dubai': 'AE',
    'turkey': 'TR', 'russia': 'RU', 'ukraine': 'UA', 'israel': 'IL',
    'sweden': 'SE', 'norway': 'NO', 'denmark': 'DK', 'finland': 'FI',
    'usa': 'US', 'united states': 'US', 'united states of america': 'US',
    'u.s.': 'US', 'u.s.a.': 'US', 'america': 'US',
    'canada': 'CA', 'québec': 'CA', 'quebec': 'CA', 'ontario': 'CA',
    'british columbia': 'CA', 'alberta': 'CA',
    'mexico': 'MX',
    'singapore': 'SG', 'hong kong': 'HK', 'china': 'CN',
    'australia': 'AU', 'new zealand': 'NZ', 'japan': 'JP', 'india': 'IN',
    'brazil': 'BR', 'south africa': 'ZA',
  }
  const lower = country.toLowerCase().trim()
  return map[lower] ?? (country.length === 2 ? country.toUpperCase() : country.substring(0, 2).toUpperCase())
}

function isNorthAmerica(countryISO: string): boolean {
  return ['US', 'CA', 'MX'].includes(countryISO)
}

// ─── Feature signals detector ─────────────────────────────────────────────────

function detectFeatureSignals(prop: WizardProperty): {
  hasLuxury: boolean; hasSeaside: boolean; hasMountain: boolean
  isUrban: boolean; isPenthouse: boolean; isFurnishedInvestment: boolean
} {
  const features  = (prop.features ?? []).map(f => f.toLowerCase())
  const proximity = (prop.proximityTags ?? []).map(p => p.toLowerCase())
  const all = [...features, ...proximity]

  const hasLuxury = all.some(f => ['pool','sea_view','yacht_dock','rooftop','penthouse','spa','concierge'].includes(f))
    || (prop.price >= 500_000)

  const hasSeaside = all.some(f => ['beach','seaside','sea','coast','waterfront','sea_view','seafront','ocean'].includes(f))
  const hasMountain = all.some(f => ['mountain','ski','alpine','mountain_view','ski_resort','hiking'].includes(f))
  const isUrban = all.some(f => ['city_center','urban','downtown','metro','central','old_town'].includes(f))

  const isPenthouse =
    features.includes('penthouse') ||
    (prop.floor != null && prop.total_floors != null
      && prop.floor >= prop.total_floors - 1
      && prop.bedrooms != null && prop.bedrooms >= 2)

  const isFurnishedInvestment =
    (prop.furnished === 'full' || prop.furnished === 'partial') &&
    (prop.mode === 'rent' || prop.type.toLowerCase() === 'apartment')

  return { hasLuxury, hasSeaside, hasMountain, isUrban, isPenthouse, isFurnishedInvestment }
}

// ─── Property DNA builder ─────────────────────────────────────────────────────

function buildPropertyDNA(prop: WizardProperty): PropertyDNA {
  const priceEUR =
    prop.currency === 'EUR' ? prop.price :
    prop.currency === 'USD' ? prop.price * 0.92 :
    prop.currency === 'CAD' ? prop.price * 0.69 :
    prop.currency === 'CHF' ? prop.price * 1.03 :
    prop.currency === 'GBP' ? prop.price * 1.16 :
    prop.currency === 'AUD' ? prop.price * 0.59 :
    prop.currency === 'MXN' ? prop.price * 0.052 :
    prop.price * 0.0085

  const price_band: PropertyDNA['price_band'] =
    priceEUR < 150_000 ? 'budget' :
    priceEUR < 500_000 ? 'mid' :
    priceEUR < 1_500_000 ? 'premium' :
    priceEUR < 5_000_000 ? 'luxury' : 'ultra'

  const type_key = prop.type.toLowerCase().replace(/[\s]+/g, '_')
    .replace('new_build', 'new_build').replace('new build', 'new_build')

  const countryISO = normalizeCountryToISO(prop.country)
  const signals = detectFeatureSignals(prop)
  const isRental = prop.mode === 'rent'

  const archetypeMap: Record<string, string[]> = {
    apartment:  isRental ? ['rental_investor','yield_investor','relocation_family']
                         : ['yield_investor','relocation_family','lifestyle_second_home'],
    house:      isRental ? ['relocation_family','lifestyle_migrant','rental_investor']
                         : ['relocation_family','lifestyle_migrant','lifestyle_second_home'],
    villa:      isRental ? ['vacation_rental','lifestyle_second_home','ultra_hnwi']
                         : ['lifestyle_second_home','capital_preserver','ultra_hnwi'],
    land:        ['developer_landbank','capital_preserver','yield_investor'],
    commercial:  ['yield_investor','commercial_investor','developer_landbank'],
    new_build:   isRental ? ['yield_investor','rental_investor','off_plan_investor']
                           : ['off_plan_investor','yield_investor','relocation_family'],
  }

  let buyer_archetypes: string[] = archetypeMap[type_key] ?? ['yield_investor','lifestyle_migrant']
  if (price_band === 'luxury' || price_band === 'ultra')
    buyer_archetypes = ['ultra_hnwi','capital_preserver',...buyer_archetypes]
  if (signals.isPenthouse) buyer_archetypes = ['ultra_hnwi',...buyer_archetypes]
  if (signals.isFurnishedInvestment && !buyer_archetypes[0].includes('rental'))
    buyer_archetypes = ['rental_investor',...buyer_archetypes]

  // Demand markets
  let demand_markets: string[]
  const overrideMarkets = buildOverrideMarkets(prop.targetBuyerTypes ?? [], countryISO)
  if (overrideMarkets.length > 0) {
    demand_markets = [...new Set([...overrideMarkets, ...getTargetMarkets(countryISO)])].slice(0, 10)
  } else {
    demand_markets = getTargetMarkets(countryISO)
  }
  if (signals.hasSeaside && !demand_markets.includes('NO'))
    demand_markets = [...new Set([...demand_markets,'NO','SE','DK','FI'])].slice(0, 10)
  if (signals.hasMountain)
    demand_markets = [...new Set(['CH','AT','DE',...demand_markets])].slice(0, 10)
  if (isNorthAmerica(countryISO)) {
    const naBoost = countryISO === 'CA' ? ['CA','US','GB','HK'] : ['US','CA','GB','MX']
    demand_markets = [...new Set([...naBoost,...demand_markets])].slice(0, 10)
  }

  // Channel weights — per property type
  const base_weights: Record<string, { local: number; cross_border: number; stealth: number }> = {
    apartment:  { local: 0.50, cross_border: 0.38, stealth: 0.12 },
    house:      { local: 0.38, cross_border: 0.45, stealth: 0.17 },
    villa:      { local: 0.20, cross_border: 0.58, stealth: 0.22 },
    land:       { local: 0.55, cross_border: 0.33, stealth: 0.12 },
    commercial: { local: 0.52, cross_border: 0.35, stealth: 0.13 },
    new_build:  { local: 0.28, cross_border: 0.55, stealth: 0.17 },
  }

  let cw = { ...(base_weights[type_key] ?? { local: 0.35, cross_border: 0.40, stealth: 0.25 }) }

  if (isNorthAmerica(countryISO)) {
    cw = price_band === 'luxury' || price_band === 'ultra'
      ? { local: 0.45, cross_border: 0.30, stealth: 0.25 }
      : { local: 0.62, cross_border: 0.28, stealth: 0.10 }
  }
  if (isRental) cw = { local: 0.65, cross_border: 0.28, stealth: 0.07 }
  if (!isNorthAmerica(countryISO) && (price_band === 'luxury' || price_band === 'ultra')) {
    cw.stealth = Math.min(0.40, cw.stealth + 0.15)
    cw.cross_border = Math.max(0.15, cw.cross_border - 0.08)
    cw.local = Math.max(0.15, 1 - cw.stealth - cw.cross_border)
  }
  if (signals.hasSeaside && !isRental && !isNorthAmerica(countryISO)) {
    cw.cross_border = Math.min(0.65, cw.cross_border + 0.10)
    cw.local = Math.max(0.15, cw.local - 0.10)
  }
  const total = cw.local + cw.cross_border + cw.stealth
  const channel_weights = {
    local: cw.local / total,
    cross_border: cw.cross_border / total,
    stealth: cw.stealth / total,
  }

  const seasonal_peak_months =
    type_key === 'land' || type_key === 'commercial' ? [1,2,3,4,5,6,7,8,9,10,11,12] :
    signals.hasSeaside ? [2,3,4,5,9,10] :
    signals.hasMountain ? [1,2,10,11,12] : [9,10,11,1,2,3]

  const liquidityMap: Record<string, number> = {
    apartment: 8, house: 7, villa: 6, new_build: 7, commercial: 5, land: 4,
  }

  return {
    price_band, price_eur: priceEUR, seller_urgency: 5,
    liquidity_score: liquidityMap[type_key] ?? 5,
    demand_markets, buyer_archetypes, seasonal_peak_months,
    is_off_market: prop.isOffMarket ?? false, channel_weights,
    type_key, is_rental: isRental,
    is_penthouse: signals.isPenthouse, has_luxury_features: signals.hasLuxury,
    has_seaside: signals.hasSeaside, has_mountain: signals.hasMountain,
    is_urban: signals.isUrban,
    target_buyer_override: prop.targetBuyerTypes ?? [],
    exclusive: prop.exclusiveAgreement === 'yes',
  }
}

// ─── AgencyDNA™ Computation ───────────────────────────────────────────────────
// Deterministic tier classification from historical performance data.
// Called at match time; can also be called standalone for DB formation.

export function computeAgencyDNA(agency: Agency): AgencyDNA {
  const h = agency.historical

  // ── Tier classification ──────────────────────────────────────────────────────
  // PLATINUM: elite agencies with proven HNW track record
  // GOLD:     strong performers with international pipeline
  // SILVER:   solid regional agencies
  // EMERGING: new entries or agencies lacking sufficient data
  let tier: AgencyTier
  if (
    agency.quality_score >= 90 &&
    h.conversion_rate >= 22 &&
    h.luxury_deals_12m >= 12 &&
    h.cross_border_deals_12m >= 8 &&
    h.response_rate >= 88
  ) {
    tier = 'platinum'
  } else if (
    agency.quality_score >= 78 &&
    h.conversion_rate >= 15 &&
    h.cross_border_deals_12m >= 5 &&
    h.response_rate >= 75
  ) {
    tier = 'gold'
  } else if (
    agency.quality_score >= 62 &&
    h.conversion_rate >= 8
  ) {
    tier = 'silver'
  } else {
    tier = 'emerging'
  }

  const tier_multiplier = { platinum: 1.25, gold: 1.10, silver: 1.00, emerging: 0.85 }[tier]

  // ── Performance dimensions ───────────────────────────────────────────────────

  // Sell-through rate: estimated from conversion_rate and deal counts
  const sell_through_rate = Math.min(100, h.conversion_rate * 1.2 + (h.luxury_deals_12m > 5 ? 8 : 0))

  // Network reach: how large is the agency's buyer pool?
  const network_reach_score = Math.min(100,
    agency.buyer_markets.length * 8 +
    h.cross_border_deals_12m * 2 +
    (agency.delivery_channels.length * 4) +
    (agency.languages.length * 3)
  )

  // Speed index: composite of response time and response rate
  const speed_index = Math.min(100,
    Math.max(0, 100 - h.avg_response_hours * 2) * 0.6 +
    h.response_rate * 0.4
  )

  // Cross-market authority: depth in international markets
  const cross_market_authority = Math.min(100,
    h.cross_border_deals_12m * 3.5 +
    agency.buyer_markets.length * 5 +
    (agency.languages.length >= 3 ? 15 : agency.languages.length * 4)
  )

  // Exclusivity affinity: how well the agency handles exclusive mandates
  // (high quality score + good conversion + premium price bands)
  const hasExclusive = agency.price_bands.includes('luxury') || agency.price_bands.includes('premium')
  const exclusivity_affinity = Math.min(100,
    agency.quality_score * 0.5 +
    h.conversion_rate * 1.5 +
    (hasExclusive ? 20 : 0)
  )

  return {
    tier, tier_multiplier, sell_through_rate, network_reach_score,
    speed_index, cross_market_authority, exclusivity_affinity,
    verified: agency.quality_score >= 80,
    verified_at: agency.quality_score >= 80 ? new Date().toISOString() : undefined,
  }
}

// ─── PropertyFIT™ Score — 5-Dimension Proprietary Algorithm ──────────────────
//
// Replaces the old per-channel scorer with a unified multi-dimensional model.
// Channel-specific weights determine which dimensions matter most per context.
//
// DIMENSION DEFINITIONS:
//   DRS — DNA Resonance:       overlap between agency buyer profile and PropertyDNA
//   TVI — Transaction Velocity: recent deal momentum (recency-weighted)
//   MPR — Market Penetration:  % of target demand markets covered by the agency
//   CAS — Channel Authority:   multi-channel outreach quality (email+WA+TG+voice)
//   SA  — Strategic Alignment: agency strategy ↔ property listing strategy fit

const PROPERTIFY_CHANNEL_WEIGHTS: Record<AgencyChannel, {
  drs: number; tvi: number; mpr: number; cas: number; sa: number
}> = {
  local: {
    drs: 0.35,  // resonance with property DNA is #1 for local
    tvi: 0.28,  // recent deal velocity is #2 (local buyers move fast)
    mpr: 0.15,  // local agency doesn't need wide coverage
    cas: 0.14,  // channel reach matters but secondary
    sa:  0.08,  // strategic fit matters least locally
  },
  cross_border: {
    drs: 0.22,  // DNA resonance still matters
    tvi: 0.18,  // velocity matters (cross-border deals take longer)
    mpr: 0.38,  // market penetration is #1 for cross-border
    cas: 0.15,  // international channels (WhatsApp/Telegram essential)
    sa:  0.07,  // strategy is less important for pipeline agencies
  },
  stealth: {
    drs: 0.20,  // HNW profile alignment
    tvi: 0.15,  // deal velocity matters but HNW moves slowly
    mpr: 0.12,  // stealth operates through depth, not breadth
    cas: 0.10,  // channel quality
    sa:  0.43,  // strategic alignment is #1 for stealth/confidential
  },
}

function computePropertyFIT(
  agency: Agency,
  agencyDNA: AgencyDNA,
  prop: WizardProperty,
  dna: PropertyDNA,
  channel: AgencyChannel
): PropertyFITDimensions {
  const h = agency.historical
  const countryISO = normalizeCountryToISO(prop.country)
  const cw = PROPERTIFY_CHANNEL_WEIGHTS[channel]

  // ── DRS: DNA Resonance Score ─────────────────────────────────────────────────
  // How well does agency's buyer profile match PropertyDNA?
  // Sub-components: type match, price band, buyer market, archetype alignment, geo
  let drs = 0

  // Type specialization match (0–30)
  const typeKey = dna.type_key as any
  if (agency.property_types.includes(typeKey)) drs += 30
  if (agency.specializations.some(s => ['luxury','residential','investment','commercial','new_build'].includes(s))) drs += 8

  // Price band resonance (0–25)
  if (agency.price_bands.includes(dna.price_band as any)) drs += 25
  else if (dna.price_band === 'ultra' && agency.price_bands.includes('luxury')) drs += 18
  else if (dna.price_band === 'budget' && agency.price_bands.includes('mid')) drs += 12

  // Geo resonance (0–25)
  if (agency.country === countryISO) drs += 25
  else {
    const NEIGHBOURS: Record<string, string[]> = {
      RS:['ME','HR','BA','BG'], ME:['RS','HR','BA'], HR:['RS','ME','BA','SI','AT'],
      DE:['AT','CH','NL','FR'], AT:['DE','CH','IT'], US:['CA','MX'], CA:['US','GB'],
    }
    if ((NEIGHBOURS[countryISO] ?? []).includes(agency.country)) drs += 12
  }

  // City/region match (0–12)
  const agencyCity = ((agency as any).city ?? '').toLowerCase()
  const propCity = (prop.city ?? '').toLowerCase()
  if (agencyCity && propCity) {
    if (agencyCity === propCity) drs += 12
    else if (agencyCity.includes(propCity) || propCity.includes(agencyCity)) drs += 7
    else if ((agency.regions ?? []).some(r => r.toLowerCase().includes(propCity))) drs += 5
  }

  drs = Math.min(100, drs)

  // ── TVI: Transaction Velocity Index ──────────────────────────────────────────
  // Recency-weighted deal momentum. Formula:
  //   base_velocity = total deals this year
  //   luxury_boost  = luxury deals × 1.5 (higher value, more relevant signal)
  //   response_reliability = response_rate / 100 (multiplier for execution quality)
  //   recency_factor = computed from last_contacted (stale agency = lower TVI)
  const totalDeals = h.cross_border_deals_12m + h.luxury_deals_12m
  const base_velocity = Math.min(50, totalDeals * 1.4)
  const luxury_boost  = Math.min(20, h.luxury_deals_12m * 1.5)
  const response_reliability = h.response_rate / 100
  const daysSinceContacted = agency.last_contacted
    ? (Date.now() - new Date(agency.last_contacted).getTime()) / 86_400_000 : 60
  const recency_factor = daysSinceContacted < 14 ? 0.7  // recently active (but may be fatigued)
    : daysSinceContacted < 60 ? 1.0 : daysSinceContacted < 180 ? 0.9 : 0.75
  const tvi = Math.min(100, (base_velocity + luxury_boost + h.conversion_rate) * response_reliability * recency_factor)

  // ── MPR: Market Penetration Rate ─────────────────────────────────────────────
  // What % of the top 6 demand markets does this agency cover?
  const topDemandMarkets = dna.demand_markets.slice(0, 6)
  const coveredMarkets = topDemandMarkets.filter(m => agency.buyer_markets.includes(m))
  const baseMPR = (coveredMarkets.length / Math.max(topDemandMarkets.length, 1)) * 100

  // Weighted MPR: higher weight for top-ranked markets (rank 1 = 3×, rank 6 = 1×)
  let weightedMPR = 0
  const weights = [3.0, 2.5, 2.0, 1.5, 1.2, 1.0]
  let totalWeight = 0
  topDemandMarkets.forEach((m, i) => {
    const w = weights[i] ?? 1.0
    totalWeight += w
    if (agency.buyer_markets.includes(m)) weightedMPR += w
  })
  const mpr = Math.min(100, (weightedMPR / Math.max(totalWeight, 1)) * 100 + baseMPR * 0.2)

  // ── CAS: Channel Authority Score ─────────────────────────────────────────────
  // Outreach quality: which channels does the agency have + language coverage?
  let cas = 0
  // Channel diversity (0–40)
  if ((agency.delivery_channels as string[]).includes('email'))    cas += 12
  if ((agency.delivery_channels as string[]).includes('whatsapp')) cas += 14  // highest for international
  if ((agency.delivery_channels as string[]).includes('telegram')) cas += 10
  if ((agency.delivery_channels as string[]).includes('phone'))    cas += 4
  // Language authority (0–30): can the agency actually communicate with target markets?
  const marketLangMap: Record<string, string> = {
    DE:'de', AT:'de', CH:'de', FR:'fr', RU:'ru', UA:'ru', KZ:'ru',
    GB:'en', AE:'ar', SA:'ar', US:'en', CA:'en', IT:'it', ES:'es',
    NL:'nl', RS:'sr', ME:'sr', HR:'hr', TR:'tr', CN:'zh', SG:'en',
    NO:'no', SE:'sv', DK:'da', FI:'fi', MX:'es', HK:'zh',
  }
  const targetLangs = [...new Set(dna.demand_markets.slice(0, 5).map(m => marketLangMap[m] ?? 'en'))]
  const coveredLangs = targetLangs.filter(l => agency.languages.includes(l)).length
  cas += (coveredLangs / Math.max(targetLangs.length, 1)) * 30
  // Response reliability (0–30)
  cas += h.response_rate * 0.30
  cas = Math.min(100, cas)

  // ── SA: Strategic Alignment Score ────────────────────────────────────────────
  // Does the agency's operating strategy match the property's listing strategy?
  // Key signals: exclusive mandate alignment, stealth/off-market capability, urgency fit
  let sa = 0

  // Exclusive mandate alignment (0–30)
  if (dna.exclusive && agencyDNA.exclusivity_affinity >= 70) sa += 30
  else if (!dna.exclusive && agencyDNA.exclusivity_affinity < 60) sa += 15
  else sa += 10

  // Off-market / stealth alignment (0–25)
  if (dna.is_off_market) {
    if (agencyDNA.tier === 'platinum') sa += 25
    else if (agencyDNA.tier === 'gold') sa += 16
    else sa += 5
  } else {
    sa += agencyDNA.tier === 'platinum' ? 12 : agencyDNA.tier === 'gold' ? 10 : 8
  }

  // Owner-specified buyer type alignment (0–20)
  if (dna.target_buyer_override.length > 0) {
    const overrideMarkets = buildOverrideMarkets(dna.target_buyer_override, countryISO)
    const overlapCount = overrideMarkets.filter(m => agency.buyer_markets.includes(m)).length
    sa += Math.min(20, overlapCount * 4)
  } else {
    sa += 10 // neutral bonus when no override
  }

  // Quality assurance (0–25): high quality score agency always aligned strategically
  sa += agency.quality_score * 0.25
  sa = Math.min(100, sa)

  // ── PropertyFIT™ Composite ────────────────────────────────────────────────────
  const raw = drs * cw.drs + tvi * cw.tvi + mpr * cw.mpr + cas * cw.cas + sa * cw.sa
  const property_fit_score = Math.min(100, raw * agencyDNA.tier_multiplier)

  return {
    dna_resonance: Math.round(drs),
    transaction_velocity: Math.round(tvi),
    market_penetration: Math.round(mpr),
    channel_authority: Math.round(cas),
    strategic_alignment: Math.round(sa),
    property_fit_score: Math.round(property_fit_score),
  }
}

// ─── Hard filter ──────────────────────────────────────────────────────────────

function passesFilter(agency: Agency, prop: WizardProperty, dna: PropertyDNA): boolean {
  if (!agency.is_active) return false
  if (agency.contact_policy === 'blacklisted') return false

  const typeKey = dna.type_key as any
  if (!agency.property_types.includes(typeKey)) return false

  if (dna.exclusive && agency.quality_score < 72) return false

  const countryISO = normalizeCountryToISO(prop.country)
  const hasMarketOverlap = agency.buyer_markets.some(m =>
    dna.demand_markets.includes(m) || m === countryISO
  )
  if (!hasMarketOverlap) return false

  return true
}

// ─── Channel classifier ───────────────────────────────────────────────────────

function classifyChannel(agency: Agency, prop: WizardProperty, dna: PropertyDNA): AgencyChannel {
  const isStealthEligible = ['luxury','ultra','premium'].includes(dna.price_band)
  const isStealthAgency =
    agency.quality_score >= 92 &&
    agency.historical.luxury_deals_12m >= 10 &&
    agency.price_bands.includes('luxury') &&
    agency.contact_policy !== 'blacklisted'

  if (isStealthEligible && isStealthAgency) return 'stealth'

  const propCountryISO = normalizeCountryToISO(prop.country)
  const isLocal =
    agency.country === propCountryISO ||
    (agency.regions ?? []).some(r => r.toLowerCase().includes((prop.city ?? '').toLowerCase()))

  const isCrossBorder =
    agency.buyer_markets.length >= 3 &&
    agency.historical.cross_border_deals_12m >= 5

  if (isLocal) return 'local'
  if (isCrossBorder) return 'cross_border'
  return 'local'
}

// ─── Anti-fatigue layer ───────────────────────────────────────────────────────

function computeFatiguePenalty(agency: Agency): number {
  if (!agency.last_contacted) return 1.0
  const daysSince = (Date.now() - new Date(agency.last_contacted).getTime()) / 86_400_000
  if (daysSince < 7)  return 0.30
  if (daysSince < 14) return 0.65
  if (daysSince < 30) return 0.85
  return 1.0
}

// ─── Wave timing ─────────────────────────────────────────────────────────────

function computeSendAt(wave: 1 | 2 | 3, agencyCountry: string): string {
  const now = new Date()
  const offsets: Record<string, number> = {
    DE:1, AT:1, CH:1, FR:1, NL:1, BE:1, IT:1, ES:1, PT:0,
    GB:0, IE:0, SE:1, NO:1, DK:1, FI:2,
    RS:1, ME:1, HR:1, BA:1, BG:2, RO:2, GR:2,
    AE:4, SA:3, QA:3, SG:8, HK:8, CN:8,
    RU:3, UA:2, KZ:5, US:-5, CA:-5, AU:11, MX:-6,
  }
  const tzOffset = offsets[agencyCountry] ?? 1
  const base = new Date(now)
  const waveDay   = wave === 1 ? 2 : wave === 2 ? 4 : 1
  const waveHour  = wave === 1 ? 10 : wave === 2 ? 14 : 9
  const waveDelay = wave === 1 ? 0 : wave === 2 ? 2 : 7

  base.setDate(base.getDate() + waveDelay)
  while (base.getDay() !== waveDay) base.setDate(base.getDate() + 1)
  base.setHours(waveHour - tzOffset, 0, 0, 0)
  return base.toISOString()
}

// ─── Explanation builders ─────────────────────────────────────────────────────

function buildWhyMatched(
  agency: Agency,
  agencyDNA: AgencyDNA,
  channel: AgencyChannel,
  prop: WizardProperty,
  dna: PropertyDNA,
  fit: PropertyFITDimensions
): string[] {
  const reasons: string[] = []
  const countryISO = normalizeCountryToISO(prop.country)

  if (agencyDNA.tier === 'platinum') reasons.push('PLATINUM-tier verified agency')
  if (agencyDNA.tier === 'gold') reasons.push('GOLD-tier performer')

  if (agency.country === countryISO) reasons.push(`Local expert in ${prop.country}`)
  if (fit.market_penetration >= 70)
    reasons.push(`Covers ${Math.round(fit.market_penetration)}% of target buyer markets`)
  if (agency.historical.cross_border_deals_12m >= 10)
    reasons.push(`${agency.historical.cross_border_deals_12m} cross-border deals this year`)
  if (agency.historical.response_rate >= 88)
    reasons.push(`${agency.historical.response_rate}% reply rate`)
  if (channel === 'stealth') reasons.push('Private HNW network access')
  if (channel === 'cross_border') {
    const covered = agency.buyer_markets.filter(m => dna.demand_markets.includes(m))
    if (covered.length) reasons.push(`Active buyers from ${covered.slice(0,3).join(', ')}`)
  }
  if (fit.property_fit_score >= 90) reasons.push('Top 5% PropertyFIT™ score')
  if (dna.type_key === 'land' && agency.specializations.includes('investment'))
    reasons.push('Developer & land investment specialist')
  if (dna.type_key === 'villa' && agency.specializations.includes('luxury'))
    reasons.push('Luxury villa specialist')
  if (dna.is_rental && agency.specializations.includes('residential'))
    reasons.push('Residential rental specialist')
  if (dna.target_buyer_override.length > 0)
    reasons.push(`Matches your target: ${dna.target_buyer_override.slice(0,2).join(', ')}`)

  return reasons.slice(0, 3)
}

function buildDealSignals(agency: Agency, agencyDNA: AgencyDNA, dna: PropertyDNA): string[] {
  const signals: string[] = []
  if (agencyDNA.tier === 'platinum') signals.push('Platinum-verified agency')
  if (agency.historical.conversion_rate >= 20) signals.push('High conversion rate')
  if (agency.historical.avg_response_hours <= 8) signals.push('Fast responder (<8h)')
  if (agency.historical.luxury_deals_12m >= 5 && dna.price_band !== 'budget')
    signals.push(`${agency.historical.luxury_deals_12m} luxury deals active`)
  if (agency.delivery_channels.length >= 3) signals.push('Multi-channel outreach')
  if (dna.is_rental && agency.specializations.includes('residential'))
    signals.push('Rental specialist')
  if (agencyDNA.network_reach_score >= 75) signals.push('Large international buyer network')
  return signals
}

// ─── MAIN APEX RUN (v3.0) ─────────────────────────────────────────────────────

export function runAPEX(prop: WizardProperty, agencies: RealAgency[] = DEMO_AGENCY_POOL): APEXResult {
  const dna = buildPropertyDNA(prop)
  const warnings: string[] = []

  const currentMonth = new Date().getMonth() + 1
  if (!dna.seasonal_peak_months.includes(currentMonth))
    warnings.push(`Current month (${currentMonth}) is off-peak. Response rates may be 20–30% lower.`)
  if (dna.is_rental)
    warnings.push('Rental mode active: matching rental management agencies with local buyer base.')

  const filtered = agencies.filter(a => passesFilter(a, prop, dna))

  if (filtered.length < 5)
    warnings.push('Fewer than 5 agencies passed the filter. Consider expanding property type or location.')

  const scored: APEXAgencyResult[] = filtered.map(agency => {
    const agencyDNA = computeAgencyDNA(agency)
    const channel   = classifyChannel(agency, prop, dna)
    const fatigue   = computeFatiguePenalty(agency)
    const fit       = computePropertyFIT(agency, agencyDNA, prop, dna, channel)

    // APEX score = PropertyFIT™ composite × fatigue multiplier
    const apex_score = Math.round(fit.property_fit_score * fatigue)

    // Legacy channel scores derived from fit dimensions (for UI backward compat)
    const local_score        = Math.round(fit.dna_resonance * 0.5 + fit.transaction_velocity * 0.3 + fit.channel_authority * 0.2)
    const cross_border_score = Math.round(fit.market_penetration * 0.5 + fit.channel_authority * 0.3 + fit.transaction_velocity * 0.2)
    const stealth_score      = Math.round(fit.strategic_alignment * 0.5 + fit.dna_resonance * 0.3 + fit.transaction_velocity * 0.2)

    const wave: 1 | 2 | 3 =
      apex_score >= 70 ? 1 :
      apex_score >= 45 ? 2 : 3

    return {
      agency, agency_dna: agencyDNA, channel,
      apex_score, fit_dimensions: fit,
      local_score, cross_border_score, stealth_score,
      wave,
      send_at: computeSendAt(wave, agency.country),
      why_matched: buildWhyMatched(agency, agencyDNA, channel, prop, dna, fit),
      deal_signals: buildDealSignals(agency, agencyDNA, dna),
      fatigue_penalty: fatigue,
    }
  })

  const results = scored.sort((a, b) => b.apex_score - a.apex_score)

  const wave1 = results.filter(r => r.wave === 1)
  const wave2 = results.filter(r => r.wave === 2)
  const wave3 = results.filter(r => r.wave === 3)

  const send_schedule: WaveTiming[] = [
    {
      wave: 1, send_at: computeSendAt(1, 'DE'),
      agencies_count: wave1.length,
      channel: dna.is_rental ? 'LOCAL rental specialists' : 'LOCAL + CROSS-BORDER top matches',
      rationale: 'Tuesday 10:00 — highest B2B open rates. Top PropertyFIT™-scored agencies first.',
    },
    {
      wave: 2, send_at: computeSendAt(2, 'DE'),
      agencies_count: wave2.length,
      channel: 'CROSS-BORDER + STEALTH',
      rationale: 'Thursday 14:00 — follow-up window. Foreign buyer pipeline + private networks.',
    },
    {
      wave: 3, send_at: computeSendAt(3, 'DE'),
      agencies_count: wave3.length,
      channel: 'STEALTH reserve + re-targeted',
      rationale: 'Monday 09:00 — fresh week. Last-resort wave + any missed demand markets.',
    },
  ]

  return {
    property_dna: dna,
    total_scanned: agencies.length,
    passed_filter: filtered.length,
    results,
    wave_breakdown: { wave1, wave2, wave3 },
    channel_breakdown: {
      local: results.filter(r => r.channel === 'local'),
      cross_border: results.filter(r => r.channel === 'cross_border'),
      stealth: results.filter(r => r.channel === 'stealth'),
    },
    send_schedule,
    warnings,
  }
}

// ─── SoldSense™ Detection Engine ─────────────────────────────────────────────
//
// Multi-signal algorithm to determine whether a property has been sold,
// withdrawn, or is still genuinely active.
//
// SIGNAL SOURCES:
//   1. Owner explicit confirmation (deterministic — 100% confidence)
//   2. Explicit sold keyword in agency replies (NLP parse — 90%)
//   3. Engagement silence after Wave 1 (72h no opens — 40%)
//   4. Opens but zero replies across all waves (price/content signal — 60%)
//   5. All 3 waves sent, zero engagement total (composite — 70%)
//   6. >90 days on market (time decay — 50%)
//   7. >180 days on market (dead listing — 65%)
//   8. Price reduction + still no engagement (distress signal — 65%)
//
// COMPOSITE RULE:
//   confidence = highest_signal_confidence + 5 × (additional_signals - 1), capped at 95

const SOLD_KEYWORDS = [
  'sold', 'already sold', 'property sold', 'was sold', 'has been sold',
  'off market', 'off the market', 'no longer available', 'unavailable',
  'withdrawn', 'property withdrawn', 'listing closed', 'deal closed',
  'contract signed', 'under contract', 'sale agreed', 'already under offer',
  'продано', 'снято с продажи', 'объект продан', 'сделка закрыта',
]

function detectSoldKeywords(texts: string[]): boolean {
  const combined = texts.join(' ').toLowerCase()
  return SOLD_KEYWORDS.some(kw => combined.includes(kw))
}

function agencySaidAlreadySold(texts: string[]): boolean {
  const combined = texts.join(' ').toLowerCase()
  const alreadySoldPatterns = [
    'already sold by', 'sold by another', 'sold through another',
    'another agent sold', 'sold by owner', 'owner sold',
    'already contracted', 'closed by',
  ]
  return alreadySoldPatterns.some(p => combined.includes(p))
}

export function runSoldSense(data: CampaignData): SoldSenseResult {
  const now = new Date().toISOString()
  const signals: SoldSenseSignal[] = []

  // ── Signal 1: Owner confirmed sold ────────────────────────────────────────────
  if (data.owner_marked_sold) {
    signals.push({
      signal_type: 'owner_confirmed',
      confidence: 100,
      detected_at: now,
      source: 'owner',
      recommended_action: 'mark_sold',
      metadata: { deterministic: true },
    })
  }

  // ── Signal 2: Owner withdrew listing ─────────────────────────────────────────
  if (data.owner_marked_withdrawn) {
    signals.push({
      signal_type: 'owner_confirmed',
      confidence: 100,
      detected_at: now,
      source: 'owner',
      recommended_action: 'mark_sold',
      metadata: { withdrawal: true },
    })
  }

  // ── Signal 3: Explicit sold keyword in agency replies ─────────────────────────
  const replyTexts = data.agency_reply_texts ?? []
  if (replyTexts.length > 0 && detectSoldKeywords(replyTexts)) {
    signals.push({
      signal_type: 'explicit_sold_reply',
      confidence: 90,
      detected_at: now,
      source: 'agency_reply',
      recommended_action: 'mark_likely_sold',
      metadata: { replies_analyzed: replyTexts.length },
    })
  }

  // ── Signal 4: Agency said already sold by someone else ────────────────────────
  if (replyTexts.length > 0 && agencySaidAlreadySold(replyTexts)) {
    signals.push({
      signal_type: 'agency_said_already_sold',
      confidence: 88,
      detected_at: now,
      source: 'agency_reply',
      recommended_action: 'contact_owner',
      metadata: { needs_owner_confirmation: true },
    })
  }

  // ── Signal 5: Zero-engagement composite ──────────────────────────────────────
  // All 3 waves were sent and total engagement is essentially zero
  const totalWaves = data.waves.length
  const totalOpens  = data.waves.reduce((s, w) => s + w.opens, 0)
  const totalSent   = data.waves.reduce((s, w) => s + w.emails_sent, 0)
  const totalReplies = data.waves.reduce((s, w) => s + w.replies, 0)

  if (totalWaves >= 3 && totalSent >= 15 && totalOpens === 0 && totalReplies === 0) {
    signals.push({
      signal_type: 'zero_engagement_composite',
      confidence: 70,
      detected_at: now,
      source: 'campaign_stats',
      recommended_action: 'investigate',
      metadata: { waves_sent: totalWaves, total_sent: totalSent },
    })
  }

  // ── Signal 6: Wave 1 engagement silence (72h no opens) ───────────────────────
  const wave1 = data.waves.find(w => w.wave === 1)
  if (wave1 && wave1.emails_sent >= 5 && wave1.open_rate < 5 && data.days_since_launch >= 3) {
    signals.push({
      signal_type: 'engagement_silence',
      confidence: 40,
      detected_at: now,
      source: 'campaign_stats',
      recommended_action: 'investigate',
      metadata: { wave: 1, open_rate: wave1.open_rate, emails_sent: wave1.emails_sent },
    })
  }

  // ── Signal 7: Opens without any replies across waves ─────────────────────────
  const avgOpenRate = data.waves.reduce((s, w) => s + w.open_rate, 0) / Math.max(data.waves.length, 1)
  if (totalWaves >= 2 && avgOpenRate >= 25 && totalReplies === 0) {
    signals.push({
      signal_type: 'interest_without_action',
      confidence: 58,
      detected_at: now,
      source: 'campaign_stats',
      recommended_action: 'escalate',
      metadata: { avg_open_rate: Math.round(avgOpenRate), total_replies: 0, waves_sent: totalWaves },
    })
  }

  // ── Signal 8: Time decay — 90+ days ──────────────────────────────────────────
  if (data.days_since_launch >= 180) {
    signals.push({
      signal_type: 'time_decay_180d',
      confidence: 65,
      detected_at: now,
      source: 'system',
      recommended_action: 'escalate',
      metadata: { days_on_market: data.days_since_launch },
    })
  } else if (data.days_since_launch >= 90) {
    signals.push({
      signal_type: 'time_decay_90d',
      confidence: 48,
      detected_at: now,
      source: 'system',
      recommended_action: 'escalate',
      metadata: { days_on_market: data.days_since_launch },
    })
  }

  // ── Signal 9: Price reduction + still no reply ────────────────────────────────
  if (data.price_history && data.price_history.length >= 2) {
    const firstPrice = data.price_history[0].price
    const latestPrice = data.price_history[data.price_history.length - 1].price
    const priceDropPct = ((firstPrice - latestPrice) / firstPrice) * 100
    if (priceDropPct >= 5 && totalReplies === 0 && data.days_since_launch >= 30) {
      signals.push({
        signal_type: 'price_reduction',
        confidence: 62,
        detected_at: now,
        source: 'campaign_stats',
        recommended_action: 'escalate',
        metadata: { price_drop_pct: Math.round(priceDropPct), total_replies: 0 },
      })
    }
  }

  // ── Composite confidence ──────────────────────────────────────────────────────
  if (signals.length === 0) {
    return {
      listing_status: 'active',
      composite_confidence: 0,
      signals: [],
      primary_signal: 'engagement_silence',
      recommended_action: 'Continue campaign — no sold signals detected.',
      owner_message: 'Your listing is actively running. All campaign metrics are within normal range.',
      next_step: 'Proceed with scheduled wave delivery.',
      auto_close: false,
      escalation_required: false,
    }
  }

  // Sort by confidence descending
  signals.sort((a, b) => b.confidence - a.confidence)
  const primarySignal = signals[0]
  const composite = Math.min(95, primarySignal.confidence + (signals.length - 1) * 5)

  // ── Status classification ──────────────────────────────────────────────────────
  let listing_status: ListingStatus
  let auto_close = false
  let escalation_required = false
  let recommended_action = ''
  let owner_message = ''
  let next_step = ''

  if (composite >= 95 || data.owner_marked_sold || data.owner_marked_withdrawn) {
    listing_status = 'sold'
    auto_close = true
    recommended_action = 'Close listing and archive campaign data.'
    owner_message = 'Your property has been marked as sold. All outreach waves have been stopped. Congratulations!'
    next_step = 'Archive listing. Send closure confirmation to agencies that were engaged.'
  } else if (composite >= 80) {
    listing_status = 'likely_sold'
    escalation_required = true
    recommended_action = 'Pause campaign immediately. Contact owner to confirm sale status.'
    owner_message = `Our signals suggest your property may have been sold or withdrawn. Please confirm the current status — we've paused all outreach to avoid sending to agencies unnecessarily.`
    next_step = 'Pause all waves. Send confirmation request to owner. Wait 48h for response.'
  } else if (composite >= 55) {
    listing_status = 'needs_attention'
    escalation_required = true
    if (primarySignal.signal_type === 'interest_without_action') {
      recommended_action = 'Property may be overpriced. AI-rewrite pitch and reconsider pricing.'
      owner_message = `Agencies opened your listing ${Math.round(avgOpenRate)}% of the time but no one replied. This typically means the price is above market or the offer description needs refinement.`
      next_step = 'Run diagnosis → Strategy C (rewrite pitch). Consider price analysis.'
    } else if (primarySignal.signal_type === 'time_decay_180d') {
      recommended_action = 'Listing exceeded 180 days. Switch to STEALTH channel or pause.'
      owner_message = `Your property has been listed for over 180 days with limited agency engagement. We recommend switching to our private STEALTH network to reach a different buyer pool.`
      next_step = 'Activate STEALTH channel. Pull Wave 3 reserve agencies. Consider price review.'
    } else {
      recommended_action = 'Campaign shows multiple warning signals. Human review required.'
      owner_message = `Your campaign has shown ${signals.length} warning signals. Our team is reviewing the data and will reach out with recommendations.`
      next_step = 'Escalate to PropBlaze support. Review campaign manually.'
    }
  } else {
    listing_status = 'active'
    recommended_action = 'Monitor — signals present but listing appears active.'
    owner_message = `Your listing is active. We've detected some early signals (${primarySignal.signal_type.replace(/_/g, ' ')}) but they're within acceptable range. Continue monitoring.`
    next_step = `Watch for ${primarySignal.signal_type.replace(/_/g, ' ')} to escalate. No action required yet.`
  }

  return {
    listing_status,
    composite_confidence: composite,
    signals,
    primary_signal: primarySignal.signal_type,
    recommended_action,
    owner_message,
    next_step,
    auto_close,
    escalation_required,
  }
}

// ─── Agency DB Formation Utilities ────────────────────────────────────────────
//
// Functions for importing, scoring, and tiering raw agency data
// into the PropBlaze verified agency database.
//
// Formation pipeline:
//   1. importRawAgency()   — normalize raw data into Agency shape
//   2. computeAgencyDNA()  — compute AgencyDNA tier and metrics
//   3. scoreFormationFit() — compute a formation score (DB worthiness)
//   4. rankAgencyPool()    — sort and tier a full agency list

export interface RawAgencyInput {
  name: string
  country: string
  city?: string
  email?: string
  phone?: string
  website?: string
  languages?: string[]
  property_types?: string[]
  price_range_eur?: { min: number; max: number }
  // Self-reported metrics (used when no historical data is available)
  years_in_business?: number
  team_size?: number
  annual_transactions?: number
  has_whatsapp?: boolean
  has_telegram?: boolean
  has_international_clients?: boolean
}

export interface AgencyFormationScore {
  agency_id: string
  formation_score: number       // 0–100: overall DB worthiness
  tier: AgencyTier
  recommended_for_db: boolean   // should this agency be added?
  gaps: string[]                // missing data or quality issues
  formation_notes: string
}

export function scoreFormationFit(raw: RawAgencyInput): AgencyFormationScore {
  let score = 0
  const gaps: string[] = []

  // Contact completeness (0–25)
  if (raw.email) score += 10
  else gaps.push('No email address')
  if (raw.phone) score += 8
  else gaps.push('No phone number')
  if (raw.website) score += 7
  else gaps.push('No website')

  // Geographic data (0–15)
  if (raw.country) score += 8
  if (raw.city) score += 7
  else gaps.push('City missing — needed for local matching')

  // Specialization data (0–20)
  if (raw.property_types && raw.property_types.length >= 2) score += 12
  else gaps.push('Property type specialization not specified')
  if (raw.price_range_eur) score += 8
  else gaps.push('Price range not specified — can\'t match to price bands')

  // Language coverage (0–15)
  if (raw.languages && raw.languages.length >= 2) score += 15
  else if (raw.languages && raw.languages.length === 1) score += 8
  else gaps.push('Languages not specified')

  // International capability signals (0–15)
  if (raw.has_whatsapp) score += 6
  if (raw.has_telegram) score += 4
  if (raw.has_international_clients) score += 5

  // Experience signals (0–10)
  if (raw.years_in_business && raw.years_in_business >= 5) score += 5
  if (raw.annual_transactions && raw.annual_transactions >= 20) score += 5

  // Tier derived from formation score
  const tier: AgencyTier =
    score >= 80 ? 'gold' :
    score >= 60 ? 'silver' : 'emerging'

  const agency_id = `pb_${raw.country.toLowerCase()}_${raw.name.toLowerCase().replace(/\s+/g,'_').substring(0, 20)}_${Date.now().toString(36)}`

  return {
    agency_id,
    formation_score: Math.min(100, score),
    tier,
    recommended_for_db: score >= 55,
    gaps,
    formation_notes: score >= 80
      ? 'Strong candidate — complete data profile, ready for DB entry'
      : score >= 60
        ? 'Good candidate — minor data gaps, worth onboarding with follow-up'
        : 'Weak profile — address gaps before adding to DB',
  }
}

export function rankAgencyPool(agencies: Agency[]): Array<{
  agency: Agency
  agency_dna: AgencyDNA
  rank: number
  tier: AgencyTier
  composite_score: number
}> {
  return agencies
    .map(agency => {
      const dna = computeAgencyDNA(agency)
      const composite = (
        agency.quality_score * 0.30 +
        dna.cross_market_authority * 0.25 +
        dna.network_reach_score * 0.20 +
        dna.speed_index * 0.15 +
        dna.exclusivity_affinity * 0.10
      ) * dna.tier_multiplier
      return { agency, agency_dna: dna, tier: dna.tier, composite_score: Math.round(composite) }
    })
    .sort((a, b) => b.composite_score - a.composite_score)
    .map((item, idx) => ({ ...item, rank: idx + 1 }))
}

// ─── Dead Listing Diagnosis (v2.0, kept for backward compat) ──────────────────

export function runDiagnosis(prop: WizardProperty, stats: CampaignStats): DeadListingDiagnosis {
  const dna = buildPropertyDNA(prop)
  const diagnoses: DiagnosisType[] = []

  if (stats.open_rate < 30) {
    diagnoses.push('wrong_channel_mix')
    if (stats.days_since_launch > 10) diagnoses.push('agency_fatigue')
  }
  if (stats.open_rate >= 50 && stats.reply_rate === 0) {
    diagnoses.push('description_weak')
    diagnoses.push('price_outlier')
  }
  if (stats.reply_rate > 0 && stats.negative_replies / Math.max(stats.reply_rate,1) > 0.7)
    diagnoses.push('price_outlier')

  const currentMonth = new Date().getMonth() + 1
  if (!dna.seasonal_peak_months.includes(currentMonth)) diagnoses.push('seasonal_mismatch')
  if ((dna.price_band === 'premium' || dna.price_band === 'luxury') && stats.days_since_launch >= 14)
    diagnoses.push('stealth_needed')
  if (stats.open_rate === 0 && stats.emails_sent >= 5) diagnoses.push('wrong_market_target')

  const primary = diagnoses[0] ?? 'wrong_channel_mix'

  const strategyMap: Record<DiagnosisType, RecampaignStrategy> = {
    wrong_channel_mix: 'A', agency_fatigue: 'B', description_weak: 'C',
    price_outlier: 'C', wrong_market_target: 'B', seasonal_mismatch: 'D', stealth_needed: 'D',
  }
  const strategy = strategyMap[primary] ?? 'B'

  const strategyDescriptions: Record<RecampaignStrategy, string> = {
    A: 'Switch channel: same agencies, WhatsApp instead of email + personalized subject line',
    B: 'Switch audience: fresh agencies from reserve pool, re-weighted for different buyer markets',
    C: 'Switch positioning: AI rewrites the offer headline and opening paragraph, new buyer angle',
    D: 'Stealth Mode: off-market outreach to private networks and family offices only',
  }
  const actionMap: Record<RecampaignStrategy, string[]> = {
    A: ['Activate WhatsApp channel for top 10 agencies', 'Rewrite subject line with urgency signal', 'Resend in 48h'],
    B: ['Pull Wave 3 reserve agencies', 'Re-run APEX with cross-border weight ×1.4', 'Target new buyer markets'],
    C: ['AI rewrites headline + first paragraph', 'Reframe from lifestyle → investment angle', 'New send in 3 days'],
    D: ['Switch to STEALTH channel exclusively', 'Mark listing as [CONFIDENTIAL — Off-Market]', 'Activate private network contacts'],
  }
  const ownerMessages: Record<DiagnosisType, string> = {
    wrong_channel_mix: `${stats.emails_sent} agencies received your listing, only ${stats.open_rate}% opened. Switching to WhatsApp — open rates typically 3× higher.`,
    agency_fatigue: `Agencies contacted recently are not responding. Activating fresh pool.`,
    description_weak: `Agencies opened but didn't reply — the pitch isn't converting. AI is rewriting.`,
    price_outlier: `Market is silent. Data suggests price may be above comparable properties. Suggested adjustment: −8%.`,
    wrong_market_target: `Zero engagement from current markets. Recalculating buyer profiles.`,
    seasonal_mismatch: `Current month is off-peak. Recommend 30-day pause or STEALTH channel.`,
    stealth_needed: `After ${stats.days_since_launch} days, switching to private networks.`,
  }

  return {
    days_since_launch: stats.days_since_launch,
    open_rate: stats.open_rate,
    reply_rate: stats.reply_rate,
    diagnosis: diagnoses,
    primary_diagnosis: primary,
    confidence: Math.min(95, 60 + diagnoses.length * 12),
    recommended_strategy: strategy,
    strategy_description: strategyDescriptions[strategy],
    owner_message: ownerMessages[primary],
    action_items: actionMap[strategy],
    price_adjustment_suggested: primary === 'price_outlier' ? -8 : undefined,
  }
}
