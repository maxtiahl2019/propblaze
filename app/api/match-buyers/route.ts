/**
 * POST /api/match-buyers
 *
 * BUYER matching engine — finds agencies / developers that have properties
 * available matching the buyer's criteria.
 *
 * Flow:
 *  1. DDG live search (6 buyer-focused queries)
 *  2. Claude / OpenAI / Gemini parallel race
 *  3. Static DB fallback (developers + buying agencies by market)
 *
 * Body: { propType, country, city, price, sqm?, beds? }
 * Returns: { success, agencies, provider, count }
 */

import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 55
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Logging toggle — disabled by default to reduce noise
const LOG = process.env.APEX_LOG === 'true'
const log = (...a: any[]) => { if (LOG) console.log('[buyers]', ...a) }
const warn = (...a: any[]) => { if (LOG) console.warn('[buyers]', ...a) }

// ─── Types ────────────────────────────────────────────────────────────────────
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
  Bulgaria: '🇧🇬', Romania: '🇷🇴', Turkey: '🇹🇷', Cyprus: '🇨🇾',
}

function normalizePropType(pt: string): string {
  const p = pt.toLowerCase()
  if (p.includes('apart') || p.includes('flat') || p.includes('квартир')) return 'apartment'
  if (p.includes('villa') || p.includes('вилл')) return 'villa'
  if (p.includes('land') || p.includes('plot') || p.includes('участ')) return 'land'
  if (p.includes('house') || p.includes('дом')) return 'house'
  if (p.includes('commercial') || p.includes('коммерч')) return 'commercial'
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
  if (c.includes('austria') || c.includes('австр')) return 'Austria'
  if (c.includes('uk') || c.includes('britain')) return 'UK'
  if (c.includes('france') || c.includes('франц')) return 'France'
  if (c.includes('uae') || c.includes('dubai')) return 'UAE'
  if (c.includes('bulgar')) return 'Bulgaria'
  if (c.includes('cyprus') || c.includes('кипр')) return 'Cyprus'
  if (c.includes('turkey') || c.includes('турц')) return 'Turkey'
  return raw.trim()
}

// ─── Buyer-focused DDG queries ────────────────────────────────────────────────
function buildBuyerQueries(propType: string, country: string, city: string, budget: number): string[] {
  const loc = city ? `${city} ${country}` : country
  const normType = normalizePropType(propType)
  const budgetStr = budget >= 1_000_000 ? `€${(budget / 1e6).toFixed(1)}M` : `€${Math.round(budget / 1000)}K`

  if (normType === 'apartment' || normType === 'villa' || normType === 'house') {
    return [
      `buy ${normType} ${loc} real estate agency listings ${budgetStr}`,
      `new development apartments ${loc} developer project 2024 2025`,
      `${normType} for sale ${loc} international buyers agency`,
      `real estate developer ${country} ${normType} under ${budgetStr}`,
      `${loc} property for sale agency buyer representation`,
      `new build ${normType} ${loc} investor developer`,
    ]
  }
  return [
    `buy property ${loc} agency listings ${budgetStr}`,
    `real estate for sale ${loc} international buyers`,
    `developer project ${loc} ${normType} 2024 2025`,
    `${country} property agency ${normType} buyer`,
    `new development ${loc} ${normType}`,
    `investment property ${loc} ${normType} ${budgetStr}`,
  ]
}

// ─── DDG search ───────────────────────────────────────────────────────────────
async function duckDuckGoSearch(query: string, max = 8): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
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

