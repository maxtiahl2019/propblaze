/**
 * POST /api/distribute
 *
 * Runs the AI matching engine, selects top agencies, and sends
 * a personalised outreach email to each one via Resend.
 *
 * Input:
 *   property   — full property object
 *   aiPack     — generated pack (headline, description, keyFeatures, etc.)
 *   ownerEmail — owner's email (replies forwarded here)
 *   wave?      — 1 | 2 | 3  (default: 1, top-10)
 *
 * Output:
 *   { success, sent, failed, agencies, demo }
 */

import { NextRequest, NextResponse } from 'next/server'
import { runDemoMatching } from '@/lib/ai-matching/engine'

const RESEND_API_KEY = process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY
const FROM_EMAIL = 'PropBlaze <noreply@propblaze.com>'
const OWNER_NOTIFY_EMAIL = process.env.OWNER_NOTIFY_EMAIL || 'contact@win-winsolution.com'

// ─── Agency email map (demo pool → real contacts) ─────────────────────────────
// In production these come from the PostgreSQL agencies table
const AGENCY_EMAIL_MAP: Record<string, string> = {
  'ag-001': 'adriatic@engelvoelkers.com',
  'ag-002': 'residential@savills.com',
  'ag-003': 'info@remax-adriatic.hr',
  'ag-004': 'info@sothebysrealty.com',
  'ag-005': 'info@knightfrank.com',
  'ag-006': 'info@cbreresidential.com',
  'ag-007': 'info@coldwellbanker-europe.com',
  'ag-008': 'info@jll-residential.com',
  'ag-009': 'info@colliers-residential.com',
  'ag-010': 'info@century21-europe.com',
}

// ─── Email template builder ───────────────────────────────────────────────────

