'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/* ─── Types ────────────────────────────────────────────────────────── */
type Status = 'new' | 'accepted' | 'in_progress' | 'pending_docs' | 'closed' | 'declined';

interface DocItem { id: string; name: string; requestedAt: string; receivedAt?: string; url?: string }
interface Offer {
  id: string; ref: string; receivedAt: string;
  property: { type: string; address: string; city: string; country: string; flag: string; sqm: number; beds: number; price: number; currency: string; description: string; photos: number; photoUrls?: string[] };
  seller: { name: string; lang: string; respondsIn: string; email?: string };
  match: { score: number; wave: 1 | 2 | 3; reasons: string[] };
  status: Status;
  statusHistory: { at: string; status: Status; note?: string }[];
  docs: DocItem[];
}
interface Msg { id: string; offerId: string; from: 'agency' | 'owner' | 'seller'; text: string; at: string }

/* ─── Constants ────────────────────────────────────────────────────── */
const DOC_CATALOG = [
  { key: 'title_deed',    label: 'Title Deed' },
  { key: 'id',            label: 'ID / Passport' },
  { key: 'cadastral',     label: 'Cadastral Extract' },
  { key: 'energy',        label: 'Energy Certificate' },
  { key: 'floor_plan',    label: 'Floor Plan' },
  { key: 'utility_bills', label: 'Utility Bills (3 mo)' },
  { key: 'tax',           label: 'Property Tax' },
  { key: 'hoa',           label: 'HOA / Condo Fees' },
];

