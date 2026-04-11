'use client';

import React, { useState } from 'react';

const C = {
  bg: '#F8FAFC', white: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  green: '#16A34A', greenBg: '#DCFCE7',
  blue: '#3B5BDB', blueBg: '#EFF6FF',
  yellow: '#CA8A04', yellowBg: '#FEF9C3',
  red: '#DC2626',
  purple: '#7C3AED', purpleBg: '#F3E8FF',
};

interface Thread {
  id: string; flag: string; name: string; city: string; country: string;
  time: string; unread: number; lastMsg: string; property: string;
  email: string; phone: string; website: string; specialization: string;
  messages: { from: 'agency' | 'me'; text: string; time: string }[];
}

const THREADS: Thread[] = [
  {
    id: 't1', flag: '🇦🇹', name: 'Magnus Realty GmbH', city: 'Vienna', country: 'Austria',
    time: '2h ago', unread: 2,
    property: 'Apt · Belgrade', lastMsg: 'Can you share the floor plan and arrange a virtual tour?',
    email: 'info@magnus-realty.at', phone: '+43 1 234 5678', website: 'magnus-realty.at',
    specialization: 'Residential · Eastern Europe',
    messages: [
      { from: 'agency', text: 'Dear owner, we have several qualified buyers looking for Belgrade apartments in this price range.', time: '3h ago' },
      { from: 'agency', text: 'Can you share the floor plan and arrange a virtual tour? We represent clients from Austria and Germany.', time: '2h ago' },
    ],
  },
  {
    id: 't2', flag: '🇲🇪', name: 'Adriatic Real Estate', city: 'Podgorica', country: 'Montenegro',
    time: '5h ago', unread: 1,
    property: 'Apt · Belgrade', lastMsg: 'We have a motivated buyer offering €140,000 cash.',
    email: 'contact@adriatic-re.me', phone: '+382 20 123 456', website: 'adriatic-re.me',
    specialization: 'Residential · Serbia · Montenegro',
    messages: [
      { from: 'agency', text: 'Hello! We have a motivated buyer offering €140,000 cash. Quick close possible — 30 days. Owner direct contact preferred.', time: '5h ago' },
    ],
  },
  {
    id: 't3', flag: '🇦🇹', name: 'Euro Prime Properties', city: 'Vienna', country: 'Austria',
    time: '1d ago', unread: 0,
    property: 'Apt · Belgrade', lastMsg: 'Listing is going live today on our platform.',
    email: 'listings@europrime.at', phone: '+43 1 987 6543', website: 'europrime.at',
    specialization: 'Luxury · Investment · Balkans',
    messages: [
      { from: 'agency', text: 'Professional photos received. Listing is going live today on our platform (50k monthly visitors).', time: '1d ago' },
      { from: 'me', text: 'Great, thank you! Please keep me updated on any buyer interest.', time: '22h ago' },
      { from: 'agency', text: 'Of course! We typically close within 45-60 days for Serbian properties at this price point.', time: '20h ago' },
    ],
  },
  {
    id: 't4', flag: '🇩🇪', name: 'Berlin Invest Group', city: 'Berlin', country: 'Germany',
    time: '2d ago', unread: 0,
    property: 'Apt · Belgrade', lastMsg: 'We have set up a call for Tuesday 14:00 CET.',
    email: 'deals@berlin-invest.de', phone: '+49 30 111 2222', website: 'berlin-invest.de',
    specialization: 'Investment · Portfolio · SEE',
    messages: [
      { from: 'agency', text: 'We have set up a call for next Tuesday 14:00 CET. Our investor portfolio manager will discuss the property directly.', time: '2d ago' },
      { from: 'me', text: 'Tuesday 14:00 works. Looking forward to the call.', time: '2d ago' },
    ],
  },
];

