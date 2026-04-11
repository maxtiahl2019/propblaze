'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  black:  '#0E0E0E',
  black2: '#141414',
  black3: '#1C1C1C',
  white:  '#FFFFFF',
  w80:    'rgba(255,255,255,0.80)',
  w60:    'rgba(255,255,255,0.60)',
  w40:    'rgba(255,255,255,0.40)',
  w20:    'rgba(255,255,255,0.20)',
  w10:    'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.10)',
  bdr2:   'rgba(255,255,255,0.18)',
  gold:   '#F5C200',
  green:  '#22C55E',
};

// ─── Keyframes ─────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
      html { scroll-behavior:smooth; }
      body { background:${C.black}; color:${C.white}; font-family:-apple-system,BlinkMacSystemFont,'Inter','Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased; overflow-x:hidden; }
      ::selection { background:${C.gold}; color:${C.black}; }

      @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes fadeUp  { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:none} }
      @keyframes scaleIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:none} }
      @keyframes pulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
      @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      @keyframes imgZoom { from{transform:scale(1)} to{transform:scale(1.07)} }

      /* MOOF-style service band */
      .service-band {
        position:relative;
        border-top:1px solid ${C.border};
        overflow:hidden;
        cursor:default;
        transition:background 0.4s ease;
        display:flex; align-items:center;
        min-height:180px;
        padding:0 clamp(24px,5vw,80px);
        gap:clamp(24px,4vw,60px);
      }
      .service-band .band-bg {
        position:absolute; inset:0; z-index:0;
        background-size:cover; background-position:center;
        opacity:0;
        transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1);
      }
      .service-band::after {
        content:'';
        position:absolute; inset:0; z-index:1;
        background:linear-gradient(90deg, rgba(14,14,14,0.88) 0%, rgba(14,14,14,0.65) 50%, rgba(14,14,14,0.3) 100%);
        opacity:0;
        transition:opacity 0.5s;
      }
      .service-band:hover .band-bg { opacity:1; }
      .service-band:hover::after { opacity:1; }
      .service-band:hover .band-word { color:${C.white}; }
      .service-band:hover .band-arrow { transform:translateX(8px); opacity:1; }
      .service-band > * { position:relative; z-index:2; }

      .band-num {
        width:44px; height:44px; border-radius:50%;
        border:1px solid ${C.bdr2};
        display:flex; align-items:center; justify-content:center;
        font-size:0.75rem; font-weight:700; color:${C.w60};
        flex-shrink:0;
        transition:border-color 0.3s, color 0.3s;
      }
      .service-band:hover .band-num { border-color:${C.white}; color:${C.white}; }

      .band-desc { flex:0 0 220px; }
      .band-word {
        font-size:clamp(4rem,9vw,9rem);
        font-weight:900;
        letter-spacing:-0.04em;
        line-height:1;
        color:${C.w40};
        transition:color 0.4s;
        flex:1;
        font-style:italic;
      }
      .band-arrow {
        font-size:2rem; color:${C.w40};
        transform:translateX(0); opacity:0.4;
        transition:transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s;
        flex-shrink:0;
      }

      /* Feature card */
      .feat-card {
        background:${C.black2};
        border:1px solid ${C.border};
        border-radius:20px; padding:32px;
        transition:all 0.3s cubic-bezier(0.16,1,0.3,1);
      }
      .feat-card:hover { border-color:${C.bdr2}; transform:translateY(-4px); background:#181818; box-shadow:0 20px 60px rgba(0,0,0,0.5); }

      /* Prop card */
      .prop-card { border-radius:16px; overflow:hidden; position:relative; cursor:pointer; }
      .prop-card img { display:block; width:100%; height:100%; object-fit:cover; transition:transform 0.7s cubic-bezier(0.16,1,0.3,1); }
      .prop-card:hover img { transform:scale(1.06); }
      .prop-card .overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 55%); opacity:0; transition:opacity 0.35s; }
      .prop-card:hover .overlay { opacity:1; }

      /* Plan card */
      .plan-card { background:${C.black2}; border:1px solid ${C.border}; border-radius:24px; padding:36px 32px; transition:all 0.3s cubic-bezier(0.16,1,0.3,1); }
      .plan-card:hover { border-color:${C.bdr2}; transform:translateY(-4px); box-shadow:0 24px 80px rgba(0,0,0,0.5); }
      .plan-card.featured { background:${C.white}; border-color:${C.white}; }

      /* Fade-in on scroll */
      .fi { opacity:0; transform:translateY(28px); transition:opacity 0.85s cubic-bezier(0.16,1,0.3,1),transform 0.85s cubic-bezier(0.16,1,0.3,1); }
      .fi.vis { opacity:1; transform:none; }

      /* Ticker */
      .tick { display:flex; gap:0; white-space:nowrap; animation:ticker 28s linear infinite; }
      .tick:hover { animation-play-state:paused; }

      /* Buttons */
      .btn-w { display:inline-flex; align-items:center; gap:10px; background:${C.white}; color:${C.black}; font-weight:800; font-size:0.875rem; letter-spacing:0.01em; padding:15px 30px; border-radius:100px; border:none; cursor:pointer; text-decoration:none; transition:all 0.25s cubic-bezier(0.16,1,0.3,1); }
      .btn-w:hover { background:${C.gold}; transform:translateY(-2px); box-shadow:0 12px 36px rgba(245,194,0,0.3); }
      .btn-o { display:inline-flex; align-items:center; gap:10px; background:transparent; color:${C.w60}; font-weight:600; font-size:0.875rem; padding:15px 28px; border-radius:100px; border:1px solid ${C.bdr2}; cursor:pointer; text-decoration:none; transition:all 0.25s; }
      .btn-o:hover { color:${C.white}; border-color:${C.w40}; }
    `}</style>
  );
}

// ─── Scroll observer ───────────────────────────────────────────────────────
function useScrollFade() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fi').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── Animated counter ─────────────────────────────────────────────────────
function Stat({ val, label }: { val: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(2.2rem,5vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: C.white, animation: v ? 'fadeUp 0.7s ease both' : 'none' }}>{val}</div>
      <div style={{ fontSize: '0.72rem', color: C.w40, marginTop: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

// ─── APEX animation card ───────────────────────────────────────────────────
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
    const ts = [setTimeout(() => setStep(1), 900), setTimeout(() => setStep(2), 2400), setTimeout(() => setStep(3), 4200)];
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ background: C.black2, border: `1px solid ${C.bdr2}`, borderRadius: 24, padding: 28, width: '100%', maxWidth: 360, boxShadow: '0 40px 100px rgba(0,0,0,0.7)', animation: 'scaleIn 1s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.w40, marginBottom: 3 }}>APEX AI Matching</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: C.white }}>Apartament · Budva</div>
        </div>
        <div style={{ background: step >= 3 ? '#16A34A' : step >= 2 ? C.gold : C.border, color: step >= 3 ? '#fff' : step >= 2 ? C.black : C.w60, fontSize: '0.68rem', fontWeight: 700, padding: '5px 12px', borderRadius: 99, transition: 'all 0.4s' }}>
          {step >= 3 ? '✓ Sent' : step >= 2 ? 'Matching…' : 'Analysing…'}
        </div>
      </div>
      {step >= 1 && (
        <div style={{ background: C.black3, borderRadius: 10, padding: '12px 14px', marginBottom: 10, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize: '0.68rem', color: C.w40, marginBottom: 8 }}>Property analysis</div>
          {[{ l: 'Location score', v: '94%' }, { l: 'Market demand', v: '88%' }, { l: 'Price accuracy', v: '97%' }].map(r => (
            <div key={r.l} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: C.w60, marginBottom: 3 }}><span>{r.l}</span><span style={{ color: C.white }}>{r.v.replace('%', '')}</span></div>
              <div style={{ height: 3, background: C.border, borderRadius: 99 }}>
                <div style={{ height: '100%', borderRadius: 99, width: r.v, background: 'linear-gradient(90deg,#3B5BDB,#7048E8)', transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {step >= 2 && (
        <div style={{ animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize: '0.68rem', color: C.w40, marginBottom: 8 }}>Top matches — Wave 1</div>
          {agencies.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none', animation: `fadeUp 0.4s ease ${i * 100}ms both` }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: C.white }}>{a.name}</div>
                <div style={{ fontSize: '0.65rem', color: C.w40 }}>{a.city}</div>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: a.score >= 95 ? C.gold : C.white }}>{a.score}</div>
            </div>
          ))}
        </div>
      )}
      {step >= 3 && (
        <div style={{ marginTop: 14, padding: '11px 14px', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 10, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: C.green }}>✓ 5 agencies reached · Replies → your email</div>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useScrollFade();

  const bands = [
    {
      num: '01',
      word: 'Analyse',
      desc: 'AI evaluates your property across location, market demand, and price accuracy.',
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      href: '/properties/new',
    },
    {
      num: '02',
      word: 'Match',
      desc: 'APEX scores 2,000+ agencies. You get the top 30 ranked by fit, not alphabet.',
      img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
      href: '/properties/new',
    },
    {
      num: '03',
      word: 'Distribute',
      desc: 'Personalised outreach in 3 languages goes out in waves. All replies → your inbox.',
      img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
      href: '/properties/new',
    },
    {
      num: '04',
      word: 'Sell',
      desc: 'Agencies compete to find your buyer. You connect directly — zero commission to us.',
      img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80',
      href: '/properties/new',
    },
  ];

  const props = [
    { img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80', label: 'Villa · Côte d\'Azur', price: '€3.2M', type: 'Villa' },
    { img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80', label: 'Penthouse · Lisbon', price: '€1.8M', type: 'Penthouse' },
    { img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=700&q=80', label: 'Apartment · Belgrade', price: '€420K', type: 'Apartment' },
    { img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=700&q=80', label: 'House · Montenegro', price: '€680K', type: 'House' },
    { img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&q=80', label: 'Loft · Berlin', price: '€890K', type: 'Loft' },
    { img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=700&q=80', label: 'Villa · Ibiza', price: '€5.1M', type: 'Villa' },
  ];

  const features = [
    { icon: '🤖', title: 'APEX AI Matching', desc: 'Scores 2,000+ EU agencies on 12 parameters. You get the 30 best fits, not a spray-and-pray list.' },
    { icon: '✍️', title: 'AI Sales Pack', desc: 'One description → 3 professional translations (EN, RU, SR) + personalised cover letters per agency.' },
    { icon: '📡', title: 'Wave Distribution', desc: '3 waves of 10 agencies each. Wave 2 launches automatically if Wave 1 has no response in 5 days.' },
    { icon: '✅', title: 'Owner Approval', desc: 'You review every agency and letter before anything sends. Full control, zero surprises.' },
    { icon: '🔒', title: 'GDPR-Ready', desc: 'AES-256 encryption, EU servers, explicit consent flows. Built for the European market.' },
    { icon: '📊', title: 'Live Dashboard', desc: 'See which agencies opened, replied, and showed buyer interest — all in real time.' },
  ];

  const plans = [
    { name: 'STARTER', price: '€59', period: '/mo', desc: 'One property, full reach', features: ['1 active listing', 'APEX Wave 1 (10 agencies)', 'AI pack (3 languages)', 'Email distribution', 'Dashboard'], cta: 'Start free', featured: false },
    { name: 'PRO', price: '€129', period: '/mo', desc: 'Serious sellers', features: ['3 active listings', 'Full 3-wave (30 agencies)', 'WhatsApp + Email', 'Priority AI matching', 'Analytics + vault'], cta: 'Get started', featured: true },
    { name: 'AGENCY', price: '€349', period: '/mo', desc: 'Portfolios & developers', features: ['Unlimited listings', 'White-label outreach', 'API access', 'Account manager', 'Custom rules'], cta: 'Contact sales', featured: false },
  ];

  return (
    <>
      <GlobalStyles />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60, padding: '0 clamp(20px,5vw,60px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(14,14,14,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        animation: 'fadeIn 0.8s ease both',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: C.black }}>PB</div>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>PropBlaze</span>
        </Link>
        <div style={{ display: 'flex', gap: 32 }}>
          {['Features', 'How it works', 'Pricing'].map(n => (
            <a key={n} href={`#${n.toLowerCase().replace(/ /g,'-')}`} style={{ fontSize: '0.75rem', fontWeight: 600, color: C.w60, letterSpacing: '0.07em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = C.white; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = C.w60; }}
            >{n}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" style={{ fontSize: '0.78rem', fontWeight: 600, color: C.w60, textDecoration: 'none', transition: 'color 0.2s', letterSpacing: '0.01em' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = C.white; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = C.w60; }}
          >Sign in</Link>
          <Link href="/properties/new" style={{ background: C.white, color: C.black, fontSize: '0.78rem', fontWeight: 800, padding: '8px 20px', borderRadius: 100, textDecoration: 'none', transition: 'background 0.2s', letterSpacing: '0.01em' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = C.gold; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = C.white; }}
          >Sell property →</Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', padding: 'clamp(100px,15vh,130px) clamp(20px,5vw,80px) clamp(60px,8vh,80px)', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Hero video bg */}
        <video autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.22, animation: 'fadeIn 2.5s ease 0.5s both' }}>
          <source src="/hero-interior.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(135deg,rgba(14,14,14,0.93) 0%,rgba(14,14,14,0.6) 50%,rgba(14,14,14,0.8) 100%)' }} />
        {/* Grid texture */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, backgroundImage: `linear-gradient(${C.border} 1px,transparent 1px),linear-gradient(90deg,${C.border} 1px,transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 30% 50%,transparent 40%,black 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 30% 50%,transparent 40%,black 100%)', opacity: 0.35 }} />

        <div style={{ position: 'relative', zIndex: 3, maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,auto)', gap: 'clamp(32px,5vw,72px)', alignItems: 'center' }}>
          <div>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.black2, border: `1px solid ${C.bdr2}`, borderRadius: 100, padding: '7px 16px', marginBottom: 28, animation: 'fadeUp 0.7s ease 0.1s both' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, animation: 'pulse 2s ease infinite' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.w60, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI · 2,000+ agencies · 16 EU markets</span>
            </div>

            <h1 style={{ fontSize: 'clamp(3rem,8vw,7.5rem)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.9, marginBottom: 32, animation: 'fadeUp 0.8s ease 0.2s both' }}>
              SELL<br />
              <span style={{ color: C.w40 }}>SMARTER.</span><br />
              <span style={{ background: `linear-gradient(135deg,${C.gold} 0%,#FF9500 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>FASTER.</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem,1.8vw,1.15rem)', color: C.w60, lineHeight: 1.7, maxWidth: 500, marginBottom: 44, animation: 'fadeUp 0.8s ease 0.35s both' }}>
              PropBlaze finds the <strong style={{ color: C.white }}>top 30 agencies</strong> for your property across Europe, writes personalised outreach in 3 languages, and distributes in waves — all in under 10 minutes.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 44, animation: 'fadeUp 0.8s ease 0.5s both' }}>
              <Link href="/properties/new" className="btn-w">List your property free →</Link>
              <a href="#how-it-works" className="btn-o">See how it works</a>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, animation: 'fadeUp 0.8s ease 0.65s both' }}>
              {[['🇪🇺','GDPR ready'],['🔒','AES-256'],['⚡','Live in 10 min'],['✋','No sale, no charge']].map(([i,t]) => (
                <div key={t as string} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: '0.85rem' }}>{i}</span>
                  <span style={{ fontSize: '0.73rem', color: C.w40, fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: 300 }}>
            <ApexCard />
          </div>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.black2, overflow: 'hidden', height: 42, display: 'flex', alignItems: 'center' }}>
        <div className="tick">
          {[...Array(2)].map((_, x) => (
            <React.Fragment key={x}>
              {['Montenegro','Serbia','Croatia','Portugal','Spain','Germany','Austria','France','Italy','Greece','Bulgaria','Romania','Poland','Czech Republic','Hungary','Slovenia'].map(c => (
                <span key={c} style={{ padding: '0 28px', fontSize: '0.7rem', fontWeight: 700, color: C.w40, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: C.bdr2, flexShrink: 0 }} />{c}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── SERVICE BANDS (MOOF style) ─────────────────────────────────── */}
      <section id="how-it-works" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,80px) 0' }} className="fi">
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: C.w40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: C.white, marginBottom: 0, lineHeight: 1 }}>
            Four steps.<br /><span style={{ color: C.w40 }}>One platform.</span>
          </h2>
        </div>

        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {bands.map((b, i) => (
            <div key={i} className="service-band">
              <div className="band-bg" style={{ backgroundImage: `url(${b.img})` }} />
              <div className="band-num">{b.num}</div>
              <div className="band-desc" style={{ padding: '28px 0' }}>
                <p style={{ fontSize: '0.82rem', color: C.w60, lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
              </div>
              <div className="band-word">{b.word}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${C.border}`, padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {[['2,000+','Agencies'],['16','EU markets'],['<10','Minutes to live'],['3','Languages']].map(([v,l]) => (
            <div key={l as string} className="fi"><Stat val={v as string} label={l as string} /></div>
          ))}
        </div>
      </section>

      {/* ── PROPERTY SHOWCASE ────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px,10vw,120px) clamp(20px,5vw,80px)', maxWidth: 1400, margin: '0 auto' }}>
        <div className="fi" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: C.w40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>EU Coverage</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 900, letterSpacing: '-0.04em', color: C.white, lineHeight: 1 }}>Every market.<br /><span style={{ color: C.w40 }}>Every type.</span></h2>
          </div>
          <Link href="/properties/new" style={{ color: C.w60, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', borderBottom: `1px solid ${C.bdr2}`, paddingBottom: 2 }}>List yours →</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(2,240px)', gap: 10 }}>
          {props.map((p, i) => (
            <Link key={i} href="/properties/new" className="prop-card fi" style={{ gridColumn: (i === 0 || i === 3) ? 'span 2' : undefined, textDecoration: 'none', transitionDelay: `${i * 50}ms` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.label} />
              <div className="overlay" />
              <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '5px 12px', fontSize: '0.7rem', fontWeight: 600, color: C.white }}>
                {p.label} · {p.price}
              </div>
              <div style={{ position: 'absolute', top: 12, right: 12, background: C.black3, borderRadius: 7, padding: '3px 10px', fontSize: '0.65rem', fontWeight: 700, color: C.w60 }}>{p.type}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" style={{ borderTop: `1px solid ${C.border}`, padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,80px)', maxWidth: 1280, margin: '0 auto' }}>
        <div className="fi" style={{ marginBottom: 56 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: C.w40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Platform features</p>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: C.white, lineHeight: 1 }}>Everything you need.<br /><span style={{ color: C.w40 }}>Nothing you don't.</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12 }}>
          {features.map((f, i) => (
            <div key={i} className="feat-card fi" style={{ transitionDelay: `${i * 50}ms` }}>
              <div style={{ fontSize: '1.7rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: C.white, marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ fontSize: '0.84rem', color: C.w60, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EDITORIAL QUOTE ──────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.border}`, padding: 'clamp(80px,12vw,120px) clamp(20px,5vw,80px)', textAlign: 'center' }}>
        <div className="fi" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: C.w40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>The owner's advantage</p>
          <h2 style={{ fontSize: 'clamp(2rem,5vw,4.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, color: C.white, marginBottom: 28 }}>
            "Your property deserves more than one agency's network."
          </h2>
          <p style={{ fontSize: '1rem', color: C.w40, maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7 }}>
            PropBlaze gives you the reach of 30 specialised agencies simultaneously — without paying any of them until you find your buyer.
          </p>
          <Link href="/properties/new" className="btn-w" style={{ display: 'inline-flex' }}>Start selling today →</Link>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ borderTop: `1px solid ${C.border}`, padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,80px)', maxWidth: 1200, margin: '0 auto' }}>
        <div className="fi" style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: C.w40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</p>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: C.white, lineHeight: 1 }}>Simple. Transparent.</h2>
          <p style={{ fontSize: '0.95rem', color: C.w40, marginTop: 14 }}>Cancel anytime · Mark as Sold → billing stops immediately</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
          {plans.map((p, i) => (
            <div key={i} className={`plan-card fi ${p.featured ? 'featured' : ''}`} style={{ transitionDelay: `${i * 70}ms` }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.12em', color: p.featured ? C.black : C.w40, marginBottom: 14 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 6 }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: p.featured ? C.black : C.white }}>{p.price}</span>
                <span style={{ fontSize: '0.8rem', color: p.featured ? C.black : C.w40 }}>{p.period}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: p.featured ? C.black : C.w40, marginBottom: 24 }}>{p.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 28 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 9, fontSize: '0.8rem', color: p.featured ? C.black : C.w60, alignItems: 'center' }}>
                    <span style={{ color: p.featured ? C.black : C.green }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/properties/new" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 100, fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none', background: p.featured ? C.black : 'transparent', color: p.featured ? C.white : C.w60, border: p.featured ? 'none' : `1px solid ${C.bdr2}`, transition: 'all 0.2s' }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="fi" style={{ textAlign: 'center', marginTop: 28, fontSize: '0.75rem', color: C.w40 }}>7-day free trial · No credit card required</p>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: 'clamp(60px,10vw,100px) clamp(20px,5vw,80px) clamp(32px,5vw,48px)', background: C.black }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40, marginBottom: 60 }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: C.white, marginBottom: 18 }}>PROP<br />BLAZE</div>
              <p style={{ fontSize: '0.85rem', color: C.w40, lineHeight: 1.7 }}>AI-powered property distribution. Reach 30+ EU agencies in one click.</p>
            </div>
            <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
              {[{ t: 'Product', l: ['Features', 'How it works', 'Pricing', 'APEX Engine'] }, { t: 'Legal', l: ['Privacy Policy', 'Terms', 'GDPR', 'Cookies'] }, { t: 'Company', l: ['About', 'Contact', 'Blog'] }].map(col => (
                <div key={col.t}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: C.w40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>{col.t}</div>
                  {col.l.map(l => <a key={l} href="#" style={{ display: 'block', fontSize: '0.84rem', color: C.w60, textDecoration: 'none', marginBottom: 9, transition: 'color 0.2s' }} onMouseEnter={e => { (e.target as HTMLElement).style.color = C.white; }} onMouseLeave={e => { (e.target as HTMLElement).style.color = C.w60; }}>{l}</a>)}
                </div>
              ))}
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: `1px solid ${C.border}`, marginBottom: 26 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ fontSize: '0.72rem', color: C.w40 }}>© 2026 PropBlaze. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 18 }}>
              {['🇪🇺 GDPR Ready', '🔒 AES-256', '⚡ APEX AI'].map(t => <span key={t} style={{ fontSize: '0.72rem', color: C.w40 }}>{t}</span>)}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
