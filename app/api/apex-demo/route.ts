/**
 * POST /api/apex-demo
 *
 * APEX matching pipeline:
 *   1. LIVE DuckDuckGo search (5 parallel geo-targeted queries)
 *   2. Claude parses results → 25–30 real verified agencies (primary)
 *   3. OpenAI fallback (if Claude key missing/fails)
 *   4. Full static database match (guaranteed — works with zero API keys)
 *
 * Public endpoint — no auth required.
 */

import { NextRequest, NextResponse } from 'next/server'
import { DEMO_AGENCY_POOL, type RealAgency } from '@/lib/ai-matching/demo-agencies'

export const maxDuration = 60
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApexAgency {
  name: string
  city: string
  country: string
  flag: string
  website: string
  spec: string
  reasons: string[]
  langs: string[]
  score: number
  wave: 1 | 2 | 3
  email?: string
  phone?: string
}

interface SearchResult { title: string; snippet: string; url: string }

interface StaticAgency {
  name: string; city: string; country: string; flag: string; website: string
  spec: string; langs: string[]
  types: string[]           // property types: 'apartment','villa','house','land','commercial','office'
  minPrice: number; maxPrice: number
  cluster: string           // geo cluster
  weight: number            // base quality 70–99
  tags: string[]            // 'luxury','investor','land','new-dev','historic','beachfront'
}

// ─── Country → flag emoji ────────────────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  Montenegro: '🇲🇪', Serbia: '🇷🇸', Croatia: '🇭🇷', Bosnia: '🇧🇦',
  Slovenia: '🇸🇮', 'North Macedonia': '🇲🇰', Albania: '🇦🇱',
  Greece: '🇬🇷', Bulgaria: '🇧🇬', Romania: '🇷🇴', Austria: '🇦🇹',
  Germany: '🇩🇪', Switzerland: '🇨🇭', UK: '🇬🇧', France: '🇫🇷',
  Spain: '🇪🇸', Portugal: '🇵🇹', Italy: '🇮🇹', Netherlands: '🇳🇱',
  Cyprus: '🇨🇾', Malta: '🇲🇹', UAE: '🇦🇪', 'United Kingdom': '🇬🇧',
}

// ─── Geo clusters (country → cluster) ────────────────────────────────────────
const COUNTRY_CLUSTER: Record<string, string> = {
  Montenegro: 'Balkans', Serbia: 'Balkans', Croatia: 'Balkans', Bosnia: 'Balkans',
  Slovenia: 'Balkans', Albania: 'Balkans', 'North Macedonia': 'Balkans',
  Greece: 'Balkans', Bulgaria: 'Balkans',
  Spain: 'SouthernEU', Portugal: 'SouthernEU', Italy: 'SouthernEU', Malta: 'SouthernEU', Cyprus: 'SouthernEU',
  France: 'WesternEU', Netherlands: 'WesternEU', Belgium: 'WesternEU',
  Germany: 'DACH', Austria: 'DACH', Switzerland: 'DACH',
  UK: 'UK', 'United Kingdom': 'UK', Ireland: 'UK',
  UAE: 'Global', Turkey: 'Global',
}

function normalizeCountry(raw: string): string {
  const c = raw.toLowerCase().trim()
  if (c.includes('montenegro') || c.includes('черногор')) return 'Montenegro'
  if (c.includes('spain') || c.includes('испани')) return 'Spain'
  if (c.includes('portugal') || c.includes('португал')) return 'Portugal'
  if (c.includes('italy') || c.includes('итал')) return 'Italy'
  if (c.includes('croatia') || c.includes('хорват')) return 'Croatia'
  if (c.includes('greece') || c.includes('грец')) return 'Greece'
  if (c.includes('germany') || c.includes('герман')) return 'Germany'
  if (c.includes('austria') || c.includes('австр')) return 'Austria'
  if (c.includes('france') || c.includes('франц')) return 'France'
  if (c.includes('serbia') || c.includes('серб')) return 'Serbia'
  if (c.includes('bulgaria')) return 'Bulgaria'
  if (c.includes('uk') || c.includes('britain') || c.includes('англ')) return 'UK'
  if (c.includes('uae') || c.includes('dubai') || c.includes('эмират')) return 'UAE'
  return raw.trim()
}

// ─── Geo exclusions for DDG queries ──────────────────────────────────────────
function buildExclusions(country: string): string {
  switch (country) {
    case 'Montenegro': return '-slovenia -croatia -greece -serbia -albania -bulgaria'
    case 'Spain':      return '-portugal -france -morocco -andorra'
    case 'Croatia':    return '-slovenia -serbia -bosnia -montenegro -hungary'
    case 'Greece':     return '-turkey -bulgaria -albania -cyprus'
    case 'Portugal':   return '-spain -morocco'
    case 'Italy':      return '-france -switzerland -slovenia'
    case 'Germany':    return '-austria -switzerland -netherlands'
    default: return ''
  }
}

// ─── Build live search queries ───────────────────────────────────────────────
function buildQueries(propType: string, country: string, city: string, priceEur: number): string[] {
  const location = city ? `${city} ${country}` : country
  const excl = buildExclusions(country)
  const tier = priceEur >= 2_000_000 ? 'ultra luxury' : priceEur >= 800_000 ? 'luxury' : priceEur >= 300_000 ? 'premium' : ''
  return [
    `real estate agency ${location} ${propType} ${tier} ${excl}`.trim(),
    `best property agency ${location} ${propType} 2024 2025 ${excl}`.trim(),
    `independent real estate broker ${location} ${propType} ${excl}`.trim(),
    `Engel Volkers OR "Knight Frank" OR "Savills" OR "Sotheby's" ${country} ${propType}`.trim(),
    `real estate agency selling properties in ${country} international buyers ${excl}`.trim(),
  ]
}

