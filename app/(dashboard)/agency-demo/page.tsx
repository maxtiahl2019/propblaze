'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/* ─── Types ────────────────────────────────────────────────────────── */
type Status = 'new' | 'accepted' | 'in_progress' | 'pending_docs' | 'closed' | 'declined';

interface DocItem { id: string; name: string; requestedAt: string; receivedAt?: string; url?: string }
interface Offer {
  id: string; ref: string; receivedAt: string;
  property: { type: string; address: string; city: string; country: string; flag: string; sqm: number; beds: number; price: number; currency: string; description: string; photos: number };
  seller: { name: string; lang: string; respondsIn: string; email?: string };
  match: { score: number; wave: 1 | 2 | 3; reasons: string[] };
  status: Status;
  statusHistory: { at: string; status: Status; note?: string }[];
  docs: DocItem[];
}
interface Msg { id: string; offerId: string; from: 'agency' | 'owner' | 'seller'; text: string; at: string }

/* ─── Tabs & Docs ──────────────────────────────────────────────────── */
const PIPELINE_TABS: { key: Status | 'all'; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'new',          label: 'Incoming' },
  { key: 'accepted',     label: 'Accepted' },
  { key: 'in_progress',  label: 'In Work' },
  { key: 'pending_docs', label: 'Pending Docs' },
  { key: 'closed',       label: 'Closed' },
  { key: 'declined',     label: 'Declined' },
];

const DOC_CATALOG_KEYS = [
  { key: 'title_deed',    label: 'Title Deed' },
  { key: 'id',            label: 'ID / Passport' },
  { key: 'cadastral',     label: 'Cadastral Extract' },
  { key: 'energy',        label: 'Energy Certificate' },
  { key: 'floor_plan',    label: 'Floor Plan' },
  { key: 'utility_bills', label: 'Utility Bills (3 mo)' },
  { key: 'tax',           label: 'Property Tax' },
  { key: 'hoa',           label: 'HOA / Condo Fees' },
];

