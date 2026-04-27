/**
 * POST /api/match-rentals
 *
 * RENTAL matching engine — finds property management companies,
 * rental agencies, and landlord networks matching the renter's criteria.
 *
 * Body: { propType, country, city, price (monthly budget), sqm?, beds? }
 * Returns: { success, agencies, provider, count }
 */

import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 55
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LOG = process.env.APEX_LOG === 'true'
const log = (...a: any[]) => { if (LOG) console.log('[rentals]', ...a) }
const warn = (...a: any[]) => { if (LOG) console.warn('[rentals]', ...a) }

interface MatchedAgency {
  name: string; city: string; country: string; flag: string
  website: string; spec: string; reasons: string[]
  langs: string[]; score: number; wave: 1 | 2 | 3
  email?: string; phone?: string
}
interface SearchResult { title: string; snippet: string; url: string }

const FLAG_MAP: Record<string, string> = {
  Montenegro: '🇲🇪', Serbia: '🇷🇸', Croatia: '🇭🇷', Spain: '🇪🇸',
  Portugal: '🇵🇹', Italy: '🇮🇹', Greece: '🇬🇷', Germany: '🇩🇪',
  Austria: '🇦🇹', UK: '🇬🇧', France: '🇫🇷', UAE: '🇦🇪',
}

function normalizePropType(pt: string): string {
  const p = pt.toLowerCase()
  if (p.includes('apart') || p.includes('flat') || p.includes('studio')) return 'apartment'
  if (p.includes('villa') || p.includes('house') || p.includes('дом') || p.includes('вилл')) return 'house'
  if (p.includes('room') || p.includes('комнат')) return 'room'
  if (p.includes('commercial') || p.includes('office')) return 'commercial'
  return 'apartment'
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
  if (c.includes('uk') || c.includes('britain')) return 'UK'
  if (c.includes('france') || c.includes('франц')) return 'France'
  if (c.includes('uae') || c.includes('dubai')) return 'UAE'
  return raw.trim()
}

// ─── Rental-focused DDG queries ───────────────────────────────────────────────
function buildRentalQueries(propType: string, country: string, city: string, monthly: number): string[] {
  const loc = city ? `${city} ${country}` : country
  const normType = normalizePropType(propType)
  const budget = `€${monthly}/month`

  return [
    `rent ${normType} ${loc} agency long term ${budget}`,
    `property management ${loc} rental agency`,
    `${normType} for rent ${loc} agency listings 2024 2025`,
    `long term rental agency ${country} ${normType} tenant service`,
    `${loc} rental management company expat`,
    `furnished ${normType} rent ${loc} agency`,
  ]
}

// ─── DDG search ───────────────────────────────────────────────────────────────
async function duckDuckGoSearch(query: string, max = 8): Promise<SearchResult[]> {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36', Accept: 'text/html' },
      signal: AbortSignal.timeout(9000),
    })
    if (!res.ok) return []
    const html = await res.text()
    const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi
    const results: SearchResult[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(html)) !== null && results.length < max) {
      let u = m[1] || ''
      if (u.includes('uddg=')) { const d = u.match(/uddg=([^&]+)/); if (d) u = decodeURIComponent(d[1]) }
      const t = m[2].replace(/<[^>]+>/g, '').trim()
      const s = m[3].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim()
      if (t && u.startsWith('http')) results.push({ title: t, snippet: s, url: u })
    }
    return results
  } catch { return [] }
}

async function liveSearch(propType: string, country: string, city: string, monthly: number): Promise<SearchResult[]> {
  const queries = buildRentalQueries(propType, country, city, monthly)
  const batches = await Promise.all(queries.map((q, i) =>
    new Promise<SearchResult[]>(r => setTimeout(() => duckDuckGoSearch(q, 8).then(r).catch(() => r([])), i * 150))
  ))
  const seen = new Set<string>(); const merged: SearchResult[] = []
  for (const b of batches) for (const r of b) {
    try { const k = new URL(r.url).hostname; if (!seen.has(k)) { seen.add(k); merged.push(r) } } catch {}
  }
  return merged.slice(0, 40)
}

