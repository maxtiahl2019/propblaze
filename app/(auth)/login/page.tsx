'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, DEMO_MODE, DEMO_USER } from '@/store/auth';

// ─── Dark design tokens — matches landing page ─────────────────────────────
const C = {
  black:   '#080808',
  black2:  '#111111',
  black3:  '#1A1A1A',
  white:   '#FFFFFF',
  white80: 'rgba(255,255,255,0.8)',
  white60: 'rgba(255,255,255,0.6)',
  white40: 'rgba(255,255,255,0.4)',
  white20: 'rgba(255,255,255,0.2)',
  white10: 'rgba(255,255,255,0.07)',
  border:  'rgba(255,255,255,0.1)',
  border2: 'rgba(255,255,255,0.18)',
  accent:  '#F5C200',
  green:   '#22C55E',
  red:     '#F87171',
  redBg:   'rgba(248,113,113,0.08)',
  redBdr:  'rgba(248,113,113,0.25)',
};

// Property images for the left panel
const PROPS = [
  { img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', label: 'Villa · Côte d\'Azur', price: '€3.2M' },
  { img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', label: 'Penthouse · Lisbon', price: '€1.8M' },
  { img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80', label: 'Apartment · Belgrade', price: '€420K' },
];
const [HERO_IMG] = PROPS;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]   = useState<Record<string,string>>({});
  const [showPwd, setShowPwd] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentProp, setCurrentProp] = useState(0);

  useEffect(() => {
    clearError();
    setTimeout(() => setVisible(true), 80);
    // Cycle background property images
    const t = setInterval(() => setCurrentProp(p => (p + 1) % PROPS.length), 5000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDemoLogin = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('propblaze-auth', JSON.stringify({
        state: { isAuthenticated: true, user: DEMO_USER, token: 'demo-token' },
        version: 0,
      }));
      window.location.href = '/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (!email.includes('@')) errs.email = 'Enter a valid email';
    if (!password)            errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    if (DEMO_MODE) { handleDemoLogin(); return; }
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch {}
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.black}; }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes imgFade { from{opacity:0} to{opacity:1} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .login-input {
          width:100%; padding:14px 16px;
          background:${C.black3};
          border:1px solid ${C.border};
          border-radius:12px;
          color:${C.white};
          font-size:0.9rem;
          outline:none;
          transition:border-color 0.2s;
          font-family:inherit;
        }
        .login-input::placeholder { color:${C.white40}; }
        .login-input:focus { border-color:${C.border2}; }
        .login-input.error { border-color:${C.redBdr}; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}>

        {/* ── LEFT — property showcase ───────────────────────────────────── */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Background image cycling */}
          {PROPS.map((p, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0, zIndex: i,
              opacity: currentProp === i ? 1 : 0,
              transition: 'opacity 1.2s ease',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt="" style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: 'scale(1.04)',
                animation: currentProp === i ? 'imgFade 8s ease-in-out infinite alternate' : 'none',
              }} />
            </div>
          ))}

          {/* Dark overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'linear-gradient(180deg, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.35) 50%, rgba(8,8,8,0.8) 100%)',
          }} />

          {/* Content on photo */}
          <div style={{ position: 'relative', zIndex: 11, padding: '36px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: C.white,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 900, color: C.black, letterSpacing: '-0.02em',
              }}>PB</div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>
                PropBlaze
              </span>
            </Link>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Bottom property info */}
            <div style={{ animation: 'fadeUp 0.8s ease 0.4s both' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 100, padding: '5px 14px', marginBottom: 14,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: C.green, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    2,000+ agencies matched
                  </span>
                </div>
                <h2 style={{
                  fontSize: 'clamp(1.8rem,3vw,2.6rem)',
                  fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
                  color: C.white, marginBottom: 12,
                }}>
                  Your property.<br />
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>Europe's agencies.</span>
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, maxWidth: 340 }}>
                  Reach the right buyers through 30 specialised agencies — without lifting a finger.
                </p>
              </div>

              {/* Prop indicator dots */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {PROPS.map((p, i) => (
                  <button key={i} onClick={() => setCurrentProp(i)} style={{
                    width: currentProp === i ? 24 : 8,
                    height: 8, borderRadius: 99,
                    background: currentProp === i ? C.white : 'rgba(255,255,255,0.35)',
                    border: 'none', cursor: 'pointer',
                    padding: 0, transition: 'all 0.35s',
                  }} />
                ))}
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginLeft: 8 }}>
                  {PROPS[currentProp].label} · {PROPS[currentProp].price}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT — login form ─────────────────────────────────────────── */}
        <div style={{
          background: C.black,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(32px,5vw,60px)',
          borderLeft: `1px solid ${C.border}`,
        }}>
          <div style={{
            width: '100%', maxWidth: 400,
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.65s cubic-bezier(0.16,1,0.3,1)',
          }}>

            {/* Heading */}
            <div style={{ marginBottom: 36 }}>
              <h1 style={{
                fontSize: 'clamp(1.8rem,3vw,2.4rem)',
                fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
                color: C.white, marginBottom: 12,
              }}>
                Welcome<br />back
              </h1>
              <p style={{ fontSize: '0.88rem', color: C.white40 }}>
                Don't have an account?{' '}
                <Link href="/register" style={{ color: C.white, fontWeight: 600, textDecoration: 'none', borderBottom: `1px solid ${C.border2}` }}>
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo banner */}
            {DEMO_MODE && (
              <div style={{
                background: 'rgba(245,194,0,0.08)',
                border: `1px solid rgba(245,194,0,0.2)`,
                borderRadius: 12, padding: '12px 16px', marginBottom: 24,
                fontSize: '0.82rem', color: C.accent,
              }}>
                🚀 <strong>Demo mode active</strong> — use the button below to explore
              </div>
            )}

            {/* Demo button */}
            <button onClick={handleDemoLogin} style={{
              width: '100%', padding: '14px 20px',
              background: C.white, border: 'none', borderRadius: 12,
              color: C.black, fontWeight: 800, fontSize: '0.9rem',
              cursor: 'pointer', marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              letterSpacing: '0.01em',
            }}
              onMouseEnter={e => { (e.currentTarget.style.background = C.accent); (e.currentTarget.style.transform = 'translateY(-2px)'); }}
              onMouseLeave={e => { (e.currentTarget.style.background = C.white); (e.currentTarget.style.transform = 'none'); }}
            >
              <span style={{ fontSize: '1rem' }}>⚡</span>
              Enter Demo — no signup needed
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: '0.72rem', color: C.white40, letterSpacing: '0.08em', textTransform: 'uppercase' }}>or sign in</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                background: C.redBg, border: `1px solid ${C.redBdr}`,
                borderRadius: 10, padding: '11px 14px', marginBottom: 20,
                fontSize: '0.82rem', color: C.red,
              }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block', fontSize: '0.68rem', fontWeight: 700,
                  color: C.white40, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
                }}>Email</label>
                <input
                  className={`login-input${errors.email ? ' error' : ''}`}
                  type="email" placeholder="you@example.com"
                  value={email} autoComplete="email"
                  onChange={e => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
                />
                {errors.email && <p style={{ fontSize: '0.72rem', color: C.red, marginTop: 5 }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{
                    fontSize: '0.68rem', fontWeight: 700, color: C.white40,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>Password</label>
                  <Link href="/forgot-password" style={{
                    fontSize: '0.75rem', color: C.white40, textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = C.white; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = C.white40; }}
                  >Forgot?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    className={`login-input${errors.password ? ' error' : ''}`}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password} autoComplete="current-password"
                    onChange={e => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                    style={{ paddingRight: 44 } as React.CSSProperties}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: C.white40, padding: 0, lineHeight: 1,
                  }}>
                    {showPwd
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: '0.72rem', color: C.red, marginTop: 5 }}>{errors.password}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading} style={{
                width: '100%', padding: '14px',
                background: isLoading ? C.black3 : C.black2,
                border: `1px solid ${isLoading ? C.border : C.border2}`,
                borderRadius: 12, color: isLoading ? C.white40 : C.white,
                fontWeight: 700, fontSize: '0.9rem', cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s', marginTop: 4,
              }}
                onMouseEnter={e => { if (!isLoading) { (e.currentTarget.style.background = C.black3); (e.currentTarget.style.borderColor = C.white40); } }}
                onMouseLeave={e => { if (!isLoading) { (e.currentTarget.style.background = C.black2); (e.currentTarget.style.borderColor = C.border2); } }}
              >
                {isLoading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: `2px solid ${C.border}`, borderTopColor: C.white, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Signing in…
                  </>
                ) : 'Sign In →'}
              </button>
            </form>

            {/* Footer */}
            <p style={{ fontSize: '0.72rem', color: C.white40, marginTop: 28, lineHeight: 1.6, textAlign: 'center' }}>
              By signing in you agree to our{' '}
              <Link href="/terms" style={{ color: C.white60, textDecoration: 'none' }}>Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" style={{ color: C.white60, textDecoration: 'none' }}>Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
