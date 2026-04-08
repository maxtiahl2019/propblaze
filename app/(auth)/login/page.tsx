'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useAuth, DEMO_MODE } from '@/store/auth';

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 13px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 9, color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};
const inpErr: React.CSSProperties = { ...inp, borderColor: 'rgba(248,113,113,0.5)' };

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { login, isLoading, error, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (DEMO_MODE) { router.replace('/dashboard'); return; }
    if (isAuthenticated || sessionStatus === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, sessionStatus, router]);

  if (DEMO_MODE || isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#070708', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid #e67e22', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setGoogleLoading(false);
    }
  };

  // ── Email + Password ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrs: Record<string, string> = {};
    if (!email.includes('@')) newErrs.email = 'Enter a valid email';
    if (!password) newErrs.password = 'Password is required';
    if (Object.keys(newErrs).length) { setErrs(newErrs); return; }
    setErrs({});

    try {
      // First try via NextAuth credentials provider (syncs to session)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.replace('/dashboard');
        return;
      }

      // Fallback: try Zustand store (direct API)
      await login(email, password);
      router.replace('/dashboard');
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070708', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', overflow: 'hidden' }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: -250, left: '10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,57,43,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -200, right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,126,34,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
        opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)',
        transition: 'all 0.7s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36 }}>
              <svg viewBox="0 0 32 32" fill="none" width="36" height="36">
                <defs>
                  <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c0392b"/>
                    <stop offset="100%" stopColor="#e67e22"/>
                  </linearGradient>
                </defs>
                <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="url(#lg)"/>
                <ellipse cx="16" cy="18" rx="4" ry="4" fill="white" fillOpacity="0.2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>PropBlaze</div>
              <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Platform</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#0c0c0e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 5 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
              Sign in to your PropBlaze account
            </p>
          </div>

          {/* Google OAuth button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{
              width: '100%', padding: '11px 16px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600,
              fontSize: '0.9rem', cursor: googleLoading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.15s', marginBottom: 20,
            }}
            onMouseEnter={e => { if (!googleLoading) (e.currentTarget.style.background = 'rgba(255,255,255,0.09)'); }}
            onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(255,255,255,0.06)'); }}
          >
            {googleLoading ? (
              <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? 'Connecting to Google…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Email + Password form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div style={{ padding: '10px 13px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: '#f87171', fontSize: '0.8125rem' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrs({ ...errs, email: '' }); }}
                style={errs.email ? inpErr : inp}
                autoComplete="email"
              />
              {errs.email && <p style={{ fontSize: '0.7rem', color: '#f87171', marginTop: 4 }}>{errs.email}</p>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Password</label>
                <button type="button" style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#e67e22', cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrs({ ...errs, password: '' }); }}
                  style={{ ...(errs.password ? inpErr : inp), paddingRight: 38 }}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0,
                }}>
                  {showPw
                    ? <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M1.5 7S3.5 3 7 3s5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7Z" stroke="currentColor" strokeWidth="1.25"/><line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.25"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 14 14" fill="none"><path d="M1.5 7S3.5 3 7 3s5.5 4 5.5 4-2 4-5.5 4S1.5 7 1.5 7Z" stroke="currentColor" strokeWidth="1.25"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>
                  }
                </button>
              </div>
              {errs.password && <p style={{ fontSize: '0.7rem', color: '#f87171', marginTop: 4 }}>{errs.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, marginTop: 4,
                background: isLoading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#c0392b,#e67e22)',
                color: 'white', fontWeight: 700, fontSize: '0.9375rem', border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(192,57,43,0.3)',
              }}
            >
              {isLoading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>
          No account yet?{' '}
          <Link href="/register" style={{ color: '#e67e22', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
        </p>

        {/* Demo mode hint */}
        <p style={{ textAlign: 'center', marginTop: 10 }}>
          <Link href="/dashboard" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>
            → Try demo without signing in
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
