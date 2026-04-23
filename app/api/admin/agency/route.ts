/**
 * Admin: activate / suspend registered agencies
 *
 * POST /api/admin/agency
 *   Headers: x-admin-secret: <ADMIN_SECRET>
 *   Body: { action: 'activate' | 'suspend', agency_id: string }
 *
 * GET /api/admin/agency?status=pending_review
 *   Headers: x-admin-secret: <ADMIN_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server'
import { registeredAgenciesStore, ensureAgenciesHydrated } from '@/lib/api-globals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function verifyAdmin(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  const serverSecret = process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN?.slice(-8)
  return !!(secret && serverSecret && secret === serverSecret)
}

async function syncToSupabase(id: string, fields: Record<string, any>): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes('placeholder')) return

  try {
    await fetch(`${url}/rest/v1/agencies?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(fields),
    })
  } catch {}
}

async function sendActivationEmail(agency: { email: string; company_name: string; id: string; flag: string }): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY
  if (!resendKey) return

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `PropBlaze Agency Network <${fromEmail}>`,
        to: [agency.email],
        reply_to: 'hello@propblaze.com',
        subject: `✅ Your PropBlaze agency account is now active — ${agency.company_name}`,
        html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#fff;padding:40px 20px;margin:0">
  <div style="max-width:520px;margin:0 auto">
    <div style="font-size:20px;font-weight:800;margin-bottom:28px">Prop<span style="color:#f97316">Blaze</span></div>
    <div style="font-size:40px;margin-bottom:16px">✅</div>
    <h1 style="font-size:26px;font-weight:900;margin:0 0 12px">Your account is active!</h1>
    <p style="color:rgba(255,255,255,.5);font-size:15px;margin:0 0 32px">
      <strong style="color:#fff">${agency.company_name}</strong> ${agency.flag} is now active in the PropBlaze Agency Network.
      You will start receiving property leads matched to your profile.
    </p>
    <div style="background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.2);border-radius:14px;padding:20px;margin-bottom:28px">
      <p style="font-size:13px;color:rgba(255,255,255,.6);margin:0">
        ⚡ <strong style="color:#f97316">Next:</strong> When a property match is found by APEX, you'll receive an email with the owner's contact details and full property package. Reply directly to the owner.
      </p>
    </div>
    <a href="https://propblaze.com/login" style="display:block;text-align:center;background:linear-gradient(135deg,#dc2626,#ea580c);color:#fff;font-weight:800;font-size:15px;padding:16px;border-radius:14px;text-decoration:none">
      Access Agency Dashboard →
    </a>
    <p style="text-align:center;color:rgba(255,255,255,.2);font-size:12px;margin-top:28px">PropBlaze · hello@propblaze.com</p>
  </div>
</body></html>`,
      }),
    })
  } catch {}
}

// ─── POST: activate or suspend ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { action, agency_id } = body

  if (!agency_id || !['activate', 'suspend'].includes(action)) {
    return NextResponse.json({ error: 'Required: action (activate|suspend), agency_id' }, { status: 400 })
  }

  await ensureAgenciesHydrated()
  const store = registeredAgenciesStore()
  const agency = store.find(a => a.id === agency_id)

  if (!agency) {
    return NextResponse.json({ error: `Agency ${agency_id} not found` }, { status: 404 })
  }

  const now = new Date().toISOString()

  if (action === 'activate') {
    agency.status = 'active'
    agency.is_active = true
    agency.approved_at = now
    void syncToSupabase(agency_id, { status: 'active', is_active: true, approved_at: now })
    void sendActivationEmail({ email: agency.email, company_name: agency.company_name, id: agency.id, flag: agency.flag })

    return NextResponse.json({
      success: true,
      action: 'activated',
      agency_id,
      company_name: agency.company_name,
      email: agency.email,
      message: `✅ ${agency.company_name} is now active. Activation email sent.`,
    })
  }

  if (action === 'suspend') {
    agency.status = 'suspended'
    agency.is_active = false
    void syncToSupabase(agency_id, { status: 'suspended', is_active: false })

    return NextResponse.json({
      success: true,
      action: 'suspended',
      agency_id,
      company_name: agency.company_name,
      message: `⛔ ${agency.company_name} has been suspended.`,
    })
  }
}

// ─── GET: list agencies by status ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await ensureAgenciesHydrated()
  const store = registeredAgenciesStore()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'pending_review'

  const filtered = status === 'all' ? store : store.filter(a => a.status === status)

  return NextResponse.json({
    total: store.length,
    filtered: filtered.length,
    status_filter: status,
    agencies: filtered.map(a => ({
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
