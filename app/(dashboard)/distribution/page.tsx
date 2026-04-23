'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const C = {
  bg: '#F8FAFC', white: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  green: '#16A34A', greenBg: '#DCFCE7',
  blue: '#3B5BDB', blueBg: '#EFF6FF',
  yellow: '#CA8A04', yellowBg: '#FEF9C3',
  orange: '#EA580C', orangeBg: '#FFF7ED',
  red: '#DC2626', redBg: '#FEF2F2',
  purple: '#7C3AED', purpleBg: '#EDE9FE',
};

interface WaveLogEntry {
  id: string; name: string; email: string; wave: 1 | 2 | 3;
  score: number; sent_at: string;
}

interface WaveGroup {
  wave: 1 | 2 | 3;
  agencies: WaveLogEntry[];
}

const WAVE_COLORS: Record<number, { color: string; bg: string }> = {
  1: { color: C.green,  bg: C.greenBg  },
  2: { color: C.blue,   bg: C.blueBg   },
  3: { color: C.purple, bg: C.purpleBg },
};

/* ─── Demo seed (fallback when no campaign started yet) ─────────────── */
const DEMO_SEED: WaveLogEntry[] = (() => {
  const now = Date.now();
  return [
    { id:'rs-cityexpert-001', name:'CityExpert Serbia',     email:'listings@cityexpert.rs',    wave:1, score:94, sent_at: new Date(now - 2*3600_000).toISOString() },
    { id:'rs-knightfrank-001',name:'Knight Frank Serbia',   email:'belgrade@knightfrank.com',  wave:1, score:92, sent_at: new Date(now - 3*3600_000).toISOString() },
    { id:'rs-colliers-001',   name:'Colliers Serbia',       email:'info@colliers.rs',          wave:1, score:91, sent_at: new Date(now - 5*3600_000).toISOString() },
    { id:'at-magnus-001',     name:'Magnus Realty GmbH',    email:'info@magnus-realty.at',     wave:1, score:89, sent_at: new Date(now - 7*3600_000).toISOString() },
    { id:'de-berlin-001',     name:'Berlin Invest Group',   email:'deals@berlin-invest.de',    wave:1, score:87, sent_at: new Date(now - 26*3600_000).toISOString() },
    { id:'me-adriatic-001',   name:'Adriatic Real Estate',  email:'contact@adriatic-re.me',    wave:1, score:85, sent_at: new Date(now - 28*3600_000).toISOString() },
    { id:'ch-zurich-001',     name:'Zürich Real Estate AG', email:'info@zurich-re.ch',         wave:2, score:83, sent_at: new Date(now - 50*3600_000).toISOString() },
    { id:'at-vienna-001',     name:'Vienna City Homes',     email:'office@viennacityhomes.at', wave:2, score:81, sent_at: new Date(now - 52*3600_000).toISOString() },
    { id:'nl-amsterdam-001',  name:'Amsterdam Invest NL',   email:'info@amsterdaminvest.nl',   wave:3, score:78, sent_at: new Date(now - 72*3600_000).toISOString() },
    { id:'fr-paris-001',      name:'Paris Premium Realty',  email:'contact@parispremium.fr',   wave:3, score:75, sent_at: new Date(now - 74*3600_000).toISOString() },
  ];
})();

