/**
 * POST /api/agency-portal/register
 * Agency registration — creates an agency account with unique ID.
 * Owner contact details are NEVER shared. Communication goes through the platform.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export interface AgencyRegistration {
  // Required
  company_name: string
  email: string
  country: string
  property_types: string[]
  price_bands: string[]
  buyer_markets: string[]
  languages: string[]

  // Optional
  website?: string
  phone?: string
  vat_number?: string
  specializations?: string[]
  agent_name?: string
}

function generateAgencyId(): string {
  // Format: PB-AG-XXXX-XXXX (memorable, professional)
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase()
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `PB-AG-${part1}-${part2}`
}

export async function POST(req: NextRequest) {
  try {
    const body: AgencyRegistration = await req.json()

    // Validate required fields
    const required = ['company_name', 'email', 'country', 'property_types', 'buyer_markets']
    for (const field of required) {
      if (!body[field as keyof AgencyRegistration]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const agencyId = generateAgencyId()
    const now = new Date().toISOString()

    // In production: save to database
    // await db.agencies.create({ data: { ...body, id: agencyId, created_at: now, status: 'pending_review' } })

    // Send welcome email via Resend
    const welcomeEmail = {
      to: body.email,
      subject: `Welcome to PropBlaze Agency Network — Your ID: ${agencyId}`,
      html: buildWelcomeEmail(body.company_name, agencyId),
    }

    if (process.env.NEXT_PUBLIC_RESEND_API_KEY) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(welcomeEmail),
      })
    }

    return NextResponse.json({
      success: true,
      agency_id: agencyId,
      message: 'Registration successful. Your profile is under review. You will receive leads within 48 hours.',
      next_steps: [
        'Check your email for confirmation',
        'Complete your profile (optional but increases match rate)',
        'You will receive property leads matching your criteria',
        'All communication with property owners happens inside PropBlaze',
      ],
      important: 'Owner contact details are never shared directly. All leads arrive through the PropBlaze platform.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function buildWelcomeEmail(companyName: string, agencyId: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #ffffff; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #dc2626, #ea580c); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🔥</div>
      <span style="font-size: 20px; font-weight: 800; color: white;">Prop<span style="color: #f97316;">Blaze</span></span>
    </div>

    <h1 style="font-size: 28px; font-weight: 900; margin: 0 0 8px; color: white;">Welcome, ${companyName}!</h1>
    <p style="color: rgba(255,255,255,0.5); margin: 0 0 32px;">Your PropBlaze Agency Network registration is confirmed.</p>

    <div style="background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.25); border-radius: 16px; padding: 24px; margin-bottom: 32px;">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); margin: 0 0 8px;">Your Agency ID</p>
      <p style="font-size: 32px; font-weight: 900; font-family: monospace; color: #f97316; margin: 0; letter-spacing: 0.05em;">${agencyId}</p>
      <p style="font-size: 12px; color: rgba(255,255,255,0.3); margin: 8px 0 0;">Use this ID to log in and access property leads</p>
    </div>

    <h3 style="color: white; font-size: 16px; margin: 0 0 16px;">How it works:</h3>
    <ol style="color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0 0 32px;">
      <li>We match properties to your specialisation and buyer markets</li>
      <li>You receive a full property package (letter + photos + cadastral docs)</li>
      <li>Contact the owner through the PropBlaze platform — never directly</li>
      <li>Close the deal and report back for your track record</li>
    </ol>

    <div style="background: rgba(255,255,255,0.04); border-radius: 16px; padding: 20px; margin-bottom: 32px;">
      <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin: 0;">🔒 <strong style="color: rgba(255,255,255,0.7);">Owner privacy notice:</strong> Property owner contact details are protected at all times. All communication must happen through the PropBlaze messaging system. Attempting to contact owners outside the platform will result in account suspension.</p>
    </div>

    <a href="https://propblaze.com/agency/dashboard" style="display: block; text-align: center; background: linear-gradient(135deg, #dc2626, #ea580c); color: white; font-weight: 700; font-size: 15px; padding: 16px; border-radius: 14px; text-decoration: none;">Access Agency Dashboard →</a>

    <p style="text-align: center; color: rgba(255,255,255,0.2); font-size: 12px; margin-top: 32px;">PropBlaze · hello@propblaze.com</p>
  </div>
</body>
</html>
  `
}