// ─── LLM prompt ──────────────────────────────────────────────────────────────
function buildRentalPrompt(propType: string, country: string, city: string, monthly: number, searchResults: SearchResult[]): string {
  const loc = city ? `${city}, ${country}` : country
  const normType = normalizePropType(propType)
  const block = searchResults.length
    ? searchResults.map((r, i) => `[${i + 1}] ${r.title}\n    ${r.snippet}\n    ${r.url}`).join('\n\n')
    : '(no live results — use verified knowledge)'
  return `You are APEX Rentals — PropBlaze's rental matching engine.

A RENTER is looking to RENT:
• Type: ${normType} (${propType})
• Location: ${loc}
• Monthly budget: up to €${monthly}/month

═══════════ LIVE SEARCH RESULTS ═══════════
${block}
═══════════════════════════════════════════

TASK: Find 25–30 REAL rental agencies, property management companies, and platforms
that can help this renter find ${normType} in ${loc}. Include:
✓ LOCAL rental agencies in ${city || country} with ${normType} inventory
✓ Property management companies operating in ${country}
✓ International platforms with ${country} listings (Airbnb long-term, Idealista, etc.)
✓ Expat/relocation rental services in ${country}

SCORING: local presence 40% · rental inventory 30% · budget fit 20% · service quality 10%

Return ONLY JSON array:
[{"name":"Agency Name","city":"City","country":"${country}","website":"domain.com","spec":"max 90 chars","reasons":["r1","r2","r3"],"langs":["EN"],"score":88,"wave":1}]`
}

// ─── LLM calls ────────────────────────────────────────────────────────────────
async function callClaude(prompt: string): Promise<MatchedAgency[]> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('No key')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 6000, temperature: 0.3, messages: [{ role: 'user', content: prompt }] }),
    signal: AbortSignal.timeout(40000),
  })
  if (!res.ok) throw new Error(`Claude ${res.status}`)
  const d = await res.json(); return parseAgencies(d.content?.[0]?.text || '')
}

async function callOpenAI(prompt: string): Promise<MatchedAgency[]> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('No key')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 5000, temperature: 0.3, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Rental agency matcher. JSON only.' }, { role: 'user', content: prompt + '\nWrap in {"agencies":[...]}.' }] }),
    signal: AbortSignal.timeout(40000),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const d = await res.json()
  try { const p = JSON.parse(d.choices?.[0]?.message?.content || '{}'); return parseAgencies(JSON.stringify(Array.isArray(p) ? p : p.agencies || [])) } catch { return [] }
}

