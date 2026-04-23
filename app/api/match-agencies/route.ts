/**
 * POST /api/match-agencies
 *
 * Autonomous matching — no questions to user.
 * Send property data → receive ranked agency list + auto-routing intel.
 *
 * Sources (priority order):
 *  1. Registered agencies from registeredAgenciesStore (real, self-registered)
 *  2. DEMO_AGENCY_POOL fallback when store is empty (dev / before first registration)
 *
 * Body: { property: Property }
 * Returns: MatchResult
 */

import { NextRequest, NextResponse } from 'next/server'
import { runMatchingEngine } from '@/lib/ai-matching/engine'
import { activeAgencies, toApexAgency, ensureAgenciesHydrated } from '@/lib/api-globals'
import type { Property } from '@/lib/ai-matching/engine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const prop = body.property as Property

    if (!prop?.id || !prop?.type || !prop?.price_eur || !prop?.location?.country) {
      return NextResponse.json(
        { error: 'Missing required property fields: id, type, price_eur, location.country' },
        { status: 400 }
      )
    }

    // ── Agency source: registered first, demo pool as fallback ────────────────
    // Hydrate from Supabase if store empty (server restart scenario)
    await ensureAgenciesHydrated()
    const registered = activeAgencies()
    let agencies: any[]
    let agencySource: 'registered' | 'demo_pool'

    if (registered.length > 0) {
      agencies = registered.map(toApexAgency)
      agencySource = 'registered'
    } else {
      // No agencies registered yet — use demo pool
      const { DEMO_AGENCY_POOL } = await import('@/lib/ai-matching/demo-agencies')
      agencies = DEMO_AGENCY_POOL
      agencySource = 'demo_pool'
    }

    // Optional: LLM boost if AI key available
    let llmBoostFn: ((agency: any, prop: any) => Promise<number>) | undefined

    if (process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
      llmBoostFn = async (agency: any) => {
        // Simulate quality-based boost — replace with real LLM call in production
        return Math.round((agency.quality_score / 100) * 15)
      }
    }

    const result = await runMatchingEngine(prop, agencies, llmBoostFn)

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        agency_source: agencySource,
        agency_pool_size: agencies.length,
        llm_boost_active: !!llmBoostFn,
        engine_version: '3.0',
      },
    })
  } catch (err: any) {
    console.error('[match-agencies] Error:', err)
    return NextResponse.json(
      { error: err.message ?? 'Internal server error' },
      { status: 500 }
    )
  }
}

// ── Dev-only GET test ──────────────────────────────────────────────────────────
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const { runDemoMatching } = await import('@/lib/ai-matching/engine')

  const testProperty: Property = {
    id: 'test-001',
    type: 'villa',
    price_eur: 485_000,
    location: {
      country: 'ME',
      city: 'Budva',
      is_seaside: true,
    },
    size_m2: 240,
    rooms: 4,
    condition: 'good',
    features: ['pool', 'sea_view', 'garage'],
    owner_languages: ['ru', 'en'],
  }

  const registered = activeAgencies()
  let agencies: any[]
  let agencySource: 'registered' | 'demo_pool'

  if (registered.length > 0) {
    agencies = registered.map(toApexAgency)
    agencySource = 'registered'
  } else {
    const { DEMO_AGENCY_POOL } = await import('@/lib/ai-matching/demo-agencies')
    agencies = DEMO_AGENCY_POOL
    agencySource = 'demo_pool'
  }

  const result = await runDemoMatching(testProperty)
  return NextResponse.json({
    success: true,
    data: result,
    meta: { agency_source: agencySource, agency_pool_size: agencies.length },
  })
}
