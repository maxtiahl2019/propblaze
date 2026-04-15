/**
 * POST /api/agency-docs
 *   body: { offerId, docs: string[] }   — agency requests these document types
 *   → appends a system-like message to chat from agency
 *   → simulates seller reply delivering document links
 *   → updates offer status to 'pending_docs' then 'in_progress' after delivery
 *
 * GET  /api/agency-docs?offerId=...    → list docs for an offer
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Offer {
  id: string
  docs: { id: string; name: string; requestedAt: string; receivedAt?: string; url?: string }[]
  status: string
  statusHistory: { at: string; status: string; note?: string }[]
  seller: { name: string }
  property: { address: string; city: string }
}

interface Msg { id: string; offerId: string; from: 'agency' | 'owner' | 'seller'; text: string; at: string }

declare global {
  // eslint-disable-next-line no-var
  var __PB_OFFERS__: Offer[] | undefined
  // eslint-disable-next-line no-var
  var __PB_MSGS__: Record<string, Msg[]> | undefined
  // eslint-disable-next-line no-var
  var __PB_FEEDBACK__: { at: string; offerId: string; ref: string; event: string; note?: string }[] | undefined
}

const DOC_CATALOG: Record<string, { name: string; delay: number }> = {
  title_deed:    { name: 'Title deed (свидетельство о собственности)', delay: 2000 },
  id:            { name: 'Owner ID / passport scan',                    delay: 1500 },
  cadastral:     { name: 'Cadastral extract',                           delay: 2500 },
  energy:        { name: 'Energy performance certificate',              delay: 1800 },
  floor_plan:    { name: 'Floor plan',                                  delay: 1200 },
  utility_bills: { name: 'Utility bills (last 3 months)',               delay: 1000 },
  tax:           { name: 'Property tax statement',                      delay: 2000 },
  hoa:           { name: 'HOA / condo fees statement',                  delay: 1500 },
}

export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get('offerId') || ''
  const offers = global.__PB_OFFERS__ || []
  const offer = offers.find(o => o.id === offerId)
  if (!offer) return NextResponse.json({ error: 'offer not found' }, { status: 404 })
  return NextResponse.json({ success: true, docs: offer.docs, catalog: DOC_CATALOG })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { offerId, docs } = body as { offerId?: string; docs?: string[] }
  if (!offerId || !Array.isArray(docs) || docs.length === 0) {
    return NextResponse.json({ error: 'offerId & docs[] required' }, { status: 400 })
  }
  const offers = global.__PB_OFFERS__ || []
  const offer = offers.find(o => o.id === offerId)
  if (!offer) return NextResponse.json({ error: 'offer not found' }, { status: 404 })

  const nowIso = new Date().toISOString()

  // Create doc records in "requested" state
  const requested = docs.map(key => {
    const info = DOC_CATALOG[key] || { name: key, delay: 1500 }
    const doc = {
      id: 'd-' + Date.now() + '-' + key,
      name: info.name,
      requestedAt: nowIso,
      receivedAt: undefined as string | undefined,
      url: undefined as string | undefined,
    }
    offer.docs.push(doc)
    return doc
  })

  // Set status to pending_docs
  offer.status = 'pending_docs'
  offer.statusHistory.push({ at: nowIso, status: 'pending_docs', note: `Requested ${requested.length} doc(s)` })

  // Feedback log
  if (!global.__PB_FEEDBACK__) global.__PB_FEEDBACK__ = []
  global.__PB_FEEDBACK__.unshift({
    at: nowIso, offerId, ref: (offer as { ref?: string }).ref || '',
    event: 'docs_requested',
    note: requested.map(d => d.name).join('; '),
  })

  // Append agency message into chat
  if (!global.__PB_MSGS__) global.__PB_MSGS__ = {}
  if (!global.__PB_MSGS__[offerId]) global.__PB_MSGS__[offerId] = []
  const thread = global.__PB_MSGS__[offerId]

  const agencyMsg: Msg = {
    id: 'm-' + Date.now(),
    offerId, from: 'agency',
    text: `📋 Запрос документов: ${requested.map(d => '• ' + d.name).join('\n')}`,
    at: nowIso,
  }
  thread.push(agencyMsg)

  // Simulate seller ack + delivery a bit later (same request, instant for demo)
  const ackMsg: Msg = {
    id: 'm-' + (Date.now() + 1),
    offerId, from: 'seller',
    text: `Принято. Собираю документы (${requested.length} шт.) и пришлю ссылки в течение часа.`,
    at: new Date(Date.now() + 1200).toISOString(),
  }
  thread.push(ackMsg)

  // Mark docs as received (demo: instant simulated delivery with fake URLs)
  for (const d of requested) {
    d.receivedAt = new Date(Date.now() + 2500).toISOString()
    d.url = `/docs/${offerId}/${encodeURIComponent(d.name)}.pdf`
  }
  const deliveryMsg: Msg = {
    id: 'm-' + (Date.now() + 2),
    offerId, from: 'seller',
    text: `✅ Документы отправлены:\n${requested.map(d => '• ' + d.name + ' → ' + d.url).join('\n')}`,
    at: new Date(Date.now() + 2800).toISOString(),
  }
  thread.push(deliveryMsg)

  // Status back to in_progress
  const receivedIso = new Date(Date.now() + 3000).toISOString()
  offer.status = 'in_progress'
  offer.statusHistory.push({ at: receivedIso, status: 'in_progress', note: 'Docs received' })
  global.__PB_FEEDBACK__.unshift({
    at: receivedIso, offerId, ref: (offer as { ref?: string }).ref || '',
    event: 'docs_received', note: `${requested.length} docs`,
  })

  return NextResponse.json({ success: true, docs: requested, messages: [agencyMsg, ackMsg, deliveryMsg], offer })
}
