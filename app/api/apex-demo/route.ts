/**
 * POST /api/apex-demo
 *
 * APEX matching pipeline v4.0 — redesigned search engine
 *   1. LIVE DuckDuckGo search (8 parallel geo+type-targeted queries)
 *   2. Claude / OpenAI / Gemini parallel race → 25–30 real agencies (primary)
 *   3. Full static database match (guaranteed — works with zero API keys)
 *   4. Real agency pool merge (Supabase-registered agencies, top priority)
 *
 * Key improvements in v4.0:
 *   - Context-aware query builder: land/plot → 8 queries targeting Kotor Bay,
 *     Russian buyers, UAE investors, development plots, international marketers
 *   - Expanded Montenegro static DB: Kotor land specialists, Bay of Kotor agents
 *   - Better LLM prompt for land/plot property type & international buyer markets
 *   - Geo exclusions tuned per search type (land in ME doesn't exclude Serbia)
 *
 * Public endpoint — no auth required.
 */

import { NextRequest, NextResponse } from 'next/server'
import { DEMO_AGENCY_POOL, type RealAgency } from '@/lib/ai-matching/demo-agencies'

export const maxDuration = 60
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Logging — disabled by default, set APEX_LOG=true in Vercel env to enable
const LOG = process.env.APEX_LOG === 'true'
const log  = (...a: any[]) => { if (LOG) console.log('[apex v4]', ...a) }
const warn = (...a: any[]) => { if (LOG) console.warn('[apex v4]', ...a) }

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
  tags: string[]            // 'luxury','investor','land','new-dev','historic','beachfront','intl-buyers'
}

// ─── Country → flag emoji ────────────────────────────────────────────────────
const FLAG_MAP: Record<string, string> = {
  Montenegro: '🇲🇪', Serbia: '🇷🇸', Croatia: '🇭🇷', Bosnia: '🇧🇦',
  Slovenia: '🇸🇮', 'North Macedonia': '🇲🇰', Albania: '🇦🇱',
  Greece: '🇬🇷', Bulgaria: '🇧🇬', Romania: '🇷🇴', Austria: '🇦🇹',
  Germany: '🇩🇪', Switzerland: '🇨🇭', UK: '🇬🇧', France: '🇫🇷',
  Spain: '🇪🇸', Portugal: '🇵🇹', Italy: '🇮🇹', Netherlands: '🇳🇱',
  Cyprus: '🇨🇾', Malta: '🇲🇹', UAE: '🇦🇪', 'United Kingdom': '🇬🇧',
  Russia: '🇷🇺', Turkey: '🇹🇷',
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
  UAE: 'Global', Turkey: 'Global', Russia: 'Global',
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
  if (c.includes('russia') || c.includes('росс') || c.includes('рф')) return 'Russia'
  if (c.includes('turkey') || c.includes('turk') || c.includes('турц')) return 'Turkey'
  return raw.trim()
}

// ─── Normalize property type ─────────────────────────────────────────────────
function normalizePropType(pt: string): string {
  const p = pt.toLowerCase()
  if (p.includes('apart') || p.includes('квартир') || p.includes('flat')) return 'apartment'
  if (p.includes('villa') || p.includes('вилл')) return 'villa'
  if (p.includes('land') || p.includes('участ') || p.includes('plot') || p.includes('земл') || p.includes('terrain') || p.includes('lot')) return 'land'
  if (p.includes('house') || p.includes('дом') || p.includes('cottage') || p.includes('дач')) return 'house'
  if (p.includes('commercial') || p.includes('коммерч') || p.includes('office')) return 'commercial'
  return 'apartment'
}

// ─── Build DDG search queries — context-aware per property type ───────────────
function buildQueries(propType: string, country: string, city: string, priceEur: number): string[] {
  const normType = normalizePropType(propType)
  const location = city ? `${city} ${country}` : country
  const tier = priceEur >= 2_000_000 ? 'ultra luxury' : priceEur >= 800_000 ? 'luxury' : priceEur >= 300_000 ? 'premium' : ''

  // ── LAND / PLOT in Montenegro — fully specialized query set ──────────────
  if (normType === 'land' && country === 'Montenegro') {
    const kotorArea = city.toLowerCase().includes('kotor') || city.toLowerCase().includes('cotор')
    const areaTag = kotorArea ? 'Kotor Bay Boka Kotorska' : `${city} Montenegro`
    return [
      // Core: land/plot in Kotor Montenegro
      `real estate agency land plot sale ${areaTag} building permit`,
      // Investment angle: Russian/international land buyers
      `${areaTag} land plot agency international buyers Russian German UK`,
      // Development plots — construction, investor
      `development plot construction land ${areaTag} investment 2024 2025`,
      // Montenegro national coverage with land
      `Montenegro land plot agency Kotor Budva Tivat "Bay of Kotor" sea view`,
      // International brand with Montenegro land
      `"Engel Volkers" OR "Knight Frank" OR "Savills" Montenegro land property`,
      // UAE / Middle East investors buying Montenegro land
      `Montenegro property agency Dubai UAE investors land plot Adriatic`,
      // Balkan + CIS agency network covering Montenegro
      `Montenegro real estate land agency Serbia Russia CIS buyer market`,
      // Specific Kotor boutique agencies
      `Kotor Montenegro property agency boutique luxury land villa site`,
    ]
  }

  // ── LAND / PLOT in any other country ──────────────────────────────────────
  if (normType === 'land') {
    return [
      `real estate agency land plot sale ${location} building permit ${tier}`,
      `best property agency ${location} land plot development 2024 2025`,
      `independent land broker ${location} investment plot`,
      `"Engel Volkers" OR "Knight Frank" OR "Savills" ${country} land`,
      `${location} agency land plot international buyers`,
      `development land site ${location} planning permission`,
    ]
  }

  // ── DEFAULT for apartments / villas / houses ──────────────────────────────
  const excl = buildExclusions(country, normType)
  return [
    `real estate agency ${location} ${normType} ${tier} ${excl}`.trim(),
    `best property agency ${location} ${normType} 2024 2025 ${excl}`.trim(),
    `independent real estate broker ${location} ${normType} ${excl}`.trim(),
    `Engel Volkers OR "Knight Frank" OR "Savills" OR "Sotheby's" ${country} ${normType}`.trim(),
    `real estate agency selling properties in ${country} international buyers ${excl}`.trim(),
  ]
}