export default function MessengerPage() {
  const [selected, setSelected] = useState<Thread | null>(null);
  const [replyText, setReplyText] = useState('');
  const totalUnread = THREADS.reduce((s, th) => s + th.unread, 0);

  if (selected) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>

        {/* Thread header */}
        <div style={{
          background: C.white, borderBottom: `1px solid ${C.border}`,
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: C.text2, fontSize: 22, cursor: 'pointer', padding: '4px 6px', flexShrink: 0, lineHeight: 1 }}>←</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{selected.flag}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{selected.name}</div>
            <div style={{ fontSize: '0.72rem', color: C.text3 }}>{selected.city}, {selected.country} · {selected.property}</div>
          </div>
        </div>

        {/* Agency contact card */}
        <div style={{
          background: C.white, margin: '12px 16px 0', borderRadius: 12,
          border: `1px solid ${C.border}`, padding: '12px 16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.blueBg, border: `1px solid rgba(59,91,219,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{selected.flag}</div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: C.text }}>{selected.name}</div>
              <div style={{ fontSize: '0.7rem', color: C.text3 }}>{selected.specialization}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <a href={`mailto:${selected.email}`} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
              borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`,
              textDecoration: 'none', fontSize: '0.72rem', color: C.blue, fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
            }}>
              <span>✉️</span> {selected.email}
            </a>
            <a href={`tel:${selected.phone}`} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
              borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`,
              textDecoration: 'none', fontSize: '0.72rem', color: C.green, fontWeight: 600,
            }}>
              <span>📞</span> {selected.phone}
            </a>
          </div>
          <div style={{ marginTop: 6, fontSize: '0.68rem', color: C.text3, textAlign: 'center' as const }}>
            All replies are also forwarded to <strong>contact@win-winsolution.com</strong>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 160 }}>
          {selected.messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '82%' }}>
                <div style={{
                  padding: '13px 16px',
                  borderRadius: msg.from === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.from === 'me' ? C.green : C.white,
                  border: msg.from === 'me' ? 'none' : `1px solid ${C.border}`,
                  color: msg.from === 'me' ? C.white : C.text,
                  fontSize: '0.875rem', lineHeight: 1.6,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.65rem', color: C.text3, marginTop: 4, textAlign: msg.from === 'me' ? 'right' : 'left' }}>{msg.time}</div>
              </div>
            </div>
          ))}

          {/* AI suggestion */}
          <div style={{ padding: '13px 15px', borderRadius: 12, background: C.blueBg, border: `1px solid rgba(59,91,219,0.15)`, marginTop: 4 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.blue, marginBottom: 6 }}>🤖 AI suggested reply</div>
            <p style={{ fontSize: '0.83rem', color: C.blue, lineHeight: 1.5, margin: '0 0 10px', opacity: 0.85 }}>
              "Thank you for reaching out. I can share the floor plan and schedule a virtual tour. What time works best for your clients?"
            </p>
            <button
              onClick={() => setReplyText("Thank you for reaching out. I can share the floor plan and schedule a virtual tour. What time works best for your clients?")}
              style={{ fontSize: '0.72rem', fontWeight: 700, color: C.white, background: C.blue, border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
            >
              Use this reply
            </button>
          </div>

          <div style={{ height: 100 }} />
        </div>

        {/* Reply bar */}
        <div style={{
          position: 'fixed', bottom: 'calc(60px + env(safe-area-inset-bottom,0px))',
          left: 0, right: 0, padding: '12px 16px',
          background: C.white, borderTop: `1px solid ${C.border}`,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: 760, margin: '0 auto' }}>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Type your reply…"
              rows={replyText.includes('\n') || replyText.length > 60 ? 3 : 1}
              style={{
                flex: 1, padding: '13px 16px',
                borderRadius: 14, background: C.bg,
                border: `1px solid ${C.border}`, color: C.text,
                fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
                resize: 'none', lineHeight: 1.5, minHeight: 48,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = C.green)}
              onBlur={e => (e.target.style.borderColor = C.border)}
            />
            <button
              onClick={() => setReplyText('')}
              style={{
                width: 52, height: 52, borderRadius: 26,
                background: replyText.trim() ? C.green : '#CBD5E1',
                border: 'none', color: C.white,
                fontWeight: 900, fontSize: 22, cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.15s',
                boxShadow: replyText.trim() ? '0 2px 8px rgba(22,163,74,0.35)' : 'none',
              }}
            >↑</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Thread list ──────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4, color: C.text }}>
            💬 Messages
          </h1>
          <p style={{ fontSize: '0.85rem', color: C.text3 }}>
            {totalUnread > 0 ? `${totalUnread} unread — agency conversations` : 'All agency conversations'}
          </p>
        </div>

        {totalUnread > 0 && (
          <div style={{ background: C.greenBg, border: `1px solid rgba(22,163,74,0.2)`, borderRadius: 12, padding: '13px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
            <p style={{ fontSize: '0.82rem', color: C.green, lineHeight: 1.5, margin: 0 }}>
              All agency replies are forwarded to <strong>contact@win-winsolution.com</strong> — you never miss a message.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {THREADS.map(thread => (
            <div
              key={thread.id}
              onClick={() => setSelected(thread)}
              style={{
                background: C.white,
                border: `1px solid ${thread.unread > 0 ? 'rgba(202,138,4,0.35)' : C.border}`,
                borderLeft: `4px solid ${thread.unread > 0 ? C.yellow : C.border}`,
                borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.15s, transform 0.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Flag avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: thread.unread > 0 ? C.yellowBg : C.bg,
                    border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>
                    {thread.flag}
                  </div>
                  {thread.unread > 0 && (
                    <div style={{
                      position: 'absolute', top: -5, right: -5,
                      minWidth: 20, height: 20,
                      background: C.red, borderRadius: 99, border: `2px solid ${C.white}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.62rem', fontWeight: 800, color: C.white, padding: '0 4px',
                    }}>
                      {thread.unread}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{
                      fontSize: '0.95rem', fontWeight: thread.unread > 0 ? 800 : 600,
                      color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                      flex: 1, marginRight: 10,
                    }}>
                      {thread.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: C.text3, flexShrink: 0 }}>{thread.time}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: C.text3, marginBottom: 5 }}>
                    {thread.city}, {thread.country} · <span style={{ color: C.blue, fontWeight: 600 }}>{thread.property}</span>
                  </div>
                  <div style={{
                    fontSize: '0.83rem', lineHeight: 1.4,
                    color: thread.unread > 0 ? C.text2 : C.text3,
                    fontWeight: thread.unread > 0 ? 500 : 400,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                  }}>
                    {thread.lastMsg}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ color: C.text3, fontSize: 18, flexShrink: 0, alignSelf: 'center' }}>›</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
}
