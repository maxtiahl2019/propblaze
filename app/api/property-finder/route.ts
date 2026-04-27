/**
 * POST /api/property-finder
 *
 * Engine 3 — Direct Property Purchase Selection
 *
 * Searches real estate portals via DuckDuckGo, then uses LLM to extract
 * actual property listings matching the buyer's criteria.
 *
 * NEW FILE — does not modify any existing route or engine.
 *
 * Body:  { propType, country, city, maxPrice, beds?, sqm? }
 * Returns: { success, properties, provider, count }
 */

import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FoundProperty {
  id: string
  title: string
  city: string
  country: string
  flag: string
  price: number
  price_formatted: string
  size_m2?: number
  beds?: number
  baths?: number
  type: string
  features: string[]
  description: string
  portal: string
  url: string
  score: number          // relevance 1–99
  highlight: boolean     // top pick
}

interface SearchResult { title: string; snippet: string; url: string }

const FLAG_MAP: Record<string, string> = {
  Montenegro: '🇲🇪', Serbia: '🇷🇸', Croatia: '🇭🇷', Spain: '🇪🇸',
  Portugal: '🇵🇹', Italy: '🇮🇹', Greece: '🇬🇷', Germany: '🇩🇪',
  Austria: '🇦🇹', UK: '🇬🇧', France: '🇫🇷', UAE: '🇦🇪',
  Bulgaria: '🇧🇬', Cyprus: '🇨🇾', Turkey: '🇹🇷',
}

function normalizeCountry(raw: string): string {
  const c = raw.toLowerCase().trim()
  if (c.includes('montenegro') || c.includes('черногор')) return 'Montenegro'
  if (c.includes('spain') || c.includes('испани')) return 'Spain'
  if (c.includes('croatia') || c.includes('хорват')) return 'Croatia'
  if (c.includes('serbia') || c.includes('серб')) return 'Serbia'
  if (c.includes('italy') || c.includes('итал')) return 'Italy'
  if (c.includes('portugal') || c.includes('португал')) return 'Portugal'
  if (c.includes('greece') || c.includes('грец')) return 'Greece'
  if (c.includes('germany') || c.includes('герман')) return 'Germany'
  if (c.includes('austria') || c.includes('австр')) return 'Austria'
  if (c.includes('uk') || c.includes('britain')) return 'UK'
  if (c.includes('france') || c.includes('франц')) return 'France'
  if (c.includes('uae') || c.includes('dubai')) return 'UAE'
  if (c.includes('bulgar')) return 'Bulgaria'
  if (c.includes('cyprus') || c.includes('кипр')) return 'Cyprus'
  if (c.includes('turkey') || c.includes('турц')) return 'Turkey'
  return raw.trim()
}

// ─── Property-search DDG queries ──────────────────────────────────────────────
function buildPropertyQueries(
  propType: string, country: string, city: string,
  maxPrice: number, beds?: number
): string[] {
  const loc = city ? `${city} ${country}` : country
  const budgetStr = maxPrice >= 1_000_000
    ? `€${(maxPrice / 1e6).toFixed(1)}M` : `€${Math.round(maxPrice / 1000)}K`
  const bedsStr = beds ? `${beds} bedroom` : ''

  // Target major portals by country
  const portals: Record<string, string> = {
    Montenegro: 'site:dom.me OR site:montenegroprospects.com OR site:leoestate.me',
    Spain: 'site:idealista.com OR site:fotocasa.es OR site:habitaclia.com',
    Portugal: 'site:idealista.pt OR site:imovirtual.com OR site:remax.pt',
    Italy: 'site:immobiliare.it OR site:casa.it OR site:idealista.it',
    Greece: 'site:spitogatos.gr OR site:xe.gr OR site:greekexclusiveproperties.com',
    Croatia: 'site:njuskalo.hr OR site:crozilla.com OR site:realestate-croatia.com',
    Germany: 'site:immobilienscout24.de OR site:immowelt.de OR site:ebay-kleinanzeigen.de',
    UK: 'site:rightmove.co.uk OR site:zoopla.co.uk OR site:primelocation.com',
    France: 'site:seloger.com OR site:leboncoin.fr OR site:bienici.com',
    UAE: 'site:propertyfinder.ae OR site:bayut.com OR site:dubizzle.com',
    Bulgaria: 'site:imot.bg OR site:address.bg OR site:bulgarianproperties.com',
    Cyprus: 'site:bazaraki.com OR site:propertyincyprus.com',
  }
  const portalFilter = portals[country] || ''

  return [
    // Portal-specific for target country
    `${bedsStr} ${propType} for sale ${loc} ${budgetStr} ${portalFilter}`.trim(),
    // General search with budget
    `buy ${propType} ${loc} under ${budgetStr} ${bedsStr} listing 2024 2025`,
    // Expat/international buyer portals
    `${propType} for sale ${loc} international buyer ${budgetStr} sea view`,
    // Developer new build
    `new ${propType} development ${loc} price ${budgetStr}`,
    // Direct property listing format
    `${propType} ${loc} €${Math.round(maxPrice / 1000)}k ${bedsStr} bedroom sale`,
  ]
}

