/**
 * Unified chat API — used by BOTH agency and owner/seller sides.
 *
 * GET  /api/agency-chat?offerId=...&since=...  → poll messages
 * POST /api/agency-chat                         → send a message
 *       body: { offerId, text, from?: 'agency'|'owner' }
 *
 * When from='agency' (default): AI generates owner reply for demo.
 * When from='owner': no auto-reply (agency replies manually).
 */
import { NextRequest, NextResponse } from 'next/server'
import { msgsStore, offersStore, type Msg, type Offer } from '@/lib/api-globals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* ── Shared offer seeder (same data as agency-feed, avoids circular) ─ */
function ensureOffers() {
  const s = offersStore()
  if (s.length > 0) return
  const now = Date.now()
  const photo = (t: string) => {
    const m: Record<string, string[]> = {
      Villa: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
      Apartment: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
      Land: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80','https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=800&q=80'],
    }
    return m[t] || m.Villa
  }
  s.push(
    { id: 'PB-' + (now - 3_600_000), ref: 'PB-2026-0041', receivedAt: new Date(now - 3_600_000).toISOString(),
      property: { type: 'Villa', address: 'Kneza Miloša 42', city: 'Belgrade', country: 'Serbia', flag: '🇷🇸', sqm: 210, beds: 4, price: 485000, currency: 'EUR', description: 'Luxury villa with panoramic city views, private garden, 3 levels.', photos: 12, photoUrls: photo('Villa') },
      seller: { name: 'M. Kovačević', lang: 'EN', respondsIn: '2h', email: 'm.kovacevic@seller.propblaze' },
      match: { score: 94, wave: 1, reasons: ['Geo: Belgrade ✓','Luxury segment ✓','International buyer profile ✓'] }, status: 'new', statusHistory: [{ at: new Date(now - 3_600_000).toISOString(), status: 'new' }], docs: [] },
    { id: 'PB-' + (now - 86_400_000), ref: 'PB-2026-0038', receivedAt: new Date(now - 86_400_000).toISOString(),
      property: { type: 'Apartment', address: 'Bulevar Oslobođenja 15', city: 'Novi Sad', country: 'Serbia', flag: '🇷🇸', sqm: 85, beds: 2, price: 175000, currency: 'EUR', description: 'Modern 2-bedroom apartment in city center with river view.', photos: 8, photoUrls: photo('Apartment') },
      seller: { name: 'D. Jovanović', lang: 'EN', respondsIn: '4h', email: 'd.jovanovic@seller.propblaze' },
      match: { score: 87, wave: 1, reasons: ['Geo: Novi Sad ✓','Mid-range segment ✓','High demand area ✓'] }, status: 'accepted', statusHistory: [{ at: new Date(now - 86_400_000).toISOString(), status: 'new' },{ at: new Date(now - 72_000_000).toISOString(), status: 'accepted' }], docs: [] },
    { id: 'PB-' + (now - 172_800_000), ref: 'PB-2026-0035', receivedAt: new Date(now - 172_800_000).toISOString(),
      property: { type: 'Land', address: 'Niška Banja area', city: 'Niš', country: 'Serbia', flag: '🇷🇸', sqm: 1200, beds: 0, price: 95000, currency: 'EUR', description: 'Development plot with all permits, flat terrain, utility connections ready.', photos: 4, photoUrls: photo('Land') },
      seller: { name: 'S. Nikolić', lang: 'SR', respondsIn: '6h', email: 's.nikolic@seller.propblaze' },
      match: { score: 79, wave: 2, reasons: ['Geo: Niš region ✓','Land specialist ✓','Development potential ✓'] }, status: 'in_progress', statusHistory: [{ at: new Date(now - 172_800_000).toISOString(), status: 'new' },{ at: new Date(now - 160_000_000).toISOString(), status: 'accepted' },{ at: new Date(now - 120_000_000).toISOString(), status: 'in_progress' }], docs: [] },
  )
}

