export const dynamic = "force-static";
/**
 * POST /api/match-agencies
 *
 * Autonomous matching — no questions to user.
 * Send property data → receive ranked agency list + auto-routing intel.
 *
 * Body: { property: Property }
 * Returns: MatchResult
 */

import { NextRequest, NextResponse } from 'next/server'
import { runMatchingEngine } from '@/lib/ai-matching/engine'
import type { Property } from '@/lib/ai-matching/engine'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

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

    let agencies

    if (DEMO_MODE) {
      // Use demo pool — no DB needed
      const { DEMO_AGENCY_POOL } = await import('@/lib/ai-matching/demo-agencies')
      agencies = DEMO_AGENCY_POOL
    } else {
      // In production: fetch from database
      // agencies = await db.agencies.findMany({ where: { is_active: true } })
      // For now fall back to demo
      const { DEMO_AGENCY_POOL } = await import('@/lib/ai-matching/demo-agencies')
      agencies = DEMO_AGENCY_POOL
    }

    // Optional: LLM boost if OpenAI/Anthropic key available
    let llmBoostFn: ((agency: any, prop: any) => Promise<number>) | undefined

    if (process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY) {
      llmBoostFn = async (agency, property) => {
        // In production: call LLM with structured prompt
        // Return 0–30 boost score
        // For now: simulate based on quality_score
        return Math.round((agency.quality_score / 100) * 15)
      }
    }

    const result = await runMatchingEngine(prop, agencies, llmBoostFn)

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        demo_mode: DEMO_MODE,
        llm_boost_active: !!llmBoostFn,
        engine_version: '2.0',
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

// Test the engine with GET (dev only)
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

  const result = await runDemoMatching(testProperty)
  return NextResponse.json({ success: true, data: result })
}
