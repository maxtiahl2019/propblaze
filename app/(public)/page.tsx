'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       '#07070F',
  bg2:      '#0C0C1A',
  surface:  'rgba(255,255,255,0.045)',
  surface2: 'rgba(255,255,255,0.08)',
  border:   'rgba(255,255,255,0.09)',
  border2:  'rgba(255,255,255,0.16)',
  yellow:   '#F5C200',
  grad1:    'linear-gradient(135deg, #F5C200 0%, #E07B00 100%)',
  grad2:    'linear-gradient(135deg, #3B5BDB 0%, #7048E8 100%)',
  white:    '#FFFFFF',
  white80:  'rgba(255,255,255,0.8)',
  white60:  'rgba(255,255,255,0.6)',
  white40:  'rgba(255,255,255,0.4)',
  white20:  'rgba(255,255,255,0.2)',
  white10:  'rgba(255,255,255,0.1)',
  green:    '#22C55E',
};

// ─── Global keyframes ─────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
      html { scroll-behavior: smooth; }
      body {
        background: ${C.bg};
        color: ${C.white};
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      @keyframes wordIn {
        from { opacity:0; transform:translateY(24px); filter:blur(6px); }
        to   { opacity:1; transform:translateY(0);    filter:blur(0);   }
      }
      @keyframes floatIn {
        from { opacity:0; transform:translateY(30px); }
        to   { opacity:1; transform:translateY(0);    }
      }
      @keyframes slideRight {
        from { opacity:0; transform:translateX(40px); }
        to   { opacity:1; transform:translateX(0);    }
      }
      @keyframes scaleIn {
        from { opacity:0; transform:scale(0.92) translateY(16px); }
        to   { opacity:1; transform:scale(1) translateY(0);       }
      }
      @keyframes notifPop {
        0%   { opacity:0; transform:translateX(28px) scale(0.93); }
        65%  { opacity:1; transform:translateX(-5px) scale(1.02); }
        100% { opacity:1; transform:translateX(0)    scale(1);    }
      }
      @keyframes fadeSlideUp {
        from { opacity:0; transform:translateY(10px); }
        to   { opacity:1; transform:translateY(0);    }
      }
      @keyframes droneDrift{0%{transform:scale(1.08) translate(0px,0px)}25%{transform:scale(1.12) translate(-18px,-12px)}50%{transform:scale(1.10) translate(-8px,10px)}75%{transform:scale(1.13) translate(15px,-8px)}100%{transform:scale(1.08) translate(0px,0px)}}
      @keyframes breatheA {
        0%,100% { transform:scale(1) translate(0,0);         opacity:0.55; }
        50%      { transform:scale(1.18) translate(50px,-40px); opacity:0.8;  }
      }
      @keyframes breatheB {
        0%,100% { transform:scale(1) translate(0,0);          opacity:0.4; }
        50%      { transform:scale(1.12) translate(-40px,30px); opacity:0.6; }
      }
      @keyframes breatheC {
        0%,100% { transform:scale(1) translate(0,0);         opacity:0.3; }
        50%      { transform:scale(1.1)  translate(25px,45px); opacity:0.5; }
      }
      @keyframes glowPulse {
        0%,100% { box-shadow:0 0 32px rgba(245,194,0,0.22); }
        50%      { box-shadow:0 0 64px rgba(245,194,0,0.5);  }
      }
      @keyframes dotBlink {
        0%,100% { opacity:1;   }
        50%      { opacity:0.2; }
      }
      @keyframes scanLine {
        0%   { top:0%;   opacity:0;   }
        8%   { opacity:0.7; }
        92%  { opacity:0.7; }
        100% { top:100%; opacity:0;   }
      }
      @keyframes countUp {
        from { opacity:0; transform:translateY(8px); }
        to   { opacity:1; transform:translateY(0);   }
      }
      @keyframes float {
        0%,100% { transform:translateY(0px);  }
        50%      { transform:translateY(-10px); }
      }
      @keyframes shimmer {
        from { background-position:-200% 0; }
        to   { background-position: 200% 0; }
      }
      @keyframes pulse2 {
        0%,100% { opacity:1; transform:scale(1);    }
        50%      { opacity:0.6; transform:scale(0.9); }
      }
    `}</style>
  );
}

// ─── Scroll FadeIn ────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Stat counter ─────────────────────────────────────────────────────────────
function AnimatedStat({ value, suffix = '', label }: { value: string; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 900, color: C.yellow, lineHeight: 1, animation: vis ? 'countUp 0.6s cubic-bezier(0.16,1,0.3,1) both' : 'none' }}>{value}{suffix}</div>
      <div style={{ fontSize: '0.7rem', color: C.white40, marginTop: 6, letterSpacing: '0.03em' }}>{label}</div>
    </div>
  );
}

// ─── Deal Dashboard — premium hero right panel ────────────────────────────────
function DealDashboard() {
  const [phase, setPhase] = useState(0);
  const [barW, setBarW] = useState([0, 0, 0, 0, 0]);

  const agencies = [
    { name: 'Engel & Völkers',      city: 'Montenegro', score: 97 },
    { name: "Sotheby's Realty",     city: 'Porto',      score: 94 },
    { name: 'Savills International',city: 'London',     score: 91 },
    { name: 'Knight Frank',         city: 'Belgrade',   score: 88 },
    { name: 'Win-Win Solution',     city: 'Belgrade',   score: 85 },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => {
      setPhase(2);
      agencies.forEach((ag, i) => {
        setTimeout(() => setBarW(p => { const n=[...p]; n[i]=ag.score; return n; }), i * 260);
      });
    }, 2800);
    const t3 = setTimeout(() => setPhase(3), 5600);
    const t4 = setTimeout(() => setPhase(4), 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const glassCard: React.CSSProperties = {
    background: 'rgba(10,10,22,0.94)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    borderRadius: 20,
  };

  return (
    <div style={{
      position: 'relative', width: 420, height: 520,
      animation: 'scaleIn 1s cubic-bezier(0.16,1,0.3,1) 0.5s both',
    }}>

      {/* ─── Card 1: Property listing ─────────────────────────────────── */}
      <div style={{
        ...glassCard,
        position: 'absolute', top: 0, left: 20, right: 20,
        padding: 24,
        border: '1px solid rgba(245,194,0,0.12)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(245,194,0,0.06)',
        animation: 'floatIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.7s both',
        zIndex: 10,
      }}>
        {/* Header row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:C.yellow, boxShadow:`0 0 8px ${C.yellow}`, animation:'pulse2 2s ease infinite' }}/>
              <span style={{ fontSize:'0.58rem', fontWeight:800, letterSpacing:'0.14em', color:C.yellow }}>ACTIVE LISTING</span>
            </div>
            <div style={{ fontSize:'1.08rem', fontWeight:800, color:C.white, letterSpacing:'-0.02em', lineHeight:1.2 }}>Villa Montenegro</div>
            <div style={{ fontSize:'0.72rem', color:C.white40, marginTop:3 }}>Budva Bay · Montenegro</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'1.25rem', fontWeight:900, color:C.white, letterSpacing:'-0.03em' }}>€890K</div>
            <div style={{ fontSize:'0.62rem', color:C.white40, marginTop:2 }}>4 bed · 380 m²</div>
          </div>
        </div>

        {/* Property visual: blueprint */}
        <div style={{
          height:108, borderRadius:14, marginBottom:18, overflow:'hidden', position:'relative',
          background:'linear-gradient(160deg, rgba(245,194,0,0.035) 0%, rgba(59,91,219,0.07) 100%)',
          border:'1px solid rgba(255,255,255,0.055)',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 380 108" fill="none" style={{ opacity:0.5 }}>
            <rect x="18" y="10" width="344" height="88" rx="2" stroke="rgba(245,194,0,0.55)" strokeWidth="1.5" fill="none"/>
            <line x1="168" y1="10" x2="168" y2="98" stroke="rgba(245,194,0,0.28)" strokeWidth="1"/>
            <line x1="18"  y1="54" x2="168" y2="54" stroke="rgba(245,194,0,0.28)" strokeWidth="1"/>
            <line x1="168" y1="58" x2="362" y2="58" stroke="rgba(245,194,0,0.28)" strokeWidth="1"/>
            <line x1="260" y1="10" x2="260" y2="58" stroke="rgba(245,194,0,0.18)" strokeWidth="1"/>
            <text x="90"  y="34" fill="rgba(245,194,0,0.35)" fontSize="7.5" textAnchor="middle" fontFamily="monospace">LIVING ROOM</text>
            <text x="90"  y="78" fill="rgba(245,194,0,0.35)" fontSize="7.5" textAnchor="middle" fontFamily="monospace">KITCHEN</text>
            <text x="215" y="36" fill="rgba(245,194,0,0.35)" fontSize="7.5" textAnchor="middle" fontFamily="monospace">MASTER SUITE</text>
            <text x="312" y="36" fill="rgba(245,194,0,0.35)" fontSize="7.5" textAnchor="middle" fontFamily="monospace">STUDY</text>
            <text x="262" y="80" fill="rgba(245,194,0,0.35)" fontSize="7.5" textAnchor="middle" fontFamily="monospace">GUEST ROOMS</text>
            <circle cx="168" cy="54" r="3" fill="rgba(245,194,0,0.6)"/>
            <circle cx="168" cy="10" r="2" fill="rgba(245,194,0,0.4)"/>
            <circle cx="18"  cy="54" r="2" fill="rgba(245,194,0,0.4)"/>
            <circle cx="362" cy="58" r="2" fill="rgba(245,194,0,0.4)"/>
          </svg>
          {phase === 1 && (
            <div style={{
              position:'absolute', left:0, right:0, height:2,
              background:'linear-gradient(90deg, transparent, rgba(245,194,0,0.7), transparent)',
              boxShadow:'0 0 14px rgba(245,194,0,0.5)',
              animation:'scanLine 1.4s ease-in-out infinite',
            }}/>
          )}
          <div style={{
            position:'absolute', top:9, right:9,
            background:'rgba(59,91,219,0.18)', border:'1px solid rgba(59,91,219,0.38)',
            borderRadius:6, padding:'3px 8px', fontSize:'0.58rem', fontWeight:700, color:'#A5C4FF',
          }}>⋄ SEA VIEW</div>
        </div>

        {/* AI analysis bar */}
        {phase >= 1 && (
          <div style={{ animation:'~adeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background: phase>=2 ? C.green : '#3B82F6', animation:'dotBlink 0.85s ease infinite' }}/>
                <span style={{ fontSize:'0.62rem', color:C.white40 }}>
                  {phase < 2 ? 'AI analysis in progress…' : '✓ Analysis complete · 94/100'}
                </span>
              </div>
              <span style={{ fontSize:'0.68rem', fontWeight:800, color: phase>=2 ? C.green : '#3B82F6' }}>
                {phase>=2 ? '100%' : '94%'}
              </span>
            </div>
            <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
              <div style={{
                height:'100%', borderRadius:3,
                background: phase>=2 ? `linear-gradient(90deg,${C.green},#16A34A)` : 'linear-gradient(90deg,#3B82F6,#7C3AED)',
                width: phase>=2 ? '100%' : '94%',
                transition:'width 1.3s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: phase>=2 ? `0 0 10px rgba(34,197,94,0.5)` : '0 0 10px rgba(59,130,246,0.5)',
              }}/>
            </div>
          </div>
        )}
      </div>

      {/* ─── Card 2: Agency match results ────────────────────────────────── */}
      {phase >= 2 && (
        <div style={{
          ...glassCard,
          position:'absolute', top:230, left:0, right:0,
          padding:'16px 18px 18px',
          border:'1px solid rgba(245,194,0,0.18)',
          boxShadow:'0 40px 100px rgba(0,0,0,0.7), 0 0 50px rgba(245,194,0,0.06)',
          animation:'slideRight 0.75s cubic-bezier(0.16,1,0.3,1) both',
          zIndex:20,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:C.green, boxShadow:`0 0 8px ${C.green}` }}/>
              <span style={{ fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.12em', color:C.white60 }}>AI MATCH RESULTS</span>
            </div>
            <span style={{ fontSize:'0.58rem', color:C.white40, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, padding:'2px 8px', borderRadius:6 }}>
              12 matched
            </span>
          </div>
          {agencies.map((ag, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:9, marginBottom: i<4 ? 9 : 0,
              opacity: barW[i] > 0 ? 1 : 0,
              transform: barW[i] > 0 ? 'none' : 'translateX(-8px)',
              transition:`opacity 0.35s ease ${i*0.06}s, transform 0.35s ease ${i*0.06}s`,
            }}>
              <div style={{
                width:26, height:26, borderRadius:8, flexShrink:0,
                background:`rgba(245,194,0,0.07)`, border:`1px solid rgba(245,194,0,0.14)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.62rem', fontWeight:900, color:C.yellow,
              }}>{ag.name[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:'0.68rem', fontWeight:600, color:C.white80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:156 }}>{ag.name}</span>
                  <span style={{ fontSize:'0.7rem', fontWeight:800, color: i===0 ? C.yellow : C.white60, flexShrink:0, marginLeft:4 }}>{barW[i]>0 ? ag.score : '—'}</span>
                </div>
                <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
                  <div style={{
                    height:'100%', borderRadius:3,
                    background: i===0 ? C.yellow : i<=2 ? 'rgba(245,194,0,0.6)' : 'rgba(245,194,0,0.4)',
                    width:`${barW[i]}%`,
                    transition:'width 0.95s cubic-bezier(0.16,1,0.3,1)',
                    boxShadow: i===0 ? `0 0 8px rgba(245,194,0,0.5)` : 'none',
                  }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Floating: lead notification ──────────────────────────────────── */}
      {phase >= 3 && (
        <div style={{
          position:'absolute', top:-20, right:-20,
          background:'rgba(10,10,22,0.97)',
          border:`1px solid rgba(34,197,94,0.32)`,
          borderRadius:16, padding:'11px 14px',
          boxShadow:`0 20px 60px rgba(0,0,0,0.55), 0 0 32px rgba(34,197,94,0.1)`,
          backdropFilter:'blur(24px)',
          animation:'notifPop 0.65s cubic-bezier(0.34,1.56,0.64,1) both',
          zIndex:30, minWidth:195,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.28)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3 6-6" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.white, marginBottom:2 }}>New lead received</div>
              <div style={{ fontSize:'0.6rem', color:C.white40 }}>Engel & Völkers · 97% match</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating: offer/payment ───────────────────────────────────────── */}
      {phase >= 4 && (
        <div style={{
          position:'absolute', bottom:-16, right:-14,
          background:'rgba(10,10,22,0.97)',
          border:`1px solid rgba(245,194,0,0.32)`,
          borderRadius:16, padding:'11px 14px',
          boxShadow:`0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(245,194,0,0.1)`,
          backdropFilter:'blur(24px)',
          animation:'notifPop 0.65s cubic-bezier(0.34,1.56,0.64,1) both',
          zIndex:30, minWidth:180,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:30, height:30, borderRadius:9, background:'rgba(245,194,0,0.1)', border:'1px solid rgba(245,194,0,0.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.95rem', flexShrink:0 }}>
              💰
            </div>
            <div>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:C.white, marginBottom:1 }}>Offer arrived</div>
              <div style={{ fontSize:'0.82rem', fontWeight:900, color:C.yellow, letterSpacing:'-0.02em' }}>€885,000</div>
              <div style={{ fontSize:'0.58rem', color:C.white40 }}>Knight Frank · 2h ago</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ n, title, desc, icon }: { n:string; title:string; desc:string; icon:React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:'relative', padding:28, borderRadius:20,
        background: hov ? C.surface2 : C.surface,
        border:`1px solid ${hov ? 'rgba(245,194,0,0.25)' : C.border}`,
        transition:'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        transform: hov ? 'translateY(-6px)' : 'none',
        boxShadow: hov ? '0 24px 64px rgba(0,0,0,0.4), 0 0 40px rgba(245,194,0,0.07)' : 'none',
        cursor:'default',
      }}>
      <div style={{ position:'absolute', top:16, right:20, fontSize:'0.63rem', fontWeight:700, color:C.white20, letterSpacing:'0.1em' }}>{n}</div>
      <div style={{ width:48, height:48, borderRadius:14, marginBottom:20, background: hov ? 'rgba(245,194,0,0.15)' : 'rgba(245,194,0,0.08)', border:`1px solid rgba(245,194,0,${hov?'0.3':'0.15'})`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s ease' }}>{icon}</div>
      <div style={{ fontSize:'1rem', fontWeight:700, color:C.white, marginBottom:10 }}>{title}</div>
      <div style={{ fontSize:'0.82rem', color:C.white60, lineHeight:1.65 }}>{desc}</div>
    </div>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({ icon, title, desc, accent=false }: { icon:React.ReactNode; title:string; desc:string; accent?:boolean }) {
  return (
    <div style={{ display:'flex', gap:16, padding:'20px 24px', borderRadius:16, background: accent ? 'rgba(245,194,0,0.06)' : 'transparent', border:`1px solid ${accent ? 'rgba(245,194,0,0.15)' : 'transparent'}` }}>
      <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:'rgba(245,194,0,0.1)', border:'1px solid rgba(245,194,0,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
      <div>
        <div style={{ fontSize:'0.88rem', fontWeight:700, color:C.white, marginBottom:5 }}>{title}</div>
        <div style={{ fontSize:'0.78rem', color:C.white60, lineHeight:1.55 }}>{desc}</div>
      </div>
    </div>
  );
}

// ─── Pricing card ─────────────────────────────────────────────────────────────
function PricingCard({ name, price, desc, features, highlight=false }: { name:string; price:string; desc:string; features:string[]; highlight?:boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:32, borderRadius:24, flex:1, minWidth:260, maxWidth:340, position:'relative',
        background: highlight ? 'linear-gradient(160deg,rgba(245,194,0,0.12),rgba(245,194,0,0.04))' : C.surface,
        border:`1px solid ${highlight ? 'rgba(245,194,0,0.4)' : C.border}`,
        transform: hov ? 'translateY(-6px)' : highlight ? 'translateY(-8px)' : 'none',
        transition:'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: highlight ? '0 30px 80px rgba(245,194,0,0.12)' : 'none',
      }}>
      {highlight && (
        <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:C.yellow, borderRadius:8, padding:'4px 14px', fontSize:'0.62rem', fontWeight:800, color:C.bg, letterSpacing:'0.1em' }}>MOST POPULAR</div>
      )}
      <div style={{ fontSize:'0.68rem', fontWeight:700, color: highlight ? C.yellow : C.white60, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:12 }}>{name}</div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:4, marginBottom:8 }}>
        <div style={{ fontSize:'2.4rem', fontWeight:900, color:C.white, lineHeight:1 }}>{price}</div>
        <div style={{ fontSize:'0.78rem', color:C.white40, marginBottom:6 }}>/mo</div>
      </div>
      <div style={{ fontSize:'0.78rem', color:C.white60, marginBottom:24, lineHeight:1.55 }}>{desc}</div>
      <div style={{ height:1, background:C.border, marginBottom:20 }}/>
      {features.map((f,i) => (
        <div key={i} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:2 }}>
            <circle cx="8" cy="8" r="7" fill={highlight?'rgba(245,194,0,0.15)':'rgba(255,255,255,0.06)'} stroke={highlight?'rgba(245,194,0,0.4)':C.border}/>
            <path d="M5 8l2 2 4-4" stroke={highlight?C.yellow:C.white60} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize:'0.78rem', color:C.white80, lineHeight:1.5 }}>{f}</span>
        </div>
      ))}
      <Link href="/login" style={{ display:'block', textAlign:'center', marginTop:24, padding:'13px 0', borderRadius:12, textDecoration:'none', fontWeight:700, fontSize:'0.85rem', background: highlight ? C.grad1 : 'transparent', color: highlight ? C.bg : C.white80, border: highlight ? 'none' : `1px solid ${C.border2}`, transition:'all 0.2s ease' }}>
        Get started
      </Link>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:1000,
      padding:'0 max(24px,calc(50vw - 620px))',
      height:64, display:'flex', alignItems:'center', justifyContent:'space-between',
      background: scrolled ? 'rgba(7,7,15,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
      borderBottom: scrolled ? `1px solid ${C.border}` : 'none',
      transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:C.grad1, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(245,194,0,0.3)' }}>
          <svg viewBox="0 0 32 32" fill="none" width="20" height="20">
            <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="white"/>
            <ellipse cx="16" cy="18" rx="4" ry="4" fill="rgba(0,0,0,0.25)"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight:800, fontSize:'0.95rem', color:C.white, letterSpacing:'-0.02em' }}>PropBlaze</div>
          <div style={{ fontSize:'0.5rem', color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginTop:-2 }}>AI Platform</div>
        </div>
      </Link>
      <div style={{ display:'flex', alignItems:'center', gap:28 }}>
        {['Features','Agencies','Pricing'].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize:'0.82rem', color:C.white60, textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget.style.color=C.white)}
            onMouseLeave={e=>(e.currentTarget.style.color=C.white60)}>{l}</a>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <Link href="/login" style={{ fontSize:'0.82rem', color:C.white60, textDecoration:'none', padding:'8px 16px' }}>Sign in</Link>
        <Link href="/login" style={{ fontSize:'0.82rem', fontWeight:700, color:C.bg, textDecoration:'none', padding:'9px 20px', borderRadius:10, background:C.grad1, boxShadow:'0 0 20px rgba(245,194,0,0.25)', animation:'glowPulse 3s ease 2s infinite' }}>
          Get started →
        </Link>
      </div>
    </nav>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ background:C.bg, minHeight:'100vh', color:C.white, fontFamily:"'Inter',system-ui,sans-serif", overflowX:'hidden' }}>
      <GlobalStyles/>
      <Navbar/>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        position:'relative', minHeight:'100vh', overflow:'hidden',
        display:'flex', alignItems:'center',
        padding:'clamp(80px,10vh,120px) max(16px,calc(50vw - 640px)) clamp(60px,8vh,80px)',
      }}>
        {/* YouTube Hero Video Background */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
          <iframe
            src="https://www.youtube.com/embed/UBdgfwoZpNE?autoplay=1&mute=1&loop=1&playlist=UBdgfwoZpNE&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1"
            style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'177.78vh', height:'100vh', minWidth:'100%', minHeight:'56.25vw', border:'none', pointerEvents:'none' }}
            allow="autoplay; encrypted-media"
            title=""
            aria-hidden="true"
          />
          {/* Cinematic dark overlay */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(5,5,15,0.70) 0%, rgba(5,5,15,0.52) 50%, rgba(5,5,15,0.70) 100%)' }}/>
          {/* Vignette */}
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.60) 100%)' }}/>
          {/* Subtle gold tint overlay at bottom */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%', background:'linear-gradient(to top, rgba(5,5,15,0.8) 0%, transparent 100%)' }}/>
          {/* Dot grid */}
          <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}><svg style={{position:'absolute',width:'100%',height:'100%',opacity:0.065,animation:'droneDrift 32s linear infinite'}} viewBox='0 0 1280 900' preserveAspectRatio='xMidYMid slice'><line x1='0' y1='0' x2='0' y2='900' stroke='#fff' strokeWidth='0.5'/><line x1='160' y1='0' x2='160' y2='900' stroke='#fff' strokeWidth='0.5'/><line x1='320' y1='0' x2='320' y2='900' stroke='#fff' strokeWidth='0.5'/><line x1='480' y1='0' x2='480' y2='900' stroke='#fff' strokeWidth='0.5'/><line x1='640' y1='0' x2='640' y2='900' stroke='#fff' strokeWidth='0.5'/><line x1='800' y1='0' x2='800' y2='900' stroke='#fff' strokeWidth='0.5'/><line x1='960' y1='0' x2='960' y2='900' stroke='#fff' strokeWidth='0.5'/><line x1='1120' y1='0' x2='1120' y2='900' stroke='#fff' strokeWidth='0.5'/><line x1='0' y1='120' x2='1280' y2='120' stroke='#fff' strokeWidth='0.5'/><line x1='0' y1='240' x2='1280' y2='240' stroke='#fff' strokeWidth='0.5'/><line x1='0' y1='360' x2='1280' y2='360' stroke='#fff' strokeWidth='0.5'/><line x1='0' y1='480' x2='1280' y2='480' stroke='#fff' strokeWidth='0.5'/><line x1='0' y1='600' x2='1280' y2='600' stroke='#fff' strokeWidth='0.5'/><line x1='0' y1='720' x2='1280' y2='720' stroke='#fff' strokeWidth='0.5'/><rect x='40' y='20' width='90' height='70' rx='4' fill='rgba(245,194,0,0.55)'/><rect x='290' y='15' width='110' height='85' rx='5' fill='rgba(59,91,219,0.5)'/><rect x='560' y='10' width='95' height='80' rx='4' fill='rgba(245,194,0,0.4)'/><rect x='700' y='25' width='130' height='95' rx='6' fill='rgba(59,91,219,0.45)'/><rect x='200' y='155' width='120' height='90' rx='5' fill='rgba(245,194,0,0.45)'/><rect x='820' y='145' width='140' height='100' rx='6' fill='rgba(59,91,219,0.4)'/><rect x='40' y='290' width='110' height='80' rx='5' fill='rgba(59,91,219,0.35)'/><rect x='510' y='295' width='115' height='85' rx='5' fill='rgba(245,194,0,0.42)'/><rect x='490' y='395' width='155' height='115' rx='8' fill='rgba(245,194,0,0.6)' stroke='rgba(245,194,0,0.85)' strokeWidth='2'/><ellipse cx='618' cy='288' rx='24' ry='17' fill='rgba(96,165,250,0.4)'/><ellipse cx='178' cy='448' rx='30' ry='21' fill='rgba(74,222,128,0.3)'/></svg></div><div style={{position:'absolute',top:86,right:42,opacity:0.2,fontFamily:'monospace',fontSize:'0.62rem',color:'rgba(245,194,0,1)',lineHeight:2,animation:'breatheA 9s ease-in-out infinite',letterSpacing:'0.04em'}}><div>ALT  148m</div><div>LAT  43.8N</div><div>LON  18.4E</div><div>PROPBLAZE</div></div><div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)', backgroundSize:'48px 48px', opacity:0.6 }}/>
        </div>

        {/* Content grid */}
        <div style={{
          position:'relative', zIndex:1,
          display:'grid', gridTemplateColumns:'1fr auto',
          gap:60, alignItems:'center', width:'100%', maxWidth:1280, margin:'0 auto',
        }}>

          {/* ── Left: copy ──────────────────────────────────────────────── */}
          <div style={{ maxWidth:'min(580px,100%)' }}>
            {/* Badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'rgba(245,194,0,0.08)', border:'1px solid rgba(245,194,0,0.22)',
              borderRadius:40, padding:'6px 14px 6px 8px', marginBottom:32,
              animation:'floatIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both',
            }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:C.grad1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.5 4.5H11L8 6.5L9.5 10L6 8L2.5 10L4 6.5L1 4.5H4.5L6 1Z" fill="#080810"/></svg>
              </div>
              <span style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.04em' }}>AI-Powered Property Distribution</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize:'clamp(3rem,5.5vw,4.8rem)', fontWeight:900, lineHeight:1.03, letterSpacing:'-0.04em', marginBottom:24 }}>
              {['Your','property.'].map((w,i) => (
                <span key={w} style={{ display:'inline-block', marginRight:'0.22em', animation:`wordIn 0.75s cubic-bezier(0.16,1,0.3,1) ${100+i*90}ms both` }}>{w}</span>
              ))}
              <br/>
              {['Every','agency.'].map((w,i) => (
                <span key={w} style={{ display:'inline-block', marginRight:'0.22em', animation:`wordIn 0.75s cubic-bezier(0.16,1,0.3,1) ${380+i*90}ms both`, background:C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{w}</span>
              ))}
              <br/>
              {['Zero','hassle.'].map((w,i) => (
                <span key={w} style={{ display:'inline-block', marginRight:'0.22em', animation:`wordIn 0.75s cubic-bezier(0.16,1,0.3,1) ${660+i*90}ms both` }}>{w}</span>
              ))}
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize:'1.05rem', color:C.white60, lineHeight:1.72, maxWidth:460, marginBottom:36,
              animation:'floatIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.9s both',
            }}>
              Upload your property once. Our AI matches it with the top 10–30 agencies across Europe, sends personalised offers, and forwards every reply directly to you.
            </p>

            {/* CTAs */}
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40, animation:'floatIn 0.8s cubic-bezier(0.16,1,0.3,1) 1.1s both' }}>
              <Link href="/login" style={{
                display:'inline-flex', alignItems:'center', gap:8, padding:'15px 30px',
                borderRadius:14, textDecoration:'none', fontWeight:700, fontSize:'0.95rem',
                background:C.grad1, color:C.bg,
                boxShadow:'0 0 48px rgba(245,194,0,0.3)',
                animation:'glowPulse 3s ease 1.8s infinite',
                transition:'transform 0.2s ease',
              }}
              onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px) scale(1.02)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='none')}>
                List your property
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </Link>
              <Link href="/login" style={{
                display:'inline-flex', alignItems:'center', gap:8, padding:'15px 28px',
                borderRadius:14, textDecoration:'none', fontWeight:600, fontSize:'0.95rem',
                color:C.white80, background:C.surface, border:`1px solid ${C.border2}`,
                backdropFilter:'blur(12px)',
                transition:'all 0.2s ease',
              }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(245,194,0,0.3)'; (e.currentTarget as HTMLElement).style.background=C.surface2; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=C.border2; (e.currentTarget as HTMLElement).style.background=C.surface; }}>
                View live demo
              </Link>
            </div>

            {/* Trust stats */}
            <div style={{
              display:'flex', alignItems:'center', gap:24, flewWrap:'wrap',
              animation:'floatIn 0.8s cubic-bezier(0.16,1,0.3,1) 1.3s both',
            }}>
              {[
                { v:'500+', l:'Agencies in DB' },
                { v:'10 min', l:'Time to publish' },
                { v:'3 waves', l:'Distribution strategy' },
              ].map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {i > 0 && <div style={{ width:1, height:24, background:C.border }}/>}
                  <div>
                    <div style={{ fontSize:'0.95rem', fontWeight:800, color:C.yellow }}>{s.v}</div>
                    <div style={{ fontSize:'0.62rem', color:C.white40, marginTop:1 }}>{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: deal dashboard ────────────────────────────────────── */}
          <div style={{ display:'flex', justifyContent:'center', paddingRight:40 }}>
            <DealDashboard/>
          </div>
        </div>


        {/* Scroll cue */}
        <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, opacity:0.35, animation:'floatIn 1s ease 2s both' }}>
          <span style={{ fontSize:'0.58rem', color:C.white, letterSpacing:'0.22em', textTransform:'uppercase' }}>Scroll</span>
          <div style={{ width:1, height:28, background:`linear-gradient(to bottom,${C.yellow},transparent)`, animation:'pulse2 2s infinite' }}/>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background:C.bg2, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:'64px 40px' }}>
        <div style={{ maxWidth:960, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:40 }}>
          <AnimatedStat value="500" suffix="+" label="Verified agencies in DB"/>
          <AnimatedStat value="10"  suffix=" min" label="Average time to publish"/>
          <AnimatedStat value="3x"  label="More exposure than self-listing"/>
          <AnimatedStat value="94%" label="Average response rate"/>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="features" style={{ padding:'100px max(40px,calc(50vw - 600px))' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:16 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:16 }}>
              From listing to agencies<br/>
              <span style={{ background:C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>in under 10 minutes</span>
            </h2>
            <p style={{ fontSize:'1rem', color:C.white60, maxWidth:500, margin:'0 auto' }}>Three simple steps. No agency calls, no chasing. Just results.</p>
          </div>
        </FadeIn>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20 }}>
          {[
            { n:'01', title:'Describe your property', icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 9V19H8V14H14V19H19V9L11 2Z" stroke={C.yellow} strokeWidth="1.5" strokeLinejoin="round"/></svg>, desc:'Fill in our smart wizard in 5–10 minutes. Upload photos, set your price, and tell us your target buyer.' },
            { n:'02', title:'AI builds your sales pack', icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={C.yellow} strokeWidth="1.5"/><path d="M8 11l2 2 4-4" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, desc:'Our AI writes professional descriptions in 3 languages and selects the best-matching agencies from our database.' },
            { n:'03', title:'You approve, we distribute', icon:<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 11L7 7L11 11" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/><path d="M7 7V17M11 11H19M15 7L19 11L15 15" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, desc:'Review the offer list, confirm, and watch 10–30 personalised emails reach top agencies. Every reply lands in your inbox.' },
          ].map((s,i) => (
            <FadeIn key={i} delay={i*120}>
              <StepCard {...s}/>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background:C.bg2, padding:'100px max(40px,calc(50vw - 600px))' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center', maxWidth:1200, margin:'0 auto' }}>
          <FadeIn>
            <div>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:16 }}>PLATFORM FEATURES</div>
              <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.2, marginBottom:20 }}>
                Everything built<br/>for serious sellers
              </h2>
              <p style={{ fontSize:'0.95rem', color:C.white60, lineHeight:1.7, marginBottom:36 }}>
                Designed from the ground up for property owners who want professional exposure without the agency markup.
              </p>
              <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:12, textDecoration:'none', fontWeight:700, fontSize:'0.85rem', background:C.grad1, color:C.bg }}>
                Start for free
              </Link>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={C.yellow} strokeWidth="1.5"/><path d="M6 9l2 2 4-4" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Owner-controlled approval', desc:'You see every agency before your offer goes out. Nothing sends without your confirmation.', accent:true },
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9h4l3-6 3 12 3-6 2 0" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'AI matching engine', desc:'Hard filters + weighted scoring + LLM semantic boost ranks agencies by probability of sale.' },
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke={C.yellow} strokeWidth="1.5"/><path d="M5 8h8M5 11h5" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Multi-channel delivery', desc:'Email + WhatsApp Business + Telegram. Every agency reply forwarded to you instantly.' },
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="3" stroke={C.yellow} strokeWidth="1.5"/></svg>, title:'3-wave distribution strategy', desc:'Top agencies first. If no response, expand automatically to wave 2 and 3. Maximum reach.' },
                { icon:<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M14 3H4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V4a1 1 0 00-1-1z" stroke={C.yellow} strokeWidth="1.5"/><path d="M7 9l2 2 4-4" stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round"/></svg>, title:'Mark as Sold — stops billing', desc:'One click marks your property sold. Subscription stops automatically. No manual cancellation.' },
              ].map((f,i) => (
                <FeatureRow key={i} {...f}/>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          AGENCY NETWORK
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="agencies" style={{ padding:'100px max(40px,calc(50vw - 600px))' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:16 }}>AGENCY NETWORK</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.15, marginBottom:16 }}>
              500+ verified agencies.<br/>
              <span style={{ background:C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Across Europe & beyond.</span>
            </h2>
            <p style={{ fontSize:'1rem', color:C.white60, maxWidth:500, margin:'0 auto' }}>
              From boutique local specialists to global brands — our AI selects who's most likely to sell your property.
            </p>
          </div>
        </FadeIn>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {[
            { name:'Engel & Völkers',      city:'Budva · Montenegro',  score:97, specialty:'Luxury Adriatic',        tags:['Luxury','HNWI','Cross-border'] },
            { name:"Sotheby's Realty",     city:'Porto Montenegro',     score:94, specialty:'Ultra-premium',          tags:['HNWI','UK buyers'] },
            { name:'Savills International',city:'London · Global',      score:91, specialty:'Investment grade',       tags:['International','Balkans desk'] },
            { name:'Knight Frank',         city:'Belgrade · Serbia',    score:88, specialty:'Premium Balkans',        tags:['Balkans','DACH'] },
            { name:'Win-Win Solution',     city:'Belgrade · Serbia',    score:96, specialty:'Local Expert',           tags:['Belgrade','Fast response'] },
            { name:'Tranio Partners',      city:'Berlin · Germany',     score:85, specialty:'German-speaking buyers', tags:['Expats','Digital'] },
          ].map((ag,i) => (
            <FadeIn key={i} delay={i*80}>
              <div
                style={{ padding:20, borderRadius:16, background:C.surface, border:`1px solid ${C.border}`, transition:'all 0.3s ease', cursor:'default' }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.border='1px solid rgba(245,194,0,0.3)'; (e.currentTarget as HTMLElement).style.background=C.surface2; }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.border=`1px solid ${C.border}`; (e.currentTarget as HTMLElement).style.background=C.surface; }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:'0.9rem', fontWeight:700, color:C.white, marginBottom:3 }}>{ag.name}</div>
                    <div style={{ fontSize:'0.7rem', color:C.white60 }}>{ag.city}</div>
                  </div>
                  <div style={{ background:'rgba(245,194,0,0.1)', border:'1px solid rgba(245,194,0,0.25)', borderRadius:8, padding:'4px 10px', fontSize:'0.75rem', fontWeight:800, color:C.yellow }}>{ag.score}</div>
                </div>
                <div style={{ fontSize:'0.75rem', color:C.yellow, marginBottom:10 }}>{ag.specialty}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {ag.tags.map(t => (
                    <span key={t} style={{ fontSize:'0.6rem', fontWeight:600, color:C.white60, padding:'3px 8px', borderRadius:6, background:'rgba(255,255,255,0.05)', border:`1px solid ${C.border}` }}>{t}</span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" style={{ background:C.bg2, padding:'100px max(40px,calc(50vw - 600px))' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:16 }}>PRICING</div>
            <h2 style={{ fontSize:'clamp(1.8rem,3.5vw,3rem)', fontWeight:800, letterSpacing:'-0.02em', marginBottom:16 }}>
              Simple, transparent.<br/>
              <span style={{ background:C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Cancel when sold.</span>
            </h2>
            <p style={{ fontSize:'1rem', color:C.white60, maxWidth:440, margin:'0 auto' }}>No commission. No per-agency fees. Pay monthly, stop the moment your property sells.</p>
          </div>
        </FadeIn>
        <div style={{ display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap', alignItems:'center' }}>
          <FadeIn delay={0}><PricingCard name="Starter" price="€49" desc="Perfect for a single property. AI matching, email distribution, basic analytics." features={['1 active property','AI sales pack (3 languages)','Up to 15 agencies','Email distribution','Basic lead tracking','Mark as Sold']}/></FadeIn>
          <FadeIn delay={120}><PricingCard name="Pro" price="€99" desc="More agencies, more channels, priority AI matching and full distribution analytics." highlight features={['1 active property','AI sales pack (3 languages)','Up to 30 agencies','Email + WhatsApp + Telegram','Full lead management','3-wave strategy','Priority AI matching','Distribution analytics']}/></FadeIn>
          <FadeIn delay={240}><PricingCard name="Agency / Multi" price="€199" desc="For agents managing multiple listings. Bulk distribution, white-label options." features={['Up to 5 active properties','Everything in Pro','Bulk distribution','Agency portal access','White-label offers','API access (coming)']}/></FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{ position:'relative', padding:'120px max(40px,calc(50vw - 600px))', textAlign:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:400, borderRadius:'50%', background:'rgba(245,194,0,0.06)', filter:'blur(80px)', pointerEvents:'none' }}/>
        <FadeIn>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.yellow, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:20 }}>GET STARTED TODAY</div>
            <h2 style={{ fontSize:'clamp(2rem,5vw,4rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:20 }}>
              Reach every agency.<br/>
              <span style={{ background:C.grad1, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Sell faster.</span>
            </h2>
            <p style={{ fontSize:'1.05rem', color:C.white60, maxWidth:460, margin:'0 auto 40px', lineHeight:1.7 }}>
              Join property owners across Europe who use PropBlaze to get professional agency exposure without paying per-agency fees.
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'16px 36px', borderRadius:14, textDecoration:'none', fontWeight:700, fontSize:'1rem', background:C.grad1, color:C.bg, boxShadow:'0 0 60px rgba(245,194,0,0.3)' }}>
                List your property →
              </Link>
              <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'16px 36px', borderRadius:14, textDecoration:'none', fontWeight:600, fontSize:'1rem', color:C.white80, background:C.surface, border:`1px solid ${C.border2}` }}>
                View live demo
              </Link>
            </div>
            <p style={{ fontSize:'0.75rem', color:C.white40, marginTop:20 }}>No credit card required · Cancel anytime · GDPR compliant</p>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer style={{ background:C.bg2, borderTop:`1px solid ${C.border}`, padding:'48px max(40px,calc(50vw - 600px))' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:C.grad1, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg viewBox="0 0 32 32" fill="none" width="16" height="16"><path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 2 16 2Z" fill="white"/></svg>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:'0.85rem', color:C.white }}>PropBlaze</div>
              <div style={{ fontSize:'0.55rem', color:C.yellow, letterSpacing:'0.15em', textTransform:'uppercase' }}>AI Platform</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:28 }}>
            {[['Privacy','/privacy'],['Terms','/terms'],['Contact','mailto:hello@propblaze.com']].map(([l,h]) => (
              <a key={l} href={h} style={{ fontSize:'0.78rem', color:C.white40, textDecoration:'none' }}>{l}</a>
            ))}
          </div>
          <div style={{ fontSize:'0.72rem', color:C.white40 }}>© 2026 PropBlaze · Built for EU property owners</div>
        </div>
      </footer>
    </div>
  );
}
