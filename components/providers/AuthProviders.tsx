'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuth } from '@/store/auth';

/**
 * AuthSync — reads the NextAuth session and mirrors it into the Zustand auth store.
 * This lets the rest of the app use useAuth() regardless of sign-in method.
 */
function AuthSync() {
  const { data: session, status } = useSession();
  const { updateUser, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (status === 'authenticated' && session?.user && !isAuthenticated) {
      // Sync Google / NextAuth user into the Zustand store
      updateUser({
        id: (session as any).id || session.user.email || 'oauth-user',
        email: session.user.email || '',
        role: (session as any).role || 'owner',
        status: 'active',
        email_verified: true,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Carry over access token if credentials login
        ...((session as any).accessToken && { accessToken: (session as any).accessToken }),
      } as any);

      // Also persist token from credentials-based login
      if ((session as any).accessToken && typeof window !== 'undefined') {
        localStorage.setItem('access_token', (session as any).accessToken);
      }
    }
  }, [session, status, isAuthenticated, updateUser]);

  return null;
}

/**
 * PropBlazeProviders — wraps the app in NextAuth SessionProvider.
 * AuthSync runs inside so it has access to the session.
 */
export default function PropBlazeProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSync />
      {children}
    </SessionProvider>
  );
}