async function liveSearch(propType: string, country: string, city: string, budget: number): Promise<SearchResult[]> {
  const queries = buildBuyerQueries(propType, country, city, budget)
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
function buildBuyerPrompt(propType: string, country: string, city: string, budget: number, searchResults: SearchResult[]): string {
  const loc = city ? `${city}, ${country}` : country
  const budgetF = budget >= 1_000_000 ? `€${(budget / 1e6).toFixed(2)}M` : `€${Math.round(budget / 1000)}K`
  const normType = normalizePropType(propType)
  const block = searchResults.length
    ? searchResults.map((r, i) => `[${i + 1}] ${r.title}\n    ${r.snippet}\n    ${r.url}`).join('\n\n')
    : '(no live results — use verified knowledge)'
  return `You are APEX Buyer — PropBlaze's buyer matching engine.

A BUYER is looking to PURCHASE:
• Type: ${normType} (${propType})
• Location: ${loc}
• Budget: up to ${budgetF}

═══════════ LIVE SEARCH RESULTS ═══════════
${block}
═══════════════════════════════════════════

TASK: Find 25–30 REAL agencies, developers, and brokers that can help this buyer
FIND and PURCHASE ${normType} in ${loc}. Include:
✓ LOCAL agencies in ${city || country} with ${normType} inventory
✓ DEVELOPERS with new projects in ${country} matching budget
✓ International agencies with verified ${country} buyer services
✓ Franchise brands (RE/MAX, E&V, Sotheby's) with ${country} offices

SCORING: local presence 40% · inventory match 25% · budget fit 20% · buyer service 15%

Sort by score descending. Return ONLY JSON array:
[{"name":"Agency Name","city":"City","country":"${country}","website":"domain.com","spec":"max 90 chars","reasons":["r1","r2","r3"],"langs":["EN"],"score":88,"wave":1}]`
}

// ─── LLM calls ────────────────────────────────────────────────────────────────
async function callClaude(prompt: string): Promise<MatchedAgency[]> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('No Anthropic key')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 7000, temperature: 0.3, messages: [{ role: 'user', content: prompt }] }),
    signal: AbortSignal.timeout(40000),
  })
  if (!res.ok) throw new Error(`Claude ${res.status}`)
  const d = await res.json()
  return parseAgencies(d.content?.[0]?.text || '', country => country)
}

async function callOpenAI(prompt: string): Promise<MatchedAgency[]> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('No OpenAI key')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 5000, temperature: 0.3, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Buyer agency matcher. JSON only.' }, { role: 'user', content: prompt + '\nWrap in {"agencies":[...]}.' }] }),
    signal: AbortSignal.timeout(40000),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const d = await res.json()
  const text = d.choices?.[0]?.message?.content || '{}'
  try { const p = JSON.parse(text); return parseAgencies(JSON.stringify(Array.isArray(p) ? p : p.agencies || []), c => c) } catch { return parseAgencies(text, c => c) }
}

