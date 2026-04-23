import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured, upsertUserProfile } from '@/lib/supabase';
import { User } from '@/lib/types';

// ─── Demo mode ────────────────────────────────────────────────────────────────
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@propblaze.eu',
  role: 'owner',
  status: 'active',
  email_verified: true,
  phone_verified: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-04-08T00:00:00Z',
};

/** Returns DEMO_USER with the role chosen at demo-login time (persisted in localStorage). */
function getDemoUser(): User {
  if (typeof window === 'undefined') return DEMO_USER;
  try {
    const raw = localStorage.getItem('propblaze-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const role = parsed?.state?.user?.role;
      if (role === 'agency' || role === 'staff' || role === 'owner') {
        return { ...DEMO_USER, role };
      }
    }
  } catch {}
  return DEMO_USER;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string, role?: 'owner' | 'agency') => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
}

// ─── Map Supabase user to our User type ──────────────────────────────────────
function mapSupabaseUser(sbUser: any, role: 'owner' | 'agency' = 'owner'): User {
  return {
    id: sbUser.id,
    email: sbUser.email ?? '',
    role,
    status: 'active',
    email_verified: sbUser.email_confirmed_at != null,
    phone_verified: sbUser.phone_confirmed_at != null,
    created_at: sbUser.created_at ?? new Date().toISOString(),
    updated_at: sbUser.updated_at ?? new Date().toISOString(),
  };
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: DEMO_MODE ? getDemoUser() : null,
      token: DEMO_MODE ? 'demo-token' : null,
      isAuthenticated: DEMO_MODE,
      isLoading: false,
      error: null,

      // ── Login ───────────────────────────────────────────────────────────────
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // ── Supabase auth ──────────────────────────────────────────────────────
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
          const token = data.session?.access_token ?? null;
          if (typeof window !== 'undefined' && token) {
            localStorage.setItem('access_token', token);
          }
          set({
            user: mapSupabaseUser(data.user),
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        // ── Fallback: Next.js in-memory auth API (same origin) ────────────────
        try {
          const res = await fetch(`/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) {
            const detail = await res.json().catch(() => ({ detail: 'Login failed' }));
            set({ error: detail.detail || 'Login failed', isLoading: false });
            throw new Error(detail.detail);
          }
          const loginData = await res.json();
          const token = loginData.access_token;
          if (typeof window !== 'undefined') localStorage.setItem('access_token', token);
          set({ user: loginData.user, token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          if (!err.message) set({ error: 'Login failed — check your email and password', isLoading: false });
          throw err;
        }
      },

      // ── Register ────────────────────────────────────────────────────────────
      // FIX P0-1: duplicate account prevention
      // Supabase signUp silently "succeeds" for existing emails when confirmation
      // is enabled — it sends another confirmation email without creating a duplicate.
      // We detect this case via data.user.identities === [] (empty) and show a
      // clear "already registered" message instead of a misleading success screen.
      register: async (email: string, password: string, full_name: string, role: 'owner' | 'agency' = 'owner') => {
        set({ isLoading: true, error: null });

        if (isSupabaseConfigured) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://propblaze.com';

          // Pre-check: normalize email to prevent case-sensitivity duplicates
          const normalizedEmail = email.trim().toLowerCase();

          const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: { full_name, role },
              emailRedirectTo: `${appUrl}/auth/confirm`,
            },
          });

          if (error) {
            // Friendly messages for common errors
            const msg = error.message.toLowerCase();
            if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('unique')) {
              set({ error: 'An account with this email already exists. Please sign in instead.', isLoading: false });
            } else if (msg.includes('password')) {
              set({ error: 'Password must be at least 8 characters.', isLoading: false });
            } else {
              set({ error: error.message, isLoading: false });
            }
            console.error('[auth/register] Supabase error:', error.code, error.message);
            throw error;
          }

          // Supabase "ghost" duplicate detection: identities array is empty when
          // the email is already registered (signUp doesn't fail, just returns empty identities)
          if (data.user?.identities && data.user.identities.length === 0) {
            set({
              error: 'An account with this email already exists. Please sign in or use password recovery.',
              isLoading: false,
            });
            console.warn('[auth/register] Duplicate signup attempted for:', normalizedEmail);
            throw Object.assign(new Error('ALREADY_REGISTERED'), { code: 'ALREADY_REGISTERED' });
          }

          // Email confirmation required — session will be null until confirmed
          const needsConfirmation = !data.session && data.user && !data.user.email_confirmed_at;

          if (needsConfirmation) {
            // Don't set isAuthenticated — user must confirm email first
            set({ isLoading: false, error: null });
            // Signal to the UI that confirmation is pending
            throw Object.assign(new Error('CHECK_EMAIL'), { code: 'CHECK_EMAIL', email: normalizedEmail });
          }

          // Auto-confirmed (email confirmation disabled in Supabase settings)
          if (data.user) {
            await upsertUserProfile({
              user_id: data.user.id,
              full_name,
              role,
              created_at: new Date().toISOString(),
            });
          }
          const token = data.session?.access_token ?? null;
          if (typeof window !== 'undefined' && token) {
            localStorage.setItem('access_token', token);
          }
          set({
            user: mapSupabaseUser(data.user, role),
            token,
            isAuthenticated: !!token,
            isLoading: false,
          });
          return;
        }

        // ── Fallback: Next.js in-memory auth API (same origin) ────────────────
        try {
          const res = await fetch(`/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name, role }),
          });
          if (!res.ok) {
            const detail = await res.json().catch(() => ({ detail: 'Registration failed' }));
            set({ error: detail.detail || 'Registration failed', isLoading: false });
            throw new Error(detail.detail);
          }
          const regData = await res.json();
          const token = regData.access_token;
          if (typeof window !== 'undefined') localStorage.setItem('access_token', token);
          set({ user: regData.user, token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          if (!err.message) set({ error: 'Registration failed', isLoading: false });
          throw err;
        }
      },

      // ── Logout ──────────────────────────────────────────────────────────────
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        if (isSupabaseConfigured) {
          supabase.auth.signOut();
        }
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      updateUser: (user: User) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'propblaze-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // In DEMO_MODE: always force authenticated state after rehydration,
      // but preserve the role the user chose at demo-login time.
      onRehydrateStorage: () => (state) => {
        if (DEMO_MODE && state) {
          state.isAuthenticated = true;
          state.user = getDemoUser();
          state.token = 'demo-token';
        }
      },
      merge: (persisted: any, current) => {
        if (DEMO_MODE) {
          return {
            ...current,
            ...persisted,
            isAuthenticated: true,
            user: getDemoUser(),
            token: 'demo-token',
          };
        }
        return { ...current, ...persisted };
      },
    }
  )
);
