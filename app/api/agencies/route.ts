/**
 * GET /api/agencies
 * Returns active registered agencies as RealAgency[] for APEX real-time matching.
 * Falls back to DEMO_AGENCY_POOL when no registered agencies exist.
 *
 * POST /api/agencies/:id/activate  — admin: activate a pending agency
 * POST /api/agencies/:id/suspend   — admin: suspend an active agency
 */

import { NextRequest, NextResponse } from 'next/server'
import { activeAgencies, registeredAgenciesStore, toApexAgency } from '@/lib/api-globals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const includePending = searchParams.get('include_pending') === 'true'
  const adminSecret = req.headers.get('x-admin-secret')
  const serverSecret = process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN?.slice(-8)
  const isAdmin = adminSecret && serverSecret && adminSecret === serverSecret

  let agencies
  if (includePending && isAdmin) {
    agencies = registeredAgenciesStore()
  } else {
    agencies = activeAgencies()
  }

  if (agencies.length === 0) {
    // No registered agencies yet — signal this to APEX so it can use demo pool
    return NextResponse.json({
      source: 'demo_pool',
      count: 0,
      agencies: [],
    })
  }

  return NextResponse.json({
    source: 'registered',
    count: agencies.length,
    agencies: agencies.map(toApexAgency),
  })
}