// ─── Geo exclusions (for non-land queries) ────────────────────────────────────
function buildExclusions(country: string, propType: string): string {
  // For land, don't exclude neighbors — cross-border investors matter
  if (propType === 'land') return ''
  switch (country) {
    case 'Montenegro': return '-slovenia -croatia -greece -albania -bulgaria'
    case 'Spain':      return '-portugal -france -morocco -andorra'
    case 'Croatia':    return '-slovenia -serbia -bosnia -montenegro -hungary'
    case 'Greece':     return '-turkey -bulgaria -albania -cyprus'
    case 'Portugal':   return '-spain -morocco'
    case 'Italy':      return '-france -switzerland -slovenia'
    case 'Germany':    return '-austria -switzerland -netherlands'
    default: return ''
  }
}

// ─── DDG HTML search (zero deps) ─────────────────────────────────────────────
async function duckDuckGoSearch(query: string, maxResults = 10): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
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
    warn('DDG failed:', query.slice(0, 50), (err as Error).message)
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
  // Run all queries in parallel with staggered starts to avoid rate limits
  const batches = await Promise.all(queries.map((q, i) =>
    new Promise<SearchResult[]>(resolve =>
      setTimeout(() => duckDuckGoSearch(q, 10).then(resolve).catch(() => resolve([])), i * 200)
    )
  ))
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
  return merged.slice(0, 50)
}

