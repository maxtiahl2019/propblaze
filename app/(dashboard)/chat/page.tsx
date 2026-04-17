'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Types ────────────────────────────────────────────────────────── */
interface ThreadSummary {
  offerId: string;
  lastMessage: { id: string; from: string; text: string; at: string };
  messageCount: number;
  unread: number;
  offer: {
    ref: string; type: string; city: string; country: string;
    flag: string; price: number; status: string; photoUrl?: string;
  } | null;
}
interface Msg {
  id: string; offerId: string;
  from: 'agency' | 'owner' | 'seller';
  text: string; at: string;
}

/* ─── Colors ──────────────────────────────────────────────────────── */
const C = {
  bg: '#F8FAFC', white: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  blue: '#3B82F6', blueLight: '#EFF6FF', blueDark: '#1D4ED8',
  green: '#16A34A', greenLight: '#F0FDF4',
  orange: '#F97316', orangeLight: '#FFF7ED',
};

/* ═══════════════════════════════════════════════════════════════════ */
export default function OwnerChatPage() {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const chatEnd = useRef<HTMLDivElement>(null);

  /* ── Poll thread list ─────────────────────────────────────────── */
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch('/api/agency-chat?listAll=1', { cache: 'no-store' });
        const j = await r.json();
        if (!stop && j.threads) {
          setThreads(j.threads);
          // Auto-select first thread if none selected
          if (!activeId && j.threads.length > 0) {
            setActiveId(j.threads[0].offerId);
          }
        }
      } catch { /* noop */ }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { stop = true; clearInterval(id); };
  }, [activeId]);

  /* ── Poll active thread messages ──────────────────────────────── */
  const lastTsRef = useRef('');
  useEffect(() => {
    if (!activeId) { setMsgs([]); return; }
    setMsgs([]); lastTsRef.current = '';
    let stop = false;
    const load = async () => {
      const since = lastTsRef.current;
      const url = since
        ? `/api/agency-chat?offerId=${activeId}&since=${encodeURIComponent(since)}`
        : `/api/agency-chat?offerId=${activeId}`;
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
        if (j.serverTime) lastTsRef.current = j.serverTime;
      } catch { /* noop */ }
    };
    load();
    const id = setInterval(load, 2000);
    return () => { stop = true; clearInterval(id); };
  }, [activeId]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  /* ── Send message as owner ────────────────────────────────────── */
  const send = useCallback(async () => {
    if (!draft.trim() || !activeId || sending) return;
    setSending(true);
    const text = draft.trim();
    setDraft('');
    try {
      const r = await fetch('/api/agency-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: activeId, text, from: 'owner' }),
      });
      const j = await r.json();
      if (j.messages) {
        setMsgs(prev => {
          const seen = new Set(prev.map(m => m.id));
          return [...prev, ...j.messages.filter((m: Msg) => !seen.has(m.id))];
        });
      }
    } catch { /* noop */ }
    finally { setSending(false); }
  }, [draft, activeId, sending]);

  /* ── Derived ──────────────────────────────────────────────────── */
  const activeThread = threads.find(t => t.offerId === activeId);
  const filtered = threads.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (t.offer?.city?.toLowerCase().includes(q)) ||
      (t.offer?.type?.toLowerCase().includes(q)) ||
      (t.offer?.ref?.toLowerCase().includes(q)) ||
      (t.lastMessage?.text?.toLowerCase().includes(q))
    );
  });
  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  /* ═══ Render ════════════════════════════════════════════════════ */
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: C.bg, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <style>{`
        .oc-row:hover{background:${C.blueLight}!important}
        .oc-input:focus{outline:none;border-color:${C.blue}}
        @keyframes ocFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      `}</style>

      {/* ── LEFT: Thread list ─────────────────────────────────────── */}
      <div style={{ width: 340, minWidth: 340, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: C.text, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              Messages
              {totalUnread > 0 && (
                <span style={{ background: C.orange, color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{totalUnread}</span>
              )}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
              <span style={{ fontSize: '0.68rem', color: C.green, fontWeight: 600 }}>Live</span>
            </div>
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="oc-input"
            style={{ width: '100%', padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 12, fontSize: '0.8rem', background: C.bg, color: C.text, fontFamily: 'inherit' }}
          />
        </div>

        {/* Thread list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: '0.82rem', color: C.text3 }}>
                {threads.length === 0 ? 'No conversations yet. Agencies will appear here after APEX distribution.' : 'No matches found'}
              </div>
            </div>
          )}
          {filtered.map(t => {
            const sel = activeId === t.offerId;
            const offer = t.offer;
            const isAgencyLast = t.lastMessage?.from === 'agency';
            return (
              <div key={t.offerId} className="oc-row" onClick={() => setActiveId(t.offerId)} style={{
                padding: '14px 18px', cursor: 'pointer',
                background: sel ? C.blueLight : 'transparent',
                borderBottom: `1px solid ${C.border}`,
                borderLeft: `3px solid ${sel ? C.blue : 'transparent'}`,
                transition: 'all 0.12s',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {/* Property thumb */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                    background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {offer?.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={offer.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.4rem' }}>{offer?.flag || '🏠'}</span>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: C.text }}>
                        {offer?.flag} {offer?.type || 'Property'} · {offer?.city || ''}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: C.text3, flexShrink: 0 }}>{timeAgo(t.lastMessage?.at)}</span>
                    </div>
                    <div style={{
                      fontSize: '0.75rem', color: isAgencyLast ? C.text : C.text2,
                      fontWeight: isAgencyLast ? 600 : 400,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4,
                    }}>
                      {t.lastMessage?.from === 'owner' ? 'You: ' : 'Agency: '}{t.lastMessage?.text}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {offer && (
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: C.text2, background: '#F1F5F9', padding: '1px 8px', borderRadius: 4 }}>€{offer.price.toLocaleString()}</span>
                      )}
                      {offer?.status && (
                        <span style={{
                          fontSize: '0.58rem', fontWeight: 700, padding: '1px 8px', borderRadius: 4,
                          background: offer.status === 'new' ? C.orangeLight : offer.status === 'closed' ? C.greenLight : C.blueLight,
                          color: offer.status === 'new' ? C.orange : offer.status === 'closed' ? C.green : C.blue,
                        }}>{offer.status}</span>
                      )}
                      {isAgencyLast && t.unread > 0 && (
                        <span style={{ marginLeft: 'auto', background: C.orange, color: 'white', fontSize: '0.58rem', fontWeight: 700, padding: '1px 7px', borderRadius: 20 }}>new</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Chat ───────────────────────────────────────────── */}
      {activeThread ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.white }}>
          {/* Chat header */}
          <div style={{ padding: '14px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {activeThread.offer?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeThread.offer.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.2rem' }}>{activeThread.offer?.flag || '🏠'}</span>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text }}>
                  {activeThread.offer?.flag} {activeThread.offer?.type} · {activeThread.offer?.city}
                </div>
                <div style={{ fontSize: '0.72rem', color: C.text3 }}>
                  Ref {activeThread.offer?.ref} · €{activeThread.offer?.price?.toLocaleString()} · {activeThread.messageCount} messages
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', fontWeight: 600, color: C.green, background: C.greenLight, border: `1px solid #BBF7D0`, borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} /> Live sync
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 40px', display: 'flex', flexDirection: 'column', gap: 10, background: '#FAFBFC' }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: 'center', color: C.text3, fontSize: '0.82rem', padding: '60px 0' }}>Loading messages...</div>
            )}
            {msgs.map((m, i) => {
              const isOwner = m.from === 'owner' || m.from === 'seller';
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: isOwner ? 'flex-end' : 'flex-start', animation: 'ocFade 0.2s ease both' }}>
                  <div style={{
                    maxWidth: '70%', borderRadius: 16, padding: '12px 16px', fontSize: '0.82rem', lineHeight: 1.55,
                    ...(isOwner
                      ? { background: 'linear-gradient(135deg, #16A34A, #15803D)', color: 'white', borderBottomRightRadius: 4 }
                      : { background: 'white', color: C.text, border: `1px solid ${C.border}`, borderBottomLeftRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }),
                  }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 600, marginBottom: 3, opacity: 0.7 }}>
                      {isOwner ? 'You (owner)' : 'Agency'}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                    <div style={{ fontSize: '0.58rem', opacity: 0.5, marginTop: 4, textAlign: 'right' }}>{formatTime(m.at)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEnd} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 20px 16px', borderTop: `1px solid ${C.border}`, background: C.white }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Reply to agency..."
                rows={1}
                className="oc-input"
                style={{
                  flex: 1, padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: 14,
                  background: C.bg, fontSize: '0.82rem', color: C.text, fontFamily: 'inherit',
                  lineHeight: 1.5, resize: 'none', maxHeight: 100, overflowY: 'auto',
                }}
              />
              <button onClick={send} disabled={!draft.trim() || sending} style={{
                width: 44, height: 44, borderRadius: 12, border: 'none', flexShrink: 0,
                background: (draft.trim() && !sending) ? 'linear-gradient(135deg, #16A34A, #15803D)' : '#E2E8F0',
                cursor: (draft.trim() && !sending) ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <span style={{ fontSize: '0.62rem', color: C.text3 }}>Enter to send · Shift+Enter for new line · Messages sync live with agency dashboard</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#FAFBFC' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: C.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>💬</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: C.text }}>Your Agency Conversations</div>
          <div style={{ fontSize: '0.82rem', color: C.text3, maxWidth: 340, textAlign: 'center', lineHeight: 1.6 }}>
            Messages from agencies that received your property via APEX distribution will appear here. Both sides see the same conversation in real-time.
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────── */
function timeAgo(iso?: string): string {
  if (!iso) return '';
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return 'now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}