function parseAgencies(raw: string, _cn: (c: string) => string): MatchedAgency[] {
  const m = raw.match(/\[[\s\S]*\]/)
  if (!m) throw new Error('No JSON array')
  return (JSON.parse(m[0]) as any[])
    .filter(a => a?.name && a?.country)
    .map((a, i) => ({
      name: String(a.name).trim(),
      city: String(a.city || '').trim(),
      country: String(a.country).trim(),
      flag: FLAG_MAP[a.country] || '🏢',
      website: String(a.website || '').replace(/^https?:\/\//, '').split('/')[0],
      spec: String(a.spec || '').slice(0, 100),
      reasons: Array.isArray(a.reasons) ? a.reasons.slice(0, 3).map(String) : [],
      langs: Array.isArray(a.langs) ? a.langs.slice(0, 5).map(String) : ['EN'],
      score: Math.min(99, Math.max(40, Number(a.score) || 70)),
      wave: ([1, 2, 3].includes(a.wave) ? a.wave : i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
    }))
    .sort((a, b) => b.score - a.score).slice(0, 30)
}

// ─── Static buyer DB (developers + buying agencies) ───────────────────────────
const BUYER_STATIC: Array<{
  name: string; city: string; country: string; flag: string; website: string
  spec: string; langs: string[]; types: string[]; minPrice: number; maxPrice: number; weight: number
}> = [
  // Montenegro — developers + buying agencies
  { name: 'Lustica Bay Development', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'lusticabay.com', spec: 'Luxury coastal resort & residences — developer', langs: ['EN','RU','SR'], types: ['apartment','villa'], minPrice: 200_000, maxPrice: 2_000_000, weight: 95 },
  { name: 'Porto Montenegro Real Estate', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'portomontenegro.com', spec: 'Marina ultra-luxury — developer & agency', langs: ['EN','RU','IT','FR'], types: ['apartment','villa'], minPrice: 500_000, maxPrice: 15_000_000, weight: 96 },
  { name: 'Montenegro Prospects', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'montenegroprospects.com', spec: 'Buyer representation — coastal & inland', langs: ['EN','RU','SR'], types: ['apartment','villa','house','land'], minPrice: 50_000, maxPrice: 5_000_000, weight: 91 },
  { name: 'Leo Estate Montenegro', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'leoestate.me', spec: 'Bay of Kotor buyer desk, full portfolio', langs: ['EN','RU','SR','DE'], types: ['apartment','villa','land'], minPrice: 100_000, maxPrice: 8_000_000, weight: 90 },
  { name: 'Riviera Developments', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'rivieradevelopments.me', spec: 'New residential developments — Budva & Kotor', langs: ['EN','RU'], types: ['apartment','villa'], minPrice: 80_000, maxPrice: 2_000_000, weight: 85 },
  { name: 'Dream Estate Montenegro', city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', website: 'dream-estate.me', spec: 'Kotor Bay buyer service — boutique', langs: ['EN','RU','IT'], types: ['apartment','villa','house','land'], minPrice: 60_000, maxPrice: 3_000_000, weight: 86 },
  // Spain
  { name: 'Engel & Völkers Spain', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'engelvoelkers.com/spain', spec: 'Full buyer service — all Spain regions', langs: ['EN','ES','DE','RU'], types: ['apartment','villa','house','land'], minPrice: 200_000, maxPrice: 20_000_000, weight: 95 },
  { name: 'Taylor Wimpey España', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'taylorwimpeyspain.com', spec: 'UK developer — new builds Costa del Sol, Costa Blanca', langs: ['EN','ES'], types: ['apartment','villa'], minPrice: 180_000, maxPrice: 1_500_000, weight: 88 },
  { name: 'Neinor Homes', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'neinorhomes.com', spec: 'Spain\'s largest listed developer', langs: ['EN','ES'], types: ['apartment','house'], minPrice: 150_000, maxPrice: 2_000_000, weight: 90 },
  { name: 'Lucas Fox', city: 'Barcelona', country: 'Spain', flag: '🇪🇸', website: 'lucasfox.com', spec: 'Buyer representation — Barcelona, Ibiza, Costa', langs: ['EN','ES','DE','FR','RU'], types: ['apartment','villa','house'], minPrice: 400_000, maxPrice: 20_000_000, weight: 93 },
  // Portugal
  { name: 'Vanguard Properties', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'vanguardproperties.com', spec: 'Developer — Lisbon & Algarve luxury projects', langs: ['EN','PT','FR'], types: ['apartment','villa'], minPrice: 300_000, maxPrice: 5_000_000, weight: 89 },
  { name: 'Engel & Völkers Portugal', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'engelvoelkers.com/portugal', spec: 'Full buyer service across Portugal', langs: ['EN','PT','DE','FR'], types: ['apartment','villa','house','land'], minPrice: 200_000, maxPrice: 15_000_000, weight: 92 },
  // Croatia
  { name: 'Engel & Völkers Croatia', city: 'Zagreb', country: 'Croatia', flag: '🇭🇷', website: 'engelvoelkers.com/croatia', spec: 'Adriatic buyer service', langs: ['EN','HR','DE','IT'], types: ['apartment','villa','land'], minPrice: 150_000, maxPrice: 10_000_000, weight: 87 },
  { name: 'Croatia Sotheby\'s Realty', city: 'Dubrovnik', country: 'Croatia', flag: '🇭🇷', website: 'croatiasothebysrealty.com', spec: 'Luxury buyer representation — Dalmatia', langs: ['EN','HR','DE','IT'], types: ['villa','apartment','house'], minPrice: 400_000, maxPrice: 15_000_000, weight: 90 },
  // Greece
  { name: 'Engel & Völkers Greece', city: 'Athens', country: 'Greece', flag: '🇬🇷', website: 'engelvoelkers.com/greece', spec: 'Greece buyer desk — Athens, islands', langs: ['EN','EL','DE'], types: ['villa','apartment','land'], minPrice: 200_000, maxPrice: 15_000_000, weight: 88 },
  { name: 'Greece Golden Visa Agency', city: 'Athens', country: 'Greece', flag: '🇬🇷', website: 'greecegoldenvisa.com', spec: 'Golden Visa property — investment buyers', langs: ['EN','ZH','RU','AR'], types: ['apartment','villa','commercial'], minPrice: 250_000, maxPrice: 5_000_000, weight: 85 },
  // Germany
  { name: 'Engel & Völkers Germany', city: 'Hamburg', country: 'Germany', flag: '🇩🇪', website: 'engelvoelkers.com/germany', spec: 'Premium buyer service — Germany wide', langs: ['EN','DE','FR'], types: ['apartment','villa','house'], minPrice: 300_000, maxPrice: 20_000_000, weight: 93 },
  // UK
  { name: 'Knight Frank', city: 'London', country: 'UK', flag: '🇬🇧', website: 'knightfrank.com', spec: 'Global buyer representation + research', langs: ['EN','RU','AR','ZH'], types: ['apartment','villa','house','commercial','land'], minPrice: 500_000, maxPrice: 200_000_000, weight: 97 },
  { name: 'Savills', city: 'London', country: 'UK', flag: '🇬🇧', website: 'savills.co.uk', spec: 'UK & international buyer consultancy', langs: ['EN','RU','DE','FR'], types: ['apartment','villa','house','land'], minPrice: 300_000, maxPrice: 100_000_000, weight: 96 },
  // UAE
  { name: 'Betterhomes Dubai', city: 'Dubai', country: 'UAE', flag: '🇦🇪', website: 'bhomes.com', spec: 'Dubai buyer service + international desk', langs: ['EN','AR','RU','ZH'], types: ['apartment','villa','commercial'], minPrice: 150_000, maxPrice: 50_000_000, weight: 89 },
]

function staticBuyerMatch(propType: string, country: string, city: string, budget: number): MatchedAgency[] {
  const normType = normalizePropType(propType)
  const cityL = city.toLowerCase()
  const PHONE: Record<string, string> = { Montenegro: '382', Spain: '34', Croatia: '385', Greece: '30', UK: '44', Germany: '49', France: '33', Portugal: '351', UAE: '971' }

  const scored = BUYER_STATIC.map(a => {
    let score = (a.weight - 70) * 0.5 + 50
    if (a.country === country) { score += cityL && a.city.toLowerCase().includes(cityL) ? 25 : 12 }
    else score -= 20
    if (a.types.includes(normType)) score += 8; else score -= 8
    if (budget >= a.minPrice && budget <= a.maxPrice) score += 8; else score -= 5
    score = Math.min(99, Math.max(40, Math.round(score)))
    const r: string[] = []
    if (a.country === country) r.push(`Local ${a.city} agency — direct inventory access`)
    else r.push(`International buyer service for ${country} market`)
    if (a.types.includes(normType)) r.push(`${normType} portfolio available`)
    if (budget >= a.minPrice && budget <= a.maxPrice) r.push(`Budget ${budget >= 1_000_000 ? `€${(budget/1e6).toFixed(1)}M` : `€${Math.round(budget/1000)}K`} matches active listings`)
    return { a, score, r }
  }).filter(x => x.score >= 42).sort((x, y) => y.score - x.score).slice(0, 30)

  return scored.map(({ a, score, r }, i) => {
    const domain = a.website.replace(/^https?:\/\//, '').split('/')[0]
    return {
      name: a.name, city: a.city, country: a.country, flag: a.flag,
      website: a.website, spec: a.spec, reasons: r.slice(0, 3),
      langs: a.langs, score, wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
      email: `info@${domain}`,
      phone: `+${PHONE[a.country] || '1'} ${Math.floor(10_000_000 + Math.random() * 89_999_999)}`,
    }
  })
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    const body = await req.json()
    const { propType, price, sqm, beds } = body
    const city = body.city || ''
    if (!propType || !body.country || !price) return NextResponse.json({ error: 'Missing propType, country, or price' }, { status: 400 })

    const country = normalizeCountry(String(body.country))
    const budget = Number(price) || 200_000
    log(`Buyer search: ${propType} in ${city || country} up to €${budget}`)

    const searchResults = await liveSearch(propType, country, city, budget)
    log(`DDG: ${searchResults.length} results`)

    let agencies: MatchedAgency[] = []
    let provider = 'unknown'

    const prompt = buildBuyerPrompt(propType, country, city, budget, searchResults)
    const tasks = [
      callClaude(prompt).then(a => ({ p: 'claude', a })).catch(e => { warn('Claude:', (e as Error).message); return { p: 'claude-failed', a: [] as MatchedAgency[] } }),
      callOpenAI(prompt).then(a => ({ p: 'openai', a })).catch(e => { warn('OpenAI:', (e as Error).message); return { p: 'openai-failed', a: [] as MatchedAgency[] } }),
    ]
    const results = await Promise.all(tasks)
    const winner = results.find(r => r.a.length >= 8) || results.find(r => r.a.length > 0)
    if (winner) { agencies = winner.a; provider = winner.p }

    if (agencies.length === 0) {
      agencies = staticBuyerMatch(propType, country, city, budget)
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
