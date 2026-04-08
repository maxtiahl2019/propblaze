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
      user: DEMO_MODE ? DEMO_USER : null,
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

        // ── Fallback: FastAPI backend ──────────────────────────────────────────
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${apiUrl}/auth/login`, {
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

          const userRes = await fetch(`${apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = await userRes.json();
          set({ user: userData, token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          if (!err.message) set({ error: 'Login failed — check your email and password', isLoading: false });
          throw err;
        }
      },

      // ── Register ────────────────────────────────────────────────────────────
      register: async (email: string, password: string, full_name: string, role: 'owner' | 'agency' = 'owner') => {
        set({ isLoading: true, error: null });

        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name, role },
            },
          });
          if (error) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
          // Write user profile to DB
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

        // ── Fallback: FastAPI backend ──────────────────────────────────────────
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name }),
          });
          if (!res.ok) {
            const detail = await res.json().catch(() => ({ detail: 'Registration failed' }));
            set({ error: detail.detail || 'Registration failed', isLoading: false });
            throw new Error(detail.detail);
          }
          const regData = await res.json();
          const token = regData.access_token;
          if (typeof window !== 'undefined') localStorage.setItem('access_token', token);

          const userRes = await fetch(`${apiUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = await userRes.json();
          set({ user: userData, token, isAuthenticated: true, isLoading: false });
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
    }
  )
);
