/**
 * PropBlaze — Autonomous AI Matching Engine
 *
 * No questions to the user. The algorithm reads the property data and
 * automatically determines:
 *   1. What buyer profile this property attracts
 *   2. Which geographic markets have demand for it
 *   3. Which agencies have a proven pipeline in those markets
 *   4. How to rank and wave-distribute the list
 *
 * Architecture:
 *   Phase 1 — Property Intelligence (deterministic rules)
 *   Phase 2 — Market Routing (geo + price + type logic)
 *   Phase 3 — Agency Scoring (8 weighted dimensions)
 *   Phase 4 — Wave Assembly (ranked, deduplicated, GDPR-safe)
 *   Phase 5 — LLM Explanation (optional semantic boost)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Property {
  id: string
  type: 'apartment' | 'house' | 'villa' | 'land' | 'commercial' | 'new_build'
  price_eur: number
  location: {
    country: string          // ISO 3166-1 alpha-2  e.g. "ME"
    region?: string
    city?: string
    is_seaside?: boolean
    is_mountain?: boolean
    is_urban?: boolean
  }
  size_m2?: number
  rooms?: number
  year_built?: number
  condition?: 'new' | 'good' | 'renovation'
  features?: string[]       // e.g. ['pool', 'garage', 'sea_view']
  owner_languages?: string[] // ISO 639-1 codes  e.g. ['ru', 'en']
  target_price_band?: 'budget' | 'mid' | 'premium' | 'luxury'
}

export interface Agency {
  id: string
  name: string
  country: string            // ISO 3166-1 alpha-2
  regions?: string[]
  cities?: string[]

  // What they sell
  property_types: Array<Property['type']>
  price_bands: Array<NonNullable<Property['target_price_band']>>
  specializations: string[]  // e.g. ['cross_border', 'investment', 'luxury']

  // Buyer markets they serve (demand side)
  buyer_markets: string[]    // ISO 3166-1 alpha-2 list  e.g. ['DE', 'AT', 'CH']
  languages: string[]        // ISO 639-1 list

  // Performance
  historical: {
    response_rate: number    // 0–100
    conversion_rate: number  // 0–100
    avg_response_hours: number
    owner_direct_success_rate: number
    cross_border_deals_12m: number
    luxury_deals_12m: number
  }

  // Contact
  delivery_channels: Array<'email' | 'whatsapp' | 'telegram'>
  contact_policy: 'open' | 'invite_only' | 'blacklisted'
  last_contacted?: string    // ISO date

  // Meta
  quality_score: number      // 0–100 (manually curated)
  is_active: boolean
  created_at: string
}

export interface MatchScore {
  agency_id: string
  agency: Agency
  total_score: number        // 0–100, final weighted
  dimension_scores: {
    geo_fit: number
    type_fit: number
    price_fit: number
    buyer_profile: number
    cross_border: number
    response_rate: number
    conversion: number
    language: number
  }
  llm_boost: number          // 0–30, semantic bonus
  wave: 1 | 2 | 3
  explanation: string
  routed_markets: string[]   // markets the engine auto-selected for this agency
}

export interface MatchResult {
  property_id: string
  scored_at: string
  total_agencies_scanned: number
  agencies_passed_hard_filter: number
  match_scores: MatchScore[]
  wave_breakdown: {
    wave1: MatchScore[]
    wave2: MatchScore[]
    wave3: MatchScore[]
  }
  auto_routing: {
    detected_price_band: Property['target_price_band']
    detected_buyer_profiles: string[]
    target_markets: string[]
    recommended_languages: string[]
  }
  warnings: string[]
}

// ─── Price band auto-detection ────────────────────────────────────────────────

function detectPriceBand(price_eur: number): Property['target_price_band'] {
  if (price_eur < 150_000) return 'budget'
  if (price_eur < 500_000) return 'mid'
  if (price_eur < 1_500_000) return 'premium'
  return 'luxury'
}

// ─── Buyer profile inference ──────────────────────────────────────────────────
//
// Core insight: different property types in different countries attract
// predictable buyer archetypes. We encode this domain knowledge so the
// algorithm never has to ask the owner.

interface BuyerProfile {
  label: string
  primary_markets: string[]   // countries most likely to send buyers
  weight: number              // relative likelihood
}

function inferBuyerProfiles(prop: Property): BuyerProfile[] {
  const profiles: BuyerProfile[] = []
  const { type, price_eur, location } = prop
  const band = detectPriceBand(price_eur)

  // === CROSS-BORDER INVESTMENT ===
  // Montenegro, Serbia, Bulgaria, N.Macedonia → heavy Russian/German/UK interest
  const EMERGING_EU_COUNTRIES = ['ME', 'RS', 'BG', 'MK', 'AL', 'BA', 'XK']
  if (EMERGING_EU_COUNTRIES.includes(location.country)) {
    profiles.push({
      label: 'Russian-speaking investor',
      primary_markets: ['RU', 'UA', 'KZ', 'BY', 'AZ'],
      weight: band === 'budget' || band === 'mid' ? 0.35 : 0.25,
    })
    profiles.push({
      label: 'German/Austrian/Swiss buyer',
      primary_markets: ['DE', 'AT', 'CH'],
      weight: 0.30,
    })
    profiles.push({
      label: 'UK/Scandinavian lifestyle buyer',
      primary_markets: ['GB', 'NO', 'SE', 'DK', 'FI'],
      weight: 0.20,
    })
  }

  // === WESTERN EUROPE ===
  const WESTERN_EU = ['DE', 'AT', 'CH', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE']
  if (WESTERN_EU.includes(location.country)) {
    profiles.push({
      label: 'Domestic European buyer',
      primary_markets: [location.country, 'DE', 'FR', 'NL'],
      weight: 0.40,
    })
    if (band === 'premium' || band === 'luxury') {
      profiles.push({
        label: 'HNWI / Gulf investor',
        primary_markets: ['AE', 'SA', 'QA', 'KW'],
        weight: 0.25,
      })
      profiles.push({
        label: 'US/Canada expat',
        primary_markets: ['US', 'CA'],
        weight: 0.20,
      })
    }
  }

  // === LUXURY OVERRIDE ===
  if (band === 'luxury') {
    profiles.push({
      label: 'Ultra-HNWI global buyer',
      primary_markets: ['AE', 'SG', 'HK', 'CH', 'GB', 'US'],
      weight: 0.40,
    })
  }

  // === PROPERTY TYPE MODIFIERS ===
  if (type === 'commercial') {
    profiles.push({
      label: 'Commercial investor',
      primary_markets: ['DE', 'NL', 'US', 'AE', 'CN'],
      weight: 0.50,
    })
  }

  if (type === 'land') {
    profiles.push({
      label: 'Developer / land bank',
      primary_markets: [location.country, 'DE', 'AT', 'GB'],
      weight: 0.45,
    })
  }

  if (type === 'new_build') {
    profiles.push({
      label: 'Off-plan investor',
      primary_markets: ['RU', 'GB', 'DE', 'AE', 'CN'],
      weight: 0.35,
    })
  }

  // Seaside premium
  if (location.is_seaside && (band === 'premium' || band === 'luxury')) {
    profiles.push({
      label: 'Mediterranean lifestyle buyer',
      primary_markets: ['DE', 'AT', 'CH', 'GB', 'NO', 'SE', 'RU'],
      weight: 0.30,
    })
  }

  // Normalise weights
  const total = profiles.reduce((s, p) => s + p.weight, 0)
  return profiles.map((p) => ({ ...p, weight: p.weight / total }))
}

// ─── Target market aggregation ────────────────────────────────────────────────

function aggregateTargetMarkets(profiles: BuyerProfile[]): string[] {
  const freq: Record<string, number> = {}
  for (const p of profiles) {
    for (const m of p.primary_markets) {
      freq[m] = (freq[m] ?? 0) + p.weight
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([m]) => m)
}

// ─── Hard filters ─────────────────────────────────────────────────────────────

function passesHardFilter(agency: Agency, prop: Property, targetMarkets: string[]): boolean {
  if (!agency.is_active) return false
  if (agency.contact_policy === 'blacklisted') return false

  // Must handle the property type
  if (!agency.property_types.includes(prop.type)) return false

  // Must serve at least one of our target buyer markets
  const overlap = agency.buyer_markets.some((m) => targetMarkets.includes(m))
  if (!overlap) return false

  // Must have at least 60% price band fit
  const band = detectPriceBand(prop.price_eur) as NonNullable<Property['target_price_band']>
  if (!agency.price_bands.includes(band)) return false

  // If recently contacted (< 14 days) — skip to avoid spam
  if (agency.last_contacted) {
    const daysSince =
      (Date.now() - new Date(agency.last_contacted).getTime()) / 86_400_000
    if (daysSince < 14) return false
  }

  return true
}

// ─── Dimension scoring ────────────────────────────────────────────────────────

const WEIGHTS = {
  geo_fit:        0.20,
  type_fit:       0.15,
  price_fit:      0.10,
  buyer_profile:  0.20,
  cross_border:   0.10,
  response_rate:  0.10,
  conversion:     0.08,
  language:       0.07,
}

function scoreDimensions(
  agency: Agency,
  prop: Property,
  targetMarkets: string[],
  buyerProfiles: BuyerProfile[]
): MatchScore['dimension_scores'] {

  // 1. Geographic fit
  // Agency is in the same country as property → best. Neighbour countries → good.
  const NEIGHBOUR_CLUSTERS: Record<string, string[]> = {
    ME: ['RS', 'HR', 'BA', 'AL', 'MK'],
    RS: ['ME', 'HR', 'BA', 'BG', 'RO', 'HU'],
    HR: ['RS', 'ME', 'BA', 'SI', 'AT'],
    DE: ['AT', 'CH', 'NL', 'FR', 'PL', 'CZ'],
    AT: ['DE', 'CH', 'HU', 'SI', 'IT', 'CZ'],
  }
  let geo_fit = 60
  if (agency.country === prop.location.country) geo_fit = 100
  else if ((NEIGHBOUR_CLUSTERS[prop.location.country] ?? []).includes(agency.country)) geo_fit = 80

  // 2. Property type fit
  const type_fit = agency.property_types.includes(prop.type) ? 100 : 0

  // 3. Price band fit
  const band = detectPriceBand(prop.price_eur) as NonNullable<Property['target_price_band']>
  const price_fit = agency.price_bands.includes(band) ? 100 : 30

  // 4. Buyer profile — how well does the agency's buyer_markets overlap with our targets
  const marketOverlap = targetMarkets.filter((m) =>
    agency.buyer_markets.includes(m)
  ).length
  const buyer_profile = Math.min(100, (marketOverlap / Math.max(targetMarkets.length, 1)) * 140)

  // 5. Cross-border capability
  const is_cross_border = agency.specializations.includes('cross_border')
    || agency.buyer_markets.length >= 3
    || agency.historical.cross_border_deals_12m >= 5
  const cross_border = is_cross_border ? 100 : 40

  // 6. Response rate
  const response_rate = agency.historical.response_rate

  // 7. Conversion
  const conversion = Math.min(100, agency.historical.conversion_rate * 1.2)

  // 8. Language — does agency cover owner languages or target buyer languages?
  const ownerLangs = prop.owner_languages ?? ['en']
  const targetLangs = buyerProfiles
    .flatMap((p) =>
      p.primary_markets.map((m) => MARKET_LANGUAGE_MAP[m] ?? 'en')
    )
  const allRelevantLangs = [...new Set([...ownerLangs, ...targetLangs])]
  const langOverlap = allRelevantLangs.filter((l) =>
    agency.languages.includes(l)
  ).length
  const language = Math.min(100, (langOverlap / Math.max(allRelevantLangs.length, 1)) * 130)

  return {
    geo_fit,
    type_fit,
    price_fit,
    buyer_profile,
    cross_border,
    response_rate,
    conversion,
    language,
  }
}

const MARKET_LANGUAGE_MAP: Record<string, string> = {
  DE: 'de', AT: 'de', CH: 'de',
  FR: 'fr', BE: 'fr',
  RU: 'ru', UA: 'ru', KZ: 'ru', BY: 'ru',
  GB: 'en', US: 'en', AU: 'en', CA: 'en', IE: 'en',
  AE: 'ar', SA: 'ar', QA: 'ar',
  RS: 'sr', ME: 'sr', BA: 'sr', HR: 'hr',
  IT: 'it', ES: 'es', PT: 'pt',
  NL: 'nl', PL: 'pl', CZ: 'cs', HU: 'hu',
  TR: 'tr', CN: 'zh', SG: 'zh',
  NO: 'no', SE: 'sv', DK: 'da', FI: 'fi',
}

function computeRuleScore(dims: MatchScore['dimension_scores']): number {
  return Object.entries(WEIGHTS).reduce((total, [key, w]) => {
    return total + (dims[key as keyof typeof dims] ?? 0) * w
  }, 0)
}

// ─── Wave assignment ───────────────────────────────────────────────────────────

function assignWaves(scores: MatchScore[]): MatchScore[] {
  return scores.map((s, i) => ({
    ...s,
    wave: i < 10 ? 1 : i < 20 ? 2 : 3,
  }))
}

// ─── Explanation builder ───────────────────────────────────────────────────────

function buildExplanation(
  agency: Agency,
  dims: MatchScore['dimension_scores'],
  routedMarkets: string[],
  prop: Property
): string {
  const parts: string[] = []

  if (dims.buyer_profile >= 80) {
    parts.push(
      `Strong buyer pipeline in ${routedMarkets.slice(0, 2).join(' and ')} — key demand markets for this property.`
    )
  }

  if (agency.historical.cross_border_deals_12m >= 5) {
    parts.push(
      `${agency.historical.cross_border_deals_12m} cross-border deals closed in the last 12 months.`
    )
  }

  if (dims.response_rate >= 85) {
    parts.push(`Responds within ${agency.historical.avg_response_hours}h on average (${agency.historical.response_rate}% rate).`)
  }

  if (dims.geo_fit === 100) {
    parts.push(`Based in ${prop.location.country} — local market expertise.`)
  } else if (dims.geo_fit >= 80) {
    parts.push(`Active in neighbouring markets with cross-country reach.`)
  }

  if (agency.specializations.includes('luxury') && detectPriceBand(prop.price_eur) === 'luxury') {
    parts.push(`Luxury specialist — ${agency.historical.luxury_deals_12m} high-end deals this year.`)
  }

  return parts.length > 0
    ? parts.join(' ')
    : `Quality-vetted agency with solid fundamentals for this property type and region.`
}

// ─── Main engine entry point ──────────────────────────────────────────────────

export async function runMatchingEngine(
  prop: Property,
  agencies: Agency[],
  llmBoostFn?: (agency: Agency, prop: Property) => Promise<number>
): Promise<MatchResult> {

  const warnings: string[] = []

  // Phase 1 — Property intelligence
  const detectedBand = detectPriceBand(prop.price_eur)
  const buyerProfiles = inferBuyerProfiles(prop)
  const targetMarkets = aggregateTargetMarkets(buyerProfiles)

  // Phase 2 — Hard filter
  const passed = agencies.filter((a) =>
    passesHardFilter(a, prop, targetMarkets)
  )

  if (passed.length === 0) {
    warnings.push(
      'No agencies passed hard filters. Consider expanding price band or property type coverage.'
    )
  }

  if (passed.length < 10) {
    warnings.push(
      `Only ${passed.length} agencies matched hard filters. Wave 1 may be smaller than usual.`
    )
  }

  // Phase 3 — Dimension scoring
  let scored: MatchScore[] = passed.map((agency) => {
    const dims = scoreDimensions(agency, prop, targetMarkets, buyerProfiles)
    const ruleScore = computeRuleScore(dims)

    // Which target markets does this specific agency cover?
    const routedMarkets = targetMarkets.filter((m) =>
      agency.buyer_markets.includes(m)
    )

    return {
      agency_id: agency.id,
      agency,
      total_score: ruleScore * 0.8, // LLM boost applied later
      dimension_scores: dims,
      llm_boost: 0,
      wave: 1,
      explanation: buildExplanation(agency, dims, routedMarkets, prop),
      routed_markets: routedMarkets,
    }
  })

  // Phase 4 — Optional LLM boost (top 100 only for cost efficiency)
  if (llmBoostFn) {
    const top100 = scored
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 100)

    const boosts = await Promise.allSettled(
      top100.map((s) => llmBoostFn(s.agency, prop))
    )

    top100.forEach((s, i) => {
      const result = boosts[i]
      const boost = result.status === 'fulfilled' ? Math.min(30, Math.max(0, result.value)) : 0
      s.llm_boost = boost
      s.total_score = s.total_score + boost * 0.2
    })

    // Merge back
    scored = [
      ...top100,
      ...scored.slice(100),
    ]
  }

  // Apply penalty for agencies contacted recently (beyond hard filter — soft penalty)
  scored = scored.map((s) => {
    if (!s.agency.last_contacted) return s
    const daysSince = (Date.now() - new Date(s.agency.last_contacted).getTime()) / 86_400_000
    if (daysSince < 60) {
      return { ...s, total_score: s.total_score * 0.7 }
    }
    return s
  })

  // Sort
  scored.sort((a, b) => b.total_score - a.total_score)

  // Phase 5 — Wave assignment
  const waved = assignWaves(scored)

  // Recommended languages for the AI-generated pitch
  const recommendedLanguages = [
    ...new Set(
      buyerProfiles
        .flatMap((p) => p.primary_markets.map((m) => MARKET_LANGUAGE_MAP[m] ?? 'en'))
        .concat(prop.owner_languages ?? ['en'])
    ),
  ].slice(0, 4)

  return {
    property_id: prop.id,
    scored_at: new Date().toISOString(),
    total_agencies_scanned: agencies.length,
    agencies_passed_hard_filter: passed.length,
    match_scores: waved,
    wave_breakdown: {
      wave1: waved.filter((s) => s.wave === 1),
      wave2: waved.filter((s) => s.wave === 2),
      wave3: waved.filter((s) => s.wave === 3),
    },
    auto_routing: {
      detected_price_band: detectedBand,
      detected_buyer_profiles: buyerProfiles.map((p) => p.label),
      target_markets: targetMarkets,
      recommended_languages: recommendedLanguages,
    },
    warnings,
  }
}

// ─── Convenience: run with demo agency pool ───────────────────────────────────

export async function runDemoMatching(prop: Property): Promise<MatchResult> {
  const { DEMO_AGENCY_POOL } = await import('./demo-agencies')
  return runMatchingEngine(prop, DEMO_AGENCY_POOL)
}
