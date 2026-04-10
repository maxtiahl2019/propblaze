'use client';

/**
 * /auth/confirm
 *
 * Supabase email confirmation callback.
 * After clicking the link in the confirmation email, Supabase redirects here
 * with the session tokens in the URL hash:
 *   https://propblaze.com/auth/confirm#access_token=...&refresh_token=...&type=signup
 *
 * We read the hash, set the Supabase session, then redirect to /dashboard.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email…');

  useEffect(() => {
    const handleConfirm = async () => {
      try {
        // Supabase puts tokens in URL hash: #access_token=...&refresh_token=...
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken  = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type         = params.get('type'); // 'signup' | 'recovery' | etc.

        if (accessToken && refreshToken) {
          // Set the session in Supabase client
          const { data, error } = await supabase.auth.setSession({
            access_token:  accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          // Persist to Zustand auth store
          if (data.user) {
            const { useAuth } = await import('@/store/auth');
            const store = useAuth.getState();
            // Trigger a fresh login state
            await store.updateUser({
              id:             data.user.id,
              email:          data.user.email ?? '',
              role:           (data.user.user_metadata?.role as any) || 'owner',
              status:         'active',
              email_verified: true,
              phone_verified: false,
              created_at:     data.user.created_at ?? new Date().toISOString(),
              updated_at:     new Date().toISOString(),
            });
          }

          setStatus('success');
          setMessage('Email confirmed! Redirecting to your dashboard…');
          setTimeout(() => router.replace('/dashboard'), 1500);
        } else {
          // No tokens — maybe already confirmed, just go to login
          setStatus('error');
          setMessage('Confirmation link is invalid or expired. Please register again.');
          setTimeout(() => router.replace('/login'), 3000);
        }
      } catch (err: any) {
        console.error('[confirm]', err);
        setStatus('error');
        setMessage(err.message || 'Something went wrong. Please try again.');
        setTimeout(() => router.replace('/login'), 3000);
      }
    };

    handleConfirm();
  }, [router]);

  const colors = {
    loading: { bg: 'rgba(245,194,0,0.08)', border: 'rgba(245,194,0,0.25)', icon: '⏳', color: '#F5C200' },
    success: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.25)',  icon: '✅', color: '#22C55E' },
    error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.25)',  icon: '❌', color: '#EF4444' },
  }[status];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a16',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, -apple-system, sans-serif',
      padding: '1rem',
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        padding: '40px 32px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>{colors.icon}</div>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: colors.color,
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}>
          {status === 'loading' ? 'Confirming Email' :
           status === 'success' ? 'Email Confirmed!' : 'Confirmation Failed'}
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.6,
          margin: 0,
        }}>
          {message}
        </p>

        {status === 'loading' && (
          <div style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 32, height: 32,
              border: '3px solid rgba(245,194,0,0.2)',
              borderTopColor: '#F5C200',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}/>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