function buildAgencyEmail(opts: {
  agencyName: string
  property: any
  aiPack: any
  ownerEmail: string
  matchScore: number
  wave: number
}): { subject: string; html: string } {
  const { agencyName, property, aiPack, ownerEmail, matchScore } = opts

  const subject =
    aiPack?.agencyEmailSubject ||
    `Property Opportunity: ${aiPack?.headline || property.type} in ${property.city}, ${property.country} — €${Number(property.price || 0).toLocaleString()}`

  const featuresList = (aiPack?.keyFeatures || [])
    .slice(0, 5)
    .map((f: string) => `<li style="margin:4px 0;color:#e2e8f0;">${f}</li>`)
    .join('')

  const investList = (aiPack?.investmentHighlights || [])
    .slice(0, 3)
    .map((h: string) => `<li style="margin:4px 0;color:#e2e8f0;">${h}</li>`)
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#F5C200,#FF8C00);padding:8px 20px;border-radius:99px;">
        <span style="color:#080810;font-weight:800;font-size:14px;letter-spacing:0.05em;">PROPBLAZE · EXCLUSIVE PROPERTY MATCH</span>
      </div>
    </div>

    <!-- AI Match Badge -->
    <div style="background:rgba(245,194,0,0.08);border:1px solid rgba(245,194,0,0.25);border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <div style="font-size:13px;color:#F5C200;font-weight:700;margin-bottom:4px;">🤖 AI MATCH SCORE: ${matchScore}/100</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);">Selected from our global agency database for this specific property</div>
    </div>

    <!-- Greeting -->
    <p style="color:rgba(255,255,255,0.85);font-size:15px;line-height:1.6;margin:0 0 20px;">
      Dear <strong style="color:#fff;">${agencyName}</strong>,
    </p>
    <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.65;margin:0 0 24px;">
      We have a verified property listing that matches your agency's specialization profile. The owner has authorized us to share this opportunity exclusively with selected agencies — you are among the top ${opts.wave === 1 ? '10' : opts.wave === 2 ? '20' : '30'} matches.
    </p>

    <!-- Property Card -->
    <div style="background:#1c1c34;border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:24px;margin-bottom:24px;">
      <h2 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 8px;line-height:1.3;">
        ${aiPack?.headline || subject}
      </h2>
      <div style="color:rgba(245,194,0,0.9);font-size:13px;font-weight:700;margin-bottom:16px;">
        📍 ${property.city || ''}, ${property.country || ''} &nbsp;·&nbsp; €${Number(property.price || 0).toLocaleString()} &nbsp;·&nbsp; ${property.areaSqm || property.area || '?'} m²
      </div>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.65;margin:0 0 20px;">
        ${aiPack?.description || ''}
      </p>

      ${featuresList ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">KEY FEATURES</div>
        <ul style="margin:0;padding-left:20px;">${featuresList}</ul>
      </div>` : ''}

      ${investList ? `
      <div>
        <div style="font-size:11px;font-weight:700;color:rgba(245,194,0,0.6);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">INVESTMENT HIGHLIGHTS</div>
        <ul style="margin:0;padding-left:20px;">${investList}</ul>
      </div>` : ''}
    </div>

    <!-- Target Buyer Profile -->
    ${aiPack?.targetBuyerProfile ? `
    <div style="background:rgba(59,91,219,0.08);border:1px solid rgba(59,91,219,0.2);border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:rgba(147,197,253,0.7);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">TARGET BUYER PROFILE</div>
      <p style="color:rgba(147,197,253,0.9);font-size:13px;line-height:1.6;margin:0;">${aiPack.targetBuyerProfile}</p>
    </div>` : ''}

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="mailto:${ownerEmail}?subject=Re: ${encodeURIComponent(subject)}" style="display:inline-block;background:linear-gradient(135deg,#F5C200,#FF8C00);color:#080810;font-weight:800;font-size:15px;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.02em;">
        Contact Owner Directly →
      </a>
      <p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:12px;">
        Reply to this email or contact <a href="mailto:${ownerEmail}" style="color:#F5C200;">${ownerEmail}</a> directly
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;text-align:center;">
      <p style="color:rgba(255,255,255,0.25);font-size:11px;line-height:1.6;margin:0;">
        This message was sent via <strong style="color:rgba(255,255,255,0.4);">PropBlaze AI</strong> on behalf of the property owner.<br>
        The owner has authorized this outreach and will receive all replies.<br>
        <a href="https://propblaze.com/unsubscribe" style="color:rgba(255,255,255,0.3);">Unsubscribe</a> · <a href="https://propblaze.com/privacy" style="color:rgba(255,255,255,0.3);">Privacy Policy</a>
      </p>
    </div>

  </div>
</body>
</html>`

  return { subject, html }
}

// ─── Owner notification email ─────────────────────────────────────────────────

function buildOwnerNotification(opts: {
  ownerEmail: string
  property: any
  sentCount: number
  agencies: string[]
}): { subject: string; html: string } {
  const { property, sentCount, agencies } = opts
  const agencyList = agencies.map((a) => `<li style="color:#e2e8f0;margin:4px 0;">${a}</li>`).join('')

  return {
    subject: `✅ Distribution launched — ${sentCount} agencies notified about your ${property.city || ''} property`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;padding:32px 16px;">
    <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:16px;padding:24px;margin-bottom:20px;">
      <div style="font-size:28px;margin-bottom:8px;">🚀</div>
      <h2 style="color:#22C55E;font-size:18px;font-weight:800;margin:0 0 8px;">Distribution Launched!</h2>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;line-height:1.6;margin:0;">
        Your property in <strong style="color:#fff;">${property.city || 'Unknown'}, ${property.country || ''}</strong> has been sent to <strong style="color:#22C55E;">${sentCount} verified agencies</strong>.
      </p>
    </div>
    <div style="background:#1c1c34;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">AGENCIES NOTIFIED</div>
      <ul style="margin:0;padding-left:20px;">${agencyList}</ul>
    </div>
    <div style="background:rgba(245,194,0,0.06);border:1px solid rgba(245,194,0,0.18);border-radius:12px;padding:16px 20px;">
      <div style="font-size:12px;color:rgba(245,194,0,0.8);line-height:1.6;">
        💡 <strong>What happens next:</strong> Agencies will reply directly to your email. Check your inbox — first responses typically arrive within 24–48h. You'll find all leads in your PropBlaze dashboard.
      </div>
    </div>
    <p style="color:rgba(255,255,255,0.2);font-size:11px;text-align:center;margin-top:24px;">PropBlaze · <a href="https://propblaze.com" style="color:rgba(255,255,255,0.3);">propblaze.com</a></p>
  </div>
</body>
</html>`,
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { property, aiPack, ownerEmail, wave = 1 } = body

    if (!property || !ownerEmail) {
      return NextResponse.json({ error: 'Missing property or ownerEmail' }, { status: 400 })
    }

    // Build property object compatible with matching engine
    const matchProperty = {
      id: property.id || `prop-${Date.now()}`,
      type: property.type || 'apartment',
      price_eur: Number(property.price) || 100000,
      location: {
        country: property.country || 'RS',
        city: property.city || '',
        is_urban: true,
      },
      size_m2: Number(property.areaSqm) || undefined,
      rooms: Number(property.bedrooms) || undefined,
      owner_languages: ['en', 'ru'],
    }

    // Run AI matching engine
    let matchResult: any = null
    let selectedAgencies: any[] = []

    try {
      matchResult = await runDemoMatching(matchProperty as any)
      const waveKey = `wave${wave}` as 'wave1' | 'wave2' | 'wave3'
      selectedAgencies = (matchResult.wave_breakdown?.[waveKey] || matchResult.match_scores || []).slice(0, 10)
    } catch (matchErr) {
      console.warn('[distribute] Matching engine error, using fallback agencies:', matchErr)
      // Fallback: use first 10 agencies from demo pool
      const { DEMO_AGENCY_POOL } = await import('@/lib/ai-matching/demo-agencies')
      selectedAgencies = DEMO_AGENCY_POOL.slice(0, 10).map((a) => ({ agency: a, total_score: 80, wave: 1 }))
    }

    // Demo mode — no Resend key
    if (!RESEND_API_KEY) {
      const names = selectedAgencies.map((s) => s.agency?.name || 'Unknown Agency')
      console.log('[distribute] DEMO MODE — would send to:', names.length, 'agencies')
      return NextResponse.json({
        success: true,
        demo: true,
        sent: names.length,
        failed: 0,
        agencies: names,
        message: 'Demo mode: emails logged but not sent. Add RESEND_API_KEY to enable real distribution.',
        matchResult: matchResult?.auto_routing || null,
      })
    }

    // Real send — batch emails to all selected agencies
    const results: { name: string; success: boolean; error?: string }[] = []

    for (const scored of selectedAgencies) {
      const agency = scored.agency || scored
      const agencyEmail = AGENCY_EMAIL_MAP[agency.id] || agency.email

      if (!agencyEmail) {
        results.push({ name: agency.name, success: false, error: 'No email on file' })
        continue
      }

      const { subject, html } = buildAgencyEmail({
        agencyName: agency.name,
        property,
        aiPack,
        ownerEmail,
        matchScore: Math.round(scored.total_score || 80),
        wave,
      })

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [agencyEmail],
            reply_to: ownerEmail,
            subject,
            html,
          }),
        })

        if (res.ok) {
          results.push({ name: agency.name, success: true })
        } else {
          const err = await res.json()
          results.push({ name: agency.name, success: false, error: err.message })
        }
      } catch (sendErr: any) {
        results.push({ name: agency.name, success: false, error: sendErr.message })
      }

      // Rate limit: 2 emails/sec to stay within Resend free tier
      await new Promise((r) => setTimeout(r, 500))
    }

    const sent = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)

    // Notify owner
    if (sent.length > 0) {
      const { subject: ownerSubject, html: ownerHtml } = buildOwnerNotification({
        ownerEmail,
        property,
        sentCount: sent.length,
        agencies: sent.map((r) => r.name),
      })

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [ownerEmail],
          subject: ownerSubject,
          html: ownerHtml,
        }),
      }).catch((e) => console.error('[distribute] Owner notify failed:', e))
    }

    return NextResponse.json({
      success: sent.length > 0,
      sent: sent.length,
      failed: failed.length,
      agencies: sent.map((r) => r.name),
      errors: failed.length > 0 ? failed : undefined,
      matchResult: matchResult?.auto_routing || null,
    })
  } catch (err: any) {
    console.error('[distribute] Exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
