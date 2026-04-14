/**
 * POST /api/apex-demo
 *
 * LIVE search engine for real estate agencies:
 * 1. Build geo-targeted queries from property params
 * 2. Search DuckDuckGo (live, every request — no caching)
 * 3. Pass results + strict geo-filter prompt to Claude
 * 4. Claude returns real verified agencies matching the property
 * 5. Static fallback only if no API key configured
 *
 * Public endpoint — no auth required.
 */

import { NextRequest, NextResponse } from 'next/server'

// Allow up to 60 seconds for live search + LLM analysis
export const maxDuration = 60
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // Never cache

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
}

interface SearchResult {
  title: string
  snippet: string
  url: string
}

// ─── Country → flag emoji map ─────────────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  Montenegro: '🇲🇪', Serbia: '🇷🇸', Croatia: '🇭🇷', Bosnia: '🇧🇦',
  Slovenia: '🇸🇮', 'North Macedonia': '🇲🇰', Albania: '🇦🇱', Kosovo: '🇽🇰',
  Greece: '🇬🇷', Bulgaria: '🇧🇬', Romania: '🇷🇴', Austria: '🇦🇹',
  Germany: '🇩🇪', Switzerland: '🇨🇭', UK: '🇬🇧', France: '🇫🇷',
  Spain: '🇪🇸', Portugal: '🇵🇹', Italy: '🇮🇹', Netherlands: '🇳🇱',
  Belgium: '🇧🇪', Poland: '🇵🇱', Hungary: '🇭🇺', 'Czech Republic': '🇨🇿',
  Slovakia: '🇸🇰', Denmark: '🇩🇰', Sweden: '🇸🇪', Norway: '🇳🇴',
  UAE: '🇦🇪', Turkey: '🇹🇷', Israel: '🇮🇱', Russia: '🇷🇺',
  Cyprus: '🇨🇾', Malta: '🇲🇹', Luxembourg: '🇱🇺', Ireland: '🇮🇪',
  Finland: '🇫🇮', Lithuania: '🇱🇹', Latvia: '🇱🇻', Estonia: '🇪🇪',
  'United Kingdom': '🇬🇧',
}

// ─── Geo exclusions for strict country filtering ─────────────────────────────
function buildExclusions(country: string): string {
  const c = country.toLowerCase()
  // Montenegro: exclude Balkans competitors
  if (c.includes('montenegro') || c.includes('черногор')) {
    return '-slovenia -croatia -greece -serbia -albania -bulgaria'
  }
  // Spain: exclude surrounding countries that aren't Spain
  if (c === 'spain' || c.includes('испани')) {
    return '-portugal -france -morocco -andorra'
  }
  // Croatia
  if (c === 'croatia' || c.includes('хорват')) {
    return '-slovenia -serbia -bosnia -montenegro -hungary'
  }
  // Generic EU
  return ''
}

// ─── Build live search queries ────────────────────────────────────────────────
function buildQueries(propType: string, country: string, city: string, priceEur: number): string[] {
  const location = city ? `${city} ${country}` : country
  const excl = buildExclusions(country)
  const priceTag = priceEur >= 1_000_000 ? 'luxury' : priceEur >= 300_000 ? 'premium' : ''

  return [
    // Q1: local agencies in the exact location
    `real estate agency ${location} ${propType} ${priceTag} ${excl}`.trim(),
    // Q2: local language + native terms
    `best property agency ${location} ${propType} 2024 2025 ${excl}`.trim(),
    // Q3: independent / local specialists
    `independent real estate broker ${location} ${propType} ${excl}`.trim(),
    // Q4: international brands with local presence
    `Engel Volkers OR "Knight Frank" OR "Savills" OR "Sotheby's" ${country} ${propType}`.trim(),
    // Q5: regional / nearby country agencies that serve this market
    `real estate agency selling properties in ${country} international buyers ${excl}`.trim(),
  ]
}

// ─── DuckDuckGo live search (HTML lite endpoint, no deps) ────────────────────
async function duckDuckGoSearch(query: string, maxResults = 8): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Short timeout — we have multiple queries in parallel
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return []
    const html = await res.text()

    // Parse DDG HTML results with regex
    const results: SearchResult[] = []
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi

    let match: RegExpExecArray | null
    while ((match = resultRegex.exec(html)) !== null && results.length < maxResults) {
      let url = match[1] || ''
      // DDG wraps redirects: /l/?uddg=...
      if (url.includes('uddg=')) {
        const uddg = url.match(/uddg=([^&]+)/)
        if (uddg) url = decodeURIComponent(uddg[1])
      }
      const title = stripHtml(match[2] || '').trim()
      const snippet = stripHtml(match[3] || '').trim()
      if (title && url.startsWith('http')) {
        results.push({ title, snippet, url })
      }
    }
    return results
  } catch (err) {
    console.warn('[apex] DDG search failed for:', query, (err as Error).message)
    return []
  }
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
}