/* ─── Stat colors ──────────────────────────────────────────────────── */
const STAT_CARDS: { key: string; label: string; color: string; bg: string; border: string; statuses: Status[] }[] = [
  { key: 'incoming',  label: 'Incoming',  color: '#F97316', bg: '#FFF7ED', border: '#FED7AA', statuses: ['new'] },
  { key: 'in_work',   label: 'In Work',   color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', statuses: ['accepted', 'in_progress', 'pending_docs'] },
  { key: 'closed',    label: 'Closed',    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', statuses: ['closed'] },
  { key: 'declined',  label: 'Declined',  color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0', statuses: ['declined'] },
];

/* ─── Status badge colors (light theme) ────────────────────────────── */
const STATUS_STYLES: Record<Status, { bg: string; color: string; border: string; label: string }> = {
  new:          { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', label: 'New' },
  accepted:     { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', label: 'Accepted' },
  in_progress:  { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', label: 'In Work' },
  pending_docs: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Docs' },
  closed:       { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', label: 'Closed' },
  declined:     { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Declined' },
};

/* ═══════════════════════════════════════════════════════════════════ */
export default function AgencyDemo() {
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
  const chatBottomRef = useRef<HTMLDivElement>(null);

  /* ── Poll offers ──────────────────────────────────────────────────── */
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch('/api/agency-feed', { cache: 'no-store' });
        const j = await r.json();
        if (!stop && j.offers) setOffers(j.offers);
      } catch { /* noop */ }
    };
    tick();
    const id = setInterval(tick, 4000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  /* ── Chat polling ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!active) return;
    setMsgs([]);
    let stop = false;
    let lastTs = '';
    const load = async () => {
      const url = lastTs ? `/api/agency-chat?offerId=${active}&since=${encodeURIComponent(lastTs)}` : `/api/agency-chat?offerId=${active}`;
      try {
        const r = await fetch(url, { cache: 'no-store' });
        const j = await r.json();
        if (stop) return;
        if (j.messages?.length) {
          setMsgs(prev => {
            const seen = new Set(prev.map(m => m.id));
            return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))];
          });
        }
        lastTs = j.serverTime;
      } catch { /* noop */ }
    };
    load();
    const id = setInterval(load, 2000);
    return () => { stop = true; clearInterval(id); };
  }, [active]);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  /* ── Actions ──────────────────────────────────────────────────────── */
  const updateStatus = async (id: string, status: Status, note?: string) => {
    const r = await fetch('/api/agency-feed', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, note }) });
    const j = await r.json();
    if (j.offer) setOffers(prev => prev.map(o => o.id === id ? j.offer : o));
  };

  const send = async () => {
    if (!draft.trim() || !active || sending) return;
    setSending(true);
    const text = draft.trim();
    setDraft('');
    try {
      const r = await fetch('/api/agency-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId: active, text }) });
      const j = await r.json();
      if (j.messages) setMsgs(prev => { const seen = new Set(prev.map(m => m.id)); return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))]; });
      const o = offers.find(x => x.id === active);
      if (o && o.status === 'accepted') updateStatus(active, 'in_progress');
    } finally { setSending(false); }
  };

  const requestDocs = async () => {
    if (!active) return;
    const docs = Object.entries(selectedDocs).filter(([, v]) => v).map(([k]) => k);
    if (docs.length === 0) return;
    const r = await fetch('/api/agency-docs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ offerId: active, docs }) });
    const j = await r.json();
    if (j.offer) setOffers(prev => prev.map(o => o.id === active ? j.offer : o));
    if (j.messages) setMsgs(prev => { const seen = new Set(prev.map(m => m.id)); return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))]; });
    setDocModal(false);
    setSelectedDocs({});
  };

  const simulateNewOffer = async () => {
    setSimulating(true);
    try {
      const seed = SAMPLE_PROPS[Math.floor(Math.random() * SAMPLE_PROPS.length)];
      const r = await fetch('/api/agency-feed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seed) });
      const j = await r.json();
      if (j.offer) setOffers(prev => [j.offer, ...prev]);
    } finally { setSimulating(false); }
  };

  /* ── Derived ──────────────────────────────────────────────────────── */
  const filtered = useMemo(() => tab === 'all' ? offers : offers.filter(o => o.status === tab), [offers, tab]);
  const activeOffer = offers.find(o => o.id === active);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const o of offers) c[o.status] = (c[o.status] || 0) + 1;
    return c;
  }, [offers]);

  /* ═══════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* ── Stats Row ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {STAT_CARDS.map(s => {
          const count = s.statuses.reduce((sum, st) => sum + (counts[st] || 0), 0);
          return (
            <div key={s.key} style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 14,
              padding: '20px 20px 16px',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onClick={() => setTab(s.statuses[0])}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: 6 }}>
                {s.key === 'incoming' ? 'awaiting review' : s.key === 'in_work' ? 'active pipeline' : s.key === 'closed' ? 'deals done' : 'passed'}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Simulate Button ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={simulateNewOffer} disabled={simulating} style={{
          padding: '8px 16px', borderRadius: 10, border: '1px solid #FED7AA',
          background: simulating ? '#FFF7ED' : 'linear-gradient(135deg, #F97316, #EA580C)',
          color: simulating ? '#C2410C' : 'white',
          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          opacity: simulating ? 0.7 : 1,
        }}>
          {simulating ? 'Routing...' : 'Simulate Seller from APEX'}
        </button>
      </div>

      {/* ── Pipeline Tabs ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        {PIPELINE_TABS.map(t => {
          const isActive = tab === t.key;
          const cnt = t.key === 'all' ? offers.length : (counts[t.key] || 0);
          return (
            <button key={t.key} onClick={() => setTab(t.key as Status | 'all')} style={{
              padding: '6px 14px', borderRadius: 8, border: `1px solid ${isActive ? 'var(--primary-border)' : 'var(--border)'}`,
              background: isActive ? 'var(--primary-light)' : 'var(--surface)',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: '0.75rem', fontWeight: isActive ? 600 : 400, cursor: 'pointer',
              transition: 'all 0.15s',
            }}>
              {t.label} <span style={{ opacity: 0.6, marginLeft: 4 }}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Grid: Left list + Right detail/chat ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, minHeight: 600 }}>
        {/* ─ Left: Offer List ─ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
              {PIPELINE_TABS.find(t => t.key === tab)?.label || 'All'} · {filtered.length}
            </span>
          </div>

          {filtered.length === 0 && (
            <div style={{
              border: '1px solid var(--border)', borderRadius: 12, padding: '40px 20px', textAlign: 'center',
              color: 'var(--text-tertiary)', fontSize: '0.8rem', background: 'var(--surface)',
            }}>
              {tab === 'new' ? 'No incoming offers yet. Waiting for APEX engine...' : 'No offers in this tab.'}
            </div>
          )}

          {filtered.map(o => {
            const isSelected = active === o.id;
            const st = STATUS_STYLES[o.status];
            return (
              <button key={o.id} onClick={() => setActive(o.id)} style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 12, padding: '14px 16px',
                background: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>{o.property.flag}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text)' }}>{o.property.type} · {o.property.city}</span>
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{o.seller.name} · {o.seller.lang}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>{o.property.address}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{o.property.currency === 'EUR' ? '€' : '$'}{o.property.price.toLocaleString()}</span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem' }}>score {o.match.score} · W{o.match.wave} · {timeAgo(o.receivedAt)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─ Right: Detail + Chat ─ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!activeOffer && (
            <div style={{
              border: '1px solid var(--border)', borderRadius: 16, padding: '60px 20px',
              textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem',
              background: 'var(--surface)', flex: 1,
            }}>
              Select an offer from the left to view property details and chat with the seller
            </div>
          )}

          {activeOffer && (
            <>
              {/* ─── Property Card ─── */}
              <div style={{
                border: '1px solid var(--border)', borderRadius: 16, padding: '24px',
                background: 'var(--surface)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                      <span>Ref · {activeOffer.ref}</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: STATUS_STYLES[activeOffer.status].bg, color: STATUS_STYLES[activeOffer.status].color, border: `1px solid ${STATUS_STYLES[activeOffer.status].border}` }}>{STATUS_STYLES[activeOffer.status].label}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
                      {activeOffer.property.flag} {activeOffer.property.type} · {activeOffer.property.city}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{activeOffer.property.address}, {activeOffer.property.country}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Seller: {activeOffer.seller.name} · {activeOffer.seller.lang} · ~{activeOffer.seller.respondsIn}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{activeOffer.property.currency === 'EUR' ? '€' : '$'}{activeOffer.property.price.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{activeOffer.property.currency === 'EUR' ? '€' : '$'}{Math.round(activeOffer.property.price / activeOffer.property.sqm).toLocaleString()}/m²</div>
                  </div>
                </div>

                {/* Mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                  <MiniStat label="Area" value={`${activeOffer.property.sqm} m²`} />
                  {activeOffer.property.beds > 0 && <MiniStat label="Beds" value={String(activeOffer.property.beds)} />}
                  <MiniStat label="Photos" value={String(activeOffer.property.photos)} />
                  <MiniStat label="Match" value={`${activeOffer.match.score} · W${activeOffer.match.wave}`} />
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>{activeOffer.property.description}</p>

                {/* Why your agency */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Why your agency</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {activeOffer.match.reasons.map((r, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 6, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }}>{r}</span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {activeOffer.status === 'new' && (
                    <>
                      <ActionBtn onClick={() => updateStatus(activeOffer.id, 'accepted')} color="#16A34A" label="Accept" />
                      <ActionBtn onClick={() => updateStatus(activeOffer.id, 'declined', 'Not our profile')} color="#DC2626" label="Decline" />
                    </>
                  )}
                  {(['accepted', 'in_progress', 'pending_docs'] as Status[]).includes(activeOffer.status) && (
                    <>
                      <ActionBtn onClick={() => setDocModal(true)} color="#3B82F6" label="Request Docs" />
                      <ActionBtn onClick={() => updateStatus(activeOffer.id, 'closed', 'Deal done')} color="#64748B" label="Close Deal" />
                    </>
                  )}
                  {(activeOffer.status === 'closed' || activeOffer.status === 'declined') && (
                    <ActionBtn onClick={() => updateStatus(activeOffer.id, 'new', 'Reopened')} color="#94A3B8" label="Reopen" />
                  )}
                </div>

                {/* Documents attached */}
                {activeOffer.docs.length > 0 && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Documents ({activeOffer.docs.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {activeOffer.docs.map(d => (
                        <div key={d.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          fontSize: '0.75rem', padding: '8px 12px', borderRadius: 8,
                          background: 'var(--surface-2)', border: '1px solid var(--border)',
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{d.receivedAt ? '✅' : '⏳'}</span>
                            <span style={{ color: 'var(--text)' }}>{d.name}</span>
                          </span>
                          {d.url ? (
                            <a href={d.url} style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.7rem' }}>open</a>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>requested</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Chat ─── */}
              <div style={{
                border: '1px solid var(--border)', borderRadius: 16,
                background: 'var(--surface)',
                display: 'flex', flexDirection: 'column', height: 420,
              }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>Chat with Seller</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{activeOffer.seller.name} · {activeOffer.seller.lang}</div>
                  </div>
                  <span style={{ fontSize: '0.65rem', padding: '2px 10px', borderRadius: 6, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontWeight: 600 }}>live</span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {msgs.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '40px 0' }}>Loading conversation...</div>}
                  {msgs.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'agency' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%', borderRadius: 14, padding: '10px 14px', fontSize: '0.8rem', lineHeight: 1.5,
                        ...(m.from === 'agency'
                          ? { background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: 'white', borderBottomRightRadius: 4 }
                          : { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }
                        ),
                      }}>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7, marginBottom: 2 }}>{m.from === 'agency' ? 'You (agency)' : activeOffer.seller.name}</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', padding: 12, display: 'flex', gap: 8 }}>
                  <input
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={activeOffer.status === 'new' ? 'Accept the offer first to start chatting...' : 'Write to seller...'}
                    disabled={activeOffer.status === 'new' || activeOffer.status === 'declined'}
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
                      background: 'var(--surface-2)', fontSize: '0.8rem', color: 'var(--text)',
                      outline: 'none',
                    }}
                  />
                  <button onClick={send} disabled={!draft.trim() || sending || activeOffer.status === 'new' || activeOffer.status === 'declined'} style={{
                    padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    color: 'white', fontWeight: 600, fontSize: '0.8rem',
                    opacity: (!draft.trim() || sending) ? 0.4 : 1,
                  }}>
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Document Request Modal ──────────────────────────────────── */}
      {docModal && activeOffer && (
        <div onClick={() => setDocModal(false)} style={{
          position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
            padding: 28, maxWidth: 440, width: '100%',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>Request Documents</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0 0 20px' }}>Seller will be notified and send links via chat</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              {DOC_CATALOG_KEYS.map(d => (
                <label key={d.key} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
                  background: selectedDocs[d.key] ? 'var(--primary-light)' : 'var(--surface-2)',
                  border: `1px solid ${selectedDocs[d.key] ? 'var(--primary-border)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <input type="checkbox" checked={!!selectedDocs[d.key]} onChange={e => setSelectedDocs(p => ({ ...p, [d.key]: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{d.label}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDocModal(false)} style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={requestDocs} disabled={Object.values(selectedDocs).every(v => !v)} style={{
                flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                color: 'white', fontWeight: 600, fontSize: '0.8rem',
                opacity: Object.values(selectedDocs).every(v => !v) ? 0.4 : 1,
              }}>Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Small components ─────────────────────────────────────────────── */
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)',
      padding: '8px 10px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

function ActionBtn({ onClick, color, label }: { onClick: () => void; color: string; label: string }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
      background: color, color: 'white', fontWeight: 600, fontSize: '0.75rem',
      transition: 'opacity 0.15s',
    }}>
      {label}
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

/* ─── Sample data for simulation ───────────────────────────────────── */
const SAMPLE_PROPS = [
  { type: 'Apartment', address: 'Calle Serrano 84', city: 'Madrid', country: 'Spain', flag: '🇪🇸', sqm: 95, beds: 3, price: 720000, sellerName: 'C. García', sellerLang: 'ES', score: 91, wave: 1, reasons: ['Geo: Madrid centro', 'Premium price band', 'EN+ES owner'], description: 'Renovated piso in Salamanca district. Concierge, garage, balcony.', photos: 14 },
  { type: 'Villa', address: 'Praia da Marinha 7', city: 'Lagoa', country: 'Portugal', flag: '🇵🇹', sqm: 280, beds: 5, price: 1850000, sellerName: 'M. Costa', sellerLang: 'PT', score: 96, wave: 1, reasons: ['Algarve coast', 'Luxury segment', 'Foreign-buyer ready'], description: 'Cliff-top villa, infinity pool, 180° ocean view, 12 min to Carvoeiro.', photos: 22 },
  { type: 'Apartment', address: 'Bd Saint-Germain 142', city: 'Paris', country: 'France', flag: '🇫🇷', sqm: 78, beds: 2, price: 1290000, sellerName: 'L. Dubois', sellerLang: 'FR', score: 92, wave: 1, reasons: ['6e arrondissement', 'Prime price band', 'Move-in ready'], description: 'Haussmannien 4ème étage, parquet, cheminée, ascenseur.', photos: 11 },
  { type: 'Loft', address: 'Bergmannstr 11', city: 'Berlin', country: 'Germany', flag: '🇩🇪', sqm: 132, beds: 3, price: 695000, sellerName: 'S. Schneider', sellerLang: 'DE', score: 88, wave: 1, reasons: ['Kreuzberg loft', 'Investor-ready', 'Strong rental yield'], description: 'Industrial loft in Bergmannkiez, exposed brick, 4m ceilings.', photos: 18 },
  { type: 'Villa', address: 'Camí de Cala Comte 3', city: 'Ibiza', country: 'Spain', flag: '🇪🇸', sqm: 340, beds: 6, price: 4200000, sellerName: 'A. Marí', sellerLang: 'ES', score: 95, wave: 1, reasons: ['Sant Josep coastline', 'Ultra-luxury', 'Sunset-view plot'], description: 'Modernist villa, infinity pool, direct cala access, fully licensed.', photos: 28 },
];