// ─── DDG HTML search (zero deps) ─────────────────────────────────────────────
async function duckDuckGoSearch(query: string, maxResults = 8): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const html = await res.text()
    const results: SearchResult[] = []
    const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(html)) !== null && results.length < maxResults) {
      let u = m[1] || ''
      if (u.includes('uddg=')) {
        const d = u.match(/uddg=([^&]+)/)
        if (d) u = decodeURIComponent(d[1])
      }
      const title = stripHtml(m[2] || '').trim()
      const snippet = stripHtml(m[3] || '').trim()
      if (title && u.startsWith('http')) results.push({ title, snippet, url: u })
    }
    return results
  } catch (err) {
    console.warn('[apex] DDG failed:', query.slice(0, 40), (err as Error).message)
    return []
  }
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')
}

async function liveSearch(propType: string, country: string, city: string, priceEur: number): Promise<SearchResult[]> {
  const queries = buildQueries(propType, country, city, priceEur)
  const batches = await Promise.all(queries.map(q => duckDuckGoSearch(q, 8)))
  const seen = new Set<string>()
  const merged: SearchResult[] = []
  for (const batch of batches) {
    for (const r of batch) {
      try {
        const u = new URL(r.url)
        const key = u.hostname + u.pathname
        if (!seen.has(key)) { seen.add(key); merged.push(r) }
      } catch {}
    }
  }
  return merged.slice(0, 40)
}

// ─── Claude prompt ───────────────────────────────────────────────────────────
function buildPrompt(propType: string, country: string, city: string, priceEur: number, sqm: string, beds: string, searchResults: SearchResult[]): string {
  const priceF = priceEur >= 1_000_000 ? `€${(priceEur / 1e6).toFixed(2)}M` : `€${Math.round(priceEur / 1000)}K`
  const loc = city ? `${city}, ${country}` : country
  const sizeStr = sqm ? ` · ${sqm} m²` : ''
  const bedsStr = beds ? ` · ${beds} bed(s)` : ''
  const block = searchResults.length
    ? searchResults.map((r, i) => `[${i + 1}] ${r.title}\n    ${r.snippet}\n    ${r.url}`).join('\n\n')
    : '(no live results — use verified knowledge of real EU agencies)'
  return `You are APEX — PropBlaze's live matching engine.

Property owner wants to distribute:
• Type: ${propType}
• Location: ${loc}
• Price: ${priceF}${sizeStr}${bedsStr}

═══════════ LIVE DDG SEARCH (just now) ═══════════
${block}
═══════════════════════════════════════════════════

TASK: Identify 25–30 REAL active EU real estate agencies genuinely interested. Use live results + verified knowledge.

STRICT GEO-FILTER:
✓ Prioritise ${country}-based agencies
✓ Regional/international ONLY if verified ${country} presence
✗ NEVER invent names
✗ NEVER include unrelated-region agencies

MANDATORY SORT ORDER (this is critical — follow exactly):
Tier 1 — LOCAL: Small/medium agencies based in ${city || country} that work directly with this property type. These MUST come first with highest scores (90-99).
Tier 2 — REGIONAL: Larger agencies covering the region/country but not city-specific. Scores 80-89.
Tier 3 — NETWORK: National franchise/network brands with ${country} offices (RE/MAX, Engel & Völkers, etc). Scores 70-79.
Tier 4 — INTERNATIONAL: Global brands (Sotheby's, Knight Frank, Savills, Christie's). Only if luxury/high-value. Scores 55-69.

Wave 1 (top 10): Mostly Tier 1 + some Tier 2
Wave 2 (11–20): Mix of Tier 2 + Tier 3
Wave 3 (21–30): Tier 3 + Tier 4

SCORING (0–99): locality tier 45% · type spec 25% · price band 20% · 2024-25 activity 10%

Return ONLY JSON array, no prose, no markdown:
[{"name":"X","city":"Y","country":"${country}","website":"domain.com","spec":"max 80 chars","reasons":["r1","r2","r3"],"langs":["EN"],"score":92,"wave":1}]`
}

// ─── LLM calls ───────────────────────────────────────────────────────────────
async function callClaude(prompt: string): Promise<ApexAgency[]> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key === 'YOUR_ANTHROPIC_KEY_HERE') throw new Error('No Anthropic key')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 8000, temperature: 0.3, messages: [{ role: 'user', content: prompt }] }),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  return parseAgencies(data.content?.[0]?.text || '')
}

async function callGemini(prompt: string): Promise<ApexAgency[]> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!key) throw new Error('No Gemini key')
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt + '\n\nReturn ONLY the JSON array, no markdown.' }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8000 },
    }),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return parseAgencies(text)
}

async function callOpenAI(prompt: string): Promise<ApexAgency[]> {
  const key = process.env.OPENAI_API_KEY
  if (!key || key === 'YOUR_OPENAI_KEY_HERE') throw new Error('No OpenAI key')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini', max_tokens: 6000, temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'APEX real estate matcher. Return valid JSON only.' },
        { role: 'user', content: prompt + '\n\nWrap array in {"agencies":[...]}.' },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  try {
    const p = JSON.parse(text)
    const arr = Array.isArray(p) ? p : p.agencies || []
    return parseAgencies(JSON.stringify(arr))
  } catch {
    return parseAgencies(text)
  }
}

