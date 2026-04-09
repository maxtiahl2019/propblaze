'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEMO_AGENCIES } from '@/lib/demo-agencies';

// ─── Yellow · Black · White palette ────────────────────────────────────────────
const C = {
  white:   '#FFFFFF',
  offwhite:'#FAFAF8',
  grey:    '#F4F4F2',
  grey2:   '#EAEAE8',
  black:   '#0A0A0A',
  black2:  '#1A1A1A',
  ink:     '#3A3A3A',
  mid:     '#6A6A6A',
  muted:   '#9A9A9A',
  yellow:  '#F5C400',
  yellowH: '#E0B000',
  yellowL: '#FFFBE6',
  yellowB: '#F5C40033',
  green:   '#16A34A',
};

// ─── Architectural line‑art SVG hero illustration ──────────────────────────────
function CityLineArt() {
  return (
    <svg
      viewBox="0 0 900 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* Sky */}
      <rect width="900" height="420" fill="#FAFAF8"/>

      {/* Ground line */}
      <line x1="0" y1="380" x2="900" y2="380" stroke={C.grey2} strokeWidth="1.5"/>

      {/* ─ far-left cluster ─ */}
      <rect x="30"  y="270" width="40" height="110" rx="1" fill={C.white} stroke={C.grey2} strokeWidth="1"/>
      <rect x="34"  y="280" width="8"  height="12" rx="0.5" fill={C.grey2}/>
      <rect x="46"  y="280" width="8"  height="12" rx="0.5" fill={C.yellow} opacity="0.55"/>
      <rect x="34"  y="300" width="8"  height="12" rx="0.5" fill={C.grey2}/>
      <rect x="46"  y="300" width="8"  height="12" rx="0.5" fill={C.grey2}/>

      <rect x="78"  y="210" width="55" height="170" rx="1" fill={C.white} stroke={C.grey2} strokeWidth="1"/>
      {[0,1,2,3,4].map(r => [0,1,2].map(c => (
        <rect key={`a-${r}-${c}`} x={82 + c*16} y={220 + r*30} width="10" height="18" rx="0.5"
          fill={r===1 && c===1 ? C.yellow : C.grey2} opacity={r===1&&c===1?0.7:1}/>
      )))}

      {/* ─ central tower (focal) ─ */}
      <rect x="370" y="60"  width="90" height="320" rx="1" fill={C.white} stroke={C.black2} strokeWidth="1.5"/>
      <rect x="380" y="48"  width="70" height="16"  rx="1" fill={C.white} stroke={C.black2} strokeWidth="1"/>
      <rect x="408" y="30"  width="14" height="22"  rx="0.5" fill={C.black2}/>
      <rect x="413" y="14"  width="4"  height="18"  fill={C.yellow}/>
      {/* window grid */}
      {[0,1,2,3,4,5,6,7,8,9].map(r => [0,1,2,3].map(c => (
        <rect key={`ct-${r}-${c}`} x={376 + c*20} y={72 + r*30} width="13" height="20" rx="0.5"
          fill={r%3===0&&c%2===1 ? C.yellow : r%2===0 ? C.black2 : C.grey2}
          opacity={r%3===0&&c%2===1?0.65: r%2===0?0.12:0.55}/>
      )))}

      {/* ─ left mid ─ */}
      <rect x="160" y="160" width="70" height="220" rx="1" fill={C.white} stroke={C.grey2} strokeWidth="1"/>
      {[0,1,2,3,4,5].map(r => [0,1,2].map(c => (
        <rect key={`lm-${r}-${c}`} x={166 + c*21} y={170 + r*34} width="14" height="22" rx="0.5"
          fill={r===2&&c===0 ? C.yellow : C.grey2} opacity={r===2&&c===0?0.65:0.7}/>
      )))}
      <rect x="242" y="250" width="50" height="130" rx="1" fill={C.white} stroke={C.grey2} strokeWidth="1"/>

      {/* ─ right cluster ─ */}
      <rect x="490" y="180" width="75" height="200" rx="1" fill={C.white} stroke={C.grey2} strokeWidth="1"/>
      {[0,1,2,3,4].map(r => [0,1,2].map(c => (
        <rect key={`rm-${r}-${c}`} x={496 + c*22} y={190 + r*37} width="15" height="24" rx="0.5"
          fill={r===1&&c===2 ? C.yellow : C.grey2} opacity={r===1&&c===2?0.6:0.65}/>
      )))}
      <rect x="576" y="130" width="85" height="250" rx="1" fill={C.white} stroke={C.black2} strokeWidth="1.25"/>
      {[0,1,2,3,4,5,6].map(r => [0,1,2,3].map(c => (
        <rect key={`rl-${r}-${c}`} x={582 + c*19} y={140 + r*34} width="12" height="22" rx="0.5"
          fill={r===3&&c===1 ? C.yellow : C.black2}
          opacity={r===3&&c===1?0.65:0.1}/>
      )))}

      <rect x="674" y="220" width="55" height="160" rx="1" fill={C.white} stroke={C.grey2} strokeWidth="1"/>
      <rect x="740" y="290" width="65" height="090" rx="1" fill={C.white} stroke={C.grey2} strokeWidth="1"/>
      <rect x="820" y="200" width="55" height="180" rx="1" fill={C.white} stroke={C.grey2} strokeWidth="1"/>

      {/* Ground shadow */}
      <rect x="0" y="378" width="900" height="42" fill="url(#gfade)"/>
      <defs>
        <linearGradient id="gfade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.offwhite} stopOpacity="0"/>
          <stop offset="100%" stopColor={C.offwhite} stopOpacity="1"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Live product card shown in hero ──────────────────────────────────────────
function HeroCard() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 4), 1800);
    return () => clearInterval(t);
  }, []);

  const agencies = [
    { flag: '🇷🇸', name: 'Win-Win Solution',   score: 96, top: true },
    { flag: '🇩🇪', name: 'Engel & Völkers',    score: 97 },
    { flag: '🇲🇪', name: "Sotheby's MNE",      score: 94 },
    { flag: '🇬🇧', name: 'Savills Intl',        score: 91 },
  ];

  return (
    <div style={{
      background: C.white,
      border: `1.5px solid ${C.grey2}`,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 24px 64px rgba(10,10,10,0.12), 0 4px 12px rgba(10,10,10,0.06)',
    }}>
      {/* Window chrome */}
      <div style={{
        background: C.offwhite, borderBottom: `1px solid ${C.grey2}`,
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#FF5F56','#FEBC2E','#28C840'].map((c,i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7 }}/>
          ))}
        </div>
        <div style={{
          flex: 1, background: C.grey,
          borderRadius: '5px', padding: '4px 10px',
          fontSize: '10.5px', color: C.muted,
          textAlign: 'center', maxWidth: '220px', margin: '0 auto',
        }}>propblaze.eu/dashboard</div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px' }}>
        {/* Property row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '14px', paddingBottom: '12px',
          borderBottom: `1px solid ${C.grey2}`,
        }}>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: C.black, marginBottom: '2px' }}>
              Apartment · Belgrade
            </div>
            <div style={{ fontSize: '11px', color: C.mid }}>€285,000 · 78 m² · 3 bed</div>
          </div>
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            color: C.green, padding: '3px 9px', borderRadius: '99px',
            fontSize: '10px', fontWeight: 600,
          }}>✓ Matched</div>
        </div>

        {/* Agency label */}
        <div style={{
          fontSize: '9.5px', fontWeight: 700, color: C.muted,
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px',
        }}>Top agencies · Wave 1</div>

        {/* Agency list */}
        {agencies.map((ag, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', borderRadius: '8px', marginBottom: '5px',
            background: i === pulse % 4 ? C.yellowL : C.offwhite,
            border: `1px solid ${i === pulse % 4 ? C.yellow : C.grey2}`,
            transition: 'all 0.5s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '6px',
                background: i === pulse % 4 ? C.yellowB : C.grey,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', transition: 'background 0.5s',
              }}>{ag.flag}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: C.black }}>{ag.name}</div>
            </div>
            <div style={{
              fontSize: '12px', fontWeight: 800,
              color: i === pulse % 4 ? C.black : C.mid,
              transition: 'color 0.5s',
            }}>{ag.score}<span style={{ fontSize: '9px', fontWeight: 400 }}>/100</span></div>
          </div>
        ))}

        {/* Progress footer */}
        <div style={{
          marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${C.grey2}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '10.5px', color: C.mid }}>Sending Wave 1…</div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: '3px',
                height: i <= (pulse + 1) * 1.5 ? '10px' : '5px',
                background: i <= (pulse + 1) * 1.5 ? C.yellow : C.grey2,
                borderRadius: '99px', transition: 'all 0.5s ease',
              }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Agency matching section ────────────────────────────────────────────────────
