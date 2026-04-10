'use client';

import React, { useState } from 'react';

const D = {
  bg: '#080810', surface: 'rgba(255,255,255,0.05)', surface2: 'rgba(255,255,255,0.09)',
  border: 'rgba(255,255,255,0.09)', border2: 'rgba(255,255,255,0.18)',
  yellow: '#F5C200', green: '#22C55E', red: '#EF4444', blue: '#3B5BDB',
  white: '#FFFFFF',
  w80: 'rgba(255,255,255,0.80)', w60: 'rgba(255,255,255,0.60)',
  w40: 'rgba(255,255,255,0.40)', w20: 'rgba(255,255,255,0.20)',
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

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  new:     { label: 'New', bg: 'rgba(245,194,0,0.12)', color: '#F5C200', border: 'rgba(245,194,0,0.28)' },
  replied: { label: 'Replied', bg: 'rgba(34,197,94,0.10)', color: '#22C55E', border: 'rgba(34,197,94,0.25)' },
  meeting: { label: 'Meeting', bg: 'rgba(59,91,219,0.12)', color: '#93c5fd', border: 'rgba(59,91,219,0.28)' },
  closed:  { label: 'Closed', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.12)' },
};

const FILTERS = ['All', 'New', 'Replied', 'Meeting'];

export default function LeadsPage() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = filter === 'All' ? LEADS : LEADS.filter(l => l.status === filter.toLowerCase());
  const newCount = LEADS.filter(l => l.status === 'new').length;

  if (selected) {
    const cfg = STATUS_CFG[selected.status];
    return (
      <div style={{ background: D.bg, minHeight: '100vh', color: D.white, fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>
          <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: D.w60, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
            ← Back to Leads
          </button>
          <div style={{ background: D.surface, border: `1px solid ${D.border2}`, borderRadius: 18, padding: '20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: D.surface2, border: `1px solid ${D.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{selected.flag}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: D.white, marginBottom: 3 }}>{selected.name}</div>
                <div style={{ fontSize: '0.8rem', color: D.w40 }}>{selected.city}, {selected.country}</div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, flexShrink: 0 }}>{cfg.label}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {[{ label: 'AI Score', value: `${selected.score}/100`, color: D.yellow, bg: 'rgba(245,194,0,0.08)' },
                { label: 'Property', value: selected.property, color: D.w80, bg: D.surface2 },
                { label: 'Received', value: selected.time, color: D.w80, bg: D.surface2 }].map(s => (
                <div key={s.label} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, background: s.bg, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.62rem', color: D.w40, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${D.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: D.w40, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Message from Agency</div>
              <p style={{ fontSize: '0.875rem', color: D.w80, lineHeight: 1.65, margin: 0 }}>{selected.message}</p>
            </div>
            <a href={`mailto:${selected.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: D.surface2, border: `1px solid ${D.border2}`, color: D.w80, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', marginBottom: selected.phone ? 8 : 0 }}>
              ✉️ Reply via Email
            </a>
            {selected.phone && (
              <a href={`tel:${selected.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 12, background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)', color: D.green, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                📞 Call Agency
              </a>
            )}
          </div>
          <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(59,91,219,0.08)', border: '1px solid rgba(59,91,219,0.18)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
              <p style={{ fontSize: '0.8rem', color: 'rgba(147,197,253,0.8)', lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: '#93c5fd' }}>AI insight:</strong> Score {selected.score}/100 — strong match. Replying within 24h increases close probability 3×.
              </p>
            </div>
          </div>
          <div style={{ height: 40 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: D.bg, minHeight: '100vh', color: D.white, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>🔥 Leads</h1>
          <p style={{ fontSize: '0.85rem', color: D.w40 }}>{newCount > 0 ? `${newCount} new agency responses` : 'All responses from agencies'}</p>
        </div>
        {newCount > 0 && (
          <div style={{ background: 'rgba(245,194,0,0.07)', border: '1px solid rgba(245,194,0,0.22)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
            <p style={{ fontSize: '0.8rem', color: 'rgba(245,194,0,0.85)', lineHeight: 1.5, margin: 0 }}>
              <strong>Reply within 24h</strong> — agencies with active buyers expect fast responses. Reply rate impacts Wave 2 selection.
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {FILTERS.map(f => {
            const isActive = filter === f;
            const count = f === 'All' ? LEADS.length : LEADS.filter(l => l.status === f.toLowerCase()).length;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 99, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, background: isActive ? D.yellow : D.surface, color: isActive ? '#080810' : D.w60, border: isActive ? 'none' : `1px solid ${D.border}` }}>
                {f}{count > 0 ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(lead => {
            const cfg = STATUS_CFG[lead.status];
            const isNew = lead.status === 'new';
            return (
              <div key={lead.id} onClick={() => setSelected(lead)} style={{ background: isNew ? 'rgba(245,194,0,0.04)' : D.surface, border: `1px solid ${isNew ? 'rgba(245,194,0,0.22)' : D.border}`, borderLeft: `3px solid ${isNew ? D.yellow : cfg.color}`, borderRadius: 14, padding: '14px 15px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: D.surface2, border: `1px solid ${D.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{lead.flag}</div>
                    {isNew && <div style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, background: D.red, borderRadius: 99, border: '2px solid #080810' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isNew ? D.yellow : D.w80, flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, flexShrink: 0 }}>{cfg.label}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: D.w40, marginBottom: 4 }}>{lead.city} · <span style={{ color: D.yellow, fontWeight: 700 }}>Score {lead.score}</span> · {lead.time}</div>
                    <div style={{ fontSize: '0.78rem', color: D.w60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.message}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: D.w40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>No {filter.toLowerCase()} leads yet</div>
          </div>
        )}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
