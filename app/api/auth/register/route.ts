/**
 * POST /api/auth/register
 */
import { NextRequest, NextResponse } from 'next/server'
import { usersStore, tokensStore, type StoredUser } from '@/lib/api-globals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

  const users = usersStore()
  const tokens = tokensStore()

  const existing = users.find(u => u.email === email)
  if (existing) return NextResponse.json({ detail: 'An account with this email already exists. Please sign in.' }, { status: 409 })

  const user: StoredUser = {
    id: 'u-' + Date.now(),
    email, passwordHash: hash(password), full_name, role,
    status: 'active', email_verified: true, phone_verified: false,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  users.push(user)

  const token = 't_' + user.id + '_' + Date.now().toString(36)
  tokens[token] = user.id

  const { passwordHash, ...publicUser } = user
  return NextResponse.json({ access_token: token, token_type: 'bearer', user: publicUser })
}