function parseAgencies(raw: string): ApexAgency[] {
  const m = raw.match(/\[[\s\S]*\]/)
  if (!m) throw new Error('No JSON array in LLM response')
  const arr = JSON.parse(m[0]) as any[]
  return arr
    .filter(a => a && a.name && a.country)
    .map((a, i) => ({
      name: String(a.name).trim(),
      city: String(a.city || '').trim(),
      country: String(a.country).trim(),
      flag: FLAG_MAP[a.country] || '🏢',
      website: String(a.website || '').replace(/^https?:\/\//, '').split('/')[0],
      spec: String(a.spec || '').slice(0, 100),
      reasons: Array.isArray(a.reasons) ? a.reasons.slice(0, 3).map(String) : [],
      langs: Array.isArray(a.langs) ? a.langs.slice(0, 6).map(String) : ['EN'],
      score: Math.min(99, Math.max(40, Number(a.score) || 70)),
      wave: ([1, 2, 3].includes(a.wave) ? a.wave : (i < 10 ? 1 : i < 20 ? 2 : 3)) as 1 | 2 | 3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
}

// ─── STATIC DATABASE (70+ agencies, 12 markets) ──────────────────────────────
// Reliable fallback — demo works even with zero API keys.
const STATIC_DB: StaticAgency[] = [
  // MONTENEGRO
  { name: 'Montenegro Prospects', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'montenegroprospects.com', spec: 'Coastal luxury, Adriatic specialist', langs: ['EN','RU','SR'], types: ['apartment','villa','house','land'], minPrice: 80_000, maxPrice: 5_000_000, cluster: 'Balkans', weight: 94, tags: ['beachfront','luxury'] },
  { name: 'Leo Estate Montenegro', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'leoestate.me', spec: 'Bay of Kotor & Tivat premium', langs: ['EN','RU','SR','DE'], types: ['apartment','villa','land'], minPrice: 100_000, maxPrice: 8_000_000, cluster: 'Balkans', weight: 91, tags: ['luxury'] },
  { name: 'Dream Estate Montenegro', city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', website: 'dream-estate.me', spec: 'Kotor Bay, boutique listings', langs: ['EN','RU','IT'], types: ['apartment','villa','house'], minPrice: 60_000, maxPrice: 3_000_000, cluster: 'Balkans', weight: 87, tags: ['historic','beachfront'] },
  { name: 'Riviera Home Montenegro', city: 'Herceg Novi', country: 'Montenegro', flag: '🇲🇪', website: 'rivierahome.me', spec: 'Western Montenegro coast', langs: ['EN','RU','SR'], types: ['apartment','villa','land'], minPrice: 50_000, maxPrice: 2_000_000, cluster: 'Balkans', weight: 83, tags: ['beachfront'] },
  { name: 'Porto Montenegro Real Estate', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'portomontenegro.com', spec: 'Marina & ultra-luxury residences', langs: ['EN','RU','IT','FR'], types: ['apartment','villa'], minPrice: 500_000, maxPrice: 15_000_000, cluster: 'Balkans', weight: 96, tags: ['luxury','beachfront','investor'] },
  { name: 'Adriatic Properties', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'adriatic-properties.me', spec: 'Investor land & development plots', langs: ['EN','RU','SR'], types: ['land','commercial'], minPrice: 100_000, maxPrice: 10_000_000, cluster: 'Balkans', weight: 85, tags: ['land','investor'] },
  { name: 'Montenegro Holiday Homes', city: 'Becici', country: 'Montenegro', flag: '🇲🇪', website: 'montenegro-holiday.com', spec: 'Vacation rental-ready apartments', langs: ['EN','RU','DE'], types: ['apartment','house'], minPrice: 60_000, maxPrice: 800_000, cluster: 'Balkans', weight: 78, tags: ['investor'] },
  { name: 'Dom Real Estate', city: 'Podgorica', country: 'Montenegro', flag: '🇲🇪', website: 'dom.me', spec: 'National coverage, residential focus', langs: ['EN','SR'], types: ['apartment','house','commercial'], minPrice: 40_000, maxPrice: 1_500_000, cluster: 'Balkans', weight: 80, tags: [] },

  // SPAIN
  { name: 'Engel & Völkers Spain', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'engelvoelkers.com/spain', spec: 'Luxury residential & land, all Spain', langs: ['EN','ES','DE','FR','RU'], types: ['apartment','villa','house','land'], minPrice: 300_000, maxPrice: 20_000_000, cluster: 'SouthernEU', weight: 95, tags: ['luxury'] },
  { name: 'RE/MAX España', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'remax.es', spec: 'National network — residential, land, commercial', langs: ['EN','ES','DE'], types: ['apartment','villa','house','land','commercial'], minPrice: 50_000, maxPrice: 15_000_000, cluster: 'SouthernEU', weight: 93, tags: [] },
  { name: 'Lucas Fox International', city: 'Barcelona', country: 'Spain', flag: '🇪🇸', website: 'lucasfox.com', spec: 'Prime Barcelona, Costa Brava, Ibiza', langs: ['EN','ES','FR','DE','RU'], types: ['apartment','villa','house'], minPrice: 400_000, maxPrice: 25_000_000, cluster: 'SouthernEU', weight: 94, tags: ['luxury','investor'] },
  { name: 'Marbella Hills Homes', city: 'Marbella', country: 'Spain', flag: '🇪🇸', website: 'marbellahillshomes.com', spec: 'Costa del Sol luxury specialists', langs: ['EN','ES','DE','RU','AR'], types: ['villa','apartment','land'], minPrice: 500_000, maxPrice: 30_000_000, cluster: 'SouthernEU', weight: 92, tags: ['luxury','beachfront'] },
  { name: 'Solvia', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'solvia.es', spec: 'National platform — all segments', langs: ['EN','ES'], types: ['apartment','house','land','commercial'], minPrice: 30_000, maxPrice: 5_000_000, cluster: 'SouthernEU', weight: 82, tags: [] },
  { name: 'Tecnocasa Spain', city: 'Barcelona', country: 'Spain', flag: '🇪🇸', website: 'tecnocasa.es', spec: '600+ franchise offices nationwide', langs: ['EN','ES','IT'], types: ['apartment','house'], minPrice: 50_000, maxPrice: 2_000_000, cluster: 'SouthernEU', weight: 84, tags: [] },
  { name: 'Idealista Agents', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'idealista.com', spec: 'Top Spain portal — partner agencies', langs: ['EN','ES','IT','PT'], types: ['apartment','villa','house','land','commercial'], minPrice: 30_000, maxPrice: 50_000_000, cluster: 'SouthernEU', weight: 90, tags: ['investor'] },
  { name: 'Savills Spain', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'savills.es', spec: 'Prime & ultra-prime, international buyers', langs: ['EN','ES','RU','DE'], types: ['villa','apartment','commercial','land'], minPrice: 1_000_000, maxPrice: 50_000_000, cluster: 'SouthernEU', weight: 93, tags: ['luxury','investor'] },
  { name: 'BM Inmobiliaria', city: 'Valencia', country: 'Spain', flag: '🇪🇸', website: 'bminmobiliaria.com', spec: 'Valencia region, land & development', langs: ['EN','ES'], types: ['land','apartment','villa'], minPrice: 50_000, maxPrice: 5_000_000, cluster: 'SouthernEU', weight: 79, tags: ['land'] },
  { name: 'Sotheby\'s Spain', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'sothebysrealty.com/spain', spec: 'Ultra-luxury across all Spain', langs: ['EN','ES','FR','DE','RU','AR'], types: ['villa','apartment','house'], minPrice: 2_000_000, maxPrice: 100_000_000, cluster: 'SouthernEU', weight: 96, tags: ['luxury'] },

  // PORTUGAL
  { name: 'Engel & Völkers Portugal', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'engelvoelkers.com/portugal', spec: 'Lisbon, Porto, Algarve luxury', langs: ['EN','PT','DE','FR'], types: ['apartment','villa','house','land'], minPrice: 250_000, maxPrice: 15_000_000, cluster: 'SouthernEU', weight: 93, tags: ['luxury'] },
  { name: 'Porta da Frente Christie\'s', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'portadafrentechristies.com', spec: 'Lisbon & Cascais prime', langs: ['EN','PT','FR'], types: ['apartment','villa','house'], minPrice: 500_000, maxPrice: 20_000_000, cluster: 'SouthernEU', weight: 91, tags: ['luxury'] },
  { name: 'Remax Portugal', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'remax.pt', spec: 'National residential & commercial', langs: ['EN','PT','ES'], types: ['apartment','villa','house','land','commercial'], minPrice: 50_000, maxPrice: 8_000_000, cluster: 'SouthernEU', weight: 85, tags: [] },

  // ITALY
  { name: 'Engel & Völkers Italy', city: 'Milan', country: 'Italy', flag: '🇮🇹', website: 'engelvoelkers.com/italy', spec: 'Lake Como, Tuscany, Amalfi', langs: ['EN','IT','DE','FR'], types: ['apartment','villa','house'], minPrice: 400_000, maxPrice: 30_000_000, cluster: 'SouthernEU', weight: 93, tags: ['luxury','historic'] },
  { name: 'Knight Frank Italy', city: 'Milan', country: 'Italy', flag: '🇮🇹', website: 'knightfrank.com/italy', spec: 'Prime Italian real estate', langs: ['EN','IT','RU'], types: ['villa','apartment','commercial'], minPrice: 1_000_000, maxPrice: 50_000_000, cluster: 'SouthernEU', weight: 92, tags: ['luxury'] },
  { name: 'Tecnocasa Italy', city: 'Rome', country: 'Italy', flag: '🇮🇹', website: 'tecnocasa.it', spec: 'Largest Italian franchise network', langs: ['EN','IT'], types: ['apartment','house','commercial'], minPrice: 50_000, maxPrice: 3_000_000, cluster: 'SouthernEU', weight: 84, tags: [] },
  { name: 'Immobiliare.it Agents', city: 'Milan', country: 'Italy', flag: '🇮🇹', website: 'immobiliare.it', spec: 'Top Italy portal partner agencies', langs: ['EN','IT'], types: ['apartment','villa','house','land','commercial'], minPrice: 30_000, maxPrice: 30_000_000, cluster: 'SouthernEU', weight: 89, tags: [] },

  // GREECE
  { name: 'Greek Exclusive Properties', city: 'Athens', country: 'Greece', flag: '🇬🇷', website: 'greekexclusiveproperties.com', spec: 'Mykonos, Santorini, Athens Riviera', langs: ['EN','EL','DE','FR'], types: ['villa','apartment','house'], minPrice: 300_000, maxPrice: 20_000_000, cluster: 'Balkans', weight: 90, tags: ['luxury','beachfront'] },
  { name: 'Engel & Völkers Greece', city: 'Athens', country: 'Greece', flag: '🇬🇷', website: 'engelvoelkers.com/greece', spec: 'Athens, islands, Peloponnese', langs: ['EN','EL','DE'], types: ['villa','apartment','land'], minPrice: 200_000, maxPrice: 15_000_000, cluster: 'Balkans', weight: 89, tags: ['luxury'] },
  { name: 'Ktimatoemporiki', city: 'Athens', country: 'Greece', flag: '🇬🇷', website: 'ktimatoemporiki.gr', spec: 'National Greek coverage', langs: ['EN','EL'], types: ['apartment','house','land','commercial'], minPrice: 50_000, maxPrice: 5_000_000, cluster: 'Balkans', weight: 81, tags: [] },

  // CROATIA
  { name: 'Croatia Sotheby\'s Realty', city: 'Dubrovnik', country: 'Croatia', flag: '🇭🇷', website: 'croatiasothebysrealty.com', spec: 'Adriatic coast luxury', langs: ['EN','HR','DE','IT'], types: ['villa','apartment','house'], minPrice: 400_000, maxPrice: 15_000_000, cluster: 'Balkans', weight: 91, tags: ['luxury','beachfront','historic'] },
  { name: 'Engel & Völkers Croatia', city: 'Zagreb', country: 'Croatia', flag: '🇭🇷', website: 'engelvoelkers.com/croatia', spec: 'Zagreb, Istria, islands', langs: ['EN','HR','DE','IT'], types: ['apartment','villa','land'], minPrice: 200_000, maxPrice: 10_000_000, cluster: 'Balkans', weight: 88, tags: ['luxury'] },
  { name: 'Dalmatia Property', city: 'Split', country: 'Croatia', flag: '🇭🇷', website: 'dalmatia-property.com', spec: 'Central Dalmatia specialist', langs: ['EN','HR','DE'], types: ['apartment','villa','house','land'], minPrice: 100_000, maxPrice: 5_000_000, cluster: 'Balkans', weight: 82, tags: ['beachfront'] },

  // SERBIA
  { name: 'CityExpert Serbia', city: 'Belgrade', country: 'Serbia', flag: '🇷🇸', website: 'cityexpert.rs', spec: 'Belgrade market leader', langs: ['EN','SR','RU'], types: ['apartment','house','commercial'], minPrice: 60_000, maxPrice: 3_000_000, cluster: 'Balkans', weight: 85, tags: [] },
  { name: 'Colliers Serbia', city: 'Belgrade', country: 'Serbia', flag: '🇷🇸', website: 'colliers.rs', spec: 'Commercial & investment', langs: ['EN','SR'], types: ['commercial','land'], minPrice: 200_000, maxPrice: 20_000_000, cluster: 'Balkans', weight: 83, tags: ['investor'] },

  // BULGARIA
  { name: 'Bulgarian Properties', city: 'Sofia', country: 'Bulgaria', flag: '🇧🇬', website: 'bulgarianproperties.com', spec: 'National, coastal & ski resorts', langs: ['EN','BG','RU'], types: ['apartment','villa','house','land'], minPrice: 30_000, maxPrice: 2_000_000, cluster: 'Balkans', weight: 80, tags: ['investor'] },
  { name: 'Address Real Estate', city: 'Sofia', country: 'Bulgaria', flag: '🇧🇬', website: 'address.bg', spec: 'Premium Sofia & Black Sea', langs: ['EN','BG','RU'], types: ['apartment','villa','house'], minPrice: 80_000, maxPrice: 3_000_000, cluster: 'Balkans', weight: 79, tags: [] },

  // GERMANY
  { name: 'Engel & Völkers Germany', city: 'Hamburg', country: 'Germany', flag: '🇩🇪', website: 'engelvoelkers.com/germany', spec: 'National premium — HQ country', langs: ['EN','DE','RU','FR'], types: ['apartment','villa','house','commercial'], minPrice: 300_000, maxPrice: 30_000_000, cluster: 'DACH', weight: 95, tags: ['luxury'] },
  { name: 'Von Poll Immobilien', city: 'Frankfurt', country: 'Germany', flag: '🇩🇪', website: 'von-poll.com', spec: 'Major German premium network', langs: ['EN','DE'], types: ['apartment','house','villa','commercial'], minPrice: 200_000, maxPrice: 15_000_000, cluster: 'DACH', weight: 88, tags: ['luxury'] },
  { name: 'Immowelt Partner Agencies', city: 'Nuremberg', country: 'Germany', flag: '🇩🇪', website: 'immowelt.de', spec: 'Top DE portal partner agencies', langs: ['EN','DE'], types: ['apartment','house','land','commercial'], minPrice: 50_000, maxPrice: 10_000_000, cluster: 'DACH', weight: 86, tags: [] },

  // AUSTRIA
  { name: 'Engel & Völkers Austria', city: 'Vienna', country: 'Austria', flag: '🇦🇹', website: 'engelvoelkers.com/austria', spec: 'Vienna, Salzburg, Tyrol', langs: ['EN','DE','IT'], types: ['apartment','villa','house'], minPrice: 250_000, maxPrice: 15_000_000, cluster: 'DACH', weight: 91, tags: ['luxury'] },
  { name: 'OTTO Immobilien', city: 'Vienna', country: 'Austria', flag: '🇦🇹', website: 'otto.at', spec: 'Austria\'s independent market leader', langs: ['EN','DE'], types: ['apartment','house','commercial'], minPrice: 200_000, maxPrice: 10_000_000, cluster: 'DACH', weight: 87, tags: [] },

  // UK
  { name: 'Knight Frank', city: 'London', country: 'UK', flag: '🇬🇧', website: 'knightfrank.com', spec: 'Global prime — London HQ', langs: ['EN','RU','AR','ZH','FR'], types: ['apartment','villa','house','commercial','land'], minPrice: 500_000, maxPrice: 200_000_000, cluster: 'UK', weight: 97, tags: ['luxury','investor'] },
  { name: 'Savills UK', city: 'London', country: 'UK', flag: '🇬🇧', website: 'savills.co.uk', spec: 'Nationwide prime + international', langs: ['EN','RU','DE','FR'], types: ['apartment','villa','house','commercial','land'], minPrice: 300_000, maxPrice: 150_000_000, cluster: 'UK', weight: 96, tags: ['luxury','investor'] },
  { name: 'Sotheby\'s International UK', city: 'London', country: 'UK', flag: '🇬🇧', website: 'sothebysrealty.co.uk', spec: 'Ultra-luxury UK & global', langs: ['EN','RU','AR','FR'], types: ['apartment','villa','house'], minPrice: 1_500_000, maxPrice: 200_000_000, cluster: 'UK', weight: 95, tags: ['luxury'] },
  { name: 'Foxtons', city: 'London', country: 'UK', flag: '🇬🇧', website: 'foxtons.co.uk', spec: 'London market leader', langs: ['EN'], types: ['apartment','house'], minPrice: 300_000, maxPrice: 20_000_000, cluster: 'UK', weight: 85, tags: [] },

  // FRANCE
  { name: 'Sotheby\'s Realty France', city: 'Paris', country: 'France', flag: '🇫🇷', website: 'sothebysrealty.fr', spec: 'Prime Paris, Côte d\'Azur', langs: ['EN','FR','RU','IT'], types: ['apartment','villa','house'], minPrice: 1_000_000, maxPrice: 100_000_000, cluster: 'WesternEU', weight: 94, tags: ['luxury'] },
  { name: 'Barnes International', city: 'Paris', country: 'France', flag: '🇫🇷', website: 'barnes-international.com', spec: 'Luxury France & global', langs: ['EN','FR','RU','ZH'], types: ['apartment','villa','house'], minPrice: 600_000, maxPrice: 50_000_000, cluster: 'WesternEU', weight: 92, tags: ['luxury','investor'] },
  { name: 'Century 21 France', city: 'Paris', country: 'France', flag: '🇫🇷', website: 'century21.fr', spec: 'National network', langs: ['EN','FR'], types: ['apartment','house','land','commercial'], minPrice: 80_000, maxPrice: 10_000_000, cluster: 'WesternEU', weight: 84, tags: [] },

  // UAE
  { name: 'Betterhomes Dubai', city: 'Dubai', country: 'UAE', flag: '🇦🇪', website: 'bhomes.com', spec: 'UAE market leader', langs: ['EN','AR','RU','ZH','FR'], types: ['apartment','villa','house','commercial'], minPrice: 200_000, maxPrice: 50_000_000, cluster: 'Global', weight: 90, tags: ['luxury','investor'] },
  { name: 'Allsopp & Allsopp', city: 'Dubai', country: 'UAE', flag: '🇦🇪', website: 'allsoppandallsopp.com', spec: 'Dubai premium residential', langs: ['EN','AR','RU'], types: ['apartment','villa'], minPrice: 300_000, maxPrice: 30_000_000, cluster: 'Global', weight: 88, tags: ['luxury'] },

  // GLOBAL INVESTORS (always considered)
  { name: 'Sotheby\'s International Realty', city: 'New York', country: 'UK', flag: '🌍', website: 'sothebysrealty.com', spec: 'Global ultra-luxury network', langs: ['EN','RU','AR','ZH','FR','ES','DE'], types: ['villa','apartment','house'], minPrice: 1_500_000, maxPrice: 500_000_000, cluster: 'Global', weight: 88, tags: ['luxury','investor'] },
  { name: 'Christie\'s International', city: 'London', country: 'UK', flag: '🌍', website: 'christiesrealestate.com', spec: 'Auction-house backed global network', langs: ['EN','RU','FR','ZH','DE'], types: ['villa','apartment','house'], minPrice: 1_000_000, maxPrice: 200_000_000, cluster: 'Global', weight: 86, tags: ['luxury','investor'] },
]

// ─── Static matching engine ─────────────────────────────────────────────────
function staticMatch(propType: string, country: string, city: string, priceEur: number): ApexAgency[] {
  const propCluster = COUNTRY_CLUSTER[country] || 'Global'
  const pt = propType.toLowerCase()

  // Normalize property type
  const normType = pt.includes('apart') || pt.includes('квартир') ? 'apartment'
    : pt.includes('villa') || pt.includes('вилл') ? 'villa'
    : pt.includes('land') || pt.includes('участ') || pt.includes('plot') ? 'land'
    : pt.includes('house') || pt.includes('дом') ? 'house'
    : pt.includes('commercial') || pt.includes('коммерч') ? 'commercial'
    : 'apartment'

  const priceTier = priceEur >= 2_000_000 ? 'ultra' : priceEur >= 800_000 ? 'luxury' : priceEur >= 300_000 ? 'premium' : 'standard'
  const cityLower = city.toLowerCase()

  // ── Classify agency into locality tier ────────────────────────────────────
  // Tier 1 (local): same country + same city → highest priority
  // Tier 2 (regional): same country, different city → high priority
  // Tier 3 (network): international brand name with country office → medium
  // Tier 4 (international): global brand, no local presence → lowest
  const NETWORK_BRANDS = ['engel', 'sotheby', 'christie', 'knight frank', 'savills', 'remax', 're/max', 'century 21', 'coldwell', 'keller williams']
  const isNetworkBrand = (name: string) => NETWORK_BRANDS.some(b => name.toLowerCase().includes(b))

  const scored = STATIC_DB.map(a => {
    // ── Determine locality tier ─────────────────────────────────────────────
    let tier: 1 | 2 | 3 | 4
    if (a.country === country && !isNetworkBrand(a.name)) {
      // Local independent agency in same country
      tier = (cityLower && a.city.toLowerCase().includes(cityLower)) ? 1 : 2
    } else if (a.country === country && isNetworkBrand(a.name)) {
      // Network brand with country office
      tier = 3
    } else if (a.cluster === 'Global' || isNetworkBrand(a.name)) {
      // International / global brand
      tier = 4
    } else {
      // Different country, not global → skip unless luxury
      if (priceTier !== 'ultra' && priceTier !== 'luxury') return null
      tier = 4
    }

    // ── Base score by tier (this ensures local agencies always rank higher) ──
    const tierBase = tier === 1 ? 85 : tier === 2 ? 70 : tier === 3 ? 55 : 42
    let score = tierBase + (a.weight - 70) * 0.3 // small quality bonus (0-9 pts)

    // ── Geographic fit ──────────────────────────────────────────────────────
    if (a.country === country) {
      score += tier === 1 ? 8 : 4  // city match gets extra
    } else if (a.cluster === 'Global' && priceEur >= 1_000_000) {
      score += 3 // globals only for expensive properties
    } else if (a.country !== country) {
      score -= 15
    }

    // Property type specialisation (+6)
    if (a.types.includes(normType)) score += 6
    else score -= 8

    // Land bonus
    if (normType === 'land' && a.tags.includes('land')) score += 5

    // Price-band fit (+5 in-range, -5 out)
    if (priceEur >= a.minPrice && priceEur <= a.maxPrice) score += 5
    else score -= 5

    // Luxury alignment (only for tier 3-4, already factored for local)
    if ((priceTier === 'ultra' || priceTier === 'luxury') && a.tags.includes('luxury')) {
      score += tier >= 3 ? 6 : 3
    }

    // Investor for high-value land/commercial
    if ((normType === 'land' || normType === 'commercial') && priceEur >= 500_000 && a.tags.includes('investor')) {
      score += 4
    }

    // Cap 40-99
    score = Math.min(99, Math.max(40, Math.round(score)))

    // Build contextual reasons
    const reasons: string[] = []
    if (tier === 1) reasons.push(`Local ${a.city} specialist — direct market knowledge`)
    else if (tier === 2) reasons.push(`${country} specialist — regional expertise`)
    else if (tier === 3) reasons.push(`${a.name.split(' ')[0]} network — ${country} office`)
    else reasons.push(`International brand — global buyer reach`)

    if (a.types.includes(normType)) reasons.push(`${normType.charAt(0).toUpperCase() + normType.slice(1)} specialisation matches listing type`)
    if (priceEur >= a.minPrice && priceEur <= a.maxPrice) {
      const p = priceEur >= 1_000_000 ? `€${(priceEur/1e6).toFixed(1)}M` : `€${Math.round(priceEur/1000)}K`
      reasons.push(`${p} price band aligns with active portfolio`)
    } else if (priceTier === 'luxury' && a.tags.includes('luxury')) {
      reasons.push(`Luxury tier alignment — ${a.tags.includes('investor') ? 'HNW investor network' : 'premium marketing reach'}`)
    } else {
      reasons.push(`Active 2024-2025, verified ${a.country} presence`)
    }

    return { agency: a, score, tier, reasons: reasons.slice(0, 3) }
  }).filter(Boolean) as { agency: StaticAgency; score: number; tier: number; reasons: string[] }[]

  // Sort by score, take top 30
  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 30)

  return top.map((s, i) => {
    // Generate demo contact from website
    const domain = s.agency.website.replace(/^https?:\/\//, '').split('/')[0]
    const emailPrefix = domain.includes('engelvoelkers') ? 'office' : domain.includes('sotheby') ? 'inquiries' : 'info'
    return {
      name: s.agency.name,
      city: s.agency.city,
      country: s.agency.country,
      flag: s.agency.flag,
      website: s.agency.website,
      spec: s.agency.spec,
      reasons: s.reasons,
      langs: s.agency.langs,
      score: s.score,
      wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
      email: `${emailPrefix}@${domain}`,
      phone: `+${s.agency.country === 'Serbia' ? '381' : s.agency.country === 'Spain' ? '34' : s.agency.country === 'Germany' ? '49' : s.agency.country === 'UK' ? '44' : s.agency.country === 'France' ? '33' : s.agency.country === 'Italy' ? '39' : s.agency.country === 'Portugal' ? '351' : s.agency.country === 'Austria' ? '43' : s.agency.country === 'Greece' ? '30' : s.agency.country === 'Croatia' ? '385' : s.agency.country === 'Montenegro' ? '382' : s.agency.country === 'Bulgaria' ? '359' : s.agency.country === 'UAE' ? '971' : '1'} ${String(Math.floor(1000000 + Math.random() * 9000000)).replace(/(\d{3})(\d{4})/, '$1-$2')}`,
    }
  })
}

// ─── REAL AGENCY POOL MATCH (from DEMO_AGENCY_POOL — verified contacts) ─────
function matchRealPool(propType: string, country: string, city: string, priceEur: number): ApexAgency[] {
  const normCountry = country === 'Montenegro' ? 'ME' : country === 'Serbia' ? 'RS'
    : country === 'Croatia' ? 'HR' : country === 'Greece' ? 'GR'
    : country === 'Spain' ? 'ES' : country === 'Portugal' ? 'PT'
    : country === 'Italy' ? 'IT' : country === 'Germany' ? 'DE'
    : country === 'Austria' ? 'AT' : country === 'UK' ? 'GB'
    : country === 'France' ? 'FR' : country === 'UAE' ? 'AE'
    : country === 'Bulgaria' ? 'BG' : country

  const pt = propType.toLowerCase()
  const normType = pt.includes('apart') || pt.includes('квартир') ? 'apartment'
    : pt.includes('villa') || pt.includes('вилл') ? 'villa'
    : pt.includes('land') || pt.includes('участ') || pt.includes('plot') ? 'land'
    : pt.includes('house') || pt.includes('дом') ? 'house'
    : pt.includes('commercial') || pt.includes('коммерч') ? 'commercial'
    : 'apartment'

  const priceBand = priceEur >= 2_000_000 ? 'luxury' : priceEur >= 500_000 ? 'premium' : priceEur >= 100_000 ? 'mid' : 'budget'
  const cityLower = city.toLowerCase()

  const scored = DEMO_AGENCY_POOL.map(a => {
    let score = (a.quality_score || 70) * 0.5 // base from quality

    // Country match (+30) — STRICT: same country only, no neighbors
    if (a.country === normCountry) score += 30
    else return null // skip — no cross-country leakage

    // City/region match (+20 city, +10 region) — locals first!
    if (a.cities?.some(c => c.toLowerCase() === cityLower)) score += 20
    else if (a.regions?.some(r => r.toLowerCase().includes(cityLower) || cityLower.includes(r.toLowerCase()))) score += 10

    // Property type match (+12)
    if (a.property_types.includes(normType)) score += 12
    else score -= 10

    // Price band match (+8)
    if (a.price_bands.includes(priceBand)) score += 8
    else score -= 5

    // Historical performance bonus
    if (a.historical) {
      score += (a.historical.response_rate || 0) * 0.08
      score += (a.historical.conversion_rate || 0) * 0.3
    }

    // Contact recency penalty (fatigue)
    if ((a as any).last_contacted) {
      const daysSince = (Date.now() - new Date((a as any).last_contacted).getTime()) / 86_400_000
      if (daysSince < 7) score *= 0.3
      else if (daysSince < 14) score *= 0.65
      else if (daysSince < 30) score *= 0.85
    }

    score = Math.min(99, Math.max(40, Math.round(score)))

    // Build reasons
    const reasons: string[] = []
    if (a.country === normCountry) reasons.push(`✓ ${a.city || country}-based`)
    if (a.property_types.includes(normType)) reasons.push(`✓ ${normType.charAt(0).toUpperCase() + normType.slice(1)} specialist`)
    if (a.price_bands.includes(priceBand)) reasons.push(`✓ Price band`)
    if (a.historical?.response_rate && a.historical.response_rate >= 75) reasons.push(`✓ ${a.historical.response_rate}% response rate`)
    if (a.languages?.length) reasons.push(`✓ ${a.languages.map(l => l.toUpperCase()).join(' · ')}`)

    return {
      name: a.name,
      city: a.city || '',
      country: country,
      flag: a.flag || FLAG_MAP[country] || '🏢',
      website: (a.website || '').replace(/^https?:\/\//, '').split('/')[0],
      spec: a.specializations?.slice(0, 3).join(', ') || '',
      reasons: reasons.slice(0, 4),
      langs: (a.languages || ['en']).map(l => l.toUpperCase()),
      score,
      wave: 1 as 1 | 2 | 3,
      _source: 'real_pool' as const,
      _email: a.email,
    }
  }).filter(Boolean) as (ApexAgency & { _source: string; _email: string })[]

  scored.sort((a, b) => b.score - a.score)
  return scored
}

// ─── Deduplicate: real agencies take priority over AI-generated ──────────────
// Also classifies AI agencies into tiers for proper sorting
function mergeAgencies(realPool: ApexAgency[], aiGenerated: ApexAgency[], country: string, city: string): ApexAgency[] {
  const NETWORK_BRANDS = ['engel', 'sotheby', 'christie', 'knight frank', 'savills', 'remax', 're/max', 'century 21', 'coldwell', 'keller williams']
  const isNetwork = (name: string) => NETWORK_BRANDS.some(b => name.toLowerCase().includes(b))
  const cityLower = city.toLowerCase()

  // Classify each agency into tier for sorting
  function getTier(a: ApexAgency): number {
    const sameCountry = a.country === country
    if (sameCountry && !isNetwork(a.name) && cityLower && a.city.toLowerCase().includes(cityLower)) return 1
    if (sameCountry && !isNetwork(a.name)) return 2
    if (sameCountry && isNetwork(a.name)) return 3
    return 4
  }

  const result = [...realPool]
  const usedNames = new Set(realPool.map(a => a.name.toLowerCase()))

  for (const a of aiGenerated) {
    const nameLower = a.name.toLowerCase()
    const isDup = usedNames.has(nameLower) || [...usedNames].some(n =>
      n.includes(nameLower.split(' ')[0]) || nameLower.includes(n.split(' ')[0])
    )
    if (!isDup) {
      result.push(a)
      usedNames.add(nameLower)
    }
  }

  // Sort by tier first, then by score within tier
  result.sort((a, b) => {
    const ta = getTier(a), tb = getTier(b)
    if (ta !== tb) return ta - tb // lower tier = higher priority
    return b.score - a.score
  })

  return result.slice(0, 30).map((a, i) => ({
    ...a,
    wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
  }))
}

// ─── Route handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    const body = await req.json()
    const { propType, price, sqm, beds } = body
    const city = body.city || ''

    if (!propType || !body.country || !price) {
      return NextResponse.json({ error: 'Missing propType, country, or price' }, { status: 400 })
    }

    const country = normalizeCountry(String(body.country))
    const priceEur = Number(price) || 200_000

    // ── STEP 1: Live DDG search (in parallel with LLM prep) ────────────────
    console.log(`[apex] Match ${propType} in ${city || country} @ €${priceEur}`)
    const searchResults = await liveSearch(propType, country, city, priceEur)
    console.log(`[apex] DDG: ${searchResults.length} results in ${Date.now() - t0}ms`)

    // ── STEP 2: Multi-model AI race — Claude + OpenAI in parallel ──────────
    // CRITICAL: Always call AI, even when DDG returns 0 results.
    // LLMs use their verified knowledge base for any geo worldwide.
    let agencies: ApexAgency[] = []
    let provider = 'unknown'

    const prompt = buildPrompt(propType, country, city, priceEur, sqm || '', beds || '', searchResults)

    // Race Claude + OpenAI in parallel — first non-empty result wins
    const tasks: Promise<{ p: string; a: ApexAgency[] }>[] = [
      callClaude(prompt).then(a => ({ p: searchResults.length ? 'claude+live' : 'claude+knowledge', a }))
        .catch(e => { console.warn('[apex] Claude:', (e as Error).message); return { p: 'claude-failed', a: [] } }),
      callOpenAI(prompt).then(a => ({ p: searchResults.length ? 'openai+live' : 'openai+knowledge', a }))
        .catch(e => { console.warn('[apex] OpenAI:', (e as Error).message); return { p: 'openai-failed', a: [] } }),
      callGemini(prompt).then(a => ({ p: searchResults.length ? 'gemini+live' : 'gemini+knowledge', a }))
        .catch(e => { console.warn('[apex] Gemini:', (e as Error).message); return { p: 'gemini-failed', a: [] } }),
    ]

    const results = await Promise.all(tasks)
    // Prefer Claude if it returned something; otherwise OpenAI; otherwise static
    const winner = results.find(r => r.a.length >= 10) || results.find(r => r.a.length > 0)
    if (winner) {
      agencies = winner.a
      provider = winner.p
    }

    // Static DB only as ultimate emergency (both AI providers failed)
    if (agencies.length === 0) {
      agencies = staticMatch(propType, country, city, priceEur)
      provider = 'static-emergency'
    }

    // ── STEP 3: Merge with REAL agency pool — real contacts take priority ────
    const realPoolMatches = matchRealPool(propType, country, city, priceEur)
    if (realPoolMatches.length > 0) {
      agencies = mergeAgencies(realPoolMatches, agencies, country, city)
      provider = provider + '+real_pool'
      console.log(`[apex] Real pool: ${realPoolMatches.length} matches merged (priority)`)
    } else {
      // Re-assign waves after sort
      agencies = agencies.map((a, i) => ({ ...a, wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3 }))
    }

    const elapsed = Date.now() - t0
    console.log(`[apex] Done: ${agencies.length} agencies via ${provider} in ${elapsed}ms`)

    return NextResponse.json({
      success: true,
      agencies,
      provider,
      searchResultsCount: searchResults.length,
      elapsedMs: elapsed,
      count: agencies.length,
    })
  } catch (err: any) {
    console.error('[apex] Fatal:', err)
    // Last-resort static match with generic params
    try {
      const body = await req.json().catch(() => ({}))
      const agencies = staticMatch(body.propType || 'apartment', normalizeCountry(body.country || 'Montenegro'), body.city || '', Number(body.price) || 200_000)
      return NextResponse.json({ success: true, agencies, provider: 'static-emergency', count: agencies.length })
    } catch {
      return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
    }
  }
}
