'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Luxury Splash Screen — cinematic video background ────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [videoReady, setVideoReady] = useState(false);
  const letters = 'PROPBLAZE'.split('');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 1000);
    const t2 = setTimeout(() => setPhase('out'), 5500);   // longer — enjoy the video
    const t3 = setTimeout(() => onDone(), 6300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Video becomes ready slightly after mount
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes splashLetterIn {
          from { opacity:0; transform:translateY(40px) skewY(5deg); }
          to   { opacity:1; transform:translateY(0) skewY(0deg); }
        }
        @keyframes splashTagIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes splashBarIn {
          from { transform:scaleX(0); }
          to   { transform:scaleX(1); }
        }
        @keyframes splashLogoIn {
          from { opacity:0; transform:scale(0.75); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes videoPan {
          from { transform:translate(-50%,-50%) scale(1.08); }
          to   { transform:translate(-50%,-50%) scale(1.0); }
        }
      `}</style>

      <div
        onClick={() => { setPhase('out'); setTimeout(onDone, 700); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#000',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          opacity: phase === 'out' ? 0 : 1,
          transition: phase === 'out' ? 'opacity 0.8s cubic-bezier(0.16,1,0.3,1)' : 'none',
          fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
        }}
      >
        {/* ── Cinematic YouTube background ── */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0,
          opacity: videoReady ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}>
          <iframe
            src="https://www.youtube.com/embed/UBdgfwoZpNE?autoplay=1&mute=1&loop=1&playlist=UBdgfwoZpNE&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              // Cover entire viewport regardless of 16:9 ratio
              width: 'max(100vw, 177.78vh)',
              height: 'max(100vh, 56.25vw)',
              transform: 'translate(-50%,-50%)',
              border: 'none',
              pointerEvents: 'none',
              animation: 'videoPan 8s ease-out both',
            }}
          />
        </div>

        {/* ── Dark cinematic gradient overlay ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 40%, rgba(0,0,0,0.65) 100%)',
        }} />

        {/* ── Vignette edges ── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          boxShadow: 'inset 0 0 120px rgba(0,0,0,0.7)',
          pointerEvents: 'none',
        }} />

        {/* ── Brand content ── */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
          {/* Logo mark */}
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 900, color: '#080808',
            letterSpacing: '-0.02em',
            margin: '0 auto 32px',
            animation: 'splashLogoIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            PB
          </div>

          {/* PROPBLAZE letter reveal */}
          <div style={{ display: 'flex', gap: 1, overflow: 'hidden', justifyContent: 'center' }}>
            {letters.map((l, i) => (
              <span key={i} style={{
                display: 'inline-block',
                fontSize: 'clamp(2.8rem,8vw,5.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: '#FFFFFF',
                textShadow: '0 2px 24px rgba(0,0,0,0.5)',
                animation: 'splashLetterIn 0.6s cubic-bezier(0.22,1,0.36,1) both',
                animationDelay: `${0.45 + i * 0.055}s`,
              }}>
                {l}
              </span>
            ))}
          </div>

          {/* Tagline */}
          <p style={{
            marginTop: 16,
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
            textShadow: '0 1px 8px rgba(0,0,0,0.6)',
            animation: 'splashTagIn 0.6s ease 1.3s both',
          }}>
            AI-Powered Property Distribution
          </p>

          {/* Gold accent line */}
          <div style={{
            width: 48, height: 2, background: '#F5C200',
            margin: '20px auto 0',
            animation: 'splashTagIn 0.5s ease 1.6s both',
            boxShadow: '0 0 12px rgba(245,194,0,0.5)',
          }} />
        </div>

        {/* ── Progress bar (bottom) ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 2, background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden', zIndex: 2,
        }}>
          <div style={{
            height: '100%', background: '#F5C200',
            transformOrigin: 'left',
            animation: 'splashBarIn 5.4s linear 0.4s both',
            boxShadow: '0 0 8px rgba(245,194,0,0.6)',
          }} />
        </div>

        {/* ── Location badge ── */}
        <div style={{
          position: 'absolute', bottom: 32, left: 32,
          fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          zIndex: 2,
          animation: 'splashTagIn 0.5s ease 1.8s both',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ opacity: 0.6 }}>📍</span> Adriatic Coast, Europe
        </div>

        {/* ── Skip hint ── */}
        <div style={{
          position: 'absolute', bottom: 32, right: 32,
          fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          zIndex: 2,
          animation: 'splashTagIn 0.5s ease 1.5s both',
        }}>
          Click to skip
        </div>
      </div>
    </>
  );
}

// ─── Agency plans for modal ───────────────────────────────────────────────────
const AGENCY_PLANS_MODAL = [
  {
    name: 'FREE',
    price: '€0',
    period: '/mo',
    highlight: false,
    badge: null,
    perks: ['Receive matched listings', 'Up to 5 active leads', 'Basic agency profile'],
    cta: 'Get started free',
    href: '/register?role=agency&plan=free',
  },
  {
    name: 'BASIC',
    price: '€19',
    period: '/mo',
    highlight: false,
    badge: null,
    perks: ['Priority placement in matching', 'Up to 30 leads', 'Email + WhatsApp alerts'],
    cta: 'Start Basic',
    href: '/register?role=agency&plan=basic',
  },
  {
    name: 'PRO',
    price: '€79',
    period: '/mo',
    highlight: true,
    badge: 'POPULAR',
    perks: ['Unlimited leads', 'Direct owner contact', 'Analytics dashboard', 'API access'],
    cta: 'Start Pro',
    href: '/register?role=agency&plan=pro',
  },
];

// ─── Property card modal ──────────────────────────────────────────────────────
interface PropModalProps {
  prop: { img: string; label: string; price: string } | null;
  onClose: () => void;
}

function PropModal({ prop, onClose }: PropModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prop) setTimeout(() => setVisible(true), 20);
    else setVisible(false);
  }, [prop]);

  if (!prop) return null;

  return (
    <>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity:0; transform:translateY(32px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(6px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />
      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: 820,
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 20,
          overflow: 'hidden',
          pointerEvents: 'auto',
          animation: 'modalSlideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}>
          {/* Left: property photo */}
          <div style={{ position: 'relative', minHeight: 320 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={prop.img} alt={prop.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.65) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{prop.price}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{prop.label}</div>
            </div>
            {/* Blur badge */}
            <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '5px 12px', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Matched listing
            </div>
          </div>

          {/* Right: agency plans */}
          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', background: '#0F0F0F' }}>
            {/* Close */}
            <button onClick={onClose} style={{ alignSelf: 'flex-end', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>×</button>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>For agencies</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Contact this owner directly
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.6 }}>
                Choose a plan to unlock direct owner contact and get matched properties automatically.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {AGENCY_PLANS_MODAL.map((plan) => (
                <div key={plan.name} style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: plan.highlight ? '1px solid rgba(245,194,0,0.4)' : '1px solid rgba(255,255,255,0.09)',
                  background: plan.highlight ? 'rgba(245,194,0,0.08)' : 'rgba(255,255,255,0.04)',
                  position: 'relative',
                }}>
                  {plan.badge && (
                    <div style={{ position: 'absolute', top: -9, right: 12, background: '#F5C200', color: '#000', fontSize: '0.58rem', fontWeight: 900, padding: '2px 10px', borderRadius: 99, letterSpacing: '0.08em' }}>
                      {plan.badge}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: plan.highlight ? '#F5C200' : 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{plan.name}</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 2 }}>
                        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>{plan.price}</span>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>{plan.period}</span>
                      </div>
                    </div>
                    <Link
                      href={plan.href}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: '0.75rem', fontWeight: 800,
                        textDecoration: 'none',
                        background: plan.highlight ? '#F5C200' : 'rgba(255,255,255,0.10)',
                        color: plan.highlight ? '#000' : '#fff',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                    {plan.perks.map(p => (
                      <span key={p} style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#22C55E', fontSize: '0.65rem' }}>✓</span>{p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>Already have an account? </span>
              <Link href="/login" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Sign in →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── FIND / Cuberto editorial design tokens ────────────────────────────────
const C = {
  black:   '#080808',
  black2:  '#111111',
  black3:  '#1A1A1A',
  white:   '#FFFFFF',
  white90: 'rgba(255,255,255,0.9)',
  white60: 'rgba(255,255,255,0.6)',
  white40: 'rgba(255,255,255,0.4)',
  white20: 'rgba(255,255,255,0.2)',
  white10: 'rgba(255,255,255,0.08)',
  accent:  '#F5C200',   // gold accent — used sparingly
  green:   '#22C55E',
  border:  'rgba(255,255,255,0.1)',
  border2: 'rgba(255,255,255,0.18)',
};

function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body {
        background: ${C.black};
        color: ${C.white};
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }
      ::selection { background: ${C.accent}; color: ${C.black}; }

      @keyframes fadeUp {
        from { opacity:0; transform:translateY(40px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity:0; }
        to   { opacity:1; }
      }
      @keyframes heroVideoPan {
        from { transform:translate(-50%,-50%) scale(1.04); }
        to   { transform:translate(-50%,-50%) scale(1.0); }
      }
      @keyframes slideLeft {
        from { opacity:0; transform:translateX(60px); }
        to   { opacity:1; transform:translateX(0); }
      }
      @keyframes revealWidth {
        from { width: 0; }
        to   { width: 100%; }
      }
      @keyframes tickerScroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @keyframes imgDrift {
        0%,100% { transform:scale(1.04) translate(0,0); }
        33%     { transform:scale(1.06) translate(-8px,-5px); }
        66%     { transform:scale(1.05) translate(5px,8px); }
      }
      @keyframes dotPulse {
        0%,100% { transform:scale(1); opacity:1; }
        50%     { transform:scale(1.4); opacity:0.7; }
      }
      @keyframes countUp {
        from { opacity:0; transform:translateY(12px); }
        to   { opacity:1; transform:translateY(0); }
      }

      /* Ticker */
      .ticker-inner { display:flex; gap:0; white-space:nowrap; animation:tickerScroll 28s linear infinite; }
      .ticker-inner:hover { animation-play-state:paused; }

      /* Nav link hover */
      .nav-link {
        font-size:0.8rem;
        font-weight:600;
        color:${C.white60};
        letter-spacing:0.08em;
        text-transform:uppercase;
        text-decoration:none;
        transition:color 0.2s;
        position:relative;
      }
      .nav-link:hover { color:${C.white}; }

      /* CTA button */
      .btn-primary {
        display:inline-flex; align-items:center; gap:10px;
        background:${C.white};
        color:${C.black};
        font-weight:800;
        font-size:0.875rem;
        letter-spacing:0.02em;
        padding:16px 32px;
        border-radius:100px;
        border:none;
        cursor:pointer;
        text-decoration:none;
        transition:all 0.25s cubic-bezier(0.16,1,0.3,1);
      }
      .btn-primary:hover {
        background:${C.accent};
        transform:translateY(-2px);
        box-shadow:0 12px 40px rgba(245,194,0,0.35);
      }
      .btn-secondary {
        display:inline-flex; align-items:center; gap:10px;
        background:transparent;
        color:${C.white60};
        font-weight:600;
        font-size:0.875rem;
        letter-spacing:0.02em;
        padding:16px 28px;
        border-radius:100px;
        border:1px solid ${C.border2};
        cursor:pointer;
        text-decoration:none;
        transition:all 0.25s;
      }
      .btn-secondary:hover { color:${C.white}; border-color:${C.white40}; }

      /* Prop image card hover */
      .prop-card { overflow:hidden; position:relative; border-radius:16px; cursor:pointer; }
      .prop-card img { transition:transform 0.7s cubic-bezier(0.16,1,0.3,1); display:block; width:100%; height:100%; object-fit:cover; }
      .prop-card:hover img { transform:scale(1.06); }
      .prop-card .overlay {
        position:absolute; inset:0;
        background:linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 50%);
        opacity:0; transition:opacity 0.35s;
      }
      .prop-card:hover .overlay { opacity:1; }

      /* Feature card hover */
      .feature-card {
        background:${C.black2};
        border:1px solid ${C.border};
        border-radius:20px;
        padding:32px;
        transition:all 0.3s cubic-bezier(0.16,1,0.3,1);
      }
      .feature-card:hover {
        border-color:${C.border2};
        transform:translateY(-4px);
        background:#161616;
        box-shadow:0 20px 60px rgba(0,0,0,0.5);
      }

      /* Step circle */
      .step-num {
        width:52px; height:52px; border-radius:50%;
        border:1px solid ${C.border2};
        display:flex; align-items:center; justify-content:center;
        font-size:1.1rem; font-weight:800; color:${C.white60};
        flex-shrink:0;
        transition:all 0.25s;
      }

      /* Scroll FadeIn */
      .fade-in-el {
        opacity:0;
        transform:translateY(32px);
        transition:opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1);
      }
      .fade-in-el.visible {
        opacity:1;
        transform:translateY(0);
      }

      /* Divider */
      .divider { border:none; border-top:1px solid ${C.border}; }

      /* Plan card */
      .plan-card {
        background:${C.black2};
        border:1px solid ${C.border};
        border-radius:24px;
        padding:36px 32px;
        transition:all 0.3s cubic-bezier(0.16,1,0.3,1);
      }
      .plan-card:hover {
        border-color:${C.border2};
        transform:translateY(-4px);
        box-shadow:0 24px 80px rgba(0,0,0,0.5);
      }
      .plan-card.featured {
        background:${C.white};
        border-color:${C.white};
      }
      .plan-card.featured * { color:${C.black} !important; }
      .plan-card.featured .plan-btn {
        background:${C.black};
        color:${C.white};
      }

      /* ── Mobile responsive ─────────────────────────────── */
      @media (max-width: 900px) {
        .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        .hero-right { display: none !important; }
        .prop-masonry { grid-template-columns: 1fr 1fr !important; grid-template-rows: auto !important; }
        .prop-masonry > * { grid-column: auto !important; }
        .features-grid { grid-template-columns: 1fr 1fr !important; }
        .steps-grid { grid-template-columns: 1fr !important; }
        .plans-grid { grid-template-columns: 1fr !important; }
        .stats-row { grid-template-columns: repeat(2,1fr) !important; gap: 24px !important; }
        .nav-links, .desktop-nav { display: none !important; }
      }
      @media (max-width: 480px) {
        .prop-masonry { grid-template-columns: 1fr !important; }
        .features-grid { grid-template-columns: 1fr !important; }
        .btn-primary { padding: 14px 24px !important; font-size: 0.8rem !important; }
        .btn-secondary { padding: 14px 20px !important; font-size: 0.8rem !important; }
      }
    `}</style>
  );
}

