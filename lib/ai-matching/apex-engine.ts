/**
 * PropBlaze APEX Matching Engine v2.0
 * Autonomous Property Exchange Intelligence
 *
 * Three-channel architecture:
 *   LOCAL CHANNEL      — agencies with local buyer base
 *   CROSS-BORDER       — agencies with foreign buyer pipeline
 *   STEALTH NETWORK    — private/off-market agencies, HNW access
 *
 * v2.0 changes:
 *   - Per-type channel weights (apartment ≠ villa ≠ land ≠ commercial)
 *   - mode: 'rent' handled separately (rental mgmt agencies boosted)
 *   - features[] used in scoring (pool/sea_view → luxury boost, etc.)
 *   - condition, floor, total_floors, furnished fed into buyer profile
 *   - exclusiveAgreement: 'yes' → hard filter top-tier agencies only
 *   - targetBuyerTypes: owner-specified demand override
 *   - Type-specific sub-scores: land uses developer signals, commercial uses yield signals
 *   + Dead Listing Detection (unchanged)
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

  // Extended wizard fields (v2.0)
  condition?: 'new' | 'good' | 'renovation' | string
  floor?: number
  total_floors?: number
  furnished?: 'unfurnished' | 'partial' | 'full' | string
  exclusiveAgreement?: 'yes' | 'no' | 'maybe' | string
  remoteViewing?: boolean
  features?: string[]          // e.g. ['pool', 'sea_view', 'garage', 'garden', 'mountain_view']
  proximityTags?: string[]     // e.g. ['beach', 'ski_resort', 'city_center', 'airport', 'school']
  targetBuyerTypes?: string[]  // e.g. ['investor', 'expat', 'family', 'developer', 'russian_buyer']
  description?: string
  isOffMarket?: boolean
  ownerLanguages?: string[]    // ISO 639-1 e.g. ['ru', 'en']
}

// ─── Output types ──────────────────────────────────────────────────────────────

export type AgencyChannel = 'local' | 'cross_border' | 'stealth'

export interface APEXAgencyResult {
  agency: RealAgency
  channel: AgencyChannel
  apex_score: number
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
  // v2.0 additions
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

// ─── Dead Listing Detection ────────────────────────────────────────────────────

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
  // US/CA diaspora weight increased: significant Serbian-American, Croatian-American,
  // Montenegrin-American communities actively buy back home.
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

  // ── North American source countries (US/CA as destination) ───────────────────
  // When the property IS in the US or Canada, these are the typical buyer markets.
  US: [
    { market: 'US', share: 0.50 },   // domestic Americans — primary
    { market: 'CA', share: 0.16 },   // Canadians (snowbirds, relocation)
    { market: 'GB', share: 0.10 },   // British expats
    { market: 'DE', share: 0.07 },   // German-Americans
    { market: 'MX', share: 0.07 },   // Mexican diaspora (especially FL, TX, CA)
    { market: 'CN', share: 0.05 },   // Chinese investors (NY, LA, SF)
    { market: 'AU', share: 0.03 },   // Australian expats
    { market: 'IN', share: 0.02 },   // Indian tech investors (Bay Area)
  ],
  CA: [
    { market: 'CA', share: 0.44 },   // domestic Canadians
    { market: 'US', share: 0.22 },   // Americans (border cities, lifestyle)
    { market: 'GB', share: 0.11 },   // British-Canadians
    { market: 'HK', share: 0.08 },   // Hong Kong diaspora (Vancouver, Toronto)
    { market: 'IN', share: 0.07 },   // Indian immigrants
    { market: 'FR', share: 0.05 },   // Quebec connection
    { market: 'DE', share: 0.03 },   // German-Canadians
  ],
}

function getTargetMarkets(countryISO: string): string[] {
  const flows = MONEY_FLOW[countryISO] ?? [
    // Default for unknown EU/other countries — US/CA included as diaspora channel
    { market: 'DE', share: 0.26 }, { market: 'GB', share: 0.20 },
    { market: 'US', share: 0.18 }, { market: 'RU', share: 0.14 },
    { market: 'CA', share: 0.10 }, { market: 'AE', share: 0.08 },
    { market: 'FR', share: 0.04 },
  ]
  return flows.sort((a, b) => b.share - a.share).map(f => f.market)
}

// ─── TARGET BUYER TYPE → MARKET OVERRIDE ─────────────────────────────────────
// If owner explicitly says who they want to sell to, we reprioritize markets.

const BUYER_TYPE_MARKETS: Record<string, string[]> = {
  investor:         ['DE', 'AE', 'GB', 'CH', 'NL', 'US', 'CA', 'AT'],
  expat:            ['DE', 'AT', 'CH', 'GB', 'NL', 'SE', 'NO', 'US', 'CA'],
  russian_buyer:    ['RU', 'UA', 'KZ', 'BY', 'AZ', 'GE'],
  family:           [],   // property country + neighbors (filled in buildOverrideMarkets)
  developer:        [],   // property country + DE + AT + US (filled in buildOverrideMarkets)
  vacation_home:    ['DE', 'GB', 'NO', 'SE', 'DK', 'NL', 'BE', 'CH', 'US', 'CA'],
  luxury:           ['AE', 'CH', 'GB', 'SG', 'HK', 'US', 'CA', 'DE'],
  local:            [],   // property country only
  // North American–specific overrides
  north_american:   ['US', 'CA', 'GB', 'AU'],
  us_diaspora:      ['US', 'CA'],   // diaspora buying back in home country
  canadian:         ['CA', 'US', 'GB'],
  // Investor subtypes
  golden_visa:      ['US', 'CA', 'GB', 'CN', 'HK', 'SG', 'AE', 'BR'],
  commercial_buyer: ['US', 'CA', 'DE', 'GB', 'NL', 'AE', 'SG'],
}

function buildOverrideMarkets(
  targetBuyerTypes: string[],
  countryISO: string
): string[] {
  if (!targetBuyerTypes.length) return []
  const markets: string[] = []
  for (const t of targetBuyerTypes) {
    const key = t.toLowerCase().replace(/[- ]/g, '_')
    const list = BUYER_TYPE_MARKETS[key]
    if (!list) continue
    if (list.length === 0) {
      // family / developer / local → add property country + neighbors
      const NEIGHBOURS: Record<string, string[]> = {
        RS: ['ME','HR','BA','BG','RO'],  ME: ['RS','HR','BA','AL'],
        HR: ['RS','ME','BA','SI','AT'],  DE: ['AT','CH','NL','FR','PL'],
        AT: ['DE','CH','IT','HU','SI'],  US: ['CA','MX'],  CA: ['US','GB'],
      }
      markets.push(countryISO, ...(NEIGHBOURS[countryISO] ?? []))
      if (key === 'developer') markets.push('DE', 'AT', 'US')
    } else {
      markets.push(...list)
    }
  }
  // Deduplicate preserving order
  return [...new Set(markets)]
}

// ─── Country ISO normalizer ───────────────────────────────────────────────────

function normalizeCountryToISO(country: string): string {
  const map: Record<string, string> = {
    // EU / Balkan
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
    // North America — expanded
    'usa': 'US', 'united states': 'US', 'united states of america': 'US',
    'u.s.': 'US', 'u.s.a.': 'US', 'america': 'US',
    'canada': 'CA', 'québec': 'CA', 'quebec': 'CA', 'ontario': 'CA',
    'british columbia': 'CA', 'alberta': 'CA',
    'mexico': 'MX',
    // Asia-Pacific
    'singapore': 'SG', 'hong kong': 'HK', 'china': 'CN',
    'australia': 'AU', 'new zealand': 'NZ', 'japan': 'JP', 'india': 'IN',
    // Other
    'brazil': 'BR', 'south africa': 'ZA',
  }
  const lower = country.toLowerCase().trim()
  return map[lower] ?? (country.length === 2 ? country.toUpperCase() : country.substring(0, 2).toUpperCase())
}

// ─── Is property in North America? ────────────────────────────────────────────
function isNorthAmerica(countryISO: string): boolean {
  return ['US', 'CA', 'MX'].includes(countryISO)
}

// ─── Feature signals detector ─────────────────────────────────────────────────

function detectFeatureSignals(prop: WizardProperty): {
  hasLuxury: boolean
  hasSeaside: boolean
  hasMountain: boolean
  isUrban: boolean
  isPenthouse: boolean
  isFurnishedInvestment: boolean
} {
  const features = (prop.features ?? []).map(f => f.toLowerCase())
  const proximity = (prop.proximityTags ?? []).map(p => p.toLowerCase())
  const all = [...features, ...proximity]

  const hasLuxury = all.some(f => ['pool', 'sea_view', 'yacht_dock', 'rooftop', 'penthouse', 'spa', 'concierge'].includes(f))
    || (prop.price >= 500_000)

  const hasSeaside = all.some(f => ['beach', 'seaside', 'sea', 'coast', 'waterfront', 'sea_view', 'seafront', 'ocean'].includes(f))

  const hasMountain = all.some(f => ['mountain', 'ski', 'alpine', 'mountain_view', 'ski_resort', 'hiking'].includes(f))

  const isUrban = all.some(f => ['city_center', 'urban', 'downtown', 'metro', 'central', 'old_town'].includes(f))

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

// ─── Property DNA builder (v2.0) ──────────────────────────────────────────────

function buildPropertyDNA(prop: WizardProperty): PropertyDNA {
  const priceEUR =
    prop.currency === 'EUR' ? prop.price :
    prop.currency === 'USD' ? prop.price * 0.92 :
    prop.currency === 'CAD' ? prop.price * 0.69 :
    prop.currency === 'CHF' ? prop.price * 1.03 :
    prop.currency === 'GBP' ? prop.price * 1.16 :
    prop.currency === 'AUD' ? prop.price * 0.59 :
    prop.currency === 'MXN' ? prop.price * 0.052 :
    prop.price * 0.0085  // RSD fallback

  const price_band: PropertyDNA['price_band'] =
    priceEUR < 150_000 ? 'budget' :
    priceEUR < 500_000 ? 'mid' :
    priceEUR < 1_500_000 ? 'premium' :
    priceEUR < 5_000_000 ? 'luxury' : 'ultra'

  const type_key = prop.type.toLowerCase().replace(/\s+/g, '_')
    .replace('new_build', 'new_build')
    .replace('new build', 'new_build')

  const countryISO = normalizeCountryToISO(prop.country)
  const signals = detectFeatureSignals(prop)
  const isRental = prop.mode === 'rent'

  // ── Buyer archetypes by type + mode ──────────────────────────────────────────
  const archetypeMap: Record<string, string[]> = {
    apartment:  isRental
      ? ['rental_investor', 'yield_investor', 'relocation_family']
      : ['yield_investor', 'relocation_family', 'lifestyle_second_home'],
    house:      isRental
      ? ['relocation_family', 'lifestyle_migrant', 'rental_investor']
      : ['relocation_family', 'lifestyle_migrant', 'lifestyle_second_home'],
    villa:      isRental
      ? ['vacation_rental', 'lifestyle_second_home', 'ultra_hnwi']
      : ['lifestyle_second_home', 'capital_preserver', 'ultra_hnwi'],
    land:        ['developer_landbank', 'capital_preserver', 'yield_investor'],
    commercial:  ['yield_investor', 'commercial_investor', 'developer_landbank'],
    new_build:   isRental
      ? ['yield_investor', 'rental_investor', 'off_plan_investor']
      : ['off_plan_investor', 'yield_investor', 'relocation_family'],
  }

  let buyer_archetypes: string[] = archetypeMap[type_key] ?? ['yield_investor', 'lifestyle_migrant']

  // Luxury override
  if (price_band === 'luxury' || price_band === 'ultra') {
    buyer_archetypes = ['ultra_hnwi', 'capital_preserver', ...buyer_archetypes]
  }

  // Penthouse override
  if (signals.isPenthouse) {
    buyer_archetypes = ['ultra_hnwi', ...buyer_archetypes]
  }

  // Furnished investment → rental investor first
  if (signals.isFurnishedInvestment && !buyer_archetypes[0].includes('rental')) {
    buyer_archetypes = ['rental_investor', ...buyer_archetypes]
  }

  // ── Demand markets ────────────────────────────────────────────────────────────
  let demand_markets: string[]

  // Owner-specified buyer types override everything
  const overrideMarkets = buildOverrideMarkets(prop.targetBuyerTypes ?? [], countryISO)
  if (overrideMarkets.length > 0) {
    // Merge: owner preference first, then base MONEY_FLOW for fill-up
    demand_markets = [...new Set([...overrideMarkets, ...getTargetMarkets(countryISO)])].slice(0, 10)
  } else {
    demand_markets = getTargetMarkets(countryISO)
  }

  // Seaside property → add Northern European lifestyle buyers
  if (signals.hasSeaside && !demand_markets.includes('NO')) {
    demand_markets = [...new Set([...demand_markets, 'NO', 'SE', 'DK', 'FI'])].slice(0, 10)
  }

  // Mountain/ski → add Swiss, Scandinavian, German alpine buyers
  if (signals.hasMountain) {
    demand_markets = [...new Set(['CH', 'AT', 'DE', ...demand_markets])].slice(0, 10)
  }

  // US/CA property → boost North American buyers, add diaspora channels
  if (isNorthAmerica(countryISO)) {
    const naBoost = countryISO === 'CA' ? ['CA', 'US', 'GB', 'HK'] : ['US', 'CA', 'GB', 'MX']
    demand_markets = [...new Set([...naBoost, ...demand_markets])].slice(0, 10)
  }

  // ── Per-type channel weights ───────────────────────────────────────────────────
  //
  // US/CA properties: domestic market is dominant so LOCAL weight is highest.
  // For EU properties: villa/new_build push toward cross-border.
  // Rental: always local-heavy.

  const base_weights: Record<string, { local: number; cross_border: number; stealth: number }> = {
    apartment:  { local: 0.50, cross_border: 0.38, stealth: 0.12 },
    house:      { local: 0.38, cross_border: 0.45, stealth: 0.17 },
    villa:      { local: 0.20, cross_border: 0.58, stealth: 0.22 },
    land:       { local: 0.55, cross_border: 0.33, stealth: 0.12 },
    commercial: { local: 0.52, cross_border: 0.35, stealth: 0.13 },
    new_build:  { local: 0.28, cross_border: 0.55, stealth: 0.17 },
  }

  let cw = { ...(base_weights[type_key] ?? { local: 0.35, cross_border: 0.40, stealth: 0.25 }) }

  // North American property → domestic-first logic
  // US/CA real estate is primarily sold through local MLS agents, not cross-border
  if (isNorthAmerica(countryISO)) {
    cw = {
      local: 0.62,       // local US/CA agents are the primary channel
      cross_border: 0.28, // international buyers (Chinese, British, Mexican diaspora)
      stealth: 0.10,     // HNWI network
    }
    if (price_band === 'luxury' || price_band === 'ultra') {
      cw = { local: 0.45, cross_border: 0.30, stealth: 0.25 }
    }
  }

  // Rental mode → shift heavily local (tenants are local)
  if (isRental) {
    cw = { local: 0.65, cross_border: 0.28, stealth: 0.07 }
  }

  // Luxury/ultra → more stealth
  if (!isNorthAmerica(countryISO) && (price_band === 'luxury' || price_band === 'ultra')) {
    cw.stealth = Math.min(0.40, cw.stealth + 0.15)
    cw.cross_border = Math.max(0.15, cw.cross_border - 0.08)
    cw.local = Math.max(0.15, 1 - cw.stealth - cw.cross_border)
  }

  // Seaside → cross-border lifestyle demand increases (EU only)
  if (signals.hasSeaside && !isRental && !isNorthAmerica(countryISO)) {
    cw.cross_border = Math.min(0.65, cw.cross_border + 0.10)
    cw.local = Math.max(0.15, cw.local - 0.10)
  }

  // Normalize to sum = 1
  const total = cw.local + cw.cross_border + cw.stealth
  const channel_weights = {
    local: cw.local / total,
    cross_border: cw.cross_border / total,
    stealth: cw.stealth / total,
  }

  // ── Seasonal peak ─────────────────────────────────────────────────────────────
  const seasonal_peak_months =
    type_key === 'land' || type_key === 'commercial'
      ? [1,2,3,4,5,6,7,8,9,10,11,12]
      : signals.hasSeaside
        ? [2,3,4,5,9,10]
        : signals.hasMountain
          ? [1,2,10,11,12]
          : [9,10,11,1,2,3]

  // ── Liquidity ─────────────────────────────────────────────────────────────────
  const liquidityMap: Record<string, number> = {
    apartment: 8, house: 7, villa: 6, new_build: 7, commercial: 5, land: 4
  }
  const liquidity_score = liquidityMap[type_key] ?? 5

  return {
    price_band,
    price_eur: priceEUR,
    seller_urgency: 5,
    liquidity_score,
    demand_markets,
    buyer_archetypes,
    seasonal_peak_months,
    is_off_market: prop.isOffMarket ?? false,
    channel_weights,
    // v2.0 DNA fields
    type_key,
    is_rental: isRental,
    is_penthouse: signals.isPenthouse,
    has_luxury_features: signals.hasLuxury,
    has_seaside: signals.hasSeaside,
    has_mountain: signals.hasMountain,
    is_urban: signals.isUrban,
    target_buyer_override: prop.targetBuyerTypes ?? [],
    exclusive: prop.exclusiveAgreement === 'yes',
  }
}

// ─── Hard filter (v2.0) ───────────────────────────────────────────────────────

function passesFilter(agency: Agency, prop: WizardProperty, dna: PropertyDNA): boolean {
  if (!agency.is_active) return false
  if (agency.contact_policy === 'blacklisted') return false

  const typeKey = dna.type_key as any
  if (!agency.property_types.includes(typeKey)) return false

  // Exclusive listing → only quality agencies (avoids wasting exclusive on bargain hunters)
  if (dna.exclusive && agency.quality_score < 72) return false

  const countryISO = normalizeCountryToISO(prop.country)
  const hasMarketOverlap = agency.buyer_markets.some(m =>
    dna.demand_markets.includes(m) || m === countryISO
  )
  if (!hasMarketOverlap) return false

  // For rental mode: prefer agencies with residential/rental specialization
  // (don't hard-filter, but this is used in score)

  return true
}

// ─── Stealth classifier ───────────────────────────────────────────────────────

function classifyChannel(agency: Agency, prop: WizardProperty, dna: PropertyDNA): AgencyChannel {
  const isStealthEligible = dna.price_band === 'luxury' || dna.price_band === 'ultra' || dna.price_band === 'premium'
  const isStealthAgency =
    agency.quality_score >= 92 &&
    agency.historical.luxury_deals_12m >= 10 &&
    agency.price_bands.includes('luxury') &&
    agency.contact_policy !== 'blacklisted'

  if (isStealthEligible && isStealthAgency) return 'stealth'

  const propCountryISO = normalizeCountryToISO(prop.country)
  const isLocal =
    agency.country === propCountryISO ||
    (agency.regions ?? []).some(r =>
      r.toLowerCase().includes((prop.city ?? '').toLowerCase())
    )

  const isCrossBorder =
    agency.buyer_markets.length >= 3 &&
    agency.historical.cross_border_deals_12m >= 5

  if (isLocal) return 'local'
  if (isCrossBorder) return 'cross_border'
  return 'local'
}

// ─── LOCAL channel scorer (v2.0) ─────────────────────────────────────────────
// Weights: geo proximity, city match, type match, price band, speed, type-specific signals

function scoreLocal(agency: Agency, prop: WizardProperty, dna: PropertyDNA): number {
  const countryISO = normalizeCountryToISO(prop.country)
  let score = 0

  // 1. Country geo match (0–35)
  if (agency.country === countryISO) {
    score += 35
  } else {
    const NEIGHBOUR: Record<string, string[]> = {
      RS: ['ME','HR','BA','BG','HU'], ME: ['RS','HR','BA','AL'],
      HR: ['RS','ME','BA','SI','AT'], DE: ['AT','CH','NL','FR','PL'],
      AT: ['DE','CH','IT','HU','SI'],
    }
    if ((NEIGHBOUR[countryISO] ?? []).includes(agency.country)) score += 16
  }

  // 2. City match (0–18) — direct neighborhood intelligence
  const agencyCity = ((agency as any).city ?? '').toLowerCase()
  const propCity = (prop.city ?? '').toLowerCase()
  if (agencyCity && propCity) {
    if (agencyCity === propCity) score += 18
    else if (agencyCity.includes(propCity) || propCity.includes(agencyCity)) score += 10
    else if ((agency.regions ?? []).some(r => r.toLowerCase().includes(propCity))) score += 8
  }

  // 3. Property type match (0–20)
  if (agency.property_types.includes(dna.type_key as any)) score += 20

  // 4. Price band match (0–15)
  if (agency.price_bands.includes(dna.price_band as any)) score += 15

  // 5. Response speed (0–12) — local buyers respond fast
  const speedScore = Math.max(0, 12 - agency.historical.avg_response_hours * 0.4)
  score += speedScore

  // 6. Type-specific bonuses (v2.0)
  if (dna.type_key === 'land' || dna.type_key === 'commercial') {
    // Land/commercial: developer contacts and commercial specialization are critical
    if (agency.specializations.includes('commercial')) score += 8
    if (agency.specializations.includes('investment')) score += 6
    if (agency.historical.cross_border_deals_12m >= 3) score += 4  // land developers are often international
  }

  if (dna.type_key === 'apartment') {
    // Apartments: local residential expertise and turnover speed
    if (agency.specializations.includes('residential')) score += 7
    if (agency.historical.conversion_rate >= 18) score += 5
  }

  if (dna.type_key === 'new_build') {
    // New build: local new-build specialists, off-plan know-how
    if (agency.property_types.includes('new_build')) score += 8
    if (agency.specializations.includes('new_build')) score += 5
  }

  // 7. Rental mode bonus
  if (dna.is_rental) {
    if (agency.specializations.includes('residential')) score += 8
    // Rental agencies need fast local response
    if (agency.historical.avg_response_hours <= 6) score += 5
  }

  // 8. Exclusive listing: boost high-quality local agencies
  if (dna.exclusive && agency.quality_score >= 85) score += 8

  return Math.min(100, score)
}

// ─── CROSS-BORDER channel scorer (v2.0) ──────────────────────────────────────
// Weights: money-flow alignment, CB deal history, language, channel diversity, type signals

function scoreCrossBorder(agency: Agency, dna: PropertyDNA): number {
  let score = 0

  // 1. Demand market overlap (0–38)
  let flowScore = 0
  const demandWeights = dna.demand_markets.reduce((acc, m, i) => {
    acc[m] = Math.max(0.05, 0.35 - i * 0.03)  // decreasing weight by rank
    return acc
  }, {} as Record<string, number>)

  for (const market of agency.buyer_markets) {
    if (demandWeights[market]) flowScore += demandWeights[market] * 100
  }
  score += Math.min(38, flowScore * 0.75)

  // 2. Cross-border deal history (0–22)
  score += Math.min(22, agency.historical.cross_border_deals_12m * 0.85)

  // 3. Language coverage of target markets (0–18)
  const marketLangMap: Record<string, string> = {
    DE:'de', AT:'de', CH:'de', FR:'fr', RU:'ru', UA:'ru', KZ:'ru',
    GB:'en', AE:'ar', SA:'ar', US:'en', IT:'it', ES:'es',
    NL:'nl', RS:'sr', ME:'sr', HR:'hr', TR:'tr', CN:'zh', SG:'zh',
    NO:'no', SE:'sv', DK:'da', FI:'fi', PL:'pl', CZ:'cs', HU:'hu', BG:'bg', RO:'ro',
  }
  const targetLangs = [...new Set(dna.demand_markets.slice(0, 5).map(m => marketLangMap[m] ?? 'en'))]
  const langCoverage = targetLangs.filter(l => agency.languages.includes(l)).length
  score += (langCoverage / Math.max(targetLangs.length, 1)) * 18

  // 4. Response reliability (0–12) — cross-border clients need consistent follow-through
  score += agency.historical.response_rate * 0.12

  // 5. Delivery channel diversity (0–8) — WhatsApp/Telegram essential for international buyers
  if (agency.delivery_channels.includes('whatsapp')) score += 5
  if (agency.delivery_channels.includes('telegram')) score += 3

  // 6. Type-specific signals (v2.0)
  if (dna.type_key === 'villa') {
    // Villas: lifestyle buyer pipeline is critical
    if (agency.specializations.includes('luxury')) score += 6
    if (dna.has_seaside && agency.buyer_markets.some(m => ['NO','SE','DK','GB'].includes(m))) score += 4
    if (dna.has_mountain && agency.buyer_markets.some(m => ['CH','AT','DE'].includes(m))) score += 4
  }

  if (dna.type_key === 'new_build') {
    // Off-plan international investors
    if (agency.specializations.includes('investment') || agency.specializations.includes('new_build')) score += 6
  }

  if (dna.type_key === 'land') {
    // International developers
    if (agency.buyer_markets.some(m => ['DE','AT','GB','AE'].includes(m))) score += 5
    if (agency.specializations.includes('investment')) score += 4
  }

  // 7. Penthouse / luxury feature boost
  if (dna.is_penthouse || dna.has_luxury_features) {
    if (agency.price_bands.includes('premium') || agency.price_bands.includes('luxury')) score += 5
  }

  // 8. Owner-specified buyer type override — if agency covers those exact markets, boost
  if (dna.target_buyer_override.length > 0) {
    const overrideMarkets = buildOverrideMarkets(dna.target_buyer_override, '')
    const overlapCount = overrideMarkets.filter(m => agency.buyer_markets.includes(m)).length
    score += Math.min(8, overlapCount * 2)
  }

  return Math.min(100, score)
}

// ─── STEALTH channel scorer ───────────────────────────────────────────────────

function scoreStealth(agency: Agency, dna: PropertyDNA): number {
  if (dna.price_band === 'budget' || dna.price_band === 'mid') return 0

  let score = 0

  score += agency.quality_score * 0.40
  if (agency.price_bands.includes('luxury')) score += 25
  if (agency.price_bands.includes('premium') && dna.price_band === 'premium') score += 15

  const luxDeals = Math.min(25, agency.historical.luxury_deals_12m * 1.5)
  score += luxDeals

  score += Math.min(10, agency.historical.conversion_rate * 0.5)

  return Math.min(100, score)
}

// ─── Anti-fatigue layer ───────────────────────────────────────────────────────

function computeFatiguePenalty(agency: Agency): number {
  if (!agency.last_contacted) return 1.0
  const daysSince = (Date.now() - new Date(agency.last_contacted).getTime()) / 86_400_000
  if (daysSince < 7) return 0.30
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
    RU:3, UA:2, KZ:5, US:-5, CA:-5, AU:11,
  }
  const tzOffset = offsets[agencyCountry] ?? 1
  const base = new Date(now)
  const waveDay = wave === 1 ? 2 : wave === 2 ? 4 : 1
  const waveHour = wave === 1 ? 10 : wave === 2 ? 14 : 9
  const waveDelay = wave === 1 ? 0 : wave === 2 ? 2 : 7

  base.setDate(base.getDate() + waveDelay)
  while (base.getDay() !== waveDay) base.setDate(base.getDate() + 1)
  base.setHours(waveHour - tzOffset, 0, 0, 0)
  return base.toISOString()
}

// ─── Explanation builders ─────────────────────────────────────────────────────

function buildWhyMatched(
  agency: Agency,
  channel: AgencyChannel,
  prop: WizardProperty,
  dna: PropertyDNA,
  apex_score: number
): string[] {
  const reasons: string[] = []
  const countryISO = normalizeCountryToISO(prop.country)

  if (agency.country === countryISO) reasons.push(`Local expert in ${prop.country}`)
  if (agency.historical.cross_border_deals_12m >= 10)
    reasons.push(`${agency.historical.cross_border_deals_12m} cross-border deals this year`)
  if (agency.historical.response_rate >= 88)
    reasons.push(`${agency.historical.response_rate}% reply rate`)
  if (channel === 'stealth') reasons.push('Private HNW network access')
  if (channel === 'cross_border') {
    const covered = agency.buyer_markets.filter(m => dna.demand_markets.includes(m))
    if (covered.length) reasons.push(`Active buyers from ${covered.slice(0,3).join(', ')}`)
  }
  if (apex_score >= 90) reasons.push('Top 5% in database')

  // v2.0: type-specific reasons
  if (dna.type_key === 'land' && agency.specializations.includes('investment'))
    reasons.push('Developer & land investment specialist')
  if (dna.type_key === 'villa' && agency.specializations.includes('luxury'))
    reasons.push('Luxury villa specialist')
  if (dna.is_rental && agency.specializations.includes('residential'))
    reasons.push('Residential rental specialist')
  if (dna.target_buyer_override.length > 0) {
    const covered = dna.target_buyer_override.slice(0, 2).join(', ')
    reasons.push(`Matches your target: ${covered}`)
  }

  return reasons.slice(0, 3)
}

function buildDealSignals(agency: Agency, dna: PropertyDNA): string[] {
  const signals: string[] = []
  if (agency.historical.conversion_rate >= 20) signals.push('High conversion rate')
  if (agency.historical.avg_response_hours <= 8) signals.push('Fast responder (<8h)')
  if (agency.historical.luxury_deals_12m >= 5 && dna.price_band !== 'budget')
    signals.push(`${agency.historical.luxury_deals_12m} luxury deals active`)
  if (agency.delivery_channels.length >= 3) signals.push('Multi-channel outreach')
  if (dna.is_rental && agency.specializations.includes('residential'))
    signals.push('Rental specialist')
  return signals
}

// ─── MAIN APEX RUN (v2.0) ─────────────────────────────────────────────────────

export function runAPEX(prop: WizardProperty, agencies: RealAgency[] = DEMO_AGENCY_POOL): APEXResult {
  const dna = buildPropertyDNA(prop)
  const warnings: string[] = []

  // Seasonal check
  const currentMonth = new Date().getMonth() + 1
  if (!dna.seasonal_peak_months.includes(currentMonth)) {
    warnings.push(`Current month (${currentMonth}) is off-peak for this property type. Response rates may be 20–30% lower.`)
  }

  // Rental mode warning
  if (dna.is_rental) {
    warnings.push('Rental mode active: matching rental management agencies with local buyer base.')
  }

  // Filter
  const filtered = agencies.filter(a => passesFilter(a, prop, dna))

  if (filtered.length < 5) {
    warnings.push('Fewer than 5 agencies passed the filter. Consider expanding property type or location criteria.')
  }

  // Score each agency across all three channels
  const scored: APEXAgencyResult[] = filtered.map(agency => {
    const channel = classifyChannel(agency, prop, dna)
    const fatigue = computeFatiguePenalty(agency)

    const local_score = scoreLocal(agency, prop, dna)
    const cross_border_score = scoreCrossBorder(agency, dna)
    const stealth_score = scoreStealth(agency, dna)

    // Weighted APEX score using per-type channel weights
    const raw_apex =
      local_score    * dna.channel_weights.local +
      cross_border_score * dna.channel_weights.cross_border +
      stealth_score  * dna.channel_weights.stealth

    const apex_score = Math.round(raw_apex * fatigue)

    const wave: 1 | 2 | 3 =
      apex_score >= 70 ? 1 :
      apex_score >= 45 ? 2 : 3

    return {
      agency,
      channel,
      apex_score,
      local_score: Math.round(local_score),
      cross_border_score: Math.round(cross_border_score),
      stealth_score: Math.round(stealth_score),
      wave,
      send_at: computeSendAt(wave, agency.country),
      why_matched: buildWhyMatched(agency, channel, prop, dna, apex_score),
      deal_signals: buildDealSignals(agency, dna),
      fatigue_penalty: fatigue,
    }
  })

  // Sort by APEX score descending
  const results = scored.sort((a, b) => b.apex_score - a.apex_score)

  const wave1 = results.filter(r => r.wave === 1)
  const wave2 = results.filter(r => r.wave === 2)
  const wave3 = results.filter(r => r.wave === 3)
  const local = results.filter(r => r.channel === 'local')
  const cross_border = results.filter(r => r.channel === 'cross_border')
  const stealth = results.filter(r => r.channel === 'stealth')

  const send_schedule: WaveTiming[] = [
    {
      wave: 1, send_at: computeSendAt(1, 'DE'),
      agencies_count: wave1.length,
      channel: dna.is_rental ? 'LOCAL rental specialists' : 'LOCAL + CROSS-BORDER top matches',
      rationale: 'Tuesday 10:00 — highest b2b open rates. Immediate outreach to top-scored agencies.',
    },
    {
      wave: 2, send_at: computeSendAt(2, 'DE'),
      agencies_count: wave2.length,
      channel: 'CROSS-BORDER + STEALTH',
      rationale: 'Thursday 14:00 — follow-up window. Activates foreign buyer pipeline and private networks.',
    },
    {
      wave: 3, send_at: computeSendAt(3, 'DE'),
      agencies_count: wave3.length,
      channel: 'STEALTH reserve + re-targeted',
      rationale: 'Monday 09:00 — fresh week. Last-resort wave + any missed markets.',
    },
  ]

  return {
    property_dna: dna,
    total_scanned: agencies.length,
    passed_filter: filtered.length,
    results,
    wave_breakdown: { wave1, wave2, wave3 },
    channel_breakdown: { local, cross_border, stealth },
    send_schedule,
    warnings,
  }
}

// ─── DEAD LISTING DETECTION (unchanged) ──────────────────────────────────────

export interface CampaignStats {
  days_since_launch: number
  emails_sent: number
  open_rate: number
  reply_rate: number
  negative_replies: number
}

export function runDiagnosis(
  prop: WizardProperty,
  stats: CampaignStats
): DeadListingDiagnosis {
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
  if (stats.reply_rate > 0 && stats.negative_replies / Math.max(stats.reply_rate,1) > 0.7) {
    diagnoses.push('price_outlier')
  }
  const currentMonth = new Date().getMonth() + 1
  if (!dna.seasonal_peak_months.includes(currentMonth)) diagnoses.push('seasonal_mismatch')
  if ((dna.price_band === 'premium' || dna.price_band === 'luxury') && stats.days_since_launch >= 14) {
    diagnoses.push('stealth_needed')
  }
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
    wrong_channel_mix: `${stats.emails_sent} agencies received your listing, only ${stats.open_rate}% opened it. Diagnosis: email channel underperforming. Switching to WhatsApp — open rates typically 3× higher.`,
    agency_fatigue: `Agencies contacted recently are not responding. Activating fresh pool of agencies.`,
    description_weak: `Agencies opened your listing but didn't reply — the offer language isn't converting. AI is rewriting the pitch with a new angle.`,
    price_outlier: `Market is silent. Data suggests your price may be above comparable properties. Suggested adjustment: −8%.`,
    wrong_market_target: `Zero engagement from current markets. APEX is recalculating buyer profiles and switching markets.`,
    seasonal_mismatch: `Current month is off-peak for this property type. Recommend a 30-day pause or switching to STEALTH channel which operates year-round.`,
    stealth_needed: `After ${stats.days_since_launch} days, switching to private networks. Stealth agencies with direct HNW buyer access activated.`,
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