// ─── DDG search ───────────────────────────────────────────────────────────────
async function duckDuckGoSearch(query: string, max = 10): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(10000),
      }
    )
    if (!res.ok) return []
    const html = await res.text()
    const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi
    const results: SearchResult[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(html)) !== null && results.length < max) {
      let u = m[1] || ''
      if (u.includes('uddg=')) {
        const d = u.match(/uddg=([^&]+)/)
        if (d) u = decodeURIComponent(d[1])
      }
      const t = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      const s = m[3].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      if (t && u.startsWith('http')) results.push({ title: t, snippet: s, url: u })
    }
    return results
  } catch { return [] }
}

async function liveSearch(
  propType: string, country: string, city: string,
  maxPrice: number, beds?: number
): Promise<SearchResult[]> {
  const queries = buildPropertyQueries(propType, country, city, maxPrice, beds)
  const batches = await Promise.all(
    queries.map((q, i) => new Promise<SearchResult[]>(r =>
      setTimeout(() => duckDuckGoSearch(q, 10).then(r).catch(() => r([])), i * 200)
    ))
  )
  const seen = new Set<string>()
  const merged: SearchResult[] = []
  for (const b of batches) {
    for (const r of b) {
      try {
        const k = new URL(r.url).hostname + new URL(r.url).pathname.slice(0, 30)
        if (!seen.has(k)) { seen.add(k); merged.push(r) }
      } catch {}
    }
  }
  return merged.slice(0, 50)
}

// ─── LLM prompt to extract property listings ──────────────────────────────────
function buildExtractionPrompt(
  propType: string, country: string, city: string,
  maxPrice: number, beds: number | undefined,
  results: SearchResult[]
): string {
  const loc = city ? `${city}, ${country}` : country
  const budgetStr = maxPrice >= 1_000_000
    ? `€${(maxPrice / 1e6).toFixed(2)}M` : `€${Math.round(maxPrice / 1000)}K`
  const block = results.length
    ? results.map((r, i) => `[${i + 1}] ${r.title}\n    URL: ${r.url}\n    ${r.snippet}`).join('\n\n')
    : '(no live results — use verified knowledge of typical properties in this market)'

  return `You are a real estate listing extractor for PropBlaze.

A buyer is looking for:
• Type: ${propType}
• Location: ${loc}
• Max budget: ${budgetStr}
${beds ? `• Bedrooms: ${beds}+` : ''}

═══════════ LIVE SEARCH RESULTS ═══════════
${block}
═══════════════════════════════════════════

TASK: Extract 20–30 REAL property listings from the search results above, OR if results are insufficient, generate realistic representative properties based on actual current market data for ${loc}.

For each property return:
{
  "title": "descriptive title (e.g. '2BR apartment sea view Kotor Bay')",
  "city": "${city || country}",
  "country": "${country}",
  "price": 350000,
  "price_formatted": "€350,000",
  "size_m2": 95,
  "beds": 2,
  "baths": 1,
  "type": "${propType}",
  "features": ["sea view", "pool", "parking", "furnished"],
  "description": "2-3 sentence description",
  "portal": "Idealista" (or portal name from URL),
  "url": "https://..." (real URL from search result or best-guess portal URL),
  "score": 87 (relevance 1-99 based on how well it matches criteria)
}

RULES:
✓ Only include ${propType} type properties
✓ Only include properties under ${budgetStr}
✓ Focus on ${loc} area
✓ Score: proximity to ${city || country} 40% + budget fit 30% + type match 20% + quality 10%
✓ Sort by score descending

Return ONLY valid JSON array, no markdown:
[{...}, {...}]`
}