// ─── Scroll observer hook ─────────────────────────────────────────────────
function useFadeIn() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in-el').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── Animated stat ─────────────────────────────────────────────────────────
function Stat({ val, label }: { val: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 'clamp(2.4rem,5vw,3.2rem)',
        fontWeight: 900,
        color: C.white,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        animation: vis ? 'countUp 0.7s cubic-bezier(0.16,1,0.3,1) both' : 'none',
      }}>{val}</div>
      <div style={{ fontSize: '0.75rem', color: C.white40, marginTop: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

// ─── Agency animation (hero right) ────────────────────────────────────────
function ApexCard() {
  const [step, setStep] = useState(0);
  const agencies = [
    { name: 'Engel & Völkers', city: 'Montenegro', score: 97 },
    { name: "Sotheby's Realty", city: 'Lisbon', score: 94 },
    { name: 'Savills Intl', city: 'London', score: 91 },
    { name: 'Knight Frank', city: 'Belgrade', score: 88 },
    { name: 'Fine & Country', city: 'Budva', score: 85 },
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => setStep(3), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      background: C.black2,
      border: `1px solid ${C.border2}`,
      borderRadius: 24,
      padding: 28,
      width: '100%',
      maxWidth: 380,
      animation: 'slideLeft 1s cubic-bezier(0.16,1,0.3,1) 0.6s both',
      boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.white40, marginBottom: 4 }}>
            APEX AI Matching
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: C.white }}>
            Apartament · Budva
          </div>
        </div>
        <div style={{
          background: step >= 3 ? '#16A34A' : step >= 2 ? C.accent : C.border,
          color: step >= 3 ? '#fff' : step >= 2 ? C.black : C.white60,
          fontSize: '0.7rem', fontWeight: 700,
          padding: '5px 12px', borderRadius: 99,
          transition: 'all 0.4s',
        }}>
          {step >= 3 ? '✓ Sent' : step >= 2 ? 'Matching…' : 'Analysing…'}
        </div>
      </div>

      {/* Step 1 — analysis */}
      {step >= 1 && (
        <div style={{
          background: C.black3, borderRadius: 12, padding: '12px 16px', marginBottom: 12,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ fontSize: '0.72rem', color: C.white40, marginBottom: 8 }}>Property analysis</div>
          {[
            { label: 'Location score', val: 94, w: '94%' },
            { label: 'Market demand', val: 88, w: '88%' },
            { label: 'Price accuracy', val: 97, w: '97%' },
          ].map(r => (
            <div key={r.label} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.white60, marginBottom: 3 }}>
                <span>{r.label}</span><span style={{ color: C.white }}>{r.val}</span>
              </div>
              <div style={{ height: 3, background: C.border, borderRadius: 99 }}>
                <div style={{
                  height: '100%', borderRadius: 99, width: r.w,
                  background: `linear-gradient(90deg, #3B5BDB, #7048E8)`,
                  animation: 'revealWidth 1s cubic-bezier(0.16,1,0.3,1) 0.3s both',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2 — agencies */}
      {step >= 2 && (
        <div style={{
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ fontSize: '0.72rem', color: C.white40, marginBottom: 8 }}>Top matches — Wave 1</div>
          {agencies.map((ag, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: i < agencies.length - 1 ? `1px solid ${C.border}` : 'none',
              animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms both`,
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: C.white }}>{ag.name}</div>
                <div style={{ fontSize: '0.68rem', color: C.white40 }}>{ag.city}</div>
              </div>
              <div style={{
                fontSize: '0.8rem', fontWeight: 800,
                color: ag.score >= 95 ? C.accent : C.white,
              }}>{ag.score}</div>
            </div>
          ))}
        </div>
      )}

      {/* Step 3 — sent */}
      {step >= 3 && (
        <div style={{
          marginTop: 16, padding: '12px 16px',
          background: 'rgba(22,163,74,0.1)',
          border: '1px solid rgba(22,163,74,0.25)',
          borderRadius: 12,
          animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: C.green }}>
            ✓ 5 agencies reached · Replies → your email
          </div>
          <div style={{ fontSize: '0.68rem', color: C.white40, marginTop: 4 }}>
            All replies forwarded directly to you
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  useFadeIn();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [selectedProp, setSelectedProp] = useState<{ img: string; label: string; price: string } | null>(null);

  // Show splash only once per session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = sessionStorage.getItem('pb_splash_seen');
    if (!seen) {
      setShowSplash(true);
      sessionStorage.setItem('pb_splash_seen', '1');
    }
  }, []);

  // Property showcase images (using high-quality Unsplash)
  const props = [
    { img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', label: 'Villa · Côte d\'Azur', price: '€3.2M' },
    { img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', label: 'Penthouse · Lisbon', price: '€1.8M' },
    { img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80', label: 'Apartment · Belgrade', price: '€420K' },
    { img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80', label: 'House · Montenegro', price: '€680K' },
    { img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', label: 'Loft · Berlin', price: '€890K' },
    { img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80', label: 'Villa · Ibiza', price: '€5.1M' },
  ];

  const features = [
    { icon: '🤖', title: 'APEX AI Matching', desc: 'Our engine scores 2,000+ agencies across 12 parameters — geography, price band, language, response rate. You get the 30 best fits, not a spray.' },
    { icon: '✍️', title: 'AI Sales Pack', desc: 'One description → 3 professional translations (EN, RU, SR), formatted sales brief, and personalised cover letters. Done in seconds.' },
    { icon: '📡', title: 'Wave Distribution', desc: 'Three waves of 10 agencies each. Wave 2 launches if no response after 5 days. Every reply goes straight to your inbox — zero middlemen.' },
    { icon: '✅', title: 'Owner Control', desc: 'You approve every outreach before it sends. See exactly which agencies, their match score, and why. Full transparency, always.' },
    { icon: '🔒', title: 'GDPR-Ready Privacy', desc: 'All documents AES-256 encrypted on EU servers. Contacts visible to agencies only after your explicit approval. Compliant by design.' },
    { icon: '📊', title: 'Real-Time Dashboard', desc: 'Track opens, responses, agency interest in one clean view. Know which agencies replied, when, and with what offer.' },
  ];

  const steps = [
    { num: '01', title: 'List your property', desc: 'Upload photos, describe your property, add legal details. Our wizard takes 5 minutes.' },
    { num: '02', title: 'AI builds your pack', desc: 'APEX analyses your property, finds the top 30 matching agencies and writes personalised outreach in 3 languages.' },
    { num: '03', title: 'You approve everything', desc: 'Review the agency list and draft letters. One click to launch — or edit anything you like.' },
    { num: '04', title: 'Agencies compete for you', desc: 'Wave 1 goes out. Replies land in your inbox. Interested? Connect directly. No platform fees on the deal.' },
  ];

  // ── Owner plans (LAUNCH PRICING — active until Oct 2026) ──────────────────
  const ownerPlans = [
    {
      name: 'STARTER LAUNCH',
      badge: null,
      price: '€4.90',
      period: '/month',
      desc: '1 property listing',
      features: ['1 active listing', 'APEX matching — Wave 1 (10 agencies)', 'AI sales pack (3 languages)', 'Email distribution', 'Basic dashboard'],
      cta: 'Start for €4.90 →',
      featured: false,
    },
    {
      name: 'PRO LAUNCH',
      badge: 'MOST POPULAR',
      price: '€14.90',
      period: '/month',
      desc: 'Up to 3 listings',
      features: ['3 active listings', 'Full 3-wave distribution (30 agencies)', 'WhatsApp + Email outreach', 'Priority APEX matching', 'Advanced analytics', 'Document vault'],
      cta: 'Get started →',
      featured: true,
    },
    {
      name: 'BUSINESS LAUNCH',
      badge: null,
      price: '€34.90',
      period: '/month',
      desc: 'Up to 10 listings',
      features: ['10 active listings', 'Full 3-wave distribution', 'WhatsApp + Email + Telegram', 'Priority APEX matching', 'Advanced analytics', 'API access'],
      cta: 'Get started →',
      featured: false,
    },
    {
      name: 'ENTERPRISE',
      badge: null,
      price: '€99',
      period: '/month',
      desc: 'Unlimited listings',
      features: ['Unlimited listings', 'White-label outreach', 'Dedicated account manager', 'Custom matching rules', 'Bulk import', 'API access'],
      cta: 'Contact sales →',
      featured: false,
    },
  ];

  // ── Agency plans ───────────────────────────────────────────────────────────
  const agencyPlans = [
    {
      name: 'FREE',
      price: '€0',
      period: '/month',
      desc: 'Get started',
      features: ['Receive matched listings', 'Basic agency profile', 'Up to 5 active leads'],
      cta: 'Start free →',
      featured: false,
    },
    {
      name: 'BASIC',
      price: '€19',
      period: '/month',
      desc: 'Growing agencies',
      features: ['All Free features', 'Priority placement in matching', 'Up to 30 active leads', 'Email notifications'],
      cta: 'Get started →',
      featured: false,
    },
    {
      name: 'PRO',
      price: '€79',
      period: '/month',
      desc: 'Active agencies',
      features: ['All Basic features', 'Unlimited active leads', 'WhatsApp notifications', 'Analytics dashboard'],
      cta: 'Get started →',
      featured: true,
    },
    {
      name: 'UNLIMITED',
      price: '€199',
      period: '/month',
      desc: 'Large agencies',
      features: ['All Pro features', 'API access', 'White-label portal', 'Dedicated support'],
      cta: 'Contact sales →',
      featured: false,
    },
  ];

  const [pricingTab, setPricingTab] = useState<'owner' | 'agency'>('owner');
  const plans = pricingTab === 'owner' ? ownerPlans : agencyPlans;

  return (
    <>
      <GlobalStyles />

      {/* ── LUXURY SPLASH ────────────────────────────────────────────────── */}
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* ── AGENCY CONTACT MODAL ─────────────────────────────────────────── */}
      <PropModal prop={selectedProp} onClose={() => setSelectedProp(null)} />

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 clamp(20px,5vw,60px)',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        animation: 'fadeIn 0.8s ease both',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: C.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 900, color: C.black,
            letterSpacing: '-0.02em',
          }}>PB</div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>
            PropBlaze
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="desktop-nav">
          {['Features', 'How it works', 'Pricing'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="nav-link">{item}</a>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" className="nav-link" style={{ fontSize:'0.78rem', fontWeight:600, color:'rgba(255,255,255,0.6)', textDecoration:'none', transition:'color 0.2s', letterSpacing:'0.01em' }}
            onMouseEnter={e=>{(e.target as HTMLElement).style.color='#fff'}}
            onMouseLeave={e=>{(e.target as HTMLElement).style.color='rgba(255,255,255,0.6)'}}
          >Sign in</Link>
          <Link href="/apex-demo" style={{
            background: C.white, color: C.black,
            fontSize: '0.8rem', fontWeight: 800,
            padding: '9px 22px', borderRadius: 100,
            textDecoration: 'none',
            transition: 'all 0.2s',
            letterSpacing: '0.02em',
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = C.accent; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = C.white; }}
          >
            ⚡ Match agencies →
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        padding: 'clamp(100px,15vh,140px) clamp(20px,5vw,80px) clamp(60px,10vh,100px)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* ── Hero YouTube video background (same cinematic video as splash) ── */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0,
          animation: 'fadeIn 1.5s ease 0.2s both',
        }}>
          <iframe
            src="https://www.youtube.com/embed/UBdgfwoZpNE?autoplay=1&mute=1&loop=1&playlist=UBdgfwoZpNE&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&disablekb=1&fs=0&start=4"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 'max(100vw, 177.78vh)',
              height: 'max(100vh, 56.25vw)',
              transform: 'translate(-50%,-50%)',
              border: 'none',
              pointerEvents: 'none',
              animation: 'heroVideoPan 12s ease-out both',
            }}
          />
        </div>

        {/* Dark gradient — keeps hero copy readable over video */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: `linear-gradient(135deg, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.55) 50%, rgba(8,8,8,0.80) 100%)`,
        }} />

        {/* Vignette edges */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          boxShadow: 'inset 0 0 160px rgba(0,0,0,0.65)',
          pointerEvents: 'none',
        }} />

        {/* Gold glow accent */}
        <div style={{
          position: 'absolute', top: '20%', left: '5%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(245,194,0,0.07) 0%, transparent 70%)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        <div className="hero-grid" style={{
          position: 'relative', zIndex: 3,
          maxWidth: 1280, margin: '0 auto', width: '100%',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,auto)',
          gap: 'clamp(40px,6vw,80px)',
          alignItems: 'center',
        }}>

          {/* Left — copy */}
          <div>
            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.black2, border: `1px solid ${C.border2}`,
              borderRadius: 100, padding: '7px 16px', marginBottom: 28,
              animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, animation: 'dotPulse 2s ease infinite' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.white60, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                AI-powered · EU market · 2,000+ agencies
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(3rem,8vw,7rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 0.92,
              color: C.white,
              marginBottom: 32,
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both',
            }}>
              SELL<br />
              <span style={{ color: C.white40 }}>SMARTER.</span><br />
              <span style={{
                background: `linear-gradient(135deg, ${C.accent} 0%, #FF9500 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>FASTER.</span>
            </h1>

            {/* Sub */}
            <p style={{
              fontSize: 'clamp(1rem,2vw,1.2rem)',
              color: C.white60,
              lineHeight: 1.65,
              maxWidth: 520,
              marginBottom: 44,
              fontWeight: 400,
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s both',
            }}>
              PropBlaze finds the <strong style={{ color: C.white }}>top 30 agencies</strong> for your property across Europe,
              writes personalised outreach in 3 languages, and distributes in waves — all in under 10 minutes.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 14,
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both',
            }}>
              <Link href="/apex-demo" className="btn-primary">
                <span>⚡ Find my agencies — free</span>
                <span style={{ fontSize: '1.1rem' }}>→</span>
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                See how it works
              </a>
            </div>

            {/* Trust row */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 44,
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.65s both',
            }}>
              {[
                { icon: '🇪🇺', text: 'GDPR compliant' },
                { icon: '🔒', text: 'AES-256 encrypted' },
                { icon: '⚡', text: 'Live in 10 min' },
                { icon: '✋', text: 'No sale, no charge' },
              ].map(t => (
                <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: '0.85rem' }}>{t.icon}</span>
                  <span style={{ fontSize: '0.75rem', color: C.white40, fontWeight: 500 }}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — APEX card */}
          <div className="hero-right" style={{ display: 'flex', justifyContent: 'flex-end', minWidth: 320 }}>
            <ApexCard />
          </div>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
        background: C.black2, overflow: 'hidden', height: 44,
        display: 'flex', alignItems: 'center',
      }}>
        <div className="ticker-inner">
          {[...Array(2)].map((_, x) => (
            <React.Fragment key={x}>
              {['Montenegro', 'Serbia', 'Croatia', 'Slovenia', 'Portugal', 'Spain', 'Germany', 'Austria', 'France', 'Italy', 'Greece', 'Bulgaria', 'Romania', 'Czech Republic', 'Hungary', 'Poland'].map(c => (
                <span key={c} style={{
                  padding: '0 28px', fontSize: '0.72rem', fontWeight: 700,
                  color: C.white40, letterSpacing: '0.12em', textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.border2, flexShrink: 0 }} />
                  {c}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── PROPERTY SHOWCASE ────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(60px,10vw,120px) clamp(20px,5vw,80px)',
        maxWidth: 1400, margin: '0 auto',
      }}>
        <div className="fade-in-el" style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.white40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              EU Coverage
            </p>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: C.white, lineHeight: 1 }}>
              Every market.<br />
              <span style={{ color: C.white40 }}>Every type.</span>
            </h2>
          </div>
          <Link href="/properties/new" style={{ color: C.white60, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', borderBottom: `1px solid ${C.border2}`, paddingBottom: 2 }}>
            List yours →
          </Link>
        </div>

        {/* Masonry grid */}
        <div className="prop-masonry" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 260px)',
          gap: 12,
        }}>
          {props.map((p, i) => (
            <div
              key={i}
              className="prop-card fade-in-el"
              onClick={() => setSelectedProp(p)}
              style={{
                gridColumn: i === 0 ? 'span 2' : i === 3 ? 'span 2' : undefined,
                animationDelay: `${i * 80}ms`,
                transitionDelay: `${i * 60}ms`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'imgDrift 18s ease-in-out infinite', animationDelay: `${i * 2}s` }} />
              <div className="overlay" />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '20px 20px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              }}>
                <div style={{ opacity: 0, transition: 'opacity 0.35s' }} className="card-info">
                  <div style={{ fontSize: '0.75rem', color: C.white60, marginBottom: 3 }}>{p.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: C.white }}>{p.price}</div>
                </div>
              </div>
              {/* Always-visible subtle label */}
              <div style={{
                position: 'absolute', bottom: 16, left: 16,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(8px)',
                borderRadius: 8, padding: '5px 12px',
                fontSize: '0.72rem', fontWeight: 600, color: C.white,
              }}>
                {p.label} · {p.price}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section style={{
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,80px)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32,
        }}>
          {[
            { val: '2,000+', label: 'Agencies in database' },
            { val: '16',     label: 'EU markets covered' },
            { val: '<10',    label: 'Minutes to go live' },
            { val: '3',      label: 'Languages auto-translated' },
          ].map(s => (
            <div key={s.label} className="fade-in-el">
              <Stat val={s.val} label={s.label} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" style={{
        padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,80px)',
        maxWidth: 1280, margin: '0 auto',
      }}>
        <div className="fade-in-el" style={{ marginBottom: 60, maxWidth: 540 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.white40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
            Platform features
          </p>
          <h2 style={{ fontSize: 'clamp(2.2rem,4.5vw,3.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: C.white }}>
            Everything you need.<br />
            <span style={{ color: C.white40 }}>Nothing you don't.</span>
          </h2>
        </div>

        <div className="features-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 14,
        }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card fade-in-el" style={{ transitionDelay: `${i * 60}ms` }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 18 }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: C.white, marginBottom: 10, letterSpacing: '-0.01em' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: C.white60, lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{
        borderTop: `1px solid ${C.border}`,
        padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,80px)',
        background: C.black2,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="fade-in-el" style={{ marginBottom: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.white40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                Simple process
              </p>
              <h2 style={{ fontSize: 'clamp(2.2rem,4.5vw,3.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: C.white }}>
                Four steps<br /><span style={{ color: C.white40 }}>to sold.</span>
              </h2>
            </div>
            <div style={{ fontSize: '0.85rem', color: C.white40 }}>Average time: under 10 minutes</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1, background: C.border }}>
            {steps.map((s, i) => (
              <div key={i} className="fade-in-el" style={{
                background: C.black2, padding: '36px 32px',
                transitionDelay: `${i * 80}ms`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  border: `1px solid ${C.border2}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 900, color: C.white40,
                  letterSpacing: '0.05em', marginBottom: 24,
                }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: C.white, marginBottom: 12, letterSpacing: '-0.01em' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: C.white40, lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ── Try demo CTA ── */}
          <div className="fade-in-el" style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.border2}`,
              borderRadius: 16, padding: '20px 32px',
              textDecoration: 'none',
              transition: 'all 0.25s',
            }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.1)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.06)'}}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>⚡</div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: C.white, marginBottom: 3 }}>Try the full platform — no signup</div>
                <div style={{ fontSize: '0.8rem', color: C.white40 }}>See owner dashboard, APEX matching, agency portal live</div>
              </div>
              <div style={{ fontSize: '1.3rem', color: C.white40, marginLeft: 8 }}>→</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── BIG EDITORIAL QUOTE ───────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(80px,12vw,120px) clamp(20px,5vw,80px)',
        maxWidth: 1200, margin: '0 auto',
        textAlign: 'center',
      }}>
        <div className="fade-in-el">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.white40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>
            The owner's advantage
          </p>
          <h2 style={{
            fontSize: 'clamp(2rem,5vw,4.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: C.white,
            maxWidth: 900,
            margin: '0 auto 32px',
          }}>
            "Your property deserves more than one agency's network."
          </h2>
          <p style={{ fontSize: '1rem', color: C.white40, maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7 }}>
            PropBlaze gives you the reach of 30 specialised agencies simultaneously —
            without paying any of them until you find your buyer.
          </p>
          <Link href="/properties/new" className="btn-primary" style={{ display: 'inline-flex' }}>
            Start selling today →
          </Link>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" style={{
        borderTop: `1px solid ${C.border}`,
        padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,80px)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <div className="fade-in-el" style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.white40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
            Pricing
          </p>
          <h2 style={{ fontSize: 'clamp(2.2rem,4.5vw,3.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: C.white }}>
            Simple. Transparent.
          </h2>
          {/* Launch pricing badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,194,0,0.12)', border: '1px solid rgba(245,194,0,0.35)', borderRadius: 100, padding: '6px 18px', marginTop: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: C.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Launch Pricing — first 6 months</span>
          </div>
          <p style={{ fontSize: '0.88rem', color: C.white40, marginTop: 14 }}>First property listing FREE · Cancel anytime · Mark as Sold → billing stops immediately</p>
          <p style={{ fontSize: '0.78rem', color: C.white40, marginTop: 6 }}>Success fee: 1.5% of sale price (charged once). No hidden fees.</p>
        </div>

        {/* Tab switcher: Owner / Agency */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', background: C.black3, border: `1px solid ${C.border}`, borderRadius: 100, padding: 4 }}>
            {(['owner', 'agency'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setPricingTab(tab)}
                style={{
                  padding: '9px 28px',
                  borderRadius: 100,
                  border: 'none',
                  background: pricingTab === tab ? C.white : 'transparent',
                  color: pricingTab === tab ? C.black : C.white60,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                }}
              >
                {tab === 'owner' ? '🏠 Property Owner' : '🏢 Agency'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {plans.map((p, i) => (
            <div key={i} className={`plan-card ${p.featured ? 'featured' : ''}`} style={{ position: 'relative', animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
              {/* Badge */}
              {(p as any).badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: C.accent, color: C.black, fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em', padding: '3px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                  {String((p as any).badge)}
                </div>
              )}
              <div style={{ marginBottom: 6, fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.12em', color: p.featured ? C.black : C.white40 }}>
                {p.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '12px 0 6px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: p.featured ? C.black : C.white }}>
                  {p.price}
                </span>
                <span style={{ fontSize: '0.8rem', color: p.featured ? C.black : C.white40 }}>{p.period}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: p.featured ? C.black : C.white40, marginBottom: 24 }}>{p.desc}</p>

              <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: '0.8rem', color: p.featured ? C.black : C.white60 }}>
                    <span style={{ color: p.featured ? C.black : C.green, fontSize: '0.75rem', marginTop: 1, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              <Link
                href="/properties/new"
                className="plan-btn"
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px 20px', borderRadius: 100,
                  fontSize: '0.82rem', fontWeight: 800,
                  textDecoration: 'none',
                  background: p.featured ? C.black : 'transparent',
                  color: p.featured ? C.white : C.white60,
                  border: p.featured ? 'none' : `1px solid ${C.border2}`,
                  transition: 'all 0.2s',
                }}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="fade-in-el" style={{ textAlign: 'center', marginTop: 28, fontSize: '0.78rem', color: C.white40 }}>
          No credit card required for first property · EU VAT included where applicable · Prices increase after 6-month launch period
        </p>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: 'clamp(60px,10vw,100px) clamp(20px,5vw,80px) clamp(32px,5vw,48px)',
        background: C.black,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Top row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            flexWrap: 'wrap', gap: 40, marginBottom: 64,
          }}>
            {/* Brand */}
            <div style={{ maxWidth: 320 }}>
              <div style={{
                fontSize: 'clamp(3rem,6vw,5rem)', fontWeight: 900,
                letterSpacing: '-0.05em', lineHeight: 1,
                color: C.white, marginBottom: 20,
              }}>
                PROP<br />BLAZE
              </div>
              <p style={{ fontSize: '0.85rem', color: C.white40, lineHeight: 1.7 }}>
                AI-powered property distribution. Reach 30+ specialised EU agencies in one click.
              </p>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
              {[
                { title: 'Product', links: ['Features', 'How it works', 'Pricing', 'APEX Engine'] },
                { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'GDPR', 'Cookie Policy'] },
                { title: 'Company', links: ['About', 'Contact', 'Blog', 'Careers'] },
              ].map(col => (
                <div key={col.title}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: C.white40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>{col.title}</div>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ display: 'block', fontSize: '0.85rem', color: C.white60, textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = C.white; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = C.white60; }}
                    >{l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <hr className="divider" style={{ marginBottom: 28 }} />

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: '0.75rem', color: C.white40 }}>
              © 2026 PropBlaze. All rights reserved. Built for EU property owners.
            </p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['🇪🇺 GDPR Ready', '🔒 AES-256', '⚡ Powered by APEX AI'].map(t => (
                <span key={t} style={{ fontSize: '0.72rem', color: C.white40, fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