function AgencyMatchingSection() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? DEMO_AGENCIES : DEMO_AGENCIES.slice(0, 4);

  return (
    <section id="agencies" style={{ background: C.white, borderTop: `1px solid ${C.grey2}`, padding: '120px 32px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <div style={{ maxWidth: '600px', marginBottom: '72px' }}>
          <div style={{
            display: 'inline-block', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: C.black, background: C.yellow,
            padding: '3px 10px', borderRadius: '4px', marginBottom: '20px',
          }}>AI Matching Engine</div>
          <h2 style={{
            fontSize: '42px', fontWeight: 800, letterSpacing: '-0.035em',
            color: C.black, lineHeight: 1.1, marginBottom: '16px',
          }}>
            Every agency scored.<br/>Only the best get your listing.
          </h2>
          <p style={{ fontSize: '16px', color: C.ink, lineHeight: 1.7 }}>
            12+ parameters. Historical performance. Semantic AI ranking.
            Your property reaches agencies with the highest probability of closing.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px', marginBottom: '40px',
        }}>
          {visible.map((ag) => (
            <div key={ag.id} style={{
              background: ag.isRealEmail ? C.yellowL : C.offwhite,
              border: `1.5px solid ${ag.isRealEmail ? C.yellow : C.grey2}`,
              borderRadius: '12px', padding: '22px',
              boxShadow: ag.isRealEmail ? '0 4px 20px rgba(245,196,0,0.12)' : 'none',
              transition: 'transform 0.22s, box-shadow 0.22s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(10,10,10,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'none';
                (e.currentTarget as HTMLElement).style.boxShadow = ag.isRealEmail ? '0 4px 20px rgba(245,196,0,0.12)' : 'none';
              }}
            >
              {ag.isRealEmail && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: C.yellow, color: C.black,
                  padding: '2px 10px', borderRadius: '4px',
                  fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px',
                }}>★ Demo partner</div>
              )}
              <div style={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', marginBottom: '12px',
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: C.black, marginBottom: '3px' }}>
                    {ag.flag} {ag.name}
                  </div>
                  <div style={{ fontSize: '12px', color: C.mid }}>{ag.city}, {ag.country}</div>
                </div>
                <div style={{
                  background: ag.isRealEmail ? C.black : C.grey,
                  color: ag.isRealEmail ? C.yellow : C.ink,
                  padding: '3px 10px', borderRadius: '5px',
                  fontSize: '12px', fontWeight: 800,
                }}>{ag.score}/100</div>
              </div>
              <div style={{
                height: '3px', background: C.grey2, borderRadius: '99px',
                marginBottom: '12px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${ag.score}%`,
                  background: ag.isRealEmail ? C.yellow : C.grey,
                  borderRadius: '99px',
                }}/>
              </div>
              <div style={{
                fontSize: '12px', color: C.mid, marginBottom: '12px',
                paddingBottom: '12px', borderBottom: `1px solid ${C.grey2}`,
              }}>{ag.specialization}</div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: C.mid }}>
                <span><strong style={{ color: C.black }}>{ag.deals_30d}</strong> deals/mo</span>
                <span><strong style={{ color: C.black }}>{ag.response_rate}%</strong> response</span>
              </div>
            </div>
          ))}
        </div>

        {!showAll && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setShowAll(true)} style={{
              padding: '11px 28px',
              background: 'transparent',
              border: `1.5px solid ${C.grey2}`,
              color: C.ink, borderRadius: '8px',
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = C.black;
                (e.currentTarget as HTMLElement).style.color = C.black;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = C.grey2;
                (e.currentTarget as HTMLElement).style.color = C.ink;
              }}
            >Show all {DEMO_AGENCIES.length} agencies</button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 60);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      color: C.black, background: C.white,
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .vis-1 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .vis-2 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .vis-3 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.28s both; }
        .vis-4 { animation: fadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.42s both; }
        .float-card { animation: floatY 5s ease-in-out 0.8s infinite; }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? 'rgba(255,255,255,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${C.grey2}` : 'none',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '60px',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
            <svg viewBox="0 0 32 32" fill="none" width="24" height="24">
              <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill={C.black}/>
              <ellipse cx="16" cy="18" rx="4" ry="4" fill={C.yellow}/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: '14.5px', letterSpacing: '-0.02em', color: C.black }}>PropBlaze</span>
          </Link>

          <div style={{ display: 'flex', gap: '28px', fontSize: '13px' }}>
            {[['#how-it-works','How it works'],['#pricing','Pricing'],['#agencies','Agencies']].map(([href, label]) => (
              <a key={href} href={href} style={{
                color: C.mid, textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500,
              }}
                onMouseEnter={e => (e.currentTarget.style.color = C.black)}
                onMouseLeave={e => (e.currentTarget.style.color = C.mid)}
              >{label}</a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link href="/login" style={{
              padding: '7px 15px', fontSize: '13px', fontWeight: 500,
              color: C.ink, textDecoration: 'none', borderRadius: '7px',
              border: `1px solid ${C.grey2}`, background: C.white,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.black; (e.currentTarget as HTMLElement).style.color = C.black; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.grey2; (e.currentTarget as HTMLElement).style.color = C.ink; }}
            >Sign in</Link>
            <Link href="/login" style={{
              padding: '7px 18px', fontSize: '13px', fontWeight: 700,
              background: C.yellow, color: C.black,
              borderRadius: '7px', textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(245,196,0,0.28)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = C.yellowH;
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px rgba(245,196,0,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = C.yellow;
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(245,196,0,0.28)';
              }}
            >Start free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        background: C.white,
        paddingTop: '120px', paddingBottom: '0',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Content row */}
        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 32px 80px',
          display: 'grid', gridTemplateColumns: '1.05fr 0.95fr',
          gap: '72px', alignItems: 'center',
        }}>
          {/* Left — headline */}
          <div className={vis ? 'vis-1' : ''} style={{ opacity: vis ? 1 : 0 }}>
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              marginBottom: '28px',
            }}>
              <div style={{
                background: C.yellow, color: C.black,
                padding: '4px 12px', borderRadius: '4px',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                AI Property Distribution
              </div>
              <div style={{ fontSize: '12px', color: C.muted }}>
                31 EU markets · 847+ agencies
              </div>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: '78px', fontWeight: 900,
              letterSpacing: '-0.05em', lineHeight: 0.97,
              color: C.black, marginBottom: '28px',
            }}>
              Your<br/>
              property.<br/>
              Every<br/>
              <span style={{
                background: C.yellow,
                padding: '0 6px 4px',
                display: 'inline-block',
                lineHeight: 1.05,
              }}>agency.</span>
            </h1>

            {/* Sub */}
            <p style={{
              fontSize: '17px', color: C.ink, lineHeight: 1.7,
              marginBottom: '36px', maxWidth: '440px',
            }}>
              AI-powered distribution to verified real estate agencies across Europe. Professional offer packs. First responses within 24 hours.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '44px' }}>
              <Link href="/login" style={{
                padding: '13px 26px',
                background: C.black, color: C.yellow,
                borderRadius: '8px', textDecoration: 'none',
                fontWeight: 700, fontSize: '14px',
                transition: 'all 0.22s',
                display: 'inline-flex', alignItems: 'center', gap: '7px',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = C.black2;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(10,10,10,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = C.black;
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                Launch free demo
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5H10.5M10.5 6.5L7 3M10.5 6.5L7 10" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a href="#how-it-works" style={{
                padding: '13px 22px',
                border: `1.5px solid ${C.grey2}`,
                borderRadius: '8px', textDecoration: 'none',
                fontWeight: 500, fontSize: '14px',
                color: C.ink, transition: 'all 0.22s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = C.black;
                  (e.currentTarget as HTMLElement).style.color = C.black;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = C.grey2;
                  (e.currentTarget as HTMLElement).style.color = C.ink;
                }}
              >How it works ↓</a>
            </div>

            {/* Proof strip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              paddingTop: '24px', borderTop: `1px solid ${C.grey2}`,
            }}>
              <div style={{ display: 'flex' }}>
                {['🇩🇪','🇷🇸','🇭🇷','🇦🇹','🇸🇮'].map((f, i) => (
                  <div key={i} style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: C.grey, border: `2px solid ${C.white}`,
                    marginLeft: i === 0 ? 0 : -9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px',
                  }}>{f}</div>
                ))}
              </div>
              <p style={{ fontSize: '13px', color: C.mid }}>
                <strong style={{ color: C.black }}>847+</strong> agencies ·{' '}
                <strong style={{ color: C.black }}>31</strong> markets ·{' '}
                <strong style={{ color: C.black }}>94%</strong> accuracy
              </p>
            </div>
          </div>

          {/* Right — product card */}
          <div className={vis ? 'vis-2 float-card' : ''} style={{ opacity: vis ? 1 : 0 }}>
            <HeroCard />
          </div>
        </div>

        {/* City illustration strip */}
        <div style={{
          borderTop: `1px solid ${C.grey2}`,
          background: C.offwhite,
          overflow: 'hidden',
          maxHeight: '200px',
        }}>
          <CityLineArt />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <section style={{
        background: C.black,
        padding: '48px 32px',
      }}>
        <div style={{
          maxWidth: '1180px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          textAlign: 'center',
        }}>
          {[
            { val: '847+', label: 'Verified agencies' },
            { val: '31',   label: 'EU markets' },
            { val: '94%',  label: 'Match accuracy' },
            { val: '<24h', label: 'First response' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '16px 24px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{
                fontSize: '38px', fontWeight: 900,
                letterSpacing: '-0.04em', color: C.yellow,
                lineHeight: 1, marginBottom: '6px',
              }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: C.offwhite, padding: '120px 32px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ maxWidth: '520px', marginBottom: '80px' }}>
            <div style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: C.yellow, color: C.black,
              padding: '3px 10px', borderRadius: '4px', marginBottom: '20px',
            }}>How it works</div>
            <h2 style={{
              fontSize: '42px', fontWeight: 900, letterSpacing: '-0.04em',
              color: C.black, lineHeight: 1.1, marginBottom: '16px',
            }}>Three steps.<br/>Fully automated.</h2>
            <p style={{ fontSize: '16px', color: C.ink, lineHeight: 1.7 }}>
              From property upload to agency responses — the entire workflow runs on your behalf, in the background.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              {
                num: '01',
                title: 'Upload your property',
                desc: 'Location, price, photos. AI generates a professional offer pack in every language. Under 10 minutes total.',
              },
              {
                num: '02',
                title: 'AI scores & selects',
                desc: 'The engine scores 800+ agencies on 12+ parameters — location, buyer profile, response rate, historical performance.',
              },
              {
                num: '03',
                title: 'Agencies pitch you',
                desc: 'Matched agencies receive your listing and pitch back. Every reply forwarded directly to you. You choose.',
              },
            ].map((step, i) => (
              <div key={i} style={{
                background: C.white,
                border: `1.5px solid ${C.grey2}`,
                borderRadius: '14px', padding: '36px 32px',
                position: 'relative',
                transition: 'transform 0.22s, box-shadow 0.22s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(10,10,10,0.1)';
                  (e.currentTarget as HTMLElement).style.borderColor = C.black;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = C.grey2;
                }}
              >
                {/* Step number */}
                <div style={{
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '56px', fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: C.yellow, lineHeight: 1,
                  marginBottom: '24px',
                }}>{step.num}</div>
                <h3 style={{
                  fontSize: '16px', fontWeight: 700, color: C.black,
                  marginBottom: '10px', lineHeight: 1.35,
                }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: C.ink, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID (dark) ─────────────────────────────────────────── */}
      <section style={{
        background: C.black,
        padding: '120px 32px',
      }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: C.yellow, color: C.black,
              padding: '3px 10px', borderRadius: '4px', marginBottom: '20px',
            }}>Platform</div>
            <h2 style={{
              fontSize: '42px', fontWeight: 900,
              letterSpacing: '-0.04em', color: C.white, lineHeight: 1.1,
            }}>
              Built for the way real estate<br/>actually works.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
            {[
              {
                title: 'AI Offer Packs',
                tag: 'Auto-generated',
                desc: 'Polished offer documents in English, Russian, Serbian, and more. Every agency receives localised materials.',
              },
              {
                title: 'Wave Distribution',
                tag: 'Smart delivery',
                desc: 'Top 10 agencies first. Waves 2 and 3 follow. Full audit trail — who received what, when.',
              },
              {
                title: 'Unified Inbox',
                tag: 'Email + WhatsApp + TG',
                desc: 'Every agency response arrives in your PropBlaze inbox and forwards to your email. Nothing slips through.',
              },
              {
                title: 'Owner Approval',
                tag: 'You stay in control',
                desc: 'Review every matched agency list before distribution starts. Approve, remove, reorder — full control.',
              },
              {
                title: 'Mark as Sold',
                tag: 'Auto-stop billing',
                desc: 'One click when you close the deal. Distribution stops, billing pauses. No wasted charges.',
              },
              {
                title: 'GDPR Compliant',
                tag: 'EU data protection',
                desc: 'Consent management, encrypted documents, data deletion flows. Ready for every EU market.',
              },
            ].map((feat, i) => (
              <div key={i} style={{
                background: C.black, padding: '36px 32px',
                transition: 'background 0.22s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#111111'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = C.black}
              >
                <div style={{
                  display: 'inline-block',
                  fontSize: '10px', fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: C.black, background: C.yellow,
                  padding: '2px 8px', borderRadius: '3px', marginBottom: '16px',
                }}>{feat.tag}</div>
                <h3 style={{
                  fontSize: '16px', fontWeight: 700, color: C.white,
                  marginBottom: '10px', lineHeight: 1.3,
                }}>{feat.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENCY MATCHING ──────────────────────────────────────────────── */}
      <AgencyMatchingSection />

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: C.offwhite, padding: '120px 32px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div style={{
              display: 'inline-block', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: C.yellow, color: C.black,
              padding: '3px 10px', borderRadius: '4px', marginBottom: '20px',
            }}>Pricing</div>
            <h2 style={{
              fontSize: '42px', fontWeight: 900,
              letterSpacing: '-0.04em', color: C.black, lineHeight: 1.1,
              marginBottom: '12px',
            }}>Simple. Transparent.</h2>
            <p style={{ fontSize: '16px', color: C.ink }}>
              No setup fees. Billing stops automatically when you sell.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px', alignItems: 'start',
          }}>
            {[
              {
                name: 'Starter', price: 'Free',
                desc: 'One property, one market.',
                features: ['1 active property','Email distribution','Basic analytics','Community support'],
                cta: 'Start free',
                hi: false,
              },
              {
                name: 'Professional', price: '€29', period: '/mo',
                desc: 'For serious sellers and investors.',
                features: ['Unlimited properties','Email + WhatsApp + Telegram','AI matching','Priority support','Advanced analytics','Auto-stop billing on sale'],
                cta: 'Start 14-day trial',
                hi: true,
              },
              {
                name: 'Enterprise', price: 'Custom',
                desc: 'For agencies and platforms.',
                features: ['White-label','Dedicated manager','Custom API','99.9% SLA'],
                cta: 'Talk to us',
                hi: false,
              },
            ].map((plan, i) => (
              <div key={i} style={{
                background: plan.hi ? C.black : C.white,
                border: `1.5px solid ${plan.hi ? C.yellow : C.grey2}`,
                borderRadius: '14px', padding: '32px',
                position: 'relative',
                boxShadow: plan.hi ? '0 8px 36px rgba(10,10,10,0.18)' : 'none',
                transform: plan.hi ? 'scale(1.02)' : 'none',
              }}>
                {plan.hi && (
                  <div style={{
                    position: 'absolute', top: '-13px', left: '50%',
                    transform: 'translateX(-50%)',
                    background: C.yellow, color: C.black,
                    padding: '3px 16px', borderRadius: '99px',
                    fontSize: '10.5px', fontWeight: 800,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>Most popular</div>
                )}
                <div style={{
                  fontSize: '11.5px', fontWeight: 700,
                  color: plan.hi ? 'rgba(255,255,255,0.45)' : C.muted,
                  letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '10px',
                }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '42px', fontWeight: 900,
                    color: plan.hi ? C.yellow : C.black,
                    letterSpacing: '-0.04em',
                  }}>{plan.price}</span>
                  {plan.period && (
                    <span style={{
                      fontSize: '14px',
                      color: plan.hi ? 'rgba(255,255,255,0.35)' : C.mid,
                    }}>{plan.period}</span>
                  )}
                </div>
                <p style={{
                  fontSize: '13px',
                  color: plan.hi ? 'rgba(255,255,255,0.45)' : C.mid,
                  marginBottom: '24px',
                }}>{plan.desc}</p>
                <button style={{
                  width: '100%', padding: '12px',
                  background: plan.hi ? C.yellow : C.black,
                  color: plan.hi ? C.black : C.white,
                  border: 'none', borderRadius: '8px',
                  fontWeight: 700, fontSize: '13.5px',
                  cursor: 'pointer', marginBottom: '24px',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.85';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
                >{plan.cta}</button>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{
                      fontSize: '13px',
                      color: plan.hi ? 'rgba(255,255,255,0.6)' : C.ink,
                      marginBottom: '9px',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <span style={{
                        color: plan.hi ? C.yellow : C.black,
                        fontWeight: 800, fontSize: '11px', flexShrink: 0,
                      }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────── */}
      <section style={{
        background: C.yellow,
        padding: '120px 32px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '56px', fontWeight: 900,
            letterSpacing: '-0.045em', lineHeight: 1.05,
            color: C.black, marginBottom: '20px',
          }}>
            Ready to sell faster?
          </h2>
          <p style={{
            fontSize: '17px', color: 'rgba(10,10,10,0.65)', lineHeight: 1.7,
            marginBottom: '40px',
          }}>
            Join sellers and agencies across 31 EU markets.<br/>Start free. No credit card required.
          </p>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '15px 32px',
            background: C.black, color: C.yellow,
            borderRadius: '9px', textDecoration: 'none',
            fontWeight: 700, fontSize: '15px',
            boxShadow: '0 6px 24px rgba(10,10,10,0.2)',
            transition: 'all 0.22s',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 32px rgba(10,10,10,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'none';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(10,10,10,0.2)';
            }}
          >
            Launch free demo
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2.5 6.5H10.5M10.5 6.5L7 3M10.5 6.5L7 10" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <p style={{ fontSize: '12px', color: 'rgba(10,10,10,0.5)', marginTop: '16px' }}>
            No credit card · EU GDPR compliant
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{
        background: C.black,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 32px',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M12 2C12 2 6 8 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 8 12 2 12 2Z" fill={C.yellow}/>
            </svg>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: 500 }}>
              PropBlaze EU · © 2026
            </span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[['/privacy','Privacy'],['/terms','Terms'],['/gdpr','GDPR']].map(([href, label]) => (
              <Link key={href} href={href} style={{
                color: 'rgba(255,255,255,0.3)', fontSize: '12px',
                textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
              >{label}</Link>
            ))}
            <a href="mailto:support@propblaze.eu" style={{
              color: 'rgba(255,255,255,0.3)', fontSize: '12px',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >support@propblaze.eu</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