export default function DistributionPage() {
  const [waveLog, setWaveLog]         = useState<WaveLogEntry[]>([]);
  const [expanded, setExpanded]       = useState(true);
  const [propertyLabel, setPropertyLabel] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pb_wave_log');
      if (raw) {
        const parsed: WaveLogEntry[] = JSON.parse(raw);
        setWaveLog(parsed.length > 0 ? parsed : DEMO_SEED);
      } else {
        setWaveLog(DEMO_SEED);
      }

      const props = localStorage.getItem('pb_wizard_props');
      if (props) {
        const p = JSON.parse(props);
        if (p.city && p.country) {
          const price = p.price ? `€${Number(p.price).toLocaleString('en-US')}` : '';
          setPropertyLabel(`${p.city}, ${p.country}${price ? ' — ' + price : ''}${p.type ? ' · ' + p.type : ''}`);
        }
      } else {
        setPropertyLabel('Belgrade, Serbia — €485,000 · Villa');
      }
    } catch {
      setWaveLog(DEMO_SEED);
    }
  }, []);

  const waves: WaveGroup[] = ([1, 2, 3] as const)
    .map(w => ({ wave: w, agencies: waveLog.filter(e => e.wave === w) }))
    .filter(w => w.agencies.length > 0);

  const totalSent = waveLog.length;
  const avgScore  = totalSent ? Math.round(waveLog.reduce((s, e) => s + e.score, 0) / totalSent) : 0;
  const startDate = waveLog[0]?.sent_at
    ? new Date(waveLog[0].sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  /* ── Empty state ─────────────────────────────────────── */
  if (totalSent === 0) {
    return (
      <div style={{ padding: 'clamp(16px,4vw,32px)', minHeight: '100vh', background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.text }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Distribution</h1>
          <p style={{ fontSize: '0.8125rem', color: C.text3 }}>APEX AI campaign tracking · Wave-based outreach</p>
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📡</div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: 6 }}>No campaigns yet</p>
          <p style={{ fontSize: '0.8125rem', color: C.text3, maxWidth: 320, margin: '0 auto 24px' }}>
            Add a property and run APEX distribution to see your campaign stats here.
          </p>
          <Link href="/properties/new" style={{ display: 'inline-flex', padding: '10px 22px', borderRadius: 10, background: C.green, color: C.white, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
            List a Property
          </Link>
        </div>
      </div>
    );
  }

  /* ── Active campaign ─────────────────────────────────── */
  return (
    <div style={{ padding: 'clamp(16px,4vw,32px)', minHeight: '100vh', background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Distribution</h1>
          <p style={{ fontSize: '0.8125rem', color: C.text3 }}>APEX AI campaign tracking · Wave-based outreach</p>
        </div>
        <Link href="/properties/new" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
          borderRadius: 10, background: C.green, color: C.white,
          fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none',
          boxShadow: '0 1px 4px rgba(22,163,74,0.3)',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1.5V10.5M1.5 6H10.5" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
          New Campaign
        </Link>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Active Campaigns', value: 1,            color: C.green,  bg: C.greenBg,  icon: '📡' },
          { label: 'Total Sent',       value: totalSent,    color: C.blue,   bg: C.blueBg,   icon: '📤' },
          { label: 'Waves Sent',       value: waves.length, color: C.orange, bg: C.orangeBg, icon: '🌊' },
          { label: 'Avg APEX Score',   value: avgScore,     color: C.purple, bg: C.purpleBg, icon: '🎯' },
        ].map(k => (
          <div key={k.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: k.color, letterSpacing: '-0.02em' }}>{k.value}</div>
            <div style={{ fontSize: '0.7rem', color: C.text3, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Campaign card */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        {/* Campaign header */}
        <div
          onClick={() => setExpanded(!expanded)}
          style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' as const }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: C.text }}>{propertyLabel || 'Active Property'}</span>
              <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, background: C.greenBg, color: C.green }}>
                ● Active
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: C.text3 }}>
              {startDate ? `Started ${startDate}` : 'Just launched'} · {totalSent} agencies contacted · {waves.length} wave{waves.length !== 1 ? 's' : ''} sent
            </div>
          </div>
          <span style={{ color: C.text3, fontSize: 18, flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>⌃</span>
        </div>

        {/* Summary strip */}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
          {[
            { label: 'Sent',       value: totalSent,    color: C.blue,   bg: C.blueBg   },
            { label: 'Avg Score',  value: avgScore,     color: C.green,  bg: C.greenBg  },
            { label: 'Replies',    value: '→ inbox',    color: C.orange, bg: C.orangeBg },
          ].map(m => (
            <div key={m.label} style={{ padding: '8px 14px', borderRadius: 8, background: m.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: '0.65rem', color: C.text3, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginTop: 1 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Wave breakdown */}
        {expanded && (
          <div style={{ borderTop: `1px solid ${C.border}` }}>
            <div style={{ padding: '14px 20px 6px', fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
              Wave Breakdown
            </div>
            {waves.map(w => {
              const wc = WAVE_COLORS[w.wave];
              const wAvg = Math.round(w.agencies.reduce((s, a) => s + a.score, 0) / w.agencies.length);
              return (
                <div key={w.wave} style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: wc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: wc.color }}>W{w.wave}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text }}>Wave {w.wave}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: C.yellow }}>⏱ Awaiting replies</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: C.text3, marginBottom: 8 }}>
                        {w.agencies.length} agencies · avg score {wAvg} · sent {w.agencies[0]?.sent_at ? new Date(w.agencies[0].sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                      </div>
                      {/* Agency name pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 8 }}>
                        {w.agencies.slice(0, 8).map(a => (
                          <span key={a.id} style={{ padding: '2px 8px', borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, fontSize: '0.65rem', color: C.text2 }}>
                            {a.name}
                          </span>
                        ))}
                        {w.agencies.length > 8 && (
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, fontSize: '0.65rem', color: C.text3 }}>
                            +{w.agencies.length - 8} more
                          </span>
                        )}
                      </div>
                      {/* Score progress bar */}
                      <div style={{ height: 4, background: C.bg, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${wAvg}%`, background: wc.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ padding: '12px 20px' }}>
              <Link href="/messenger" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: C.green, color: C.white, fontWeight: 600, fontSize: '0.8125rem', textDecoration: 'none' }}>
                💬 Check replies in Messages
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Reply tracking notice */}
      <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: C.blueBg, border: `1px solid rgba(59,91,219,0.15)`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>📧</span>
        <p style={{ fontSize: '0.8rem', color: C.blue, lineHeight: 1.6, margin: 0 }}>
          <strong>Replies go to your inbox.</strong> Agency responses are delivered directly to your email with your BCC copy. Use the Messages tab to track and respond to leads.
        </p>
      </div>
    </div>
  );
}