// ─── Run all queries in parallel, deduplicate by URL ─────────────────────────
async function liveSearch(
  propType: string,
  country: string,
  city: string,
  priceEur: number,
): Promise<SearchResult[]> {
  const queries = buildQueries(propType, country, city, priceEur)
  const batches = await Promise.all(queries.map(q => duckDuckGoSearch(q, 8)))

  // Dedupe by URL host+path
  const seen = new Set<string>()
  const merged: SearchResult[] = []
  for (const batch of batches) {
    for (const r of batch) {
      try {
        const u = new URL(r.url)
        const key = u.hostname + u.pathname
        if (!seen.has(key)) {
          seen.add(key)
          merged.push(r)
        }
      } catch {
        // Skip malformed URLs
      }
    }
  }
  return merged.slice(0, 40) // Cap for prompt size
}

// ─── Build Claude prompt with strict geo filter + search context ─────────────
function buildPrompt(
  propType: string,
  country: string,
  city: string,
  priceEur: number,
  sqm: string,
  beds: string,
  searchResults: SearchResult[],
): string {
  const priceFormatted = priceEur >= 1_000_000
    ? `€${(priceEur / 1_000_000).toFixed(2)}M`
    : `€${Math.round(priceEur / 1000)}K`

  const location = city ? `${city}, ${country}` : country
  const sizeStr = sqm ? ` · ${sqm} m²` : ''
  const bedsStr = beds ? ` · ${beds} bed(s)` : ''

  const searchBlock = searchResults.length
    ? searchResults.map((r, i) =>
        `[${i + 1}] ${r.title}\n    ${r.snippet}\n    ${r.url}`
      ).join('\n\n')
    : '(live search returned no results — use your knowledge of real EU agencies)'

  return `You are APEX — PropBlaze's live matching engine.

A property owner in the European market wants to distribute this listing:
• Type: ${propType}
• Location: ${location}
• Price: ${priceFormatted}${sizeStr}${bedsStr}

═══════════════════════════════════════
LIVE WEB SEARCH RESULTS (from DuckDuckGo, fetched just now):
═══════════════════════════════════════
${searchBlock}
═══════════════════════════════════════

YOUR TASK
Identify exactly 25–30 REAL, currently active real estate agencies that would genuinely be interested in this listing. Use the live search results above + your verified knowledge of European real estate.

STRICT GEO-FILTER (non-negotiable):
The property is in ${country}. You must:
✓ Prioritise agencies physically based in ${country}
✓ Include regional agencies from neighbouring countries ONLY if they demonstrably serve ${country} market
✓ Include international brands (Sotheby's, Knight Frank, Savills, Engel & Völkers, RE/MAX) ONLY if they have verified presence or buyer pipeline in ${country}
✗ NEVER include agencies from unrelated regions (e.g. no Slovenia/Greece/Serbia for a Montenegro property)
✗ NEVER invent agency names — only real, verifiable companies

DISTRIBUTION MIX:
- Wave 1 (top 10, score 85–99): Local ${country} specialists + international brands with strong ${country} presence
- Wave 2 (11–20, score 70–84): Regional players + additional locals
- Wave 3 (21–30, score 55–69): Broader network + investor-focused

SCORING CRITERIA (0–99):
• Geographic fit for ${country}: 40%
• Property type specialisation (${propType}): 25%
• Price-band alignment (${priceFormatted}): 20%
• Verified activity 2024–2025: 15%

OUTPUT FORMAT — return ONLY a JSON array, no markdown, no prose:

[
  {
    "name": "Real Agency Name",
    "city": "City",
    "country": "${country}",
    "website": "domain.com",
    "spec": "Short specialisation line, max 80 chars",
    "reasons": [
      "Reason 1 — specific to this property (not generic)",
      "Reason 2 — mentions geography or specialisation",
      "Reason 3 — commercial/activity rationale"
    ],
    "langs": ["EN", "ES"],
    "score": 92,
    "wave": 1
  }
]

Return ONLY the JSON array. No explanation, no markdown fences, no text before or after.`
}