/* ── Demo conversation seeds — realistic agency↔owner threads ───── */
const DEMO_CONVOS: { from: 'agency' | 'owner'; text: string; delayMin: number }[][] = [
  // Thread 0: Villa Belgrade — active negotiation
  [
    { from: 'owner',  text: "Hello! I'm ready to discuss the villa. All documents are prepared, happy to answer any questions.", delayMin: 0 },
    { from: 'agency', text: "Thank you for listing with us. We have 3 qualified buyers looking for premium Belgrade properties. Could we schedule a viewing this week?", delayMin: 45 },
    { from: 'owner',  text: "Of course! Thursday or Friday afternoon works best. The property is fully staged and ready.", delayMin: 120 },
    { from: 'agency', text: "Perfect, let's confirm Thursday at 15:00. One client is a Vienna-based investor — very interested in the panoramic views. Can you share the floor plans in advance?", delayMin: 180 },
    { from: 'owner',  text: "Floor plans attached to the sales pack. The top floor terrace is 45m² with 270° views — that's usually the selling point. Parking for 3 cars included.", delayMin: 210 },
    { from: 'agency', text: "Excellent. We'll prepare our client brief. What's your flexibility on the asking price? Our investor client is serious but typically negotiates.", delayMin: 300 },
  ],
  // Thread 1: Apartment Novi Sad — early stage
  [
    { from: 'owner',  text: "Hi! The apartment is available for viewings. Energy class A, underground parking included in price.", delayMin: 0 },
    { from: 'agency', text: "Great listing. We noticed the river view — is it unobstructed? We have two young professional couples looking in this area.", delayMin: 90 },
    { from: 'owner',  text: "Yes, 5th floor with direct Danube view, nothing blocking it. The balcony is 12m². Building is from 2024, still under warranty.", delayMin: 150 },
    { from: 'agency', text: "That's a strong selling point. Could we arrange a viewing for both clients next Monday? Also, is the parking spot deeded or assigned?", delayMin: 240 },
  ],
  // Thread 2: Land Niš — document stage
  [
    { from: 'owner',  text: "Hello. The plot has all permits ready — residential zoning, up to 3 floors. Utilities are at the boundary.", delayMin: 0 },
    { from: 'agency', text: "Interesting opportunity. We have a developer client looking for plots in this area. Can you confirm the exact zoning regulations and any building restrictions?", delayMin: 180 },
    { from: 'owner',  text: "Zoned R3 — residential up to 3 floors, max 60% ground coverage. No heritage restrictions. I can provide the full urban planning certificate.", delayMin: 300 },
  ],
]

/* ── Thread accessor (seeds first message if empty) ───────────────── */
function thread(offerId: string): Msg[] {
  const s = msgsStore()
  if (!s[offerId]) {
    // Find the offer to personalize the seed message
    const offer = offersStore().find(o => o.id === offerId)
    const sellerName = offer?.seller?.name || 'Owner'
    s[offerId] = [{
      id: 'm-seed-' + offerId,
      offerId,
      from: 'owner',
      text: `Hello! This is ${sellerName}. I'm ready to discuss your interest in the property. What questions do you have?`,
      at: new Date(Date.now() - 60_000).toISOString(),
    }]
  }
  return s[offerId]
}

/* ── Ensure all offers have chat threads (with demo conversations) ── */
function ensureAllThreads() {
  ensureOffers() // make sure offers exist even if agency-feed wasn't visited
  const offers = offersStore()
  const s = msgsStore()

  offers.forEach((offer, idx) => {
    if (s[offer.id]) return // already has messages

    const convo = DEMO_CONVOS[idx % DEMO_CONVOS.length]
    const baseTime = Date.now() - (convo.length * 30 * 60_000) // spread over last few hours

    s[offer.id] = convo.map((msg, i) => ({
      id: `m-demo-${offer.id}-${i}`,
      offerId: offer.id,
      from: msg.from,
      text: msg.text,
      at: new Date(baseTime + msg.delayMin * 60_000).toISOString(),
    }))
  })
}

