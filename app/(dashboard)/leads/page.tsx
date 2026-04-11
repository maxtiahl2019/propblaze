'use client';

import React, { useState } from 'react';
// i18n removed: English-only MVP

const C = {
  bg: '#F8FAFC', white: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  green: '#16A34A', greenBg: '#DCFCE7',
  blue: '#3B5BDB', blueBg: '#EFF6FF',
  yellow: '#CA8A04', yellowBg: '#FEF9C3',
  orange: '#EA580C', orangeBg: '#FFF7ED',
  red: '#DC2626', redBg: '#FEF2F2',
};

interface Lead {
  id: string; flag: string; name: string; city: string; country: string;
  property: string; score: number; time: string; status: 'new' | 'replied' | 'meeting' | 'closed';
  message: string; email: string; phone?: string;
}

const LEADS: Lead[] = [
  { id: 'l1', flag: '🇦🇹', name: 'Magnus Realty GmbH', city: 'Vienna', country: 'Austria', property: 'Apt · Belgrade', score: 94, time: '2h ago', status: 'new', email: 'info@magnus-realty.at', phone: '+43 1 234 5678', message: 'Dear owner, we have several qualified buyers looking for Belgrade apartments in this price range. Can you share the floor plan and arrange a virtual tour?' },
  { id: 'l2', flag: '🇲🇪', name: 'Adriatic Real Estate', city: 'Podgorica', country: 'Montenegro', property: 'Apt · Belgrade', score: 88, time: '5h ago', status: 'new', email: 'sales@adriatic-re.me', message: 'Hello! We have a motivated buyer offering €140,000 cash. Quick close possible — 30 days. Owner direct contact preferred.' },
  { id: 'l3', flag: '🇦🇹', name: 'Euro Prime Properties', city: 'Vienna', country: 'Austria', property: 'Apt · Belgrade', score: 91, time: '1d ago', status: 'replied', email: 'contact@europrime.at', message: 'Professional photos received. Listing is going live today on our platform (50k monthly visitors). We typically close within 45-60 days.' },
  { id: 'l4', flag: '🇩🇪', name: 'Berlin Invest Group', city: 'Berlin', country: 'Germany', property: 'Apt · Belgrade', score: 79, time: '2d ago', status: 'meeting', email: 'team@berlininvest.de', message: 'We have set up a call for next Tuesday 14:00 CET. Our investor portfolio manager will discuss the property directly.' },
  { id: 'l5', flag: '🇷🇸', name: 'Capital Estate Beograd', city: 'Belgrade', country: 'Serbia', property: 'Apt · Belgrade', score: 85, time: '3d ago', status: 'replied', email: 'office@capital-estate.rs', message: "We operate one of Belgrade's largest buyer networks. We'd like to feature this property in our premium newsletter reaching 12,000 subscribers." },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  new:     { bg: C.yellowBg, color: C.yellow },
  replied: { bg: C.greenBg,  color: C.green  },
  meeting: { bg: C.blueBg,   color: C.blue   },
  closed:  { bg: C.bg,       color: C.text3  },
};
const STATUS_LABEL: Record<string, string> = {
  new: 'New', replied: 'Replied', meeting: 'Meeting', closed: 'Closed',
};

const FILTER_KEYS = ['All', 'new', 'replied', 'meeting'] as const;

// FIX P0-2: All LEADS data is demo/example content — clearly labeled in UI
const IS_DEMO_LEADS = true; // flip to false when real backend leads are wired