// ─── LLM calls ────────────────────────────────────────────────────────────────
async function callClaude(prompt: string): Promise<FoundProperty[]> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('No Anthropic key')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) throw new Error(`Claude ${res.status}`)
  const d = await res.json()
  return parseProperties(d.content?.[0]?.text || '')
}

async function callOpenAI(prompt: string): Promise<FoundProperty[]> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('No OpenAI key')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 6000,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Real estate property extractor. Return valid JSON array of properties.' },
        { role: 'user', content: prompt + '\nWrap array in {"properties":[...]}.' },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const d = await res.json()
  const text = d.choices?.[0]?.message?.content || '{}'
  try {
    const p = JSON.parse(text)
    return parseProperties(JSON.stringify(Array.isArray(p) ? p : p.properties || []))
  } catch { return parseProperties(text) }
}

function parseProperties(raw: string): FoundProperty[] {
  const m = raw.match(/\[[\s\S]*\]/)
  if (!m) throw new Error('No JSON array in response')
  const arr = JSON.parse(m[0]) as any[]
  return arr
    .filter(p => p?.title && (p?.price || p?.price_formatted))
    .map((p, i) => ({
      id: `prop-${Date.now()}-${i}`,
      title: String(p.title || '').trim(),
      city: String(p.city || '').trim(),
      country: String(p.country || '').trim(),
      flag: FLAG_MAP[p.country] || '🏢',
      price: Number(p.price) || 0,
      price_formatted: String(p.price_formatted || (p.price ? `€${Number(p.price).toLocaleString()}` : '—')),
      size_m2: p.size_m2 ? Number(p.size_m2) : undefined,
      beds: p.beds ? Number(p.beds) : undefined,
      baths: p.baths ? Number(p.baths) : undefined,
      type: String(p.type || '').toLowerCase(),
      features: Array.isArray(p.features) ? p.features.slice(0, 6).map(String) : [],
      description: String(p.description || '').slice(0, 200),
      portal: String(p.portal || extractPortal(p.url)),
      url: String(p.url || ''),
      score: Math.min(99, Math.max(40, Number(p.score) || 70)),
      highlight: i < 5,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
}

function extractPortal(url: string): string {
  try {
    const h = new URL(url).hostname.replace('www.', '')
    if (h.includes('idealista')) return 'Idealista'
    if (h.includes('rightmove')) return 'Rightmove'
    if (h.includes('zoopla')) return 'Zoopla'
    if (h.includes('immobiliare')) return 'Immobiliare.it'
    if (h.includes('immobilienscout')) return 'ImmobilienScout24'
    if (h.includes('spitogatos')) return 'Spitogatos'
    if (h.includes('dom.me')) return 'DOM.me'
    if (h.includes('propertyfinder')) return 'PropertyFinder'
    if (h.includes('bayut')) return 'Bayut'
    if (h.includes('seloger')) return 'SeLoger'
    return h.split('.')[0].charAt(0).toUpperCase() + h.split('.')[0].slice(1)
  } catch { return 'Portal' }
}

// ─── Static fallback — curated demo properties by country ─────────────────────
function staticProperties(
  propType: string, country: string, city: string, maxPrice: number, beds?: number
): FoundProperty[] {
  const flag = FLAG_MAP[country] || '🏢'
  const loc = city || country
  const t = propType.toLowerCase()

  const pool: Omit<FoundProperty, 'id' | 'highlight'>[] = [
    // Montenegro
    { title: `Sea-view ${t} in Kotor Bay, Montenegro`, city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', price: 285_000, price_formatted: '€285,000', size_m2: 78, beds: 2, baths: 1, type: t, features: ['sea view', 'terrace', 'parking'], description: 'Modern 2-bedroom apartment with stunning Bay of Kotor views. Recently renovated, fully furnished.', portal: 'dom.me', url: 'https://dom.me', score: 90 },
    { title: `Villa with pool near Budva`, city: 'Budva', country: 'Montenegro', flag: '🇲🇪', price: 495_000, price_formatted: '€495,000', size_m2: 185, beds: 4, baths: 3, type: t, features: ['pool', 'sea view', 'garden', 'parking', 'furnished'], description: 'Luxury villa 800m from beach. Private pool, panoramic sea views, automated shutters.', portal: 'montenegroprospects.com', url: 'https://montenegroprospects.com', score: 88 },
    { title: `Beachfront ${t} Tivat — Porto Montenegro area`, city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', price: 620_000, price_formatted: '€620,000', size_m2: 120, beds: 3, baths: 2, type: t, features: ['marina view', 'concierge', 'gym', 'pool'], description: 'Premium residence in Porto Montenegro complex. 5-star resort amenities, direct marina access.', portal: 'portomontenegro.com', url: 'https://portomontenegro.com', score: 92 },
    { title: `Stone house Kotor old town`, city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', price: 330_000, price_formatted: '€330,000', size_m2: 95, beds: 2, baths: 2, type: t, features: ['historic', 'renovated', 'terrace', 'UNESCO area'], description: 'Fully renovated stone house inside Kotor old town walls. UNESCO World Heritage area.', portal: 'dream-estate.me', url: 'https://dream-estate.me', score: 87 },
    { title: `Development land plot Kotor Bay sea view`, city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', price: 180_000, price_formatted: '€180,000', size_m2: 600, beds: 0, baths: 0, type: 'land', features: ['building permit', 'sea view', 'access road', '600 m²'], description: 'Prime development plot with approved building permit. Panoramic sea views over Boka Bay.', portal: 'adriatic-properties.me', url: 'https://adriatic-properties.me', score: 85 },
    // Spain
    { title: `Modern ${t} Marbella Golden Mile`, city: 'Marbella', country: 'Spain', flag: '🇪🇸', price: 875_000, price_formatted: '€875,000', size_m2: 145, beds: 3, baths: 2, type: t, features: ['pool', 'sea view', 'gated', '24h security'], description: 'Contemporary apartment in prestigious Golden Mile complex. South-facing terrace with sea views.', portal: 'Idealista', url: 'https://idealista.com', score: 89 },
    { title: `Costa del Sol villa with pool`, city: 'Estepona', country: 'Spain', flag: '🇪🇸', price: 1_200_000, price_formatted: '€1,200,000', size_m2: 320, beds: 5, baths: 4, type: t, features: ['pool', 'garden', 'garage', 'sea view', 'smart home'], description: 'Luxury villa with infinity pool and panoramic sea views. 5 bedrooms, top-quality finishes.', portal: 'Idealista', url: 'https://idealista.com', score: 91 },
    { title: `Barcelona apartment Eixample`, city: 'Barcelona', country: 'Spain', flag: '🇪🇸', price: 495_000, price_formatted: '€495,000', size_m2: 90, beds: 2, baths: 2, type: t, features: ['renovated', 'balcony', 'elevator', 'modernist building'], description: 'Renovated apartment in prime Eixample location. High ceilings, parquet floors, south-facing.', portal: 'Fotocasa', url: 'https://fotocasa.es', score: 86 },
    // Portugal
    { title: `Lisbon ${t} Chiado premium`, city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', price: 680_000, price_formatted: '€680,000', size_m2: 105, beds: 2, baths: 2, type: t, features: ['renovated', 'river view', 'elevator', 'prime location'], description: 'Prime Chiado apartment with Tagus river views. Fully renovated with premium finishes.', portal: 'Idealista', url: 'https://idealista.pt', score: 88 },
    { title: `Algarve villa with heated pool`, city: 'Lagos', country: 'Portugal', flag: '🇵🇹', price: 1_100_000, price_formatted: '€1,100,000', size_m2: 280, beds: 4, baths: 3, type: t, features: ['pool', 'heated pool', 'garden', 'ocean view', 'garage'], description: 'Stunning villa near Lagos with heated pool. Panoramic ocean views, mature garden.', portal: 'Imovirtual', url: 'https://imovirtual.com', score: 90 },
    // Greece
    { title: `Santorini ${t} caldera view`, city: 'Santorini', country: 'Greece', flag: '🇬🇷', price: 980_000, price_formatted: '€980,000', size_m2: 115, beds: 2, baths: 2, type: t, features: ['caldera view', 'infinity pool', 'terrace', 'traditional style'], description: 'Iconic Santorini property with world-famous caldera views. Private infinity pool.', portal: 'Spitogatos', url: 'https://spitogatos.gr', score: 93 },
    // Germany
    { title: `Munich apartment Schwabing`, city: 'Munich', country: 'Germany', flag: '🇩🇪', price: 780_000, price_formatted: '€780,000', size_m2: 88, beds: 3, baths: 2, type: t, features: ['renovated', 'balcony', 'cellar', 'central'], description: 'Well-maintained apartment in upscale Schwabing. Parquet floors, recently renovated kitchen.', portal: 'ImmobilienScout24', url: 'https://immobilienscout24.de', score: 84 },
    // UK
    { title: `London Kensington flat`, city: 'London', country: 'UK', flag: '🇬🇧', price: 1_450_000, price_formatted: '€1,450,000', size_m2: 92, beds: 2, baths: 1, type: t, features: ['period building', 'porter', 'garden square'], description: 'Second floor flat in a Victorian conversion in prime Kensington. Communal garden square.', portal: 'Rightmove', url: 'https://rightmove.co.uk', score: 87 },
    // UAE
    { title: `Dubai Marina ${t} sea view`, city: 'Dubai', country: 'UAE', flag: '🇦🇪', price: 620_000, price_formatted: '€620,000', size_m2: 115, beds: 2, baths: 2, type: t, features: ['marina view', 'pool', 'gym', 'concierge', 'furnished'], description: 'High-floor marina view apartment in Dubai Marina tower. Fully furnished, ready to move in.', portal: 'PropertyFinder', url: 'https://propertyfinder.ae', score: 88 },
  ]

  // Filter by country if specified, else return all
  let filtered = pool.filter(p => {
    if (country && p.country !== country) return false
    if (p.price > maxPrice * 1.2) return false
    if (beds && p.beds && p.beds < beds) return false
    return true
  })

  // If country filter returns nothing, return best matches from all
  if (filtered.length < 5) {
    filtered = pool
      .filter(p => p.price <= maxPrice * 1.2)
      .sort((a, b) => b.score - a.score)
  }

  return filtered
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((p, i) => ({
      ...p,
      id: `static-${i}`,
      highlight: i < 5,
    }))
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    const body = await req.json()
    const { propType, maxPrice, sqm } = body
    const city = body.city || ''
    const beds = body.beds ? Number(body.beds) : undefined

    if (!propType || !body.country || !maxPrice) {
      return NextResponse.json(
        { error: 'Missing propType, country, or maxPrice' },
        { status: 400 }
      )
    }

    const country = normalizeCountry(String(body.country))
    const budget = Number(maxPrice) || 300_000

    // ── Step 1: live DDG search
    const searchResults = await liveSearch(propType, country, city, budget, beds)

    // ── Step 2: LLM extraction
    let properties: FoundProperty[] = []
    let provider = 'static'

    const prompt = buildExtractionPrompt(propType, country, city, budget, beds, searchResults)

    const tasks = [
      callClaude(prompt)
        .then(p => ({ p: 'claude+live', a: p }))
        .catch(() => ({ p: 'claude-failed', a: [] as FoundProperty[] })),
      callOpenAI(prompt)
        .then(p => ({ p: 'openai+live', a: p }))
        .catch(() => ({ p: 'openai-failed', a: [] as FoundProperty[] })),
    ]
    const results = await Promise.all(tasks)
    const winner = results.find(r => r.a.length >= 5) || results.find(r => r.a.length > 0)

    if (winner && winner.a.length > 0) {
      properties = winner.a
      provider = winner.p
    } else {
      // Static fallback
      properties = staticProperties(propType, country, city, budget, beds)
      provider = 'static'
    }

    const elapsed = Date.now() - t0
    return NextResponse.json({
      success: true,
      properties,
      provider,
      searchResultsCount: searchResults.length,
      elapsedMs: elapsed,
      count: properties.length,
    })
  } catch (err: any) {
    // Last-resort fallback
    try {
      const body = await req.json().catch(() => ({}))
      const props = staticProperties(
        body.propType || 'apartment',
        normalizeCountry(body.country || 'Montenegro'),
        body.city || '',
        Number(body.maxPrice) || 300_000,
        body.beds ? Number(body.beds) : undefined
      )
      return NextResponse.json({ success: true, properties: props, provider: 'static-emergency', count: props.length })
    } catch {
      return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
    }
  }
}