// ─── Call Claude ──────────────────────────────────────────────────────────────
async function callClaude(prompt: string): Promise<ApexAgency[]> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key === 'YOUR_ANTHROPIC_KEY_HERE') throw new Error('No Anthropic key')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      temperature: 0.3, // Low — reduce hallucinated agency names
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(45000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  return parseAgencies(text)
}

// ─── Call OpenAI as fallback LLM ──────────────────────────────────────────────
async function callOpenAI(prompt: string): Promise<ApexAgency[]> {
  const key = process.env.OPENAI_API_KEY
  if (!key || key === 'YOUR_OPENAI_KEY_HERE') throw new Error('No OpenAI key')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 6000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are APEX, a European real estate matching AI. Return only valid JSON.' },
        { role: 'user', content: prompt + '\n\nWrap the array in {"agencies": [...]}.' },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(text)
    const arr = Array.isArray(parsed) ? parsed : parsed.agencies || []
    return parseAgencies(JSON.stringify(arr))
  } catch {
    return parseAgencies(text)
  }
}

// ─── Parse + validate LLM output ─────────────────────────────────────────────
function parseAgencies(raw: string): ApexAgency[] {
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON array in LLM response')

  const arr = JSON.parse(match[0]) as any[]
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

// ─── Static fallback (used only when no API keys) ────────────────────────────
// Minimal database — just enough to keep the demo alive if both LLMs fail.
const STATIC_FALLBACK: Partial<Record<string, ApexAgency[]>> = {
  Montenegro: [
    { name: 'Montenegro Prospects', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'montenegroprospects.com', spec: 'Coastal luxury, Adriatic specialist', reasons: ['Local specialist', 'Coastal expertise', 'RU/EN/SR team'], langs: ['EN','RU','SR'], score: 94, wave: 1 },
    { name: 'Leo Estate Montenegro', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'leoestate.me', spec: 'Bay of Kotor & Tivat premium', reasons: ['Local coastal specialist', 'Active 2024-2025', 'Multilingual team'], langs: ['EN','RU','SR','DE'], score: 91, wave: 1 },
  ],
  Spain: [
    { name: 'RE/MAX España', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'remax.es', spec: 'National network — residential, land & commercial', reasons: ['National Spain coverage', 'Land expertise', 'Multilingual network'], langs: ['EN','ES','DE'], score: 94, wave: 1 },
    { name: 'Engel & Völkers Spain', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'engelvoelkers.com/spain', spec: 'Luxury residential & land, all Spain', reasons: ['Premium Spain specialist', 'Strong international buyer network', 'Multilingual'], langs: ['EN','ES','DE','FR','RU'], score: 93, wave: 1 },
  ],
}

function minimalStaticFallback(country: string): ApexAgency[] {
  const base = STATIC_FALLBACK[country] || []
  // Return at least something so UI isn't empty
  return base
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const t0 = Date.now()
  try {
    const { propType, country, city, price, sqm, beds } = await req.json()

    if (!propType || !country || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: propType, country, price' },
        { status: 400 },
      )
    }

    const priceEur = Number(price) || 200_000

    // ── STEP 1: Live DuckDuckGo search (always) ─────────────────────────────
    console.log(`[apex] Starting live search for ${propType} in ${city || country} @ €${priceEur}`)
    const searchResults = await liveSearch(propType, country, city || '', priceEur)
    console.log(`[apex] Live search: ${searchResults.length} unique results in ${Date.now() - t0}ms`)

    // ── STEP 2: Build prompt with live context ──────────────────────────────
    const prompt = buildPrompt(propType, country, city || '', priceEur, sqm || '', beds || '', searchResults)

    // ── STEP 3: Try Claude → OpenAI → minimal static ────────────────────────
    let agencies: ApexAgency[] = []
    let provider = 'unknown'

    try {
      agencies = await callClaude(prompt)
      provider = 'claude+live'
    } catch (claudeErr) {
      console.warn('[apex] Claude failed:', (claudeErr as Error).message)
      try {
        agencies = await callOpenAI(prompt)
        provider = 'openai+live'
      } catch (openaiErr) {
        console.warn('[apex] OpenAI failed:', (openaiErr as Error).message)
        agencies = minimalStaticFallback(country)
        provider = agencies.length ? 'fallback' : 'empty'
      }
    }

    // ── STEP 4: Re-assign waves after final sort ────────────────────────────
    agencies = agencies.map((a, i) => ({
      ...a,
      wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
    }))

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
    console.error('[apex] Fatal error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal error', elapsedMs: Date.now() - t0 },
      { status: 500 },
    )
  }
}
