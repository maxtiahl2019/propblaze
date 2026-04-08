import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    // ─── Google OAuth ─────────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),

    // ─── Email + Password (delegates to FastAPI backend) ────────────────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        try {
          const res = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();
          if (!data.access_token) return null;

          // Fetch user profile
          const userRes = await fetch(`${apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${data.access_token}` },
          });

          if (!userRes.ok) return null;

          const user = await userRes.json();

          return {
            id: user.id,
            email: user.email,
            name: user.profile?.full_name || user.email,
            accessToken: data.access_token,
            role: user.role,
          };
        } catch {
          // Backend not available — allow demo mode passthrough
          if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
            return {
              id: 'demo-user-001',
              email: credentials.email,
              name: 'Demo User',
              role: 'owner',
            };
          }
          return null;
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET || 'propblaze-dev-secret-change-in-production',

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, account, user }) {
      // On first sign-in, persist extra fields to token
      if (account?.provider === 'google') {
        token.provider = 'google';
        token.role = 'owner'; // Google users are property owners by default
      }
      if (user) {
        token.role = (user as any).role || 'owner';
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose role and provider to the client session
      (session as any).role = token.role;
      (session as any).provider = token.provider;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },
});

export { handler as GET, handler as POST };
