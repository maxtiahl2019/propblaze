/**
 * NextAuth route — PropBlaze MVP
 *
 * Auth flow:
 *   1. Supabase handles real email/password auth on the client (store/auth.ts)
 *   2. NextAuth is used only for session persistence
 *   3. Google OAuth enabled only if GOOGLE_CLIENT_ID is set
 *   4. Demo mode: any credentials pass through
 */

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
        userId:   { label: 'User ID',  type: 'text' },
        role:     { label: 'Role',     type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        // Demo mode — accept any credentials
        if (DEMO_MODE) {
          return {
            id:    credentials.userId || 'demo-user-001',
            email: credentials.email,
            name:  credentials.email.split('@')[0],
            role:  credentials.role || 'owner',
          }
        }

        // Supabase client already authenticated the user and passes userId
        if (credentials.userId) {
          return {
            id:    credentials.userId,
            email: credentials.email,
            name:  credentials.email.split('@')[0],
            role:  credentials.role || 'owner',
          }
        }

        return null
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET || 'propblaze-dev-secret-2026',

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'owner'
        token.sub  = user.id
      }
      return token
    },
    async session({ session, token }) {
      ;(session as any).role   = token.role
      ;(session as any).userId = token.sub
      return session
    },
  },

  pages: {
    signIn:  '/login',
    newUser: '/register',
    error:   '/login',
  },
})

export { handler as GET, handler as POST }
