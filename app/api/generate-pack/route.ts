/**
 * POST /api/generate-pack
 *
 * Generates a professional multilingual property sales pack using Claude AI.
 * Falls back to high-quality templates if no API key is configured.
 *
 * Input: { property, shortDesc, language? }
 * Output: { headline, description, keyFeatures, investmentHighlights, targetBuyerProfile, languages }
 */

import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

interface PropertyInput {
  type: string
  city: string
  country: string
  areaSqm: number
  bedrooms: number
  bathrooms: number
  price: number
  currency: string
  mode: 'sale' | 'rent'
  address?: string
}

export async function POST(req: NextRequest) {
  try {
    const { property, shortDesc } = await req.json() as { property: PropertyInput; shortDesc: string }

    if (!property || !shortDesc) {
      return NextResponse.json({ error: 'Missing property or shortDesc' }, { status: 400 })
    }

    const priceFormatted = `${property.currency} ${property.price.toLocaleString('en-EU')}`
    const priceBand = property.price < 100_000 ? 'budget'
      : property.price < 300_000 ? 'mid-range'
      : property.price < 800_000 ? 'premium' : 'luxury'

    // ── Real Claude AI generation ─────────────────────────────────────────
    if (ANTHROPIC_KEY) {
      const systemPrompt = `You are an elite European real estate copywriter specializing in cross-border property sales. 
You write compelling, factual property sales packs that real estate agencies use to pitch to high-net-worth buyers.
Your writing is professional, specific, and commercially persuasive — never generic or fluffy.
You respond only with valid JSON matching the exact schema requested.`

      const userPrompt = `Generate a professional property sales pack for this listing.

PROPERTY DATA:
- Type: ${property.type}
- Location: ${property.address || ''}, ${property.city}, ${property.country}
- Size: ${property.areaSqm}m²
- Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
- Price: ${priceFormatted} (${property.mode === 'sale' ? 'For Sale' : 'For Rent'})
- Price band: ${priceBand}
- Owner description: "${shortDesc}"

Return ONLY this JSON (no markdown, no explanation):
{
  "headline": "One powerful headline sentence (max 12 words) for agency outreach email subject",
  "description": "3 paragraphs. Para 1: property highlights + location (3-4 sentences). Para 2: lifestyle / investment appeal (3-4 sentences). Para 3: call to action for agencies (2-3 sentences). Total ~250 words. No bullet points.",
  "keyFeatures": ["6 specific factual bullet points about this property, no generic phrases"],
  "investmentHighlights": ["3 specific investment/commercial reasons to buy in this location"],
  "targetBuyerProfile": "One sentence: specific buyer persona for this property type, location, price",
  "agencyEmailSubject": "Short email subject line for agency outreach (max 10 words)",
  "whyThisProperty": "One sentence: the single strongest selling point of this specific property"
}`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1200,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const rawText = data.content[0]?.text || ''

        try {
          // Strip potential markdown code fences
          const jsonText = rawText.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim()
          const pack = JSON.parse(jsonText)

          return NextResponse.json({
            success: true,
            provider: 'claude',
            pack: {
              headline: pack.headline || '',
              description: pack.description || '',
              keyFeatures: pack.keyFeatures || [],
              investmentHighlights: pack.investmentHighlights || [],
              targetBuyerProfile: pack.targetBuyerProfile || '',
              agencyEmailSubject: pack.agencyEmailSubject || '',
              whyThisProperty: pack.whyThisProperty || '',
            },
          })
        } catch {
          console.error('[generate-pack] JSON parse failed, using fallback. Raw:', rawText.slice(0, 200))
        }
      }
    }

    // ── High-quality template fallback (no API key needed) ────────────────
    const isLuxury = priceBand === 'luxury' || priceBand === 'premium'
    const modeLabel = property.mode === 'sale' ? 'sale' : 'rental'
    const investLabel = property.mode === 'sale' ? 'Investment Opportunity' : 'Premium Rental'

    const pack = {
      provider: 'template',
      headline: `${isLuxury ? 'Exclusive' : 'Premium'} ${property.bedrooms}BR ${property.type} in ${property.city} — ${priceFormatted}`,
      description: `This ${property.areaSqm}m² ${property.type.toLowerCase()} in ${property.city}, ${property.country} offers a rare combination of quality, location, and value. ${shortDesc}

The property features ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms across ${property.areaSqm}m² of well-designed living space, priced at ${priceFormatted} for ${modeLabel}. ${property.city} continues to attract strong cross-border buyer interest, particularly from Northern and Western European markets, making this a compelling listing for your portfolio.

We invite your agency to present this property to qualified buyers. Our AI matching system selected your agency based on your proven track record in ${property.country} and surrounding markets. Please contact the owner directly via PropBlaze to arrange viewings or request additional documentation.`,
      keyFeatures: [
        `${property.areaSqm}m² of total living space`,
        `${property.bedrooms} bedrooms / ${property.bathrooms} bathrooms`,
        `Prime location in ${property.city}, ${property.country}`,
        `Listed at ${priceFormatted} — ${modeLabel}`,
        'Full legal documentation available',
        'Owner responsive via PropBlaze platform',
      ],
      investmentHighlights: [
        `${property.city} market shows strong cross-border buyer demand`,
        `${priceBand.charAt(0).toUpperCase() + priceBand.slice(1)} segment with solid appreciation potential`,
        'All documentation verified — fast transaction possible',
      ],
      targetBuyerProfile: `${isLuxury ? 'HNW investors and second-home buyers' : 'European families and investors'} seeking ${property.mode === 'sale' ? 'capital growth' : 'passive rental income'} in ${property.country}`,
      agencyEmailSubject: `New ${property.type} Listing: ${property.city} — ${priceFormatted} | PropBlaze AI Match`,
      whyThisProperty: `${isLuxury ? 'Rare premium opportunity' : 'Strong value proposition'} in one of ${property.country}'s most active markets at an accessible price point.`,
    }

    return NextResponse.json({ success: true, ...pack })
  } catch (err: any) {
    console.error('[generate-pack] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
