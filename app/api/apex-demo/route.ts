/**
 * POST /api/apex-demo
 *
 * Public demo endpoint — calls LLM (Claude or OpenAI) to dynamically select
 * the best-matched REAL European real estate agencies for a given property.
 *
 * No auth required (public APEX demo page).
 * Rate-limited by Vercel Edge (production) or open in dev.
 */

import { NextRequest, NextResponse } from 'next/server'

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
}

// ─── Build the expert prompt ──────────────────────────────────────────────────
function buildPrompt(
  propType: string,
  country: string,
  city: string,
  priceEur: number,
  sqm: string,
  beds: string,
): string {
  const priceFormatted = priceEur >= 1_000_000
    ? `€${(priceEur / 1_000_000).toFixed(2)}M`
    : `€${Math.round(priceEur / 1000)}K`

  const location = city ? `${city}, ${country}` : country
  const sizeStr = sqm ? ` · ${sqm}m²` : ''
  const bedsStr = beds ? ` · ${beds} bed${beds !== '1' && beds !== 'studio' ? 's' : ''}` : ''

  return `You are APEX, the AI matching engine for PropBlaze — a European property distribution SaaS platform.

A property owner wants to sell their property:
• Type: ${propType}
• Location: ${location}
• Price: ${priceFormatted}${sizeStr}${bedsStr}

Your task: identify exactly 28 REAL, currently active real estate agencies across Europe that would be most interested in this specific listing. These must be real companies that exist and can be verified online.

PRIORITY ORDER (strict):
1. Local agencies based in ${country} specialising in this property type and price range
2. Regional agencies in neighbouring countries (especially Adriatic, Balkans, or DACH cluster) that actively serve buyers looking in ${country}
3. International luxury/investment brands (Sotheby's, Knight Frank, Savills, Engel & Völkers, RE/MAX) with documented presence or buyer networks covering ${country}
4. Major international brands whose UHNW clients actively invest in this region (only if price > €200K)

STRICT RULES:
- Return ONLY agencies you are confident exist and are currently active
- Do NOT invent agency names — use real companies
- Geographic fit is the #1 priority: a property in ${country} should show ${country}-based agencies first
- Mix: ~10 local, ~8 regional, ~6 major international brands, ~4 investor-focused
- Assign wave: 1 = top 10 (highest score), 2 = 11–20, 3 = 21–28
- Score range: 62–99 (higher = better fit for this specific property)

Return ONLY a valid JSON array (no markdown, no explanation, just the array):
[
  {
    "name": "Agency Name",
    "city": "City",
    "country": "Country",
    "website": "domain.com",
    "spec": "Short specialization (max 80 chars)",
    "reasons": ["Reason 1 (specific to this property)", "Reason 2", "Reason 3"],
    "langs": ["EN", "SR"],
    "score": 96,
    "wave": 1
  }
]`
}

// ─── Call Anthropic Claude ────────────────────────────────────────────────────
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
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  return parseAgencies(text)
}

// ─── Call OpenAI ──────────────────────────────────────────────────────────────
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
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are APEX, a European real estate agency matching AI. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt + '\n\nReturn JSON object with key "agencies" containing the array.',
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(text)
    return parseAgencies(Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify(parsed.agencies || []))
  } catch {
    return parseAgencies(text)
  }
}

// ─── Parse + validate LLM output ─────────────────────────────────────────────
function parseAgencies(raw: string): ApexAgency[] {
  // Extract JSON array from response (handles markdown code blocks)
  const match = raw.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON array found in LLM response')

  const arr = JSON.parse(match[0]) as any[]

  return arr
    .filter(a => a.name && a.city && a.country)
    .map((a, i) => ({
      name: String(a.name || '').trim(),
      city: String(a.city || '').trim(),
      country: String(a.country || '').trim(),
      flag: FLAG_MAP[a.country] || '🏢',
      website: String(a.website || '').replace(/^https?:\/\//, '').split('/')[0],
      spec: String(a.spec || '').slice(0, 100),
      reasons: Array.isArray(a.reasons) ? a.reasons.slice(0, 3).map(String) : [],
      langs: Array.isArray(a.langs) ? a.langs.slice(0, 6).map(String) : ['EN'],
      score: Math.min(99, Math.max(62, Number(a.score) || 75)),
      wave: ([1, 2, 3].includes(a.wave) ? a.wave : (i < 10 ? 1 : i < 20 ? 2 : 3)) as 1 | 2 | 3,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { propType, country, city, price, sqm, beds } = await req.json()

    if (!propType || !country || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: propType, country, price' },
        { status: 400 },
      )
    }

    const priceEur = Number(price) || 200_000
    const prompt = buildPrompt(propType, country, city || '', priceEur, sqm || '', beds || '')

    let agencies: ApexAgency[]
    let provider: string

    // Try Claude first, then OpenAI
    try {
      agencies = await callClaude(prompt)
      provider = 'claude'
    } catch (claudeErr) {
      console.warn('[apex-demo] Claude failed:', (claudeErr as Error).message)
      try {
        agencies = await callOpenAI(prompt)
        provider = 'openai'
      } catch (openaiErr) {
        console.warn('[apex-demo] OpenAI failed:', (openaiErr as Error).message)
        return NextResponse.json(
          { error: 'no_llm_key', message: 'No LLM API key configured. Add ANTHROPIC_API_KEY to Vercel env vars.' },
          { status: 503 },
        )
      }
    }

    // Re-assign waves after sorting (LLM sometimes gets wave wrong)
    agencies = agencies.map((a, i) => ({
      ...a,
      wave: (i < 10 ? 1 : i < 20 ? 2 : 3) as 1 | 2 | 3,
    }))

    return NextResponse.json({
      success: true,
      agencies,
      provider,
      count: agencies.length,
    })
  } catch (err: any) {
    console.error('[apex-demo] Error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
