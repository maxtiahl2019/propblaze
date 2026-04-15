/**
 * GET  /api/agency-feed?since=<iso>  → returns offers created since timestamp
 * POST /api/agency-feed               → creates a new offer (used by APEX engine)
 *
 * In-memory store for demo. Replace with DB in production.
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Offer {
  id: string
  ref: string
  receivedAt: string
  property: {
    type: string; address: string; city: string; country: string; flag: string
    sqm: number; beds: number; price: number; currency: string
    description: string; photos: number
  }
  owner: { name: string; lang: string; respondsIn: string }
  match: { score: number; wave: 1 | 2 | 3; reasons: string[] }
  status: 'new' | 'viewed' | 'replied' | 'declined'
}

// Module-level store survives across requests within same lambda warm window.
declare global {
  // eslint-disable-next-line no-var
  var __PB_OFFERS__: Offer[] | undefined
}

function getStore(): Offer[] {
  if (!global.__PB_OFFERS__) {
    global.__PB_OFFERS__ = seed()
  }
  return global.__PB_OFFERS__
}

function seed(): Offer[] {
  const now = Date.now()
  return [
    {
      id: 'PB-' + (now - 3_600_000),
      ref: 'PB-2026-0041',
      receivedAt: new Date(now - 3_600_000).toISOString(),
      property: {
        type: 'Villa', address: 'Jadranska bb 14', city: 'Budva', country: 'Montenegro', flag: '🇲🇪',
        sqm: 210, beds: 4, price: 485000, currency: 'EUR',
        description: 'Sea-view villa with pool, 400 m from the beach. Fully furnished.', photos: 12,
      },
      owner: { name: 'A. Petrov', lang: 'RU', respondsIn: '2h' },
      match: { score: 94, wave: 1, reasons: ['Geo: Budva ✓', 'Luxury segment ✓', 'Russian buyer profile ✓'] },
      status: 'new',
    },
  ]
}

export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get('since')
  const store = getStore()
  const filtered = since ? store.filter(o => o.receivedAt > since) : store
  return NextResponse.json({
    success: true,
    offers: filtered.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
    serverTime: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const store = getStore()
  const id = 'PB-' + Date.now()
  const offer: Offer = {
    id,
    ref: body.ref || 'PB-2026-' + String(40 + store.length).padStart(4, '0'),
    receivedAt: new Date().toISOString(),
    property: {
      type: body.type || 'Apartment',
      address: body.address || 'Demo address',
      city: body.city || '',
      country: body.country || 'Montenegro',
      flag: body.flag || '🏢',
      sqm: Number(body.sqm) || 80,
      beds: Number(body.beds) || 2,
      price: Number(body.price) || 200_000,
      currency: 'EUR',
      description: body.description || 'New listing routed via APEX matching.',
      photos: Number(body.photos) || 6,
    },
    owner: {
      name: body.ownerName || 'Owner',
      lang: body.ownerLang || 'EN',
      respondsIn: body.respondsIn || '4h',
    },
    match: {
      score: Number(body.score) || 80,
      wave: ([1, 2, 3].includes(body.wave) ? body.wave : 1) as 1 | 2 | 3,
      reasons: Array.isArray(body.reasons) ? body.reasons.slice(0, 4).map(String) : ['AI-matched'],
    },
    status: 'new',
  }
  store.unshift(offer)
  // Keep only last 50 to prevent unbounded growth
  if (store.length > 50) store.length = 50
  return NextResponse.json({ success: true, offer })
}
