import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// Supabase client
// Get credentials from: https://app.supabase.com → Project Settings → API
// ─────────────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Single shared client instance (browser-safe)
// Uses placeholder values at build time — real values come from env at runtime
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: write a key/value config record to Supabase (platform_config table)
// Use this to store API keys (Resend, Telegram, etc.) in the DB
// so they can be updated from the admin panel without a redeploy.
// ─────────────────────────────────────────────────────────────────────────────
export async function saveConfigKey(key: string, value: string): Promise<void> {
  if (!supabaseUrl) return; // skip if Supabase not configured
  await supabase.from('platform_config').upsert({ key, value, updated_at: new Date().toISOString() });
}

export async function getConfigKey(key: string): Promise<string | null> {
  if (!supabaseUrl) return null;
  const { data } = await supabase.from('platform_config').select('value').eq('key', key).single();
  return data?.value ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// User profile helpers
// ─────────────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  country?: string;
  role: 'owner' | 'agency' | 'admin';
  created_at: string;
}

export async function upsertUserProfile(profile: Partial<UserProfile> & { user_id: string }): Promise<void> {
  if (!supabaseUrl) return;
  await supabase.from('user_profiles').upsert({
    ...profile,
    updated_at: new Date().toISOString(),
  });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabaseUrl) return null;
  const { data } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
  return data ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Check if Supabase is configured (non-empty URL)
// ─────────────────────────────────────────────────────────────────────────────
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';
