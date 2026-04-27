/**
 * POST /api/send-email
 * Unified email sender via Resend API
 * Handles: trial campaigns, owner notifications, agency welcome, distribution emails
 */

import { NextRequest, NextResponse } from 'next/server'

// Server-only vars preferred; NEXT_PUBLIC_ kept as legacy fallback (do not add new NEXT_PUBLIC_ keys)
const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY
// Use onboarding@resend.dev as default — works without domain verification.
// Once propblaze.com is verified in Resend dashboard, set RESEND_FROM_EMAIL=PropBlaze <noreply@propblaze.com>
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL || 'PropBlaze <onboarding@resend.dev>'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, subject, html, replyTo, text, tags } = body

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html or text' },
        { status: 400 }
      )
    }

    if (!RESEND_API_KEY) {
      console.log('[send-email] DEMO MODE — would send to:', to, '| Subject:', subject)
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Demo mode: email logged but not sent. Add RESEND_API_KEY to .env.local to enable sending.',
        to,
        subject,
      })
    }

    const payload: any = {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
    }

    if (html) payload.html = html
    if (text) payload.text = text
    if (replyTo) payload.reply_to = replyTo
    if (tags) payload.tags = tags

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[send-email] Resend error:', data)
      return NextResponse.json(
        { error: data.message || 'Failed to send email', details: data },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message_id: data.id,
      to,
      subject,
    })
  } catch (err: any) {
    console.error('[send-email] Exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
