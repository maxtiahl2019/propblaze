/**
 * GET  /api/agency-chat?offerId=...&since=...  → poll new messages
 * POST /api/agency-chat                         → send a message
 *
 * AI-driven owner replies for demo realism. Uses Anthropic if key present,
 * otherwise canned scripted replies.
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Msg {
  id: string
  offerId: string
  from: 'agency' | 'owner' | 'seller'
  text: string
  at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __PB_MSGS__: Record<string, Msg[]> | undefined
}

function store(): Record<string, Msg[]> {
  if (!global.__PB_MSGS__) global.__PB_MSGS__ = {}
  return global.__PB_MSGS__
}

function thread(offerId: string): Msg[] {
  const s = store()
  if (!s[offerId]) {
    s[offerId] = [{
      id: 'm-' + Date.now(),
      offerId,
      from: 'owner',
      text: 'Здравствуйте! Готов обсудить вашу заинтересованность объектом. Какие у вас вопросы?',
      at: new Date(Date.now() - 60_000).toISOString(),
    }]
  }
  return s[offerId]
}

async function aiOwnerReply(offerId: string, history: Msg[], lastAgencyMsg: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return canned(lastAgencyMsg)
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
  return 'Спасибо за интерес. Что именно вы хотели бы уточнить?'
}

export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get('offerId') || ''
  const since = req.nextUrl.searchParams.get('since') || ''
  if (!offerId) return NextResponse.json({ error: 'offerId required' }, { status: 400 })
  const msgs = thread(offerId)
  const filtered = since ? msgs.filter(m => m.at > since) : msgs
  return NextResponse.json({ success: true, messages: filtered, serverTime: new Date().toISOString() })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { offerId, text } = body
  if (!offerId || !text) return NextResponse.json({ error: 'offerId & text required' }, { status: 400 })
  const msgs = thread(offerId)
  const agencyMsg: Msg = {
    id: 'm-' + Date.now(),
    offerId, from: 'agency', text: String(text).slice(0, 1000),
    at: new Date().toISOString(),
  }
  msgs.push(agencyMsg)

  // AI owner reply (async-ish — small delay to feel natural)
  const replyText = await aiOwnerReply(offerId, msgs, agencyMsg.text)
  const ownerMsg: Msg = {
    id: 'm-' + (Date.now() + 1),
    offerId, from: 'owner', text: replyText,
    at: new Date(Date.now() + 1500).toISOString(),
  }
  msgs.push(ownerMsg)

  return NextResponse.json({ success: true, messages: [agencyMsg, ownerMsg] })
}
