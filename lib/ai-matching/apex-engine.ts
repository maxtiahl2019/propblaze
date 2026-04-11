/**
 * PropBlaze APEX Matching Engine v1.0
 * Autonomous Property Exchange Intelligence
 *
 * Three-channel architecture:
 *   LOCAL CHANNEL      (35%) — agencies with local buyer base
 *   CROSS-BORDER       (40%) — agencies with foreign buyer pipeline
 *   STEALTH NETWORK    (25%) — private/off-market agencies, HNW access
 *
 * + Dead Listing Detection: auto-diagnosis if no replies in 7 days
 */

import type { Agency } from './engine'
import { DEMO_AGENCY_POOL, type RealAgency } from './demo-agencies'

// ─── Input from wizard ─────────────────────────────────────────────────────────

export interface WizardProperty {
  type: string
  address: string
  city: string
  country: string
  areaSqm: number
  bedrooms: number
  bathrooms: number
  mode: 'sale' | 'rent'
  price: number
  currency: string
  description?: string
  features?: string[]
  isOffMarket?: boolean
}

// ─── Output types ──────────────────────────────────────────────────────────────

export type AgencyChannel = 'local' | 'cross_border' | 'stealth'

export interface APEXAgencyResult {
  agency: RealAgency
  channel: AgencyChannel
  apex_score: number         // 0–100 final
  local_score: number
  cross_border_score: number
  stealth_score: number
  wave: 1 | 2 | 3
  send_at: string            // ISO timestamp — when to send
  why_matched: string[]      // human-readable reasons
  deal_signals: string[]     // active signals (buyer pipeline, urgency, etc.)
  fatigue_penalty: number    // 0–1 multiplier
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
  seller_urgency: number       // 0–10
  liquidity_score: number      // 0–10
  demand_markets: string[]     // target buyer countries
  buyer_archetypes: string[]
  seasonal_peak_months: number[]
  is_off_market: boolean
  channel_weights: { local: number; cross_border: number; stealth: number }
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
  | 'price_outlier'
  | 'wrong_channel_mix'
  | 'agency_fatigue'
  | 'wrong_market_target'
  | 'seasonal_mismatch'
  | 'description_weak'
  | 'stealth_needed'

export type RecampaignStrategy = 'A' | 'B' | 'C' | 'D'

export interface DeadListingDiagnosis {
  days_since_launch: number
  open_rate: number           // 0–100
  reply_rate: number          // 0–100
  diagnosis: DiagnosisType[]
  primary_diagnosis: DiagnosisType
  confidence: number          // 0–100
  recommended_strategy: RecampaignStrategy
  strategy_description: string
  owner_message: string
  action_items: string[]
  price_adjustment_suggested?: number   // % to reduce
}

// ─── Money Flow Matrix ────────────────────────────────────────────────────────
// Who actually buys in each country right now (weighted by market share)

const MONEY_FLOW: Record<string, { market: string; share: number }[]> = {
  RS: [
    { market: 'DE', share: 0.31 },
    { market: 'RU', share: 0.28 },
    { market: 'GB', share: 0.14 },
    { market: 'AE', share: 0.11 },
    { market: 'CH', share: 0.08 },
    { market: 'US', share: 0.05 },
    { market: 'AT', share: 0.03 },
  ],
  ME: [
    { market: 'RU', share: 0.34 },
    { market: 'DE', share: 0.22 },
    { market: 'SA', share: 0.14 },
    { market: 'GB', share: 0.12 },
    { market: 'AE', share: 0.09 },
    { market: 'CH', share: 0.05 },
    { market: 'FR', share: 0.04 },
  ],
  HR: [
    { market: 'DE', share: 0.38 },
    { market: 'AT', share: 0.18 },
    { market: 'NL', share: 0.14 },
    { market: 'GB', share: 0.12 },
    { market: 'CH', share: 0.08 },
    { market: 'BE', share: 0.06 },
    { market: 'RU', share: 0.04 },
  ],
  GR: [
    { market: 'DE', share: 0.26 },
    { market: 'GB', share: 0.22 },
    { market: 'US', share: 0.16 },
    { market: 'AE', share: 0.12 },
    { market: 'FR', share: 0.10 },
    { market: 'CN', share: 0.08 },
    { market: 'RU', share: 0.06 },
  ],
  PT: [
    { market: 'GB', share: 0.30 },
    { market: 'FR', share: 0.22 },
    { market: 'DE', share: 0.16 },
    { market: 'US', share: 0.12 },
    { market: 'BR', share: 0.10 },
    { market: 'NL', share: 0.06 },
    { market: 'CH', share: 0.04 },
  ],
  ES: [
    { market: 'GB', share: 0.28 },
    { market: 'DE', share: 0.20 },
    { market: 'FR', share: 0.16 },
    { market: 'NL', share: 0.10 },
    { market: 'BE', share: 0.08 },
    { market: 'US', share: 0.08 },
    { market: 'SE', share: 0.06 },
    { market: 'NO', share: 0.04 },
  ],
  DE: [
    { market: 'DE', share: 0.45 },
    { market: 'AT', share: 0.15 },
    { market: 'CH', share: 0.12 },
    { market: 'NL', share: 0.08 },
    { market: 'US', share: 0.08 },
    { market: 'GB', share: 0.07 },
    { market: 'FR', share: 0.05 },
  ],
}

function getTargetMarkets(countryISO: string): string[] {
  const flows = MONEY_FLOW[countryISO] ?? [
    { market: 'DE', share: 0.30 },
    { market: 'GB', share: 0.25 },
    { market: 'RU', share: 0.20 },
    { market: 'AE', share: 0.15 },
    { market: 'FR', share: 0.10 },
  ]
  return flows.sort((a, b) => b.share - a.share).map(f => f.market)
}

// ─── Property DNA builder ─────────────────────────────────────────────────────

function buildPropertyDNA(prop: WizardProperty): PropertyDNA {
  const priceEUR = prop.currency === 'EUR' ? prop.price
    : prop.currency === 'USD' ? prop.price * 0.92
    : prop.currency === 'CHF' ? prop.price * 1.03
    : prop.price * 0.0085  // RSD

  const price_band: PropertyDNA['price_band'] =
    priceEUR < 150_000 ? 'budget' :
    priceEUR < 500_000 ? 'mid' :
    priceEUR < 1_500_000 ? 'premium' :
    priceEUR < 5_000_000 ? 'luxury' : 'ultra'

  // Buyer archetypes by property type
  const archetypeMap: Record<string, string[]> = {
    apartment:   ['yield_investor', 'relocation_family', 'lifestyle_second_home'],
    house:       ['relocation_family', 'lifestyle_migrant', 'lifestyle_second_home'],
    villa:       ['lifestyle_second_home', 'capital_preserver', 'ultra_hnwi'],
    land:        ['developer_landbank', 'yield_investor', 'capital_preserver'],
    commercial:  ['yield_investor', 'commercial_investor', 'developer_landbank'],
    new_build:   ['off_plan_investor', 'yield_investor', 'relocation_family'],
  }

  const type_key = prop.type.toLowerCase().replace(/\s+/g, '_')
  const buyer_archetypes = archetypeMap[type_key] ?? ['yield_investor', 'lifestyle_migrant']

  // Luxury override
  if (price_band === 'luxury' || price_band === 'ultra') {
    buyer_archetypes.unshift('ultra_hnwi', 'capital_preserver')
  }

  // Seasonal peak: land/commercial → year-round; sea → Feb-May; city → Sep-Nov
  const seasonal_peak_months =
    type_key === 'land' || type_key === 'commercial' ? [1,2,3,4,5,6,7,8,9,10,11,12] :
    prop.city?.toLowerCase().includes('coast') ||
    prop.country === 'ME' || prop.country === 'HR' || prop.country === 'GR' ? [2,3,4,5,9,10] :
    [9, 10, 11, 1, 2, 3]

  // Seller urgency: inferred (neutral 5 unless price is very low → urgency high)
  const seller_urgency = 5

  // Liquidity: land is less liquid; apartment in capital city is most liquid
  const liquidityMap: Record<string, number> = {
    apartment: 8, house: 7, villa: 6, new_build: 7, commercial: 5, land: 4
  }
  const liquidity_score = liquidityMap[type_key] ?? 5

  // ISO country code (normalize)
  const countryISO = normalizeCountryToISO(prop.country)
  const demand_markets = getTargetMarkets(countryISO)

  // Channel weights — depends on price band and type
  const channel_weights = {
    local: type_key === 'commercial' || type_key === 'land' ? 0.45 : 0.35,
    cross_border: type_key === 'villa' || price_band === 'premium' || price_band === 'luxury' ? 0.50 : 0.40,
    stealth: price_band === 'luxury' || price_band === 'ultra' ? 0.35 : price_band === 'premium' ? 0.20 : 0.10,
  }

  // Normalize channel weights to sum to 1
  const total = channel_weights.local + channel_weights.cross_border + channel_weights.stealth
  channel_weights.local = channel_weights.local / total
  channel_weights.cross_border = channel_weights.cross_border / total
  channel_weights.stealth = channel_weights.stealth / total

  return {
    price_band,
    price_eur: priceEUR,
    seller_urgency,
    liquidity_score,
    demand_markets,
    buyer_archetypes,
    seasonal_peak_months,
    is_off_market: prop.isOffMarket ?? false,
    channel_weights,
  }
}

// ─── Country ISO normalizer ───────────────────────────────────────────────────

function normalizeCountryToISO(country: string): string {
  const map: Record<string, string> = {
    'serbia': 'RS', 'montenegro': 'ME', 'croatia': 'HR',
    'germany': 'DE', 'austria': 'AT', 'france': 'FR',
    'spain': 'ES', 'portugal': 'PT', 'italy': 'IT',
    'greece': 'GR', 'netherlands': 'NL', 'poland': 'PL',
    'united kingdom': 'GB', 'uk': 'GB', 'uae': 'AE',
    'united arab emirates': 'AE', 'switzerland': 'CH',
    'sweden': 'SE', 'norway': 'NO', 'czech republic': 'CZ',
    'russia': 'RU', 'bulgaria': 'BG', 'romania': 'RO',
  }
  return map[country.toLowerCase()] ?? country.substring(0, 2).toUpperCase()
}

// ─── Stealth classifier ───────────────────────────────────────────────────────
// An agency is "stealth" if it works quietly at premium level

// FIX P0-4: classifyChannel now uses property country (not demand_markets[0])
// Previously was comparing agency country to buyer country (RU for ME) — causing all
// Montenegro agencies to be misclassified as cross_border instead of local.
function classifyChannel(agency: Agency, prop: WizardProperty, dna: PropertyDNA): AgencyChannel {
  const isStealthEligible = dna.price_band === 'luxury' || dna.price_band === 'ultra' || dna.price_band === 'premium'
  const isStealthAgency =
    agency.quality_score >= 92 &&
    agency.historical.luxury_deals_12m >= 10 &&
    agency.price_bands.includes('luxury') &&
    agency.contact_policy !== 'blacklisted'

  if (isStealthEligible && isStealthAgency) return 'stealth'

  // LOCAL = agency is in the SAME country as the property (or neighbouring)
  const propCountryISO = normalizeCountryToISO(prop.country)
  const isLocal =
    agency.country === propCountryISO ||
    (agency.regions ?? []).some(r =>
      r.toLowerCase().includes(prop.city?.toLowerCase() ?? '')
    )

  const isCrossBorder =
    agency.buyer_markets.length >= 3 &&
    agency.historical.cross_border_deals_12m >= 5

  if (isLocal) return 'local'
  if (isCrossBorder) return 'cross_border'
  return 'local'
}

// ─── LOCAL channel scorer ─────────────────────────────────────────────────────

function scoreLocal(agency: Agency, prop: WizardProperty, dna: PropertyDNA): number {
  const countryISO = normalizeCountryToISO(prop.country)
  let score = 0

  // Same country → strong base
  if (agency.country === countryISO) score += 35
  else {
    const NEIGHBOUR: Record<string, string[]> = {
      RS: ['ME','HR','BA','BG','HU'], ME: ['RS','HR','BA','AL'],
      HR: ['RS','ME','BA','SI','AT'], DE: ['AT','CH','NL','FR'],
    }
    if ((NEIGHBOUR[countryISO] ?? []).includes(agency.country)) score += 18
  }

  // City match bonus (Neighbourhood Intel)
  const agencyCities = (agency as any).city ? [(agency as any).city.toLowerCase()] : []
  if (agencyCities.some((c: string) => c.includes(prop.city.toLowerCase()))) score += 15

  // Local buyer ratio
  const localBuyerRatio = agency.buyer_markets.filter(m => m === countryISO).length
  score += localBuyerRatio * 10

  // Type match
  const typeKey = prop.type.toLowerCase().replace(/\s+/g,'_') as any
  if (agency.property_types.includes(typeKey)) score += 20

  // Price band match
  if (agency.price_bands.includes(dna.price_band as any)) score += 15

  // Response speed (faster = better for local market)
  const speedScore = Math.max(0, 15 - agency.historical.avg_response_hours * 0.5)
  score += speedScore

  return Math.min(100, score)
}

// ─── CROSS-BORDER channel scorer ──────────────────────────────────────────────

function scoreCrossBorder(agency: Agency, dna: PropertyDNA): number {
  let score = 0

  // Money flow alignment — how well does this agency's buyer markets match our target?
  const flows = MONEY_FLOW[Object.keys(MONEY_FLOW).find(k =>
    dna.demand_markets[0] === MONEY_FLOW[k]?.[0]?.market
  ) ?? ''] ?? []

  let flowScore = 0
  for (const flow of flows) {
    if (agency.buyer_markets.includes(flow.market)) {
      flowScore += flow.share * 100
    }
  }
  score += Math.min(35, flowScore * 0.8)

  // Cross-border deal history
  const cbDeals = Math.min(25, agency.historical.cross_border_deals_12m * 0.9)
  score += cbDeals

  // Language coverage of target markets
  const marketLangMap: Record<string, string> = {
    DE:'de', AT:'de', CH:'de', FR:'fr', RU:'ru', GB:'en', AE:'ar',
    US:'en', IT:'it', ES:'es', NL:'nl', RS:'sr', ME:'sr',
  }
  const targetLangs = dna.demand_markets.slice(0, 4).map(m => marketLangMap[m] ?? 'en')
  const langCoverage = targetLangs.filter(l => agency.languages.includes(l)).length
  score += (langCoverage / Math.max(targetLangs.length, 1)) * 20

  // Response rate (essential for cross-border — they need to be reliable)
  score += agency.historical.response_rate * 0.12

  // Channel diversity (cross-border needs WhatsApp/Telegram, not just email)
  if (agency.delivery_channels.includes('whatsapp')) score += 5
  if (agency.delivery_channels.includes('telegram')) score += 3

  return Math.min(100, score)
}

// ─── STEALTH channel scorer ───────────────────────────────────────────────────

function scoreStealth(agency: Agency, dna: PropertyDNA): number {
  if (dna.price_band === 'budget' || dna.price_band === 'mid') return 0

  let score = 0

  // Premium network access: quality score is a proxy for exclusivity
  score += agency.quality_score * 0.40

  // Ticket alignment: luxury agencies for luxury property
  if (agency.price_bands.includes('luxury')) score += 25
  if (agency.price_bands.includes('premium') && dna.price_band === 'premium') score += 15

  // Luxury deal volume
  const luxDeals = Math.min(25, agency.historical.luxury_deals_12m * 1.5)
  score += luxDeals

  // Conversion rate (stealth agencies close, not just talk)
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

// ─── Hard filter ─────────────────────────────────────────────────────────────

function passesFilter(agency: Agency, prop: WizardProperty, dna: PropertyDNA): boolean {
  if (!agency.is_active) return false
  if (agency.contact_policy === 'blacklisted') return false

  const typeKey = prop.type.toLowerCase().replace(/\s+/g,'_') as any
  if (!agency.property_types.includes(typeKey)) return false

  // Must overlap with at least one target market or property country
  const countryISO = normalizeCountryToISO(prop.country)
  const hasMarketOverlap = agency.buyer_markets.some(m =>
    dna.demand_markets.includes(m) || m === countryISO
  )
  if (!hasMarketOverlap) return false

  return true
}

// ─── Wave timing ─────────────────────────────────────────────────────────────
// Smart send times: Tue 10:00 → Thu 14:00 → Mon 09:00 (agency local time)

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

  // Wave 1: next Tuesday 10:00 agency time
  // Wave 2: next Thursday 14:00
  // Wave 3: following Monday 09:00
  const waveDay = wave === 1 ? 2 : wave === 2 ? 4 : 1  // 0=Sun, 1=Mon...
  const waveHour = wave === 1 ? 10 : wave === 2 ? 14 : 9
  const waveDelay = wave === 1 ? 0 : wave === 2 ? 2 : 7  // days from now

  base.setDate(base.getDate() + waveDelay)
  // Adjust to nearest correct day-of-week
  while (base.getDay() !== waveDay) base.setDate(base.getDate() + 1)
  base.setHours(waveHour - tzOffset, 0, 0, 0)
  return base.toISOString()
}

// ─── Why-matched explanation builder ─────────────────────────────────────────

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