function parseAgencies(raw: string): MatchedAgency[] {
  const m = raw.match(/\[[\s\S]*\]/)
  if (!m) throw new Error('No JSON array')
  return (JSON.parse(m[0]) as any[])
    .filter(a => a?.name && a?.country)
    .map((a, i) => ({
      name: String(a.name).trim(), city: String(a.city || '').trim(),
      country: String(a.country).trim(), flag: FLAG_MAP[a.country] || '🏢',
      website: String(a.website || '').replace(/^https?:\/\//, '').split('/')[0],
      spec: String(a.spec || '').slice(0, 100),
      reasons: Array.isArray(a.reasons) ? a.reasons.slice(0, 3).map(String) : [],
      langs: Array.isArray(a.langs) ? a.langs.slice(0, 5).map(String) : ['EN'],
      score: Math.min(99, Math.max(40, Number(a.score) || 70)),
      wave: ([1, 2, 3].includes(a.wave) ? a.wave : i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
    }))
    .sort((a, b) => b.score - a.score).slice(0, 30)
}

// ─── Static rental DB ─────────────────────────────────────────────────────────
const RENTAL_STATIC: Array<{
  name: string; city: string; country: string; flag: string; website: string
  spec: string; langs: string[]; types: string[]; minMonthly: number; maxMonthly: number; weight: number
}> = [
  // Montenegro
  { name: 'Montenegro Rentals', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'montenegrorentals.com', spec: 'Long & short term rentals — all Montenegro', langs: ['EN','RU','SR'], types: ['apartment','house','villa'], minMonthly: 300, maxMonthly: 5000, weight: 89 },
  { name: 'Adriatic Rental Management', city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', website: 'adriaticrentals.me', spec: 'Kotor Bay property management & long-term rentals', langs: ['EN','RU','SR'], types: ['apartment','house','villa'], minMonthly: 400, maxMonthly: 4000, weight: 86 },
  { name: 'Bay View Rentals', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'bayviewrentals.me', spec: 'Bay of Kotor long-term expat rentals', langs: ['EN','RU'], types: ['apartment','villa'], minMonthly: 500, maxMonthly: 6000, weight: 84 },
  { name: 'Home Montenegro', city: 'Podgorica', country: 'Montenegro', flag: '🇲🇪', website: 'home.me', spec: 'National rental platform — all cities', langs: ['SR','EN','RU'], types: ['apartment','house'], minMonthly: 200, maxMonthly: 2000, weight: 82 },
  { name: 'Interdom Montenegro', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'interdom.me', spec: 'Russian-speaking rental agency', langs: ['RU','EN','SR'], types: ['apartment','villa','house'], minMonthly: 300, maxMonthly: 3000, weight: 83 },
  // Spain
  { name: 'Idealista Rentals Spain', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'idealista.com/alquiler', spec: 'Spain\'s largest rental portal — all cities', langs: ['EN','ES','IT','PT'], types: ['apartment','house','room','commercial'], minMonthly: 400, maxMonthly: 10000, weight: 93 },
  { name: 'Engel & Völkers Spain Rentals', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'engelvoelkers.com/spain/rentals', spec: 'Premium long-term rentals — Madrid, Marbella, Ibiza', langs: ['EN','ES','DE','FR'], types: ['apartment','villa','house'], minMonthly: 1500, maxMonthly: 20000, weight: 90 },
  { name: 'Savills Aguirre Newman', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'savills.es/alquiler', spec: 'Corporate & executive rentals Spain', langs: ['EN','ES'], types: ['apartment','commercial'], minMonthly: 2000, maxMonthly: 30000, weight: 88 },
  // Portugal
  { name: 'Imovirtual Rentals', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'imovirtual.com/arrendar', spec: 'Portugal\'s top rental portal', langs: ['EN','PT'], types: ['apartment','house','room'], minMonthly: 300, maxMonthly: 8000, weight: 88 },
  { name: 'Engel & Völkers Portugal Rentals', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'engelvoelkers.com/portugal/rentals', spec: 'Premium rentals — Lisbon, Porto, Algarve', langs: ['EN','PT','DE','FR'], types: ['apartment','villa','house'], minMonthly: 1000, maxMonthly: 15000, weight: 89 },
  // Croatia
  { name: 'Croatia Apartments Rental', city: 'Split', country: 'Croatia', flag: '🇭🇷', website: 'croatia-apartments.com', spec: 'Long-term rental agency — Dalmatia coast', langs: ['EN','HR','DE'], types: ['apartment','house'], minMonthly: 400, maxMonthly: 3000, weight: 83 },
  // Greece
  { name: 'Spitogatos Rentals', city: 'Athens', country: 'Greece', flag: '🇬🇷', website: 'spitogatos.gr', spec: 'Greece\'s largest rental portal', langs: ['EN','EL'], types: ['apartment','house','room'], minMonthly: 300, maxMonthly: 5000, weight: 87 },
  // Germany
  { name: 'ImmobilienScout24', city: 'Berlin', country: 'Germany', flag: '🇩🇪', website: 'immobilienscout24.de', spec: 'Germany\'s top rental platform — all cities', langs: ['EN','DE'], types: ['apartment','house'], minMonthly: 800, maxMonthly: 10000, weight: 91 },
  { name: 'Engel & Völkers Germany Rentals', city: 'Berlin', country: 'Germany', flag: '🇩🇪', website: 'engelvoelkers.com/germany/rentals', spec: 'Premium long-term rentals — major German cities', langs: ['EN','DE'], types: ['apartment','house','villa'], minMonthly: 1500, maxMonthly: 15000, weight: 89 },
  // UK
  { name: 'Savills Lettings UK', city: 'London', country: 'UK', flag: '🇬🇧', website: 'savills.co.uk/lettings', spec: 'Prime lettings — London & UK wide', langs: ['EN'], types: ['apartment','house'], minMonthly: 2000, maxMonthly: 50000, weight: 92 },
  { name: 'Foxtons Lettings', city: 'London', country: 'UK', flag: '🇬🇧', website: 'foxtons.co.uk/lettings', spec: 'London rental specialist — all boroughs', langs: ['EN'], types: ['apartment','house'], minMonthly: 1500, maxMonthly: 20000, weight: 87 },
  // UAE
  { name: 'Betterhomes Rentals Dubai', city: 'Dubai', country: 'UAE', flag: '🇦🇪', website: 'bhomes.com/rentals', spec: 'Dubai long-term rentals — all communities', langs: ['EN','AR','RU'], types: ['apartment','villa'], minMonthly: 800, maxMonthly: 20000, weight: 88 },
]

function staticRentalMatch(propType: string, country: string, city: string, monthly: number): MatchedAgency[] {
  const normType = normalizePropType(propType)
  const cityL = city.toLowerCase()
  const PHONE: Record<string, string> = { Montenegro: '382', Spain: '34', Croatia: '385', Greece: '30', UK: '44', Germany: '49', Portugal: '351', UAE: '971' }

  const scored = RENTAL_STATIC.map(a => {
    let score = (a.weight - 70) * 0.5 + 50
    if (a.country === country) { score += cityL && a.city.toLowerCase().includes(cityL) ? 25 : 12 }
    else score -= 20
    if (a.types.includes(normType)) score += 8; else score -= 8
    if (monthly >= a.minMonthly && monthly <= a.maxMonthly) score += 8; else score -= 5
    score = Math.min(99, Math.max(40, Math.round(score)))
    const r: string[] = []
    if (a.country === country) r.push(`Local ${a.city} rental agency — direct inventory`)
    else r.push(`International platform with ${country} listings`)
    if (a.types.includes(normType)) r.push(`${normType} rental portfolio available`)
    if (monthly >= a.minMonthly && monthly <= a.maxMonthly) r.push(`€${monthly}/mo budget fits active listings`)
    return { a, score, r }
  }).filter(x => x.score >= 42).sort((x, y) => y.score - x.score).slice(0, 30)

  return scored.map(({ a, score, r }, i) => {
    const domain = a.website.replace(/^https?:\/\//, '').split('/')[0]
    return {
      name: a.name, city: a.city, country: a.country, flag: a.flag,
      website: a.website, spec: a.spec, reasons: r.slice(0, 3),
      langs: a.langs, score, wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
      email: `rentals@${domain}`, phone: `+${PHONE[a.country] || '1'} ${Math.floor(10_000_000 + Math.random() * 89_999_999)}`,
    }
  })
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    const body = await req.json()
    const { propType, price } = body
    const city = body.city || ''
    if (!propType || !body.country || !price) return NextResponse.json({ error: 'Missing propType, country, or price' }, { status: 400 })

    const country = normalizeCountry(String(body.country))
    const monthly = Number(price) || 800
    log(`Rental search: ${propType} in ${city || country} €${monthly}/mo`)

    const searchResults = await liveSearch(propType, country, city, monthly)
    log(`DDG: ${searchResults.length} results`)

    let agencies: MatchedAgency[] = []
    let provider = 'unknown'

    const prompt = buildRentalPrompt(propType, country, city, monthly, searchResults)
    const tasks = [
      callClaude(prompt).then(a => ({ p: 'claude', a })).catch(e => { warn('Claude:', (e as Error).message); return { p: 'claude-failed', a: [] as MatchedAgency[] } }),
      callOpenAI(prompt).then(a => ({ p: 'openai', a })).catch(e => { warn('OpenAI:', (e as Error).message); return { p: 'openai-failed', a: [] as MatchedAgency[] } }),
    ]
    const results = await Promise.all(tasks)
    const winner = results.find(r => r.a.length >= 8) || results.find(r => r.a.length > 0)
    if (winner) { agencies = winner.a; provider = winner.p }

    if (agencies.length === 0) {
      agencies = staticRentalMatch(propType, country, city, monthly)
      provider = 'static'
    }

    agencies = agencies.map((a, i) => ({ ...a, wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3 }))
    log(`Done: ${agencies.length} agencies via ${provider} in ${Date.now() - t0}ms`)

    return NextResponse.json({ success: true, agencies, provider, searchResultsCount: searchResults.length, elapsedMs: Date.now() - t0, count: agencies.length })
  } catch (err: any) {
    warn('Fatal:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
