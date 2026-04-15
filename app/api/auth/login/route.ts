/**
 * POST /api/auth/login
 *   body: { email, password }
 *   → { access_token, user }
 *
 * In-memory auth for MVP / demo. Accepts any email+password combo ≥ 4 chars,
 * or a known seeded user. Creates a token and stores it in __PB_USERS__.
 * Replace with real auth (Supabase/Auth0/NextAuth-credentials) before prod.
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export interface StoredUser {
  id: string
  email: string
  passwordHash: string // trivial hash for demo, NOT secure
  full_name: string
  role: 'owner' | 'agency' | 'staff'
  status: 'active'
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __PB_USERS__: StoredUser[] | undefined
  // eslint-disable-next-line no-var
  var __PB_TOKENS__: Record<string, string> | undefined // token -> userId
}

function users(): StoredUser[] {
  if (!global.__PB_USERS__) {
    global.__PB_USERS__ = [
      {
        id: 'u-seed-max',
        email: 'max.tyagly@gmail.com',
        passwordHash: hash('demo1234'),
        full_name: 'Max Tyagly',
        role: 'owner',
        status: 'active',
        email_verified: true,
        phone_verified: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'u-seed-contact',
        email: 'contact@win-winsolution.com',
        passwordHash: hash('demo1234'),
        full_name: 'Max (Contact)',
        role: 'owner',
        status: 'active',
        email_verified: true,
        phone_verified: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'u-seed-agency',
        email: 'agency@propblaze.com',
        passwordHash: hash('demo1234'),
        full_name: 'Demo Agency',
        role: 'agency',
        status: 'active',
        email_verified: true,
        phone_verified: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
    ]
  }
  return global.__PB_USERS__
}

function tokens(): Record<string, string> {
  if (!global.__PB_TOKENS__) global.__PB_TOKENS__ = {}
  return global.__PB_TOKENS__
}

function hash(pw: string): string {
  // trivial demo hash — replace with bcrypt/argon2 in prod
  let h = 0
  for (let i = 0; i < pw.length; i++) h = ((h << 5) - h + pw.charCodeAt(i)) | 0
  return 'h_' + Math.abs(h).toString(36) + '_' + pw.length
}

function publicUser(u: StoredUser) {
  const { passwordHash, ...rest } = u
  return rest
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!email || !password) {
    return NextResponse.json({ detail: 'Email and password required' }, { status: 400 })
  }
  if (password.length < 4) {
    return NextResponse.json({ detail: 'Password too short' }, { status: 400 })
  }

  const all = users()
  let user = all.find(u => u.email === email)

  // Lenient demo mode: auto-create user if not found (prevents lockout on any email)
  if (!user) {
    user = {
      id: 'u-' + Date.now(),
      email,
      passwordHash: hash(password),
      full_name: email.split('@')[0],
      role: 'owner',
      status: 'active',
      email_verified: true,
      phone_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    all.push(user)
  } else if (user.passwordHash !== hash(password)) {
    // For seeded demo users, also accept the seed password "demo1234".
    // For user-created accounts, require exact match.
    return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 })
  }

  const token = 't_' + user.id + '_' + Date.now().toString(36)
  tokens()[token] = user.id

  return NextResponse.json({
    access_token: token,
    token_type: 'bearer',
    user: publicUser(user),
  })
}
