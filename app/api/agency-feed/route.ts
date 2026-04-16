/**
 * Agency cabinet API (in-memory, demo-grade).
 *
 * GET    /api/agency-feed?since=<iso>        → list offers (optionally incremental)
 * POST   /api/agency-feed                     → create a new offer (engine simulation)
 * PATCH  /api/agency-feed                     → update offer status (accept/decline/etc)
 *                                               body: { id, status, note? }
 *
 * Status flow:
 *   new → accepted → in_progress → pending_docs → closed
 *        ↘ declined
 *
 * Each status change is logged to __PB_FEEDBACK__ so the engine can learn
 * (acceptance rate, decline reasons, time-to-accept, etc).
 */
import { NextRequest, NextResponse } from 'next/server'

import {
  offersStore, feedbackStore, logFeedback,
  type Offer, type OfferStatus, type FeedbackEvent,
} from '@/lib/api-globals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function store(): Offer[] {
  const s = offersStore()
  if (s.length === 0) s.push(...seed())
  return s
}

function feedback(): FeedbackEvent[] {
  return feedbackStore()
}

/* Demo photo pools by property type */
const DEMO_PHOTOS: Record<string, string[]> = {
  Villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  ],
  Apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  ],
  Loft: [
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  ],
  Land: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800&q=80',
  ],
  _default: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  ],
}

function photosForType(type: string): string[] {
  return DEMO_PHOTOS[type] || DEMO_PHOTOS._default
}

function seed(): Offer[] {
  const now = Date.now()
  const photos = photosForType('Villa')
  const o: Offer = {
    id: 'PB-' + (now - 3_600_000),
    ref: 'PB-2026-0041',
    receivedAt: new Date(now - 3_600_000).toISOString(),
    property: {
      type: 'Villa', address: 'Jadranska bb 14', city: 'Budva', country: 'Montenegro', flag: '🇲🇪',
      sqm: 210, beds: 4, price: 485000, currency: 'EUR',
      description: 'Sea-view villa with pool, 400 m from the beach. Fully furnished. Three levels, panoramic terrace, private parking for 3 cars. 5 min walk to Old Town.',
      photos: 12, photoUrls: photos,
    },
    seller: { name: 'A. Petrov', lang: 'RU', respondsIn: '2h', email: 'a.petrov@seller.propblaze' },
    match: { score: 94, wave: 1, reasons: ['Geo: Budva ✓', 'Luxury segment ✓', 'Russian buyer profile ✓'] },
    status: 'new',
    statusHistory: [{ at: new Date(now - 3_600_000).toISOString(), status: 'new' }],
    docs: [],
  }
  return [o]
}

export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get('since')
  const s = store()
  const filtered = since ? s.filter(o => o.receivedAt > since || (o.statusHistory[o.statusHistory.length - 1]?.at > since)) : s
  return NextResponse.json({
    success: true,
    offers: [...filtered].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
    feedback: feedback().slice(0, 20),
    serverTime: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const s = store()
  const id = 'PB-' + Date.now()
  const nowIso = new Date().toISOString()
  const offer: Offer = {
    id,
    ref: body.ref || 'PB-2026-' + String(40 + s.length).padStart(4, '0'),
    receivedAt: nowIso,
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
      photoUrls: Array.isArray(body.photoUrls) ? body.photoUrls : photosForType(body.type || 'Apartment'),
    },
    seller: {
      name: body.sellerName || body.ownerName || 'Seller',
      lang: body.sellerLang || body.ownerLang || 'EN',
      respondsIn: body.respondsIn || '4h',
      email: body.sellerEmail || undefined,
    },
    match: {
      score: Number(body.score) || 80,
      wave: ([1, 2, 3].includes(body.wave) ? body.wave : 1) as 1 | 2 | 3,
      reasons: Array.isArray(body.reasons) ? body.reasons.slice(0, 4).map(String) : ['AI-matched'],
    },
    status: 'new',
    statusHistory: [{ at: nowIso, status: 'new' }],
    docs: [],
  }
  s.unshift(offer)
  if (s.length > 50) s.length = 50

  logFeedback({
    at: nowIso,
    offerId: offer.id,
    ref: offer.ref,
    event: 'routed',
    score: offer.match.score,
    city: offer.property.city,
    country: offer.property.country,
  })

  return NextResponse.json({ success: true, offer })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { id, status, note } = body as { id?: string; status?: OfferStatus; note?: string }
  if (!id || !status) return NextResponse.json({ error: 'id & status required' }, { status: 400 })
  const s = store()
  const offer = s.find(o => o.id === id)
  if (!offer) return NextResponse.json({ error: 'offer not found' }, { status: 404 })

  const allowed: OfferStatus[] = ['new', 'accepted', 'in_progress', 'pending_docs', 'closed', 'declined']
  if (!allowed.includes(status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 })

  const nowIso = new Date().toISOString()
  offer.status = status
  offer.statusHistory.push({ at: nowIso, status, note })

  logFeedback({
    at: nowIso,
    offerId: offer.id,
    ref: offer.ref,
    event: status as FeedbackEvent['event'],
    score: offer.match.score,
    city: offer.property.city,
    country: offer.property.country,
    note,
  })

  return NextResponse.json({ success: true, offer })
}