export default function LeadsPage() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = filter === 'All' ? LEADS : LEADS.filter(l => l.status === filter);
  const newCount = LEADS.filter(l => l.status === 'new').length;

  if (selected) {
    const cfg = STATUS_STYLE[selected.status];
    return (
      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>
          {IS_DEMO_LEADS && (
            <div style={{ padding: '8px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, fontSize: '0.75rem', color: '#92400E', fontWeight: 600, marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
              <span>🧪</span>
              <span>DEMO — This is a sample lead. Real agency responses appear here after your campaign is live.</span>
            </div>
          )}
          <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.text2, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
            ← Back
          </button>

          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{selected.flag}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: C.text, marginBottom: 3 }}>{selected.name}</div>
                <div style={{ fontSize: '0.8rem', color: C.text3 }}>{selected.city}, {selected.country}</div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{STATUS_LABEL[selected.status]}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'AI Score', value: `${selected.score}/100`, color: C.green, bg: C.greenBg },
                { label: 'Property',  value: selected.property, color: C.text, bg: C.bg },
                { label: 'Received',  value: selected.time, color: C.text2, bg: C.bg },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, background: s.bg, border: `1px solid ${C.border}`, textAlign: 'center' as const }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.62rem', color: C.text3, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }}>Message from agency</div>
              <p style={{ fontSize: '0.875rem', color: C.text2, lineHeight: 1.65, margin: 0 }}>{selected.message}</p>
            </div>

            <a href={`mailto:${selected.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: C.green, color: C.white, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', marginBottom: selected.phone ? 8 : 0 }}>
              ✉️ Reply by Email
            </a>
            {selected.phone && (
              <a href={`tel:${selected.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: C.greenBg, border: `1px solid rgba(22,163,74,0.3)`, color: C.green, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                📞 Call Agency
              </a>
            )}
          </div>

          <div style={{ padding: '14px 16px', borderRadius: 14, background: C.blueBg, border: `1px solid rgba(59,91,219,0.15)` }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
              <p style={{ fontSize: '0.8rem', color: C.blue, lineHeight: 1.6, margin: 0 }}>
                <strong>AI insight:</strong> Score {selected.score}/100 — strong match. Replying within 24h increases close probability 3×.
              </p>
            </div>
          </div>
          <div style={{ height: 40 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.5rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4, color: C.text }}>
            Agency Responses
          </h1>
          <p style={{ fontSize: '0.85rem', color: C.text3 }}>
            {newCount > 0 ? `${newCount} new agency responses` : 'All responses from agencies'}
          </p>
        </div>

        {IS_DEMO_LEADS && (
          <div style={{ padding: '12px 16px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🧪</span>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400E', marginBottom: 3 }}>Demo Examples</div>
              <p style={{ fontSize: '0.75rem', color: '#92400E', lineHeight: 1.5, margin: 0 }}>
                These are example agency responses shown for illustration. Once your property campaign goes live, real agency messages will appear here — linked to your actual listing.
              </p>
            </div>
          </div>
        )}

        {newCount > 0 && (
          <div style={{ background: C.yellowBg, border: `1px solid rgba(202,138,4,0.25)`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
            <p style={{ fontSize: '0.8rem', color: C.yellow, lineHeight: 1.5, margin: 0 }}>
              <strong>Reply within 24h</strong> — agencies with active buyers expect fast responses. Reply rate impacts Wave 2 selection.
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
          {FILTER_KEYS.map(f => {
            const isActive = filter === f;
            const count = f === 'All' ? LEADS.length : LEADS.filter(l => l.status === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                flex: 1, padding: '7px 10px', borderRadius: 7, fontWeight: 600, fontSize: '0.78rem',
                cursor: 'pointer', whiteSpace: 'nowrap' as const, border: 'none',
                background: isActive ? C.green : 'transparent',
                color: isActive ? C.white : C.text2,
                transition: 'all 0.15s',
              }}>
                {f === 'All' ? 'All' : STATUS_LABEL[f]}{count > 0 ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(lead => {
            const cfg = STATUS_STYLE[lead.status];
            const isNew = lead.status === 'new';
            return (
              <div key={lead.id} onClick={() => setSelected(lead)} style={{
                background: C.white,
                border: `1px solid ${isNew ? 'rgba(202,138,4,0.3)' : C.border}`,
                borderLeft: `3px solid ${isNew ? C.yellow : cfg.color}`,
                borderRadius: 12, padding: '14px 15px', cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{lead.flag}</div>
                    {isNew && <div style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, background: C.red, borderRadius: 99, border: `2px solid ${C.white}` }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: C.text, flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{lead.name}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{STATUS_LABEL[lead.status]}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: C.text3, marginBottom: 4 }}>
                      {lead.city} · <span style={{ color: C.green, fontWeight: 700 }}>Score {lead.score}</span> · {lead.time}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: C.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{lead.message}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: C.text3 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.text2 }}>No leads yet</div>
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
