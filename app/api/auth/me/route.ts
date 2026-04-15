/**
 * GET /api/auth/me  — returns user from Bearer token
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface StoredUser {
  id: string; email: string; passwordHash: string; full_name: string
  role: 'owner' | 'agency' | 'staff'; status: 'active'
  email_verified: boolean; phone_verified: boolean
  created_at: string; updated_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __PB_USERS__: StoredUser[] | undefined
  // eslint-disable-next-line no-var
  var __PB_TOKENS__: Record<string, string> | undefined
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return NextResponse.json({ detail: 'No token' }, { status: 401 })

  const userId = (global.__PB_TOKENS__ || {})[token]
  if (!userId) return NextResponse.json({ detail: 'Invalid token' }, { status: 401 })

  const user = (global.__PB_USERS__ || []).find(u => u.id === userId)
  if (!user) return NextResponse.json({ detail: 'User not found' }, { status: 404 })

  const { passwordHash, ...publicUser } = user
  return NextResponse.json(publicUser)
}
