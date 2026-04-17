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
import { msgsStore, offersStore, seedOffers, seedChatThreads, type Msg } from '@/lib/api-globals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* ── Thread accessor ──────────────────────────────────────────────── */
function thread(offerId: string): Msg[] {
  seedChatThreads() // ensure all demo threads exist
  const s = msgsStore()
  if (!s[offerId]) {
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

/* ── List all threads with latest message (for owner inbox) ───────── */
function allThreads(): { offerId: string; messages: Msg[]; lastAt: string }[] {
  seedChatThreads() // ensure all demo threads exist
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
  const listAll = req.nextUrl.searchParams.get('listAll')

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

  if (!offerId) return NextResponse.json({ error: 'offerId required' }, { status: 400 })
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
