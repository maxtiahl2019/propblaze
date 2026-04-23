/**
 * POST /api/auth/login  → { access_token, user }
 * In-memory auth for MVP / demo.
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

function users(): StoredUser[] {
  const s = usersStore()
  if (s.length === 0) {
    const seeds: StoredUser[] = [
      { id: 'u-seed-max', email: 'max.tyagly@gmail.com', passwordHash: hash('demo1234'),
        full_name: 'Max Tyagly', role: 'owner', status: 'active',
        email_verified: true, phone_verified: false,
        created_at: '2026-01-01T00:00:00Z', updated_at: new Date().toISOString() },
      { id: 'u-seed-contact', email: 'contact@win-winsolution.com', passwordHash: hash('demo1234'),
        full_name: 'Max (Contact)', role: 'owner', status: 'active',
        email_verified: true, phone_verified: false,
        created_at: '2026-01-01T00:00:00Z', updated_at: new Date().toISOString() },
      { id: 'u-seed-agency', email: 'agency@propblaze.com', passwordHash: hash('demo1234'),
        full_name: 'Demo Agency', role: 'agency', status: 'active',
        email_verified: true, phone_verified: false,
        created_at: '2026-01-01T00:00:00Z', updated_at: new Date().toISOString() },
    ]
    s.push(...seeds)
  }
  return s
}

function publicUser(u: StoredUser) {
  const { passwordHash, ...rest } = u
  return rest
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const requestedRole = body.role === 'agency' ? 'agency' : 'owner'

  if (!email || !password) return NextResponse.json({ detail: 'Email and password required' }, { status: 400 })
  if (password.length < 4) return NextResponse.json({ detail: 'Password too short' }, { status: 400 })

  const all = users()
  let user = all.find(u => u.email === email)

  if (!user) {
    user = {
      id: 'u-' + Date.now(),
      email,
      passwordHash: hash(password),
      full_name: email.split('@')[0],
      role: requestedRole,
      status: 'active',
      email_verified: true,
      phone_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    all.push(user)
  } else if (user.passwordHash !== hash(password)) {
    return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 })
  }

  const token = 't_' + user.id + '_' + Date.now().toString(36)
  tokensStore()[token] = user.id

  return NextResponse.json({
    access_token: token,
    token_type: 'bearer',
    user: publicUser(user),
  })
}