/* Status config */
const S: Record<Status, { bg: string; color: string; border: string; label: string; dot: string }> = {
  new:          { bg: '#FFF7ED', color: '#C2410C', border: '#FDBA74', label: 'New',       dot: '#F97316' },
  accepted:     { bg: '#F0FDF4', color: '#15803D', border: '#86EFAC', label: 'Accepted',  dot: '#22C55E' },
  in_progress:  { bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD', label: 'In Work',   dot: '#3B82F6' },
  pending_docs: { bg: '#FFFBEB', color: '#B45309', border: '#FCD34D', label: 'Docs',      dot: '#F59E0B' },
  closed:       { bg: '#F0FDF4', color: '#15803D', border: '#86EFAC', label: 'Closed',    dot: '#22C55E' },
  declined:     { bg: '#FEF2F2', color: '#B91C1C', border: '#FCA5A5', label: 'Declined',  dot: '#EF4444' },
};

/* Fallback photos when API doesn't provide them */
const FALLBACK_PHOTOS: Record<string, string> = {
  Villa:     'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
  Apartment: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  Loft:      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&q=80',
  Land:      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
  _:         'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
};
function thumb(o: Offer): string {
  return o.property.photoUrls?.[0] || FALLBACK_PHOTOS[o.property.type] || FALLBACK_PHOTOS._;
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function AgencyDashboard() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Status | null) ?? 'all';

  const [offers, setOffers] = useState<Offer[]>([]);
  const [tab, setTab] = useState<Status | 'all'>(initialTab);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [docModal, setDocModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
  const [photoIdx, setPhotoIdx] = useState(0);
  const chatEnd = useRef<HTMLDivElement>(null);

  /* ── Poll offers ──────────────────────────────────────────────────── */
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try { const r = await fetch('/api/agency-feed', { cache: 'no-store' }); const j = await r.json(); if (!stop && j.offers) setOffers(j.offers); } catch { /* */ }
    };
    tick(); const id = setInterval(tick, 4000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  /* ── Chat polling ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!active) return;
    setMsgs([]); let stop = false; let lastTs = '';
    const load = async () => {
      const url = lastTs ? `/api/agency-chat?offerId=${active}&since=${encodeURIComponent(lastTs)}` : `/api/agency-chat?offerId=${active}`;
      try { const r = await fetch(url, { cache: 'no-store' }); const j = await r.json(); if (stop) return; if (j.messages?.length) setMsgs(prev => { const seen = new Set(prev.map(m => m.id)); return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))]; }); lastTs = j.serverTime; } catch { /* */ }
    };
    load(); const id = setInterval(load, 2000);
    return () => { stop = true; clearInterval(id); };
  }, [active]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  /* ── Actions ──────────────────────────────────────────────────────── */
  const updateStatus = async (id: string, status: Status, note?: string) => {
    const r = await fetch('/api/agency-feed', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, note }) });
    const j = await r.json(); if (j.offer) setOffers(prev => prev.map(o => o.id === id ? j.offer : o));
  };
  const send = async () => {
    if (!draft.trim() || !active || sending) return;
    setSending(true); const text = draft.trim(); setDraft('');
    try { const r = await fetch('/api/agency-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId: active, text }) }); const j = await r.json(); if (j.messages) setMsgs(prev => { const seen = new Set(prev.map(m => m.id)); return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))]; }); const o = offers.find(x => x.id === active); if (o && o.status === 'accepted') updateStatus(active, 'in_progress'); } finally { setSending(false); }
  };
  const requestDocs = async () => {
    if (!active) return; const docs = Object.entries(selectedDocs).filter(([, v]) => v).map(([k]) => k); if (!docs.length) return;
    const r = await fetch('/api/agency-docs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId: active, docs }) }); const j = await r.json();
    if (j.offer) setOffers(prev => prev.map(o => o.id === active ? j.offer : o));
    if (j.messages) setMsgs(prev => { const seen = new Set(prev.map(m => m.id)); return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))]; });
    setDocModal(false); setSelectedDocs({});
  };
  const simulateNewOffer = async () => {
    setSimulating(true);
    try { const seed = SAMPLES[Math.floor(Math.random() * SAMPLES.length)]; const r = await fetch('/api/agency-feed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seed) }); const j = await r.json(); if (j.offer) setOffers(prev => [j.offer, ...prev]); } finally { setSimulating(false); }
  };

  /* ── Derived ──────────────────────────────────────────────────────── */
  const filtered = useMemo(() => tab === 'all' ? offers : offers.filter(o => o.status === tab), [offers, tab]);
  const ao = offers.find(o => o.id === active);
  const counts = useMemo(() => { const c: Record<string, number> = {}; for (const o of offers) c[o.status] = (c[o.status] || 0) + 1; return c; }, [offers]);
  const photos = ao?.property.photoUrls || [];

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <style>{`
        .ag-card:hover{box-shadow:0 4px 20px rgba(0,0,0,0.08);transform:translateY(-1px)}
        .ag-btn:hover{filter:brightness(1.08)}
        .ag-photo{transition:opacity 0.4s ease}
        .ag-pill:hover{opacity:0.85}
        @keyframes agSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .ag-topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:12px;flex-wrap:wrap}
        .ag-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
        .ag-tabs{display:flex;gap:4px;margin-bottom:20px;overflow-x:auto;-webkit-overflow-scrolling:touch}
        .ag-main{display:grid;gap:20px;min-height:550px}
        @media(max-width:900px){
          .ag-stats{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
          .ag-main{grid-template-columns:1fr!important}
          .ag-tabs{padding-bottom:4px}
        }
        @media(max-width:480px){
          .ag-stats{grid-template-columns:1fr 1fr!important;gap:8px!important}
          .ag-topbar h1{font-size:1.2rem!important}
        }
      `}</style>

      {/* ══ TOP BAR ════════════════════════════════════════════════════ */}
      <div className="ag-topbar">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.03em' }}>Agency Dashboard</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>Manage incoming properties, deals, and seller communications</p>
        </div>
        <button onClick={simulateNewOffer} disabled={simulating} className="ag-btn" style={{
          padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white',
          fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
          opacity: simulating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          {simulating ? 'Routing...' : 'Simulate New Lead'}
        </button>
      </div>

      {/* ══ STATS ══════════════════════════════════════════════════════ */}
      <div className="ag-stats">
        {([
          { label: 'Incoming', icon: '📥', statuses: ['new'] as Status[], accent: '#F97316', bg: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)' },
          { label: 'In Work', icon: '⚡', statuses: ['accepted', 'in_progress', 'pending_docs'] as Status[], accent: '#3B82F6', bg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' },
          { label: 'Closed', icon: '✅', statuses: ['closed'] as Status[], accent: '#16A34A', bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' },
          { label: 'Declined', icon: '—', statuses: ['declined'] as Status[], accent: '#94A3B8', bg: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)' },
        ]).map(s => {
          const count = s.statuses.reduce((sum, st) => sum + (counts[st] || 0), 0);
          return (
            <div key={s.label} onClick={() => setTab(s.statuses[0])} className="ag-card" style={{
              background: s.bg, borderRadius: 16, padding: '22px 24px',
              border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '3.5rem', opacity: 0.08 }}>{s.icon}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: s.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: s.accent, lineHeight: 1, marginBottom: 4 }}>{count}</div>
              <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 500 }}>
                {s.label === 'Incoming' ? 'awaiting your review' : s.label === 'In Work' ? 'active pipeline' : s.label === 'Closed' ? 'completed deals' : 'passed offers'}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══ PIPELINE TABS ══════════════════════════════════════════════ */}
      <div className="ag-tabs" style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 4, border: '1px solid var(--border)' }}>
        {(['all', 'new', 'accepted', 'in_progress', 'pending_docs', 'closed', 'declined'] as const).map(t => {
          const labels: Record<string, string> = { all: 'All', new: 'Incoming', accepted: 'Accepted', in_progress: 'In Work', pending_docs: 'Pending Docs', closed: 'Closed', declined: 'Declined' };
          const isActive = tab === t;
          const cnt = t === 'all' ? offers.length : (counts[t] || 0);
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: isActive ? 'white' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-tertiary)',
              fontWeight: isActive ? 700 : 500, fontSize: '0.75rem', cursor: 'pointer',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s', flex: t === 'all' ? '0 0 auto' : 1,
            }}>
              {labels[t]} <span style={{ opacity: 0.5, marginLeft: 4, fontWeight: 400, fontSize: '0.7rem' }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* ══ MAIN LAYOUT ════════════════════════════════════════════════ */}
      <div className="ag-main" style={{ gridTemplateColumns: ao ? '340px 1fr' : '1fr' }}>

        {/* ── LEFT: Offer List ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 'calc(100vh - 340px)', overflowY: 'auto', paddingRight: 4 }}>
          {filtered.length === 0 && (
            <div style={{ border: '2px dashed var(--border)', borderRadius: 16, padding: '48px 24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>No offers here yet</div>
              <div style={{ fontSize: '0.75rem' }}>{tab === 'new' ? 'New leads will appear automatically from APEX engine' : 'Switch tabs to see other offers'}</div>
            </div>
          )}
          {filtered.map(o => {
            const sel = active === o.id;
            const st = S[o.status];
            return (
              <div key={o.id} onClick={() => { setActive(o.id); setPhotoIdx(0); }} className="ag-card" style={{
                display: 'flex', gap: 14, padding: 12, borderRadius: 14, cursor: 'pointer',
                border: `2px solid ${sel ? '#3B82F6' : 'var(--border)'}`,
                background: sel ? '#EFF6FF' : 'white',
                transition: 'all 0.2s', animation: 'agSlide 0.3s ease both',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: 80, height: 80, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                  background: '#F1F5F9',
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb(o)} alt={o.property.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text)' }}>{o.property.flag} {o.property.type}</span>
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.property.city}, {o.property.country}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{o.seller.name} · {o.seller.lang}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text)' }}>€{o.property.price.toLocaleString()}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>score {o.match.score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: Detail + Chat ─────────────────────────────────── */}
        {ao && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'agSlide 0.3s ease both' }}>

            {/* ─── Photo Gallery + Property Header ─── */}
            <div style={{ background: 'white', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              {/* Photo */}
              <div style={{ position: 'relative', height: 240, background: '#0F172A', overflow: 'hidden' }}>
                {photos.length > 0 ? photos.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt="" className="ag-photo" style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                    opacity: photoIdx === i ? 1 : 0,
                  }} />
                )) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb(ao)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                {/* Photo nav */}
                {photos.length > 1 && (
                  <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                    {photos.map((_, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)} style={{
                        width: photoIdx === i ? 20 : 8, height: 8, borderRadius: 4, border: 'none',
                        background: photoIdx === i ? 'white' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }} />
                    ))}
                  </div>
                )}
                {/* Photo count badge */}
                <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: 8, padding: '4px 10px', fontSize: '0.7rem', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="8" rx="1.5" stroke="white" strokeWidth="1"/><circle cx="4" cy="5.5" r="1" fill="white"/><path d="M1 8.5L4 6L6 7.5L8.5 5L11 7.5" stroke="white" strokeWidth="0.75"/></svg>
                  {ao.property.photos} photos
                </div>
                {/* Status + price overlay */}
                <div style={{ position: 'absolute', bottom: 14, left: 18, right: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: S[ao.status].bg, color: S[ao.status].color, border: `1px solid ${S[ao.status].border}` }}>{S[ao.status].label}</span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: '6px 0 0', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      {ao.property.flag} {ao.property.type} · {ao.property.city}
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>€{ao.property.price.toLocaleString()}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>€{Math.round(ao.property.price / ao.property.sqm).toLocaleString()}/m²</div>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: 6, fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 12 }}>
                  <span>{ao.property.address}, {ao.property.country}</span>
                  <span style={{ opacity: 0.3 }}>·</span>
                  <span>Ref {ao.ref}</span>
                  <span style={{ opacity: 0.3 }}>·</span>
                  <span>Seller: {ao.seller.name} ({ao.seller.lang}) · responds ~{ao.seller.respondsIn}</span>
                </div>

                {/* Key metrics row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
                  <MetricChip label="Area" value={`${ao.property.sqm} m²`} />
                  {ao.property.beds > 0 && <MetricChip label="Beds" value={String(ao.property.beds)} />}
                  <MetricChip label="Photos" value={String(ao.property.photos)} />
                  <MetricChip label="Score" value={String(ao.match.score)} accent />
                  <MetricChip label="Wave" value={`W${ao.match.wave}`} />
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 16px' }}>{ao.property.description}</p>

                {/* Why matched */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {ao.match.reasons.map((r, i) => (
                    <span key={i} className="ag-pill" style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 20, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', fontWeight: 500, cursor: 'default' }}>{r}</span>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ao.status === 'new' && (
                    <>
                      <CTA onClick={() => updateStatus(ao.id, 'accepted')} color="#16A34A" icon="✓" label="Accept Offer" />
                      <CTA onClick={() => updateStatus(ao.id, 'declined', 'Not our profile')} color="#DC2626" icon="✕" label="Decline" outline />
                    </>
                  )}
                  {(['accepted', 'in_progress', 'pending_docs'] as Status[]).includes(ao.status) && (
                    <>
                      <CTA onClick={() => setDocModal(true)} color="#3B82F6" icon="📋" label="Request Docs" />
                      <CTA onClick={() => updateStatus(ao.id, 'closed', 'Deal done')} color="#16A34A" icon="🏁" label="Close Deal" outline />
                    </>
                  )}
                  {(ao.status === 'closed' || ao.status === 'declined') && (
                    <CTA onClick={() => updateStatus(ao.id, 'new', 'Reopened')} color="#64748B" icon="↩" label="Reopen" outline />
                  )}
                </div>

                {/* Docs list */}
                {ao.docs.length > 0 && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Documents ({ao.docs.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {ao.docs.map(d => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '8px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{d.receivedAt ? '✅' : '⏳'}</span>
                            <span style={{ color: 'var(--text)' }}>{d.name}</span>
                          </span>
                          {d.url ? <a href={d.url} style={{ color: '#3B82F6', fontWeight: 600, fontSize: '0.7rem' }}>Open</a> : <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>requested</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Chat ─── */}
            <div style={{ background: 'white', borderRadius: 18, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: 380, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>Chat with Seller</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{ao.seller.name} · {ao.seller.lang} · responds ~{ao.seller.respondsIn}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.65rem', fontWeight: 600, color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 20, padding: '3px 10px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />live
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {msgs.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '40px 0' }}>Loading conversation...</div>}
                {msgs.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'agency' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%', borderRadius: 16, padding: '10px 16px', fontSize: '0.8rem', lineHeight: 1.5,
                      ...(m.from === 'agency'
                        ? { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white', borderBottomRightRadius: 4 }
                        : { background: '#F1F5F9', color: 'var(--text)', borderBottomLeftRadius: 4 }),
                    }}>
                      <div style={{ fontSize: '0.62rem', opacity: 0.7, marginBottom: 3, fontWeight: 600 }}>{m.from === 'agency' ? 'You' : ao.seller.name}</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                    </div>
                  </div>
                ))}
                <div ref={chatEnd} />
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '10px 14px', display: 'flex', gap: 8 }}>
                <input value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={ao.status === 'new' ? 'Accept the offer to start chatting...' : 'Type a message...'}
                  disabled={ao.status === 'new' || ao.status === 'declined'}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: '0.8rem', color: 'var(--text)', outline: 'none' }} />
                <button onClick={send} disabled={!draft.trim() || sending || ao.status === 'new' || ao.status === 'declined'} className="ag-btn" style={{
                  padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white',
                  fontWeight: 700, fontSize: '0.8rem', opacity: (!draft.trim() || sending) ? 0.4 : 1,
                }}>
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when nothing selected (full width) */}
        {!ao && (
          <div style={{
            border: '2px dashed var(--border)', borderRadius: 20, padding: '80px 40px',
            textAlign: 'center', background: 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🏘</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Select a property to get started</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', maxWidth: 380 }}>
              Click on any incoming offer from the left panel to view full property details, photos, documents, and chat directly with the seller
            </div>
          </div>
        )}
      </div>

      {/* ── Document Request Modal ──────────────────────────────────── */}
      {docModal && ao && (
        <div onClick={() => setDocModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: 28, maxWidth: 460, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text)' }}>Request Documents</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', margin: '0 0 20px' }}>The seller will be notified and upload documents via chat</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
              {DOC_CATALOG.map(d => (
                <label key={d.key} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                  background: selectedDocs[d.key] ? '#EFF6FF' : '#F8FAFC',
                  border: `1.5px solid ${selectedDocs[d.key] ? '#93C5FD' : '#E2E8F0'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <input type="checkbox" checked={!!selectedDocs[d.key]} onChange={e => setSelectedDocs(p => ({ ...p, [d.key]: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#3B82F6', borderRadius: 4 }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: selectedDocs[d.key] ? 600 : 400 }}>{d.label}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDocModal(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={requestDocs} disabled={Object.values(selectedDocs).every(v => !v)} className="ag-btn" style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', opacity: Object.values(selectedDocs).every(v => !v) ? 0.4 : 1 }}>
                Request Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Small components ─────────────────────────────────────────────── */
function MetricChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      borderRadius: 10, padding: '8px 6px', textAlign: 'center',
      background: accent ? '#EFF6FF' : '#F8FAFC',
      border: `1px solid ${accent ? '#BFDBFE' : '#E2E8F0'}`,
    }}>
      <div style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: accent ? '#1D4ED8' : '#1E293B', marginTop: 2 }}>{value}</div>
    </div>
  );
}

function CTA({ onClick, color, icon, label, outline }: { onClick: () => void; color: string; icon: string; label: string; outline?: boolean }) {
  return (
    <button onClick={onClick} className="ag-btn" style={{
      padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
      border: outline ? `1.5px solid ${color}` : 'none',
      background: outline ? 'white' : color,
      color: outline ? color : 'white',
      fontWeight: 700, fontSize: '0.78rem',
      display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.15s',
    }}>
      <span>{icon}</span> {label}
    </button>
  );
}

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

/* ─── Simulation samples ───────────────────────────────────────────── */
const SAMPLES = [
  { type: 'Apartment', address: 'Calle Serrano 84', city: 'Madrid', country: 'Spain', flag: '🇪🇸', sqm: 95, beds: 3, price: 720000, sellerName: 'C. García', sellerLang: 'ES', score: 91, wave: 1, reasons: ['Geo: Madrid centro', 'Premium price band', 'EN+ES owner'], description: 'Renovated piso in Salamanca district. Concierge, garage, balcony. Walking distance to Retiro Park.', photos: 14, photoUrls: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'] },
  { type: 'Villa', address: 'Praia da Marinha 7', city: 'Lagoa', country: 'Portugal', flag: '🇵🇹', sqm: 280, beds: 5, price: 1850000, sellerName: 'M. Costa', sellerLang: 'PT', score: 96, wave: 1, reasons: ['Algarve coast', 'Luxury segment', 'Foreign-buyer ready'], description: 'Cliff-top villa, infinity pool, 180° ocean view, 12 min to Carvoeiro. Modern architecture, smart home.', photos: 22, photoUrls: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'] },
  { type: 'Loft', address: 'Bergmannstr 11', city: 'Berlin', country: 'Germany', flag: '🇩🇪', sqm: 132, beds: 3, price: 695000, sellerName: 'S. Schneider', sellerLang: 'DE', score: 88, wave: 1, reasons: ['Kreuzberg loft', 'Investor-ready', 'Strong rental yield'], description: 'Industrial loft in Bergmannkiez, exposed brick, 4m ceilings, rooftop terrace with skyline view.', photos: 18, photoUrls: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'] },
  { type: 'Villa', address: 'Camí de Cala Comte 3', city: 'Ibiza', country: 'Spain', flag: '🇪🇸', sqm: 340, beds: 6, price: 4200000, sellerName: 'A. Marí', sellerLang: 'ES', score: 95, wave: 1, reasons: ['Sant Josep coastline', 'Ultra-luxury', 'Sunset-view plot'], description: 'Modernist villa, infinity pool, direct cala access, fully licensed for holiday rental. Private helipad.', photos: 28, photoUrls: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80','https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80'] },
  { type: 'Apartment', address: 'Bd Saint-Germain 142', city: 'Paris', country: 'France', flag: '🇫🇷', sqm: 78, beds: 2, price: 1290000, sellerName: 'L. Dubois', sellerLang: 'FR', score: 92, wave: 1, reasons: ['6e arrondissement', 'Prime price band', 'Move-in ready'], description: 'Haussmannien 4ème étage, original parquet, marble fireplace, restored moldings, private cellar.', photos: 11, photoUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'] },
];