  return reasons.slice(0, 3)
}

function buildDealSignals(agency: Agency, dna: PropertyDNA): string[] {
  const signals: string[] = []
  if (agency.historical.conversion_rate >= 20) signals.push('High conversion rate')
  if (agency.historical.avg_response_hours <= 8) signals.push('Fast responder (<8h)')
  if (agency.historical.luxury_deals_12m >= 5 && dna.price_band !== 'budget')
    signals.push(`${agency.historical.luxury_deals_12m} luxury deals active`)
  if (agency.delivery_channels.length >= 3) signals.push('Multi-channel outreach')
  return signals
}

// ─── MAIN APEX RUN ────────────────────────────────────────────────────────────

export function runAPEX(prop: WizardProperty, agencies: RealAgency[] = DEMO_AGENCY_POOL): APEXResult {
  const dna = buildPropertyDNA(prop)
  const warnings: string[] = []

  // Current month seasonal check
  const currentMonth = new Date().getMonth() + 1
  if (!dna.seasonal_peak_months.includes(currentMonth)) {
    warnings.push(`Current month (${currentMonth}) is off-peak for this property type. Response rates may be 20–30% lower.`)
  }

  // Filter
  const filtered = agencies.filter(a => passesFilter(a, prop, dna))

  if (filtered.length < 5) {
    warnings.push('Fewer than 5 agencies passed the filter. Consider expanding property type or location criteria.')
  }

  // Score each agency in all three channels
  const scored: APEXAgencyResult[] = filtered.map(agency => {
    const channel = classifyChannel(agency, prop, dna)
    const fatigue = computeFatiguePenalty(agency)

    const local_score = scoreLocal(agency, prop, dna)
    const cross_border_score = scoreCrossBorder(agency, dna)
    const stealth_score = scoreStealth(agency, dna)

    // Weighted APEX score based on channel + property DNA weights
    const raw_apex =
      local_score * dna.channel_weights.local +
      cross_border_score * dna.channel_weights.cross_border +
      stealth_score * dna.channel_weights.stealth

    const apex_score = Math.round(raw_apex * fatigue)

    // Wave assignment
    const wave: 1 | 2 | 3 =
      apex_score >= 70 ? 1 :
      apex_score >= 45 ? 2 : 3

    const send_at = computeSendAt(wave, agency.country)
    const why_matched = buildWhyMatched(agency, channel, prop, dna, apex_score)
    const deal_signals = buildDealSignals(agency, dna)

    return {
      agency,
      channel,
      apex_score,
      local_score: Math.round(local_score),
      cross_border_score: Math.round(cross_border_score),
      stealth_score: Math.round(stealth_score),
      wave,
      send_at,
      why_matched,
      deal_signals,
      fatigue_penalty: fatigue,
    }
  })

  // Sort by APEX score descending
  const results = scored.sort((a, b) => b.apex_score - a.apex_score)

  // Wave/channel breakdowns
  const wave1 = results.filter(r => r.wave === 1)
  const wave2 = results.filter(r => r.wave === 2)
  const wave3 = results.filter(r => r.wave === 3)

  const local = results.filter(r => r.channel === 'local')
  const cross_border = results.filter(r => r.channel === 'cross_border')
  const stealth = results.filter(r => r.channel === 'stealth')

  // Send schedule
  const send_schedule: WaveTiming[] = [
    {
      wave: 1, send_at: computeSendAt(1, 'DE'),
      agencies_count: wave1.length,
      channel: 'LOCAL + CROSS-BORDER top matches',
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

// ─── DEAD LISTING DETECTION ───────────────────────────────────────────────────

export interface CampaignStats {
  days_since_launch: number
  emails_sent: number
  open_rate: number       // 0–100
  reply_rate: number      // 0–100
  negative_replies: number
}

export function runDiagnosis(
  prop: WizardProperty,
  stats: CampaignStats
): DeadListingDiagnosis {
  const dna = buildPropertyDNA(prop)
  const diagnoses: DiagnosisType[] = []

  // Rule 1: Low open rate → delivery/channel problem
  if (stats.open_rate < 30) {
    diagnoses.push('wrong_channel_mix')
    if (stats.days_since_launch > 10) diagnoses.push('agency_fatigue')
  }

  // Rule 2: High open, zero replies → content or price problem
  if (stats.open_rate >= 50 && stats.reply_rate === 0) {
    diagnoses.push('description_weak')
    diagnoses.push('price_outlier')
  }

  // Rule 3: All replies are negative → price confirmed outlier
  if (stats.reply_rate > 0 && stats.negative_replies / Math.max(stats.reply_rate,1) > 0.7) {
    diagnoses.push('price_outlier')
  }

  // Rule 4: Seasonal mismatch
  const currentMonth = new Date().getMonth() + 1
  if (!dna.seasonal_peak_months.includes(currentMonth)) {
    diagnoses.push('seasonal_mismatch')
  }

  // Rule 5: If premium/luxury and no stealth yet → recommend stealth
  if ((dna.price_band === 'premium' || dna.price_band === 'luxury') && stats.days_since_launch >= 14) {
    diagnoses.push('stealth_needed')
  }

  // Rule 6: Zero opens at all → wrong market targeting
  if (stats.open_rate === 0 && stats.emails_sent >= 5) {
    diagnoses.push('wrong_market_target')
  }

  const primary = diagnoses[0] ?? 'wrong_channel_mix'

  // Strategy selection
  const strategyMap: Record<DiagnosisType, RecampaignStrategy> = {
    wrong_channel_mix: 'A',
    agency_fatigue: 'B',
    description_weak: 'C',
    price_outlier: 'C',
    wrong_market_target: 'B',
    seasonal_mismatch: 'D',
    stealth_needed: 'D',
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
    agency_fatigue: `Agencies contacted recently are not responding. Activating fresh pool of ${Math.min(20, DEMO_AGENCY_POOL.length)} new agencies.`,
    description_weak: `Agencies opened your listing but didn't reply — the offer language isn't converting. AI is rewriting the pitch with a new angle.`,
    price_outlier: `Market is silent. Data suggests your price may be ${Math.round(dna.price_eur * 0.08 / 1000)}k above comparable properties. Suggested adjustment: −8%.`,
    wrong_market_target: `Zero engagement from current markets. APEX is recalculating buyer profiles and switching to ${dna.demand_markets.slice(2,5).join(', ')} markets.`,
    seasonal_mismatch: `Current month is off-peak for this property type. Recommend a 30-day pause or switching to STEALTH channel which operates year-round.`,
    stealth_needed: `After ${stats.days_since_launch} days, switching to private networks. 6 stealth agencies have been identified with direct HNW buyer access.`,
  }

  const priceSuggestion = primary === 'price_outlier'
    ? -8
    : primary === 'description_weak' ? undefined : undefined

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
    price_adjustment_suggested: priceSuggestion ?? undefined,
  }
}
