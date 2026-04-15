/**
 * POST /api/auth/register
 *   body: { email, password, full_name, role? }
 *   → { access_token, user }
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

function hash(pw: string): string {
  let h = 0
  for (let i = 0; i < pw.length; i++) h = ((h << 5) - h + pw.charCodeAt(i)) | 0
  return 'h_' + Math.abs(h).toString(36) + '_' + pw.length
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const full_name = String(body.full_name || '').trim() || email.split('@')[0]
  const role = (['owner', 'agency', 'staff'].includes(body.role) ? body.role : 'owner') as 'owner' | 'agency' | 'staff'

  if (!email || !password) return NextResponse.json({ detail: 'Email and password required' }, { status: 400 })
  if (password.length < 8) return NextResponse.json({ detail: 'Password must be at least 8 characters' }, { status: 400 })

  if (!global.__PB_USERS__) global.__PB_USERS__ = []
  if (!global.__PB_TOKENS__) global.__PB_TOKENS__ = {}

  const existing = global.__PB_USERS__.find(u => u.email === email)
  if (existing) return NextResponse.json({ detail: 'An account with this email already exists. Please sign in.' }, { status: 409 })

  const user: StoredUser = {
    id: 'u-' + Date.now(),
    email, passwordHash: hash(password), full_name, role,
    status: 'active', email_verified: true, phone_verified: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  global.__PB_USERS__.push(user)

  const token = 't_' + user.id + '_' + Date.now().toString(36)
  global.__PB_TOKENS__[token] = user.id

  const { passwordHash, ...publicUser } = user
  return NextResponse.json({ access_token: token, token_type: 'bearer', user: publicUser })
}
