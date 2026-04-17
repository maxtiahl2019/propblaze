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
import { msgsStore, offersStore, type Msg } from '@/lib/api-globals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
      text: `Здравствуйте! Это ${sellerName}. Готов обсудить вашу заинтересованность объектом. Какие у вас вопросы?`,
      at: new Date(Date.now() - 60_000).toISOString(),
    }]
  }
  return s[offerId]
}

/* ── List all threads with latest message (for owner inbox) ───────── */
function allThreads(): { offerId: string; messages: Msg[]; lastAt: string }[] {
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
    const transcript = history.slice(-8).map(m => `${m.from === 'agency' ? 'Agency' : 'Owner'}: ${m.text}`).join('\n')
    const prompt = `You are a property OWNER chatting with a real-estate AGENCY about your listing on PropBlaze.
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
  if (/price|цен|стоим/.test(m)) return 'Цена обсуждаемая, готов рассмотреть предложения от €465K. Документы все в порядке.'
  if (/view|посмотр|показ/.test(m)) return 'Можем организовать просмотр в любой день на этой неделе. Когда удобно?'
  if (/photo|фото|видео/.test(m)) return 'Все фото и видео-обход уже в pack. Хотите дополнительные ракурсы?'
  if (/buyer|клиент|покупател/.test(m)) return 'Открыт ко всем серьёзным покупателям. Какой профиль у вашего клиента?'
  if (/doc|документ|справк/.test(m)) return 'Все документы в порядке. Могу предоставить что нужно для проверки.'
  return 'Спасибо за интерес. Что именно вы хотели бы уточнить?'
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
        unread: t.messages.filter(m => m.from === 'agency').length, // rough unread count
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

  // Single thread mode
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