/* ── List all threads with latest message (for owner inbox) ───────── */
function allThreads(): { offerId: string; messages: Msg[]; lastAt: string }[] {
  // Auto-seed threads for all offers that don't have them yet
  ensureAllThreads()

  const s = msgsStore()
  return Object.entries(s)
    .filter(([, msgs]) => msgs.length > 0)
    .map(([offerId, msgs]) => ({
      offerId,
      messages: msgs,
      lastAt: msgs[msgs.length - 1].at,
    }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
}

/* ── AI owner reply (only when agency writes) ─────────────────────── */
async function aiOwnerReply(offerId: string, history: Msg[], lastAgencyMsg: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key === 'YOUR_ANTHROPIC_KEY_HERE') return canned(lastAgencyMsg)
  try {
    const offer = offersStore().find(o => o.id === offerId)
    const propInfo = offer ? `Property: ${offer.property.type} in ${offer.property.city}, ${offer.property.country}, €${offer.property.price.toLocaleString()}, ${offer.property.sqm}m²` : ''
    const transcript = history.slice(-8).map(m => `${m.from === 'agency' ? 'Agency' : 'Owner'}: ${m.text}`).join('\n')
    const prompt = `You are a property OWNER chatting with a real-estate AGENCY about your listing on PropBlaze.
${propInfo}
Be natural, concise (1-3 sentences). Reply in the same language the agency used. Be cooperative but business-like.
Conversation so far:
${transcript}
Agency just wrote: "${lastAgencyMsg}"
Your reply as the owner:`
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 200, temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return canned(lastAgencyMsg)
    const data = await res.json()
    return (data.content?.[0]?.text || canned(lastAgencyMsg)).trim()
  } catch {
    return canned(lastAgencyMsg)
  }
}

function canned(msg: string): string {
  const m = msg.toLowerCase()
  if (/price|цен|стоим|cost|offer|€/.test(m)) return 'The price is negotiable — open to offers from €465K. All documents are in order.'
  if (/view|посмотр|показ|visit|tour|see/.test(m)) return 'We can arrange a viewing any day this week. When works best for you?'
  if (/photo|фото|видео|video|image|picture/.test(m)) return 'All photos and video walkthrough are in the pack. Would you like additional angles?'
  if (/buyer|клиент|покупател|client|interest|investor/.test(m)) return 'Open to all serious buyers. What is your client\'s profile?'
  if (/doc|документ|справк|paper|certificate|plan|permit/.test(m)) return 'All documents are in order. I can provide whatever you need for due diligence.'
  if (/when|когда|time|date|schedule|available/.test(m)) return 'I\'m flexible — mornings and afternoons work. What time suits your client best?'
  return 'Thank you for your interest. What would you like to know more about?'
}

/* ═══ GET — poll messages ══════════════════════════════════════════ */
export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get('offerId') || ''
  const since = req.nextUrl.searchParams.get('since') || ''
  const listAll = req.nextUrl.searchParams.get('listAll') // owner inbox mode

  // Owner inbox mode: return all threads with offer metadata
  if (listAll === '1') {
    const threads = allThreads()
    const offers = offersStore()
    const result = threads.map(t => {
      const offer = offers.find(o => o.id === t.offerId)
      return {
        offerId: t.offerId,
        lastMessage: t.messages[t.messages.length - 1],
        messageCount: t.messages.length,
        unread: t.messages.filter(m => m.from === 'agency').length,
        offer: offer ? {
          ref: offer.ref,
          type: offer.property.type,
          city: offer.property.city,
          country: offer.property.country,
          flag: offer.property.flag,
          price: offer.property.price,
          status: offer.status,
          photoUrl: offer.property.photoUrls?.[0],
        } : null,
      }
    })
    return NextResponse.json({ success: true, threads: result, serverTime: new Date().toISOString() })
  }

  // Single thread mode — also ensure threads are seeded
  if (!offerId) return NextResponse.json({ error: 'offerId required' }, { status: 400 })
  ensureAllThreads()
  const msgs = thread(offerId)
  const filtered = since ? msgs.filter(m => m.at > since) : msgs
  return NextResponse.json({ success: true, messages: filtered, serverTime: new Date().toISOString() })
}

/* ═══ POST — send a message ═══════════════════════════════════════ */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { offerId, text } = body
  const from: 'agency' | 'owner' = body.from === 'owner' ? 'owner' : 'agency'

  if (!offerId || !text) return NextResponse.json({ error: 'offerId & text required' }, { status: 400 })

  ensureAllThreads()
  const msgs = thread(offerId)
  const userMsg: Msg = {
    id: 'm-' + Date.now(),
    offerId,
    from,
    text: String(text).slice(0, 1000),
    at: new Date().toISOString(),
  }
  msgs.push(userMsg)

  const result: Msg[] = [userMsg]

  // Only generate AI reply when AGENCY writes (simulate owner response)
  // When OWNER writes, agency sees it on next poll — no auto-reply
  if (from === 'agency') {
    const replyText = await aiOwnerReply(offerId, msgs, userMsg.text)
    const ownerMsg: Msg = {
      id: 'm-' + (Date.now() + 1),
      offerId,
      from: 'owner',
      text: replyText,
      at: new Date(Date.now() + 1500).toISOString(),
    }
    msgs.push(ownerMsg)
    result.push(ownerMsg)
  }

  return NextResponse.json({ success: true, messages: result })
}
