/**
 * POST /api/save-lead
 *
 * Saves a lead to Supabase and fires a Telegram notification.
 * Called by all 3 lead pages: /lead, /rental-match, /property-finder
 *
 * Body:
 * {
 *   email: string          — required
 *   phone?: string         — optional
 *   intent: string         — 'sell' | 'buy' | 'rent' | 'find_rental' | 'list_rental' | 'buy_property'
 *   source: string         — 'lead' | 'rental-match' | 'property-finder'
 *   prop_type?: string
 *   country?: string
 *   city?: string
 *   price?: number
 *   agencies_count?: number
 *   saved_agencies?: string[]   — names of saved/ranked agencies
 *   saved_properties?: string[] — titles of saved properties (Engine 3)
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Supabase client (server-side) ───────────────────────────────────────────
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('placeholder')) return null
  return createClient(url, key)
}

// ─── Telegram helper ─────────────────────────────────────────────────────────
async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // non-blocking — never throw
  }
}

// ─── Format Telegram notification ────────────────────────────────────────────
function buildTelegramMsg(data: {
  email: string; phone?: string; intent: string; source: string
  prop_type?: string; country?: string; city?: string; price?: number
  agencies_count?: number; saved_agencies?: string[]; saved_properties?: string[]
}): string {
  const sourceEmoji: Record<string, string> = {
    'lead': '🏠',
    'rental-match': '🏘️',
    'property-finder': '🔎',
  }
  const intentLabel: Record<string, string> = {
    'sell': 'Sell property',
    'buy': 'Buy property',
    'rent': 'Rent property',
    'find_rental': 'Find rental',
    'list_rental': 'List for rent',
    'buy_property': 'Buy property (direct)',
  }

  const emoji = sourceEmoji[data.source] ?? '📩'
  const intent = intentLabel[data.intent] ?? data.intent
  const location = [data.city, data.country].filter(Boolean).join(', ')
  const priceStr = data.price ? `€${data.price.toLocaleString()}` : ''
  const savedList = (data.saved_agencies || data.saved_properties || []).slice(0, 3)

  let msg = `${emoji} <b>New Lead — PropBlaze</b>\n\n`
  msg += `📧 <b>${data.email}</b>\n`
  if (data.phone) msg += `📞 ${data.phone}\n`
  msg += `\n`
  msg += `🎯 Intent: ${intent}\n`
  if (data.prop_type) msg += `🏷️ Type: ${data.prop_type}\n`
  if (location) msg += `📍 Location: ${location}\n`
  if (priceStr) msg += `💶 Budget: ${priceStr}\n`
  if (data.agencies_count) msg += `🏢 Agencies shown: ${data.agencies_count}\n`
  if (savedList.length > 0) {
    msg += `\n⭐ Saved:\n`
    savedList.forEach(s => { msg += `  • ${s}\n` })
  }
  msg += `\n🕐 ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Podgorica', dateStyle: 'short', timeStyle: 'short' })} (ME)`
  msg += `\n📌 Source: /${data.source}`

  return msg
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email, phone, intent, source,
      prop_type, country, city, price,
      agencies_count, saved_agencies, saved_properties,
    } = body

    if (!email || !intent || !source) {
      return NextResponse.json({ error: 'email, intent, source required' }, { status: 400 })
    }

    const leadData = {
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      intent,
      source,
      prop_type: prop_type || null,
      country: country || null,
      city: city || null,
      price: price || null,
      agencies_count: agencies_count || null,
      saved_agencies: saved_agencies || [],
      saved_properties: saved_properties || [],
      created_at: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
      user_agent: req.headers.get('user-agent')?.slice(0, 200) || null,
    }

    // ── 1. Save to Supabase ───────────────────────────────────────────────────
    let supabaseOk = false
    const supabase = getSupabase()
    if (supabase) {
      const { error } = await supabase
        .from('leads')
        .upsert(leadData, { onConflict: 'email,source' })  // don't duplicate same email+source
      if (!error) supabaseOk = true
    }

    // ── 2. Telegram notification (parallel, non-blocking) ─────────────────────
    const tgMsg = buildTelegramMsg({
      email, phone, intent, source, prop_type, country, city, price,
      agencies_count, saved_agencies, saved_properties,
    })
    sendTelegram(tgMsg)  // fire-and-forget — don't await

    return NextResponse.json({
      success: true,
      saved: supabaseOk,
      demo: !supabase,
      message: supabaseOk
        ? 'Lead saved to Supabase'
        : 'Lead received (Supabase not configured — add real keys to enable persistence)',
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