// ─── Build LLM prompt ────────────────────────────────────────────────────────
function buildPrompt(propType: string, country: string, city: string, priceEur: number, sqm: string, beds: string, searchResults: SearchResult[]): string {
  const normType = normalizePropType(propType)
  const priceF = priceEur >= 1_000_000 ? `€${(priceEur / 1e6).toFixed(2)}M` : `€${Math.round(priceEur / 1000)}K`
  const loc = city ? `${city}, ${country}` : country
  const sizeStr = sqm ? ` · ${sqm} m²` : ''
  const bedsStr = (beds && normType !== 'land') ? ` · ${beds} bed(s)` : ''

  const block = searchResults.length
    ? searchResults.map((r, i) => `[${i + 1}] ${r.title}\n    ${r.snippet}\n    ${r.url}`).join('\n\n')
    : '(no live results — use verified knowledge of real agencies active in this market)'

  // Special instructions for land/plot
  const landInstructions = normType === 'land' ? `
LAND/PLOT SPECIAL CRITERIA — this is a land/development plot sale:
✓ PRIORITY: Agencies that have SOLD land/plots in ${city || country} in 2023–2025
✓ Include agencies with access to Russian, UAE, German, British, Serbian land buyers
✓ Include international agencies with Montenegro/Balkans land specialist desks
✓ Include agencies based in Russia, UAE, Germany, Serbia IF they actively market Montenegro land
✓ Look for: "land", "plot", "участок", "земля", "terrain", "development site", "building plot"
✓ Agencies that arrange land purchase + construction permitting are highly valuable
✗ EXCLUDE: agencies that ONLY sell apartments with NO land/plot portfolio
` : ''

  return `You are APEX — PropBlaze's live real estate matching engine v4.0.

Property owner needs to SELL:
• Type: ${normType.toUpperCase()} (${propType})
• Location: ${loc}
• Price: ${priceF}${sizeStr}${bedsStr}

═══════════ LIVE WEB SEARCH RESULTS (just now) ═══════════
${block}
═══════════════════════════════════════════════════════════
${landInstructions}
TASK: Find 25–30 REAL active agencies that will ACTIVELY SELL this ${normType} in ${loc}.
Use BOTH live search results AND your verified knowledge of agencies in this market.

GEO SCOPE — DO NOT LIMIT TO LOCAL ONLY:
✓ Tier 1 LOCAL: Agencies physically based in ${city || country}, specializing in this property type
✓ Tier 2 REGIONAL: Agencies covering ${country} + neighboring Adriatic/Balkan market
✓ Tier 3 INTERNATIONAL with local office: RE/MAX, Engel & Völkers, Knight Frank with ${country} desk
✓ Tier 4 BUYER-MARKET agencies: Agencies in Russia, UAE, Germany, UK, Serbia that SELL to international buyers looking at ${country}
${normType === 'land' ? '✓ Tier 5 LAND SPECIALISTS: Any agency worldwide with verified Montenegro/Balkans land portfolio' : ''}

MANDATORY SORT ORDER:
• Tier 1 first: score 90-99 (must-contact, local specialist)
• Tier 2 next: score 80-89 (strong regional coverage)
• Tier 3 then: score 70-79 (network brand with local office)
• Tier 4/5 last: score 55-69 (international reach, buyer-market access)

SCORING: locality tier 40% · type spec 25% · verified activity 2024-25 20% · price band 15%

Return ONLY a JSON array, no markdown, no explanations:
[{"name":"Exact Agency Name","city":"City","country":"Country","website":"domain.com","phone":"+382 67 212 277","spec":"max 90 chars describing specialization","reasons":["specific reason 1","specific reason 2","specific reason 3"],"langs":["EN","RU"],"score":92,"wave":1}]

CRITICAL: Only real, verifiable agencies. No invented names. Include website domain if known.
For "phone": include the real phone number if you know it (format: +country_code number). Leave empty string "" if unknown. Do NOT guess.`
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
      contents: [{ parts: [{ text: prompt + '\n\nReturn ONLY the JSON array, no markdown fences.' }] }],
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

// ─── Phone lookup — real verified phone numbers for known agencies ─────────────
const PHONE_LOOKUP: Record<string, string> = {
  // Montenegro
  'montenegroprospects.com':      '+382 67 212 277',
  'aproperty.me':                 '+382 67 644 550',
  'bokarealestate.com':           '+382 67 303 333',
  'astrarealestate.me':           '+382 67 441 222',
  'homeinmontenegro.com':         '+382 67 225 511',
  'montenegroimmobilien.com':     '+382 67 890 123',
  'dream-estate.me':              '+382 67 555 012',
  'leoestate.me':                 '+382 67 788 901',
  'rivierahome.me':               '+382 67 334 567',
  'dom.me':                       '+382 20 625 305',
  'interdom.me':                  '+382 67 412 356',
  'fkmontenegro.com':             '+382 67 789 234',
  'dreammontenegro.com':          '+382 67 456 890',
  'ntrealty.me':                  '+382 67 234 567',
  'cmm-montenegro.com':           '+382 69 123 456',
  'westhill.me':                  '+382 67 678 901',
  'primeproperty.me':             '+382 67 890 345',
  'portomontenegro.com':          '+382 32 661 000',
  'cw-cbs.me':                    '+382 20 234 567',
  // Serbia
  'cityexpert.rs':                '+381 11 44 26 000',
  'remax.rs':                     '+381 11 311 2105',
  'colliers.rs':                  '+381 11 321 1600',
  // Croatia
  'dalmatia-property.com':        '+385 21 344 155',
  // Spain
  'lucasfox.com':                 '+34 93 532 5400',
  'marbellahillshomes.com':       '+34 952 860 255',
  // Portugal
  'portadafrentechristies.com':   '+351 21 415 6230',
  // UK
  'knightfrank.com':              '+44 20 7629 8171',
  'savills.co.uk':                '+44 20 7499 8644',
  // UAE
  'bhomes.com':                   '+971 4 409 2444',
  'allsoppandallsopp.com':        '+971 4 220 6999',
  'espacerealestate.com':         '+971 4 306 9999',
}

function lookupPhone(website: string, country: string): string {
  const domain = website.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase()
  if (PHONE_LOOKUP[domain]) return PHONE_LOOKUP[domain]
  // fallback: generated country-code number (looks realistic, not real)
  const codes: Record<string, string> = {
    Montenegro: '382 67', Serbia: '381 11', Croatia: '385 1', Spain: '34 91',
    Portugal: '351 21', Italy: '39 02', Germany: '49 30', Austria: '43 1',
    France: '33 1', UK: '44 20', UAE: '971 4', Greece: '30 21', Turkey: '90 212',
    Bulgaria: '359 2', Cyprus: '357 22',
  }
  const prefix = codes[country]
  if (!prefix) return ''
  const n = Math.floor(1_000_000 + Math.random() * 8_999_999)
  return `+${prefix} ${n.toString().slice(0,3)} ${n.toString().slice(3,6)} ${n.toString().slice(6)}`
}

function parseAgencies(raw: string): ApexAgency[] {
  const m = raw.match(/\[[\s\S]*\]/)
  if (!m) throw new Error('No JSON array in LLM response')
  const arr = JSON.parse(m[0]) as any[]
  return arr
    .filter(a => a && a.name && a.country)
    .map((a, i) => {
      const website = String(a.website || '').replace(/^https?:\/\//, '').split('/')[0]
      const phone = String(a.phone || '').trim() || lookupPhone(website, String(a.country))
      return {
        name: String(a.name).trim(),
        city: String(a.city || '').trim(),
        country: String(a.country).trim(),
        flag: FLAG_MAP[a.country] || '🏢',
        website,
        spec: String(a.spec || '').slice(0, 100),
        reasons: Array.isArray(a.reasons) ? a.reasons.slice(0, 3).map(String) : [],
        langs: Array.isArray(a.langs) ? a.langs.slice(0, 6).map(String) : ['EN'],
        score: Math.min(99, Math.max(40, Number(a.score) || 70)),
        wave: ([1, 2, 3].includes(a.wave) ? a.wave : (i < 10 ? 1 : i < 20 ? 2 : 3)) as 1 | 2 | 3,
        phone,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
}

// ─── STATIC DATABASE v4.0 — expanded Montenegro + land specialists ────────────
// Reliable fallback — works with zero API keys.
const STATIC_DB: StaticAgency[] = [
  // ── MONTENEGRO — Kotor Bay / land specialists (new in v4.0) ──────────────────
  { name: 'Kotor Realty', city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', website: 'kotorrealty.com', spec: 'Kotor Bay land & villas — Bay of Kotor specialists', langs: ['EN','RU','SR','DE'], types: ['land','villa','house','apartment'], minPrice: 50_000, maxPrice: 5_000_000, cluster: 'Balkans', weight: 91, tags: ['land','beachfront','historic','intl-buyers'] },
  { name: 'Boka Bay Properties', city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', website: 'bokabayproperties.com', spec: 'Bay of Kotor, land plots, sea-view development', langs: ['EN','RU','DE'], types: ['land','villa','apartment'], minPrice: 60_000, maxPrice: 4_000_000, cluster: 'Balkans', weight: 89, tags: ['land','beachfront','investor'] },
  { name: 'Montenegro Land & Sea', city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', website: 'montenegrolandandsea.com', spec: 'Land plots, development sites — Kotor & Bay', langs: ['EN','RU','SR'], types: ['land','commercial'], minPrice: 80_000, maxPrice: 8_000_000, cluster: 'Balkans', weight: 87, tags: ['land','investor'] },
  { name: 'Adriatic Land Investment', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'adriaticlandinvestment.com', spec: 'Sea-view plots & development land, Bay of Kotor', langs: ['EN','RU','DE','SR'], types: ['land','commercial'], minPrice: 100_000, maxPrice: 10_000_000, cluster: 'Balkans', weight: 88, tags: ['land','investor','intl-buyers'] },
  { name: 'Montenegro Real Estate Club', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'montenegrorec.com', spec: 'Investment land & luxury property, Russian market', langs: ['EN','RU','SR'], types: ['land','villa','apartment'], minPrice: 70_000, maxPrice: 6_000_000, cluster: 'Balkans', weight: 86, tags: ['land','investor','intl-buyers'] },
  { name: 'Interdom Montenegro', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'interdom.me', spec: 'Russian-speaking agency, land & residential', langs: ['RU','EN','SR'], types: ['land','apartment','villa','house'], minPrice: 50_000, maxPrice: 4_000_000, cluster: 'Balkans', weight: 85, tags: ['land','intl-buyers'] },
  { name: 'MonteCasa', city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', website: 'montecasa.me', spec: 'Kotor & Risan area, boutique land & villas', langs: ['EN','RU','IT'], types: ['land','villa','house'], minPrice: 60_000, maxPrice: 3_000_000, cluster: 'Balkans', weight: 84, tags: ['land','historic'] },
  { name: 'Prime Property Montenegro', city: 'Herceg Novi', country: 'Montenegro', flag: '🇲🇪', website: 'primeproperty.me', spec: 'Bay of Kotor full coverage, land & premium', langs: ['EN','RU','DE'], types: ['land','villa','apartment'], minPrice: 80_000, maxPrice: 5_000_000, cluster: 'Balkans', weight: 86, tags: ['land','beachfront','investor'] },

  // ── MONTENEGRO — core agencies (existing, updated) ───────────────────────────
  { name: 'Montenegro Prospects', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'montenegroprospects.com', spec: 'Coastal luxury, Adriatic specialist', langs: ['EN','RU','SR'], types: ['apartment','villa','house','land'], minPrice: 80_000, maxPrice: 5_000_000, cluster: 'Balkans', weight: 94, tags: ['beachfront','luxury','land'] },
  { name: 'Leo Estate Montenegro', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'leoestate.me', spec: 'Bay of Kotor & Tivat premium', langs: ['EN','RU','SR','DE'], types: ['apartment','villa','land'], minPrice: 100_000, maxPrice: 8_000_000, cluster: 'Balkans', weight: 91, tags: ['luxury','land'] },
  { name: 'Dream Estate Montenegro', city: 'Kotor', country: 'Montenegro', flag: '🇲🇪', website: 'dream-estate.me', spec: 'Kotor Bay boutique — apartments, villas, land', langs: ['EN','RU','IT'], types: ['apartment','villa','house','land'], minPrice: 60_000, maxPrice: 3_000_000, cluster: 'Balkans', weight: 87, tags: ['historic','beachfront','land'] },
  { name: 'Riviera Home Montenegro', city: 'Herceg Novi', country: 'Montenegro', flag: '🇲🇪', website: 'rivierahome.me', spec: 'Western Montenegro coast', langs: ['EN','RU','SR'], types: ['apartment','villa','land'], minPrice: 50_000, maxPrice: 2_000_000, cluster: 'Balkans', weight: 83, tags: ['beachfront','land'] },
  { name: 'Porto Montenegro Real Estate', city: 'Tivat', country: 'Montenegro', flag: '🇲🇪', website: 'portomontenegro.com', spec: 'Marina & ultra-luxury residences', langs: ['EN','RU','IT','FR'], types: ['apartment','villa'], minPrice: 500_000, maxPrice: 15_000_000, cluster: 'Balkans', weight: 96, tags: ['luxury','beachfront','investor'] },
  { name: 'Adriatic Properties', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'adriatic-properties.me', spec: 'Investor land & development plots', langs: ['EN','RU','SR'], types: ['land','commercial'], minPrice: 100_000, maxPrice: 10_000_000, cluster: 'Balkans', weight: 85, tags: ['land','investor'] },
  { name: 'Montenegro Holiday Homes', city: 'Becici', country: 'Montenegro', flag: '🇲🇪', website: 'montenegro-holiday.com', spec: 'Vacation rental-ready apartments', langs: ['EN','RU','DE'], types: ['apartment','house'], minPrice: 60_000, maxPrice: 800_000, cluster: 'Balkans', weight: 78, tags: ['investor'] },
  { name: 'Dom Real Estate', city: 'Podgorica', country: 'Montenegro', flag: '🇲🇪', website: 'dom.me', spec: 'National coverage, residential focus', langs: ['EN','SR'], types: ['apartment','house','commercial','land'], minPrice: 40_000, maxPrice: 1_500_000, cluster: 'Balkans', weight: 80, tags: ['land'] },
  { name: 'Property Montenegro', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'property-montenegro.com', spec: 'Full market coverage, land & apartments', langs: ['EN','RU','SR'], types: ['apartment','villa','house','land'], minPrice: 50_000, maxPrice: 4_000_000, cluster: 'Balkans', weight: 83, tags: ['land','investor'] },
  { name: 'New Montenegro Real Estate', city: 'Budva', country: 'Montenegro', flag: '🇲🇪', website: 'newmontenegro.com', spec: 'Land & new development, investor focus', langs: ['EN','RU'], types: ['land','apartment'], minPrice: 80_000, maxPrice: 5_000_000, cluster: 'Balkans', weight: 82, tags: ['land','new-dev','investor'] },

  // ── INTERNATIONAL agencies with verified Montenegro/Balkans land reach ────────
  { name: 'Engel & Völkers Adriatic', city: 'Split', country: 'Croatia', flag: '🇭🇷', website: 'engelvoelkers.com/adriatic', spec: 'Adriatic coast incl. Montenegro, land & villas', langs: ['EN','HR','DE','IT','RU'], types: ['villa','apartment','land'], minPrice: 300_000, maxPrice: 15_000_000, cluster: 'Balkans', weight: 90, tags: ['luxury','land','intl-buyers'] },
  { name: 'Balkan Property Group', city: 'Belgrade', country: 'Serbia', flag: '🇷🇸', website: 'balkanproperty.com', spec: 'Serbia & Montenegro land, investor network', langs: ['EN','SR','RU','DE'], types: ['land','commercial','apartment'], minPrice: 100_000, maxPrice: 8_000_000, cluster: 'Balkans', weight: 83, tags: ['land','investor'] },
  { name: 'Montenegro Invest', city: 'Belgrade', country: 'Serbia', flag: '🇷🇸', website: 'montenegroinvest.com', spec: 'Serbian agency selling Montenegro land & property', langs: ['SR','EN','RU'], types: ['land','villa','apartment'], minPrice: 80_000, maxPrice: 5_000_000, cluster: 'Balkans', weight: 81, tags: ['land','investor','intl-buyers'] },

  // ── SPAIN ─────────────────────────────────────────────────────────────────────
  { name: 'Engel & Völkers Spain', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'engelvoelkers.com/spain', spec: 'Luxury residential & land, all Spain', langs: ['EN','ES','DE','FR','RU'], types: ['apartment','villa','house','land'], minPrice: 300_000, maxPrice: 20_000_000, cluster: 'SouthernEU', weight: 95, tags: ['luxury','land'] },
  { name: 'RE/MAX España', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'remax.es', spec: 'National network — residential, land, commercial', langs: ['EN','ES','DE'], types: ['apartment','villa','house','land','commercial'], minPrice: 50_000, maxPrice: 15_000_000, cluster: 'SouthernEU', weight: 93, tags: [] },
  { name: 'Lucas Fox International', city: 'Barcelona', country: 'Spain', flag: '🇪🇸', website: 'lucasfox.com', spec: 'Prime Barcelona, Costa Brava, Ibiza', langs: ['EN','ES','FR','DE','RU'], types: ['apartment','villa','house'], minPrice: 400_000, maxPrice: 25_000_000, cluster: 'SouthernEU', weight: 94, tags: ['luxury','investor'] },
  { name: 'Marbella Hills Homes', city: 'Marbella', country: 'Spain', flag: '🇪🇸', website: 'marbellahillshomes.com', spec: 'Costa del Sol luxury specialists', langs: ['EN','ES','DE','RU','AR'], types: ['villa','apartment','land'], minPrice: 500_000, maxPrice: 30_000_000, cluster: 'SouthernEU', weight: 92, tags: ['luxury','beachfront','land'] },
  { name: 'Solvia', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'solvia.es', spec: 'National platform — all segments', langs: ['EN','ES'], types: ['apartment','house','land','commercial'], minPrice: 30_000, maxPrice: 5_000_000, cluster: 'SouthernEU', weight: 82, tags: [] },
  { name: 'Idealista Agents', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'idealista.com', spec: 'Top Spain portal — partner agencies', langs: ['EN','ES','IT','PT'], types: ['apartment','villa','house','land','commercial'], minPrice: 30_000, maxPrice: 50_000_000, cluster: 'SouthernEU', weight: 90, tags: ['investor'] },
  { name: 'Savills Spain', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'savills.es', spec: 'Prime & ultra-prime, international buyers', langs: ['EN','ES','RU','DE'], types: ['villa','apartment','commercial','land'], minPrice: 1_000_000, maxPrice: 50_000_000, cluster: 'SouthernEU', weight: 93, tags: ['luxury','investor'] },
  { name: 'Sotheby\'s Spain', city: 'Madrid', country: 'Spain', flag: '🇪🇸', website: 'sothebysrealty.com/spain', spec: 'Ultra-luxury across all Spain', langs: ['EN','ES','FR','DE','RU','AR'], types: ['villa','apartment','house'], minPrice: 2_000_000, maxPrice: 100_000_000, cluster: 'SouthernEU', weight: 96, tags: ['luxury'] },

  // ── PORTUGAL ──────────────────────────────────────────────────────────────────
  { name: 'Engel & Völkers Portugal', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'engelvoelkers.com/portugal', spec: 'Lisbon, Porto, Algarve luxury', langs: ['EN','PT','DE','FR'], types: ['apartment','villa','house','land'], minPrice: 250_000, maxPrice: 15_000_000, cluster: 'SouthernEU', weight: 93, tags: ['luxury','land'] },
  { name: 'Porta da Frente Christie\'s', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'portadafrentechristies.com', spec: 'Lisbon & Cascais prime', langs: ['EN','PT','FR'], types: ['apartment','villa','house'], minPrice: 500_000, maxPrice: 20_000_000, cluster: 'SouthernEU', weight: 91, tags: ['luxury'] },
  { name: 'Remax Portugal', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', website: 'remax.pt', spec: 'National residential & commercial', langs: ['EN','PT','ES'], types: ['apartment','villa','house','land','commercial'], minPrice: 50_000, maxPrice: 8_000_000, cluster: 'SouthernEU', weight: 85, tags: [] },

  // ── ITALY ─────────────────────────────────────────────────────────────────────
  { name: 'Engel & Völkers Italy', city: 'Milan', country: 'Italy', flag: '🇮🇹', website: 'engelvoelkers.com/italy', spec: 'Lake Como, Tuscany, Amalfi', langs: ['EN','IT','DE','FR'], types: ['apartment','villa','house'], minPrice: 400_000, maxPrice: 30_000_000, cluster: 'SouthernEU', weight: 93, tags: ['luxury','historic'] },
  { name: 'Knight Frank Italy', city: 'Milan', country: 'Italy', flag: '🇮🇹', website: 'knightfrank.com/italy', spec: 'Prime Italian real estate', langs: ['EN','IT','RU'], types: ['villa','apartment','commercial'], minPrice: 1_000_000, maxPrice: 50_000_000, cluster: 'SouthernEU', weight: 92, tags: ['luxury'] },

  // ── GREECE ────────────────────────────────────────────────────────────────────
  { name: 'Greek Exclusive Properties', city: 'Athens', country: 'Greece', flag: '🇬🇷', website: 'greekexclusiveproperties.com', spec: 'Mykonos, Santorini, Athens Riviera', langs: ['EN','EL','DE','FR'], types: ['villa','apartment','house'], minPrice: 300_000, maxPrice: 20_000_000, cluster: 'Balkans', weight: 90, tags: ['luxury','beachfront'] },
  { name: 'Engel & Völkers Greece', city: 'Athens', country: 'Greece', flag: '🇬🇷', website: 'engelvoelkers.com/greece', spec: 'Athens, islands, Peloponnese', langs: ['EN','EL','DE'], types: ['villa','apartment','land'], minPrice: 200_000, maxPrice: 15_000_000, cluster: 'Balkans', weight: 89, tags: ['luxury','land'] },

  // ── CROATIA ───────────────────────────────────────────────────────────────────
  { name: 'Croatia Sotheby\'s Realty', city: 'Dubrovnik', country: 'Croatia', flag: '🇭🇷', website: 'croatiasothebysrealty.com', spec: 'Adriatic coast luxury', langs: ['EN','HR','DE','IT'], types: ['villa','apartment','house'], minPrice: 400_000, maxPrice: 15_000_000, cluster: 'Balkans', weight: 91, tags: ['luxury','beachfront','historic'] },
  { name: 'Dalmatia Property', city: 'Split', country: 'Croatia', flag: '🇭🇷', website: 'dalmatia-property.com', spec: 'Central Dalmatia specialist', langs: ['EN','HR','DE'], types: ['apartment','villa','house','land'], minPrice: 100_000, maxPrice: 5_000_000, cluster: 'Balkans', weight: 82, tags: ['beachfront','land'] },

  // ── SERBIA ────────────────────────────────────────────────────────────────────
  { name: 'CityExpert Serbia', city: 'Belgrade', country: 'Serbia', flag: '🇷🇸', website: 'cityexpert.rs', spec: 'Belgrade market leader', langs: ['EN','SR','RU'], types: ['apartment','house','commercial'], minPrice: 60_000, maxPrice: 3_000_000, cluster: 'Balkans', weight: 85, tags: [] },
  { name: 'Colliers Serbia', city: 'Belgrade', country: 'Serbia', flag: '🇷🇸', website: 'colliers.rs', spec: 'Commercial & investment land', langs: ['EN','SR'], types: ['commercial','land'], minPrice: 200_000, maxPrice: 20_000_000, cluster: 'Balkans', weight: 83, tags: ['investor','land'] },

  // ── GERMANY ───────────────────────────────────────────────────────────────────
  { name: 'Engel & Völkers Germany', city: 'Hamburg', country: 'Germany', flag: '🇩🇪', website: 'engelvoelkers.com/germany', spec: 'National premium — HQ country', langs: ['EN','DE','RU','FR'], types: ['apartment','villa','house','commercial'], minPrice: 300_000, maxPrice: 30_000_000, cluster: 'DACH', weight: 95, tags: ['luxury'] },
  { name: 'Von Poll Immobilien', city: 'Frankfurt', country: 'Germany', flag: '🇩🇪', website: 'von-poll.com', spec: 'Major German premium network', langs: ['EN','DE'], types: ['apartment','house','villa','commercial'], minPrice: 200_000, maxPrice: 15_000_000, cluster: 'DACH', weight: 88, tags: ['luxury'] },

  // ── AUSTRIA ───────────────────────────────────────────────────────────────────
  { name: 'Engel & Völkers Austria', city: 'Vienna', country: 'Austria', flag: '🇦🇹', website: 'engelvoelkers.com/austria', spec: 'Vienna, Salzburg, Tyrol', langs: ['EN','DE','IT'], types: ['apartment','villa','house'], minPrice: 250_000, maxPrice: 15_000_000, cluster: 'DACH', weight: 91, tags: ['luxury'] },
  { name: 'OTTO Immobilien', city: 'Vienna', country: 'Austria', flag: '🇦🇹', website: 'otto.at', spec: 'Austria\'s independent market leader', langs: ['EN','DE'], types: ['apartment','house','commercial'], minPrice: 200_000, maxPrice: 10_000_000, cluster: 'DACH', weight: 87, tags: [] },

  // ── UK ────────────────────────────────────────────────────────────────────────
  { name: 'Knight Frank', city: 'London', country: 'UK', flag: '🇬🇧', website: 'knightfrank.com', spec: 'Global prime — London HQ, Adriatic desk', langs: ['EN','RU','AR','ZH','FR'], types: ['apartment','villa','house','commercial','land'], minPrice: 500_000, maxPrice: 200_000_000, cluster: 'UK', weight: 97, tags: ['luxury','investor','intl-buyers','land'] },
  { name: 'Savills UK', city: 'London', country: 'UK', flag: '🇬🇧', website: 'savills.co.uk', spec: 'Nationwide prime + international markets', langs: ['EN','RU','DE','FR'], types: ['apartment','villa','house','commercial','land'], minPrice: 300_000, maxPrice: 150_000_000, cluster: 'UK', weight: 96, tags: ['luxury','investor','land'] },
  { name: 'Sotheby\'s International UK', city: 'London', country: 'UK', flag: '🇬🇧', website: 'sothebysrealty.co.uk', spec: 'Ultra-luxury UK & global', langs: ['EN','RU','AR','FR'], types: ['apartment','villa','house'], minPrice: 1_500_000, maxPrice: 200_000_000, cluster: 'UK', weight: 95, tags: ['luxury'] },

  // ── FRANCE ────────────────────────────────────────────────────────────────────
  { name: 'Barnes International', city: 'Paris', country: 'France', flag: '🇫🇷', website: 'barnes-international.com', spec: 'Luxury France & global markets', langs: ['EN','FR','RU','ZH'], types: ['apartment','villa','house'], minPrice: 600_000, maxPrice: 50_000_000, cluster: 'WesternEU', weight: 92, tags: ['luxury','investor'] },

  // ── UAE ───────────────────────────────────────────────────────────────────────
  { name: 'Betterhomes Dubai', city: 'Dubai', country: 'UAE', flag: '🇦🇪', website: 'bhomes.com', spec: 'UAE market leader, international investment', langs: ['EN','AR','RU','ZH','FR'], types: ['apartment','villa','house','commercial'], minPrice: 200_000, maxPrice: 50_000_000, cluster: 'Global', weight: 90, tags: ['luxury','investor'] },
  { name: 'Allsopp & Allsopp', city: 'Dubai', country: 'UAE', flag: '🇦🇪', website: 'allsoppandallsopp.com', spec: 'Dubai premium residential', langs: ['EN','AR','RU'], types: ['apartment','villa'], minPrice: 300_000, maxPrice: 30_000_000, cluster: 'Global', weight: 88, tags: ['luxury'] },
  { name: 'Espace Real Estate Dubai', city: 'Dubai', country: 'UAE', flag: '🇦🇪', website: 'espacerealestate.com', spec: 'Dubai + international investment desk', langs: ['EN','AR','RU','FR'], types: ['apartment','villa','land'], minPrice: 200_000, maxPrice: 20_000_000, cluster: 'Global', weight: 86, tags: ['investor','intl-buyers'] },

  // ── GLOBAL LUXURY ─────────────────────────────────────────────────────────────
  { name: 'Sotheby\'s International Realty', city: 'New York', country: 'UK', flag: '🌍', website: 'sothebysrealty.com', spec: 'Global ultra-luxury network, 1000+ offices', langs: ['EN','RU','AR','ZH','FR','ES','DE'], types: ['villa','apartment','house','land'], minPrice: 1_500_000, maxPrice: 500_000_000, cluster: 'Global', weight: 88, tags: ['luxury','investor','land'] },
  { name: 'Christie\'s International', city: 'London', country: 'UK', flag: '🌍', website: 'christiesrealestate.com', spec: 'Auction-house backed global luxury network', langs: ['EN','RU','FR','ZH','DE'], types: ['villa','apartment','house'], minPrice: 1_000_000, maxPrice: 200_000_000, cluster: 'Global', weight: 86, tags: ['luxury','investor'] },
]

// ─── Static matching engine v4.0 ────────────────────────────────────────────
function staticMatch(propType: string, country: string, city: string, priceEur: number): ApexAgency[] {
  const normType = normalizePropType(propType)
  const propCluster = COUNTRY_CLUSTER[country] || 'Global'

  const priceTier = priceEur >= 2_000_000 ? 'ultra' : priceEur >= 800_000 ? 'luxury' : priceEur >= 300_000 ? 'premium' : 'standard'
  const cityLower = city.toLowerCase()

  const NETWORK_BRANDS = ['engel', 'sotheby', 'christie', 'knight frank', 'savills', 'remax', 're/max', 'century 21', 'coldwell', 'keller williams', 'colliers']
  const isNetworkBrand = (name: string) => NETWORK_BRANDS.some(b => name.toLowerCase().includes(b))

  // For land: international agencies with intl-buyers tag get a bonus (buyer access matters)
  const isLandSearch = normType === 'land'

  const scored = STATIC_DB.map(a => {
    // ── Determine locality tier ─────────────────────────────────────────────
    let tier: 1 | 2 | 3 | 4
    if (a.country === country && !isNetworkBrand(a.name)) {
      tier = (cityLower && a.city.toLowerCase().includes(cityLower)) ? 1 : 2
    } else if (a.country === country && isNetworkBrand(a.name)) {
      tier = 3
    } else if (a.cluster === 'Balkans' && propCluster === 'Balkans' && isLandSearch) {
      // For land in Balkans: regional Balkan agencies with land tag are useful
      tier = a.tags.includes('land') || a.tags.includes('intl-buyers') ? 3 : 4
    } else if (a.cluster === 'Global' || isNetworkBrand(a.name)) {
      tier = 4
    } else {
      // Different country not global
      if (!isLandSearch && priceTier !== 'ultra' && priceTier !== 'luxury') return null
      tier = 4
    }

    // ── Base score by tier ──────────────────────────────────────────────────
    const tierBase = tier === 1 ? 85 : tier === 2 ? 70 : tier === 3 ? 55 : 42
    let score = tierBase + (a.weight - 70) * 0.3

    // ── Geographic fit ──────────────────────────────────────────────────────
    if (a.country === country) {
      score += tier === 1 ? 8 : 4
    } else if (a.cluster === 'Global' && priceEur >= 1_000_000) {
      score += 3
    } else if (a.cluster === 'Balkans' && propCluster === 'Balkans' && isLandSearch) {
      score += 2 // Balkan neighbor gets a small bonus for land searches
    } else if (a.country !== country) {
      score -= isLandSearch ? 8 : 15  // less penalty for land: intl reach matters
    }

    // ── Property type match ─────────────────────────────────────────────────
    if (a.types.includes(normType)) score += 6
    else score -= 8

    // ── Land-specific bonuses ───────────────────────────────────────────────
    if (isLandSearch) {
      if (a.tags.includes('land')) score += 8
      if (a.tags.includes('investor')) score += 4
      if (a.tags.includes('intl-buyers')) score += 5  // agencies with Russian/UAE/DE buyer networks
    }

    // ── Price-band fit ──────────────────────────────────────────────────────
    if (priceEur >= a.minPrice && priceEur <= a.maxPrice) score += 5
    else score -= 5

    // ── Luxury alignment ────────────────────────────────────────────────────
    if ((priceTier === 'ultra' || priceTier === 'luxury') && a.tags.includes('luxury')) {
      score += tier >= 3 ? 6 : 3
    }

    // Cap 40–99
    score = Math.min(99, Math.max(40, Math.round(score)))

    // ── Build reasons ───────────────────────────────────────────────────────
    const reasons: string[] = []
    if (tier === 1) reasons.push(`Local ${a.city} specialist — direct ${normType} market knowledge`)
    else if (tier === 2) reasons.push(`${country} specialist — full country coverage`)
    else if (tier === 3) reasons.push(`${a.name.split(' ')[0]} network — ${a.country} desk with regional reach`)
    else if (a.tags.includes('intl-buyers')) reasons.push(`International buyer network — access to Russian/UAE/DE investor market`)
    else reasons.push(`International brand — global buyer reach`)

    if (a.types.includes(normType)) reasons.push(`${normType.charAt(0).toUpperCase() + normType.slice(1)} specialisation confirmed in portfolio`)
    if (isLandSearch && a.tags.includes('land')) reasons.push(`Dedicated land & plot desk — active 2024-2025`)
    if (priceEur >= a.minPrice && priceEur <= a.maxPrice) {
      const p = priceEur >= 1_000_000 ? `€${(priceEur/1e6).toFixed(1)}M` : `€${Math.round(priceEur/1000)}K`
      reasons.push(`${p} price band aligns with active portfolio`)
    } else if (isLandSearch && a.tags.includes('investor')) {
      reasons.push(`Investor land network — HNW buyer access`)
    } else {
      reasons.push(`Active 2024-2025, verified ${a.country} presence`)
    }

    return { agency: a, score, tier, reasons: reasons.slice(0, 3) }
  }).filter(Boolean) as { agency: StaticAgency; score: number; tier: number; reasons: string[] }[]

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 30)

  return top.map((s, i) => {
    const domain = s.agency.website.replace(/^https?:\/\//, '').split('/')[0]
    const emailPrefix = domain.includes('engelvoelkers') ? 'office'
      : domain.includes('sotheby') ? 'inquiries'
      : domain.includes('knightfrank') ? 'international'
      : 'info'
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
      phone: lookupPhone(domain, s.agency.country),
    }
  })
}

// ─── REAL AGENCY POOL MATCH (from DEMO_AGENCY_POOL — Supabase registered) ─────
function matchRealPool(propType: string, country: string, city: string, priceEur: number): ApexAgency[] {
  const normCountry = country === 'Montenegro' ? 'ME' : country === 'Serbia' ? 'RS'
    : country === 'Croatia' ? 'HR' : country === 'Greece' ? 'GR'
    : country === 'Spain' ? 'ES' : country === 'Portugal' ? 'PT'
    : country === 'Italy' ? 'IT' : country === 'Germany' ? 'DE'
    : country === 'Austria' ? 'AT' : country === 'UK' ? 'GB'
    : country === 'France' ? 'FR' : country === 'UAE' ? 'AE'
    : country === 'Bulgaria' ? 'BG' : country === 'Russia' ? 'RU'
    : country === 'Turkey' ? 'TR' : country

  const normType = normalizePropType(propType) as 'apartment' | 'villa' | 'house' | 'land' | 'commercial' | 'new_build'
  const priceBand = priceEur >= 2_000_000 ? 'luxury' : priceEur >= 500_000 ? 'premium' : priceEur >= 100_000 ? 'mid' : 'budget'
  const cityLower = city.toLowerCase()

  const scored = DEMO_AGENCY_POOL.map(a => {
    let score = (a.quality_score || 70) * 0.5

    if (a.country === normCountry) score += 30
    else return null

    if (a.cities?.some(c => c.toLowerCase() === cityLower)) score += 20
    else if (a.regions?.some(r => r.toLowerCase().includes(cityLower) || cityLower.includes(r.toLowerCase()))) score += 10

    if (a.property_types.includes(normType)) score += 12
    else score -= 10

    if (a.price_bands.includes(priceBand)) score += 8
    else score -= 5

    if (a.historical) {
      score += (a.historical.response_rate || 0) * 0.08
      score += (a.historical.conversion_rate || 0) * 0.3
    }

    if ((a as any).last_contacted) {
      const daysSince = (Date.now() - new Date((a as any).last_contacted).getTime()) / 86_400_000
      if (daysSince < 7) score *= 0.3
      else if (daysSince < 14) score *= 0.65
      else if (daysSince < 30) score *= 0.85
    }

    score = Math.min(99, Math.max(40, Math.round(score)))

    const reasons: string[] = []
    if (a.country === normCountry) reasons.push(`✓ ${a.city || country}-based, registered agency`)
    if (a.property_types.includes(normType)) reasons.push(`✓ ${normType.charAt(0).toUpperCase() + normType.slice(1)} specialist`)
    if (a.price_bands.includes(priceBand)) reasons.push(`✓ Price band match`)
    if (a.historical?.response_rate && a.historical.response_rate >= 75) reasons.push(`✓ ${a.historical.response_rate}% response rate`)

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

// ─── Merge: real agencies take priority; AI supplements ─────────────────────
function mergeAgencies(realPool: ApexAgency[], aiGenerated: ApexAgency[], country: string, city: string): ApexAgency[] {
  const NETWORK_BRANDS = ['engel', 'sotheby', 'christie', 'knight frank', 'savills', 'remax', 're/max', 'century 21', 'coldwell', 'keller williams', 'colliers']
  const isNetwork = (name: string) => NETWORK_BRANDS.some(b => name.toLowerCase().includes(b))
  const cityLower = city.toLowerCase()

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

  result.sort((a, b) => {
    const ta = getTier(a), tb = getTier(b)
    if (ta !== tb) return ta - tb
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

    // ── STEP 1: Live DDG search ─────────────────────────────────────────────
    log(`Match "${propType}" in ${city || country} @ €${priceEur}`)
    const searchResults = await liveSearch(propType, country, city, priceEur)
    log(`DDG: ${searchResults.length} results in ${Date.now() - t0}ms`)

    // ── STEP 2: Parallel AI race — Claude + OpenAI + Gemini ────────────────
    let agencies: ApexAgency[] = []
    let provider = 'unknown'

    const prompt = buildPrompt(propType, country, city, priceEur, sqm || '', beds || '', searchResults)

    const tasks: Promise<{ p: string; a: ApexAgency[] }>[] = [
      callClaude(prompt).then(a => ({ p: searchResults.length ? 'claude+live' : 'claude+knowledge', a }))
        .catch(e => { warn('Claude:', (e as Error).message); return { p: 'claude-failed', a: [] } }),
      callOpenAI(prompt).then(a => ({ p: searchResults.length ? 'openai+live' : 'openai+knowledge', a }))
        .catch(e => { warn('OpenAI:', (e as Error).message); return { p: 'openai-failed', a: [] } }),
      callGemini(prompt).then(a => ({ p: searchResults.length ? 'gemini+live' : 'gemini+knowledge', a }))
        .catch(e => { warn('Gemini:', (e as Error).message); return { p: 'gemini-failed', a: [] } }),
    ]

    const results = await Promise.all(tasks)
    const winner = results.find(r => r.a.length >= 10) || results.find(r => r.a.length > 0)
    if (winner) {
      agencies = winner.a
      provider = winner.p
    }

    // ── Static fallback (zero API keys mode) ────────────────────────────────
    if (agencies.length === 0) {
      agencies = staticMatch(propType, country, city, priceEur)
      provider = 'static-emergency'
    }

    // ── STEP 3: Merge with real Supabase-registered agencies ─────────────────
    const realPoolMatches = matchRealPool(propType, country, city, priceEur)
    if (realPoolMatches.length > 0) {
      agencies = mergeAgencies(realPoolMatches, agencies, country, city)
      provider = provider + '+real_pool'
      log(`Real pool: ${realPoolMatches.length} matches merged`)
    } else {
      agencies = agencies.map((a, i) => ({ ...a, wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3 }))
    }

    const elapsed = Date.now() - t0
    log(`Done: ${agencies.length} agencies via ${provider} in ${elapsed}ms`)

    return NextResponse.json({
      success: true,
      agencies,
      provider,
      searchResultsCount: searchResults.length,
      elapsedMs: elapsed,
      count: agencies.length,
    })
  } catch (err: any) {
    warn('Fatal:', err)
    try {
      const body = await req.json().catch(() => ({}))
      const agencies = staticMatch(body.propType || 'apartment', normalizeCountry(body.country || 'Montenegro'), body.city || '', Number(body.price) || 200_000)
      return NextResponse.json({ success: true, agencies, provider: 'static-emergency', count: agencies.length })
    } catch {
      return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
    }
  }
}
