/**
 * POST /api/agency-portal/register
 * Agency self-registration → stored in registeredAgenciesStore (+ Supabase when configured).
 * Sends welcome email via Resend and Telegram admin notification.
 *
 * GET  /api/agency-portal/register   → admin listing (requires x-admin-secret header)
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  registeredAgenciesStore,
  countryFlag,
  type RegisteredAgency,
} from '@/lib/api-globals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Country normalizer ────────────────────────────────────────────────────────
const COUNTRY_TO_ISO: Record<string, string> = {
  // Balkans
  serbia: 'RS', 'srbija': 'RS',
  montenegro: 'ME', 'crna gora': 'ME',
  croatia: 'HR', 'hrvatska': 'HR',
  'bosnia': 'BA', 'bosna': 'BA',
  slovenia: 'SI', 'slovenija': 'SI',
  macedonia: 'MK', 'north macedonia': 'MK', 'severna makedonija': 'MK',
  albania: 'AL', 'shqipëria': 'AL',
  // Western Europe
  germany: 'DE', 'deutschland': 'DE',
  austria: 'AT', 'österreich': 'AT',
  switzerland: 'CH', 'schweiz': 'CH',
  france: 'FR',
  italy: 'IT', 'italia': 'IT',
  spain: 'ES', 'españa': 'ES',
  portugal: 'PT',
  netherlands: 'NL', 'holland': 'NL',
  belgium: 'BE',
  greece: 'GR', 'ελλάδα': 'GR',
  // Eastern Europe
  poland: 'PL', 'polska': 'PL',
  'czech republic': 'CZ', 'czechia': 'CZ',
  hungary: 'HU', 'magyarország': 'HU',
  romania: 'RO', 'românia': 'RO',
  bulgaria: 'BG', 'българия': 'BG',
  // UK & Nordics
  'united kingdom': 'GB', 'uk': 'GB', 'england': 'GB',
  ireland: 'IE',
  sweden: 'SE', 'sverige': 'SE',
  norway: 'NO', 'norge': 'NO',
  denmark: 'DK', 'danmark': 'DK',
  finland: 'FI', 'suomi': 'FI',
  // Middle East
  'united arab emirates': 'AE', 'uae': 'AE', 'dubai': 'AE',
  'saudi arabia': 'SA',
  qatar: 'QA',
  turkey: 'TR', 'türkiye': 'TR',
  israel: 'IL',
  // Post-Soviet
  russia: 'RU', 'россия': 'RU',
  ukraine: 'UA', 'україна': 'UA',
  belarus: 'BY', 'беларусь': 'BY',
  kazakhstan: 'KZ', 'казахстан': 'KZ',
  // Americas
  'united states': 'US', 'usa': 'US',
  canada: 'CA',
  mexico: 'MX', 'méxico': 'MX',
  brazil: 'BR', 'brasil': 'BR',
  // Asia-Pacific
  singapore: 'SG',
  'hong kong': 'HK',
  china: 'CN',
  japan: 'JP',
  australia: 'AU',
  'new zealand': 'NZ',
  india: 'IN',
  // Africa
  'south africa': 'ZA',
}

function normalizeCountry(raw: string): string {
  const lower = raw.toLowerCase().trim()
  // Already ISO-2
  if (/^[a-z]{2}$/i.test(raw)) return raw.toUpperCase()
  return COUNTRY_TO_ISO[lower] ?? raw.toUpperCase().slice(0, 2)
}

function generateAgencyId(): string {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase()
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `PB-AG-${part1}-${part2}`
}

// ─── Supabase sync ─────────────────────────────────────────────────────────────
async function syncToSupabase(agency: RegisteredAgency): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes('placeholder')) return

  try {
    await fetch(`${url}/rest/v1/agencies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        id: agency.id,
        company_name: agency.company_name,
        agent_name: agency.agent_name,
        email: agency.email,
        phone: agency.phone,
        website: agency.website,
        vat_number: agency.vat_number,
        country: agency.country,
        city: agency.city,
        flag: agency.flag,
        property_types: agency.property_types,
        price_bands: agency.price_bands,
        buyer_markets: agency.buyer_markets,
        languages: agency.languages,
        specializations: agency.specializations,
        delivery_channels: agency.delivery_channels,
        quality_score: agency.quality_score,
        status: agency.status,
        is_active: agency.is_active,
        registered_at: agency.registered_at,
        contact_policy: agency.contact_policy,
      }),
    })
  } catch (e) {
    console.warn('[register] Supabase sync failed (non-fatal):', e)
  }
}

// ─── Telegram admin notification ───────────────────────────────────────────────
async function notifyAdminTelegram(agency: RegisteredAgency): Promise<void> {
  const tgToken = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
  const tgChat  = process.env.TELEGRAM_CHAT_ID  || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID
  if (!tgToken || !tgChat) return

  const msg = [
    `🏢 <b>New Agency Registered!</b>`,
    ``,
    `<b>${agency.company_name}</b> ${agency.flag}`,
    agency.agent_name ? `👤 ${agency.agent_name}` : '',
    `📧 ${agency.email}`,
    agency.phone ? `📱 ${agency.phone}` : '',
    agency.website ? `🌐 ${agency.website}` : '',
    ``,
    `📍 Country: ${agency.country}`,
    `🏠 Property types: ${agency.property_types.join(', ')}`,
    `💰 Price bands: ${agency.price_bands.join(', ')}`,
    `🌍 Buyer markets: ${agency.buyer_markets.join(', ')}`,
    `🗣 Languages: ${agency.languages.join(', ')}`,
    ``,
    `🆔 <code>${agency.id}</code>`,
    `⏳ Status: <b>pending_review</b> → Approve to activate`,
  ].filter(Boolean).join('\n')

  try {
    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgChat, text: msg, parse_mode: 'HTML' }),
    })
  } catch (e) {
    console.warn('[register] Telegram notify failed (non-fatal):', e)
  }
}

// ─── Welcome email ─────────────────────────────────────────────────────────────
async function sendWelcomeEmail(agency: RegisteredAgency): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY
  if (!resendKey) return

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `PropBlaze Agency Network <${fromEmail}>`,
        to: [agency.email],
        reply_to: 'hello@propblaze.com',
        subject: `Welcome to PropBlaze Agency Network — Your ID: ${agency.id}`,
        html: buildWelcomeHTML(agency),
      }),
    })
  } catch (e) {
    console.warn('[register] Welcome email failed (non-fatal):', e)
  }
}

function buildWelcomeHTML(a: RegisteredAgency): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#fff;padding:40px 20px;margin:0">
  <div style="max-width:560px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px">
      <div style="width:40px;height:40px;background:linear-gradient(135deg,#dc2626,#ea580c);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px">🔥</div>
      <span style="font-size:20px;font-weight:800;color:#fff">Prop<span style="color:#f97316">Blaze</span></span>
    </div>

    <h1 style="font-size:28px;font-weight:900;margin:0 0 8px;color:#fff">Welcome, ${a.company_name}! ${a.flag}</h1>
    <p style="color:rgba(255,255,255,.5);margin:0 0 32px">Your PropBlaze Agency Network registration is confirmed. You are currently under review and will be activated within 24–48 hours.</p>

    <div style="background:rgba(220,38,38,.1);border:1px solid rgba(220,38,38,.25);border-radius:16px;padding:24px;margin-bottom:32px">
      <p style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.4);margin:0 0 8px">Your Agency ID</p>
      <p style="font-size:28px;font-weight:900;font-family:monospace;color:#f97316;margin:0;letter-spacing:.05em">${a.id}</p>
      <p style="font-size:12px;color:rgba(255,255,255,.3);margin:8px 0 0">Keep this ID safe — you will need it to log in and receive leads</p>
    </div>

    <div style="background:rgba(255,255,255,.04);border-radius:16px;padding:20px;margin-bottom:24px">
      <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.4);margin:0 0 12px">Your Registration Details</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="color:rgba(255,255,255,.4);padding:4px 0;width:40%">Country</td><td style="color:#fff">${a.country} ${a.flag}</td></tr>
        <tr><td style="color:rgba(255,255,255,.4);padding:4px 0">Property types</td><td style="color:#fff">${a.property_types.join(', ')}</td></tr>
        <tr><td style="color:rgba(255,255,255,.4);padding:4px 0">Price bands</td><td style="color:#fff">${a.price_bands.join(', ')}</td></tr>
        <tr><td style="color:rgba(255,255,255,.4);padding:4px 0">Buyer markets</td><td style="color:#fff">${a.buyer_markets.join(', ')}</td></tr>
        <tr><td style="color:rgba(255,255,255,.4);padding:4px 0">Languages</td><td style="color:#fff">${a.languages.join(', ')}</td></tr>
      </table>
    </div>

    <h3 style="color:#fff;font-size:16px;margin:0 0 16px">How PropBlaze works:</h3>
    <ol style="color:rgba(255,255,255,.5);font-size:14px;line-height:1.8;padding-left:20px;margin:0 0 24px">
      <li>APEX AI matches your profile to properties from verified owners</li>
      <li>You receive a full package (letter + photos + documents)</li>
      <li>Reply directly to the owner via the contact details provided</li>
      <li>Close the deal and report back — builds your track record for better matches</li>
    </ol>

    <div style="background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.2);border-radius:12px;padding:16px;margin-bottom:24px">
      <p style="font-size:12px;color:rgba(255,255,255,.6);margin:0">⚡ <strong style="color:#f97316">Next step:</strong> Our team will review your profile and activate your account. You'll receive leads matching your specialisation as soon as you're active. Questions? Reply to this email.</p>
    </div>

    <a href="https://propblaze.com/agency" style="display:block;text-align:center;background:linear-gradient(135deg,#dc2626,#ea580c);color:#fff;font-weight:700;font-size:15px;padding:16px;border-radius:14px;text-decoration:none">Agency Login →</a>

    <p style="text-align:center;color:rgba(255,255,255,.2);font-size:12px;margin-top:32px">PropBlaze · hello@propblaze.com · propblaze.com</p>
  </div>
</body>
</html>`
}

// ─── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    // Validate required fields
    const required = ['company_name', 'email', 'country']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    if (!body.property_types?.length) {
      return NextResponse.json({ error: 'At least one property_type required' }, { status: 400 })
    }
    if (!body.buyer_markets?.length) {
      return NextResponse.json({ error: 'At least one buyer_market required' }, { status: 400 })
    }
    if (!body.languages?.length) {
      return NextResponse.json({ error: 'At least one language required' }, { status: 400 })
    }

    // Email format
    const email = String(body.email).trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Duplicate check
    const store = registeredAgenciesStore()
    if (store.find(a => a.email === email)) {
      return NextResponse.json({
        error: 'An agency with this email is already registered. Contact hello@propblaze.com to update your profile.',
      }, { status: 409 })
    }

    const countryIso = normalizeCountry(String(body.country))
    const now = new Date().toISOString()

    const agency: RegisteredAgency = {
      // Identity
      id: generateAgencyId(),
      company_name: String(body.company_name).trim(),
      agent_name: body.agent_name ? String(body.agent_name).trim() : undefined,
      email,
      phone: body.phone ? String(body.phone).trim() : undefined,
      website: body.website ? String(body.website).trim() : undefined,
      vat_number: body.vat_number ? String(body.vat_number).trim() : undefined,

      // Location
      country: countryIso,
      city: body.city ? String(body.city).trim() : countryIso,
      flag: countryFlag(countryIso),

      // Matching
      property_types: Array.isArray(body.property_types) ? body.property_types : [body.property_types],
      price_bands: Array.isArray(body.price_bands) && body.price_bands.length
        ? body.price_bands
        : ['mid', 'premium'],
      buyer_markets: Array.isArray(body.buyer_markets) ? body.buyer_markets : [body.buyer_markets],
      languages: Array.isArray(body.languages) ? body.languages : [body.languages],
      specializations: Array.isArray(body.specializations) && body.specializations.length
        ? body.specializations
        : ['residential'],
      delivery_channels: Array.isArray(body.delivery_channels) && body.delivery_channels.length
        ? body.delivery_channels
        : ['email'],

      // Performance defaults (fresh account)
      quality_score: 72,
      historical: {
        response_rate: 0,
        conversion_rate: 0,
        avg_response_hours: 24,
        owner_direct_success_rate: 0,
        cross_border_deals_12m: 0,
        luxury_deals_12m: 0,
      },

      // Platform
      status: 'pending_review',
      is_active: false,
      registered_at: now,
      contact_policy: 'open',
    }

    // Save to in-memory store
    store.push(agency)

    // Async side effects — fire and forget (don't block response)
    void syncToSupabase(agency)
    void notifyAdminTelegram(agency)
    void sendWelcomeEmail(agency)

    return NextResponse.json({
      success: true,
      agency_id: agency.id,
      status: agency.status,
      message: 'Registration successful. Your profile is under review and will be activated within 24–48 hours.',
      next_steps: [
        'Check your email for your Agency ID and confirmation',
        'Our team will review your profile and activate your account',
        'You will start receiving property leads matching your criteria',
        'Reply directly to owners — their contact details are included in each lead',
      ],
    })
  } catch (err: any) {
    console.error('[agency-portal/register] Error:', err)
    return NextResponse.json({ error: err.message ?? 'Registration failed' }, { status: 500 })
  }
}

// ─── GET handler — admin listing ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')
  const adminSecret = process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN?.slice(-8)
  if (!adminSecret || secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const store = registeredAgenciesStore()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const agencies = status ? store.filter(a => a.status === status) : store

  return NextResponse.json({
    total: store.length,
    active: store.filter(a => a.is_active).length,
    pending: store.filter(a => a.status === 'pending_review').length,
    agencies: agencies.map(a => ({
      id: a.id,
      company_name: a.company_name,
      email: a.email,
      country: a.country,
      flag: a.flag,
      status: a.status,
      is_active: a.is_active,
      property_types: a.property_types,
      buyer_markets: a.buyer_markets,
      registered_at: a.registered_at,
    })),
  })
}
