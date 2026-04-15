/**
 * GET /api/auth/me  — returns user from Bearer token
 */
import { NextRequest, NextResponse } from 'next/server'
import { usersStore, tokensStore } from '@/lib/api-globals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return NextResponse.json({ detail: 'No token' }, { status: 401 })

  const userId = tokensStore()[token]
  if (!userId) return NextResponse.json({ detail: 'Invalid token' }, { status: 401 })

  const user = usersStore().find(u => u.id === userId)
  if (!user) return NextResponse.json({ detail: 'User not found' }, { status: 404 })

  const { passwordHash, ...publicUser } = user
  return NextResponse.json(publicUser)
}
