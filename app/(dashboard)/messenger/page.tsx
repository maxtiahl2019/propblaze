'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n/LangContext';

const D = {
  bg: '#10101E', surface: 'rgba(255,255,255,0.07)', surface2: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.10)', border2: 'rgba(255,255,255,0.22)',
  yellow: '#F5C200', green: '#22C55E', red: '#EF4444', blue: '#3B5BDB',
  white: '#FFFFFF',
  w80: 'rgba(255,255,255,0.88)', w60: 'rgba(255,255,255,0.68)',
  w40: 'rgba(255,255,255,0.48)', w20: 'rgba(255,255,255,0.28)',
};

interface Thread {
  id: string; flag: string; name: string; city: string;
  time: string; unread: number; lastMsg: string; property: string;
  messages: { from: 'agency' | 'me'; text: string; time: string }[];
}

const THREADS: Thread[] = [
  {
    id: 't1', flag: '🇦🇹', name: 'Magnus Realty GmbH', city: 'Vienna', time: '2h ago', unread: 2,
    property: 'Apt · Belgrade', lastMsg: 'Can you share the floor plan and arrange a virtual tour?',
    messages: [
      { from: 'agency', text: 'Dear owner, we have several qualified buyers looking for Belgrade apartments in this price range.', time: '3h ago' },
      { from: 'agency', text: 'Can you share the floor plan and arrange a virtual tour? We represent clients from Austria and Germany.', time: '2h ago' },
    ],
  },
  {
    id: 't2', flag: '🇲🇪', name: 'Adriatic Real Estate', city: 'Podgorica', time: '5h ago', unread: 1,
    property: 'Apt · Belgrade', lastMsg: 'We have a motivated buyer offering €140,000 cash.',
    messages: [
      { from: 'agency', text: 'Hello! We have a motivated buyer offering €140,000 cash. Quick close possible — 30 days. Owner direct contact preferred. Please call us at your earliest convenience.', time: '5h ago' },
    ],
  },
  {
    id: 't3', flag: '🇦🇹', name: 'Euro Prime Properties', city: 'Vienna', time: '1d ago', unread: 0,
    property: 'Apt · Belgrade', lastMsg: 'Listing is going live today on our platform.',
    messages: [
      { from: 'agency', text: 'Professional photos received. Listing is going live today on our platform (50k monthly visitors).', time: '1d ago' },
      { from: 'me', text: 'Great, thank you! Please keep me updated on any buyer interest.', time: '22h ago' },
      { from: 'agency', text: 'Of course! We typically close within 45-60 days for Serbian properties at this price point.', time: '20h ago' },
    ],
  },
  {
    id: 't4', flag: '🇩🇪', name: 'Berlin Invest Group', city: 'Berlin', time: '2d ago', unread: 0,
    property: 'Apt · Belgrade', lastMsg: 'We have set up a call for Tuesday 14:00 CET.',
    messages: [
      { from: 'agency', text: 'We have set up a call for next Tuesday 14:00 CET. Our investor portfolio manager will discuss the property directly. Please confirm availability.', time: '2d ago' },
      { from: 'me', text: 'Tuesday 14:00 works. Looking forward to the call.', time: '2d ago' },
    ],
  },
];

export default function MessengerPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Thread | null>(null);
  const totalUnread = THREADS.reduce((s, th) => s + th.unread, 0);

  if (selected) {
    return (
      <div style={{ background: D.bg, minHeight: '100vh', color: D.white, fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>
        {/* Thread header */}
        <div style={{ background: 'rgba(13,13,26,0.95)', borderBottom: `1px solid ${D.border}`, padding: 'clamp(12px,3vw,16px) clamp(16px,4vw,24px)', display: 'flex', alignItems: 'center', gap: 12, backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: D.w60, fontSize: 22, cursor: 'pointer', padding: '4px', flexShrink: 0 }}>←</button>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: D.surface2, border: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{selected.flag}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: D.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</div>
            <div style={{ fontSize: '0.72rem', color: D.w40 }}>{selected.city} · {selected.property}</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: 'clamp(12px,3vw,20px) clamp(16px,4vw,24px)', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 100 }}>
          {selected.messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '80%' }}>
                <div style={{
                  padding: '12px 15px', borderRadius: msg.from === 'me' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.from === 'me' ? 'linear-gradient(135deg,#F5C200,#FF8C00)' : D.surface2,
                  color: msg.from === 'me' ? '#080810' : D.w80,
                  fontSize: '0.875rem', lineHeight: 1.55, fontWeight: msg.from === 'me' ? 600 : 400,
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.65rem', color: D.w20, marginTop: 4, textAlign: msg.from === 'me' ? 'right' : 'left' }}>{msg.time}</div>
              </div>
            </div>
          ))}

          {/* AI suggestion */}
          <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(59,91,219,0.08)', border: '1px solid rgba(59,91,219,0.18)', marginTop: 8 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#93c5fd', marginBottom: 6 }}>🤖 AI suggested reply</div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(147,197,253,0.75)', lineHeight: 1.5, margin: 0 }}>
              "Thank you for reaching out. I can share the floor plan and schedule a virtual tour. What time works best for your clients?"
            </p>
          </div>
        </div>

        {/* Reply bar */}
        <div style={{ position: 'fixed', bottom: 'calc(60px + env(safe-area-inset-bottom,0px))', left: 0, right: 0, padding: '10px 16px', background: 'rgba(8,8,16,0.97)', borderTop: `1px solid ${D.border}`, backdropFilter: 'blur(20px)', display: 'flex', gap: 10 }}>
          <input placeholder={t('messenger.placeholder')} style={{ flex: 1, padding: '12px 16px', borderRadius: 22, background: D.surface2, border: `1px solid ${D.border2}`, color: D.white, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
          <button style={{ width: 46, height: 46, borderRadius: 23, background: 'linear-gradient(135deg,#F5C200,#FF8C00)', border: 'none', color: '#080810', fontWeight: 900, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↑</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: D.bg, minHeight: '100vh', color: D.white, fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            💬 {t('messenger.title')}
          </h1>
          <p style={{ fontSize: '0.85rem', color: D.w40 }}>
            {totalUnread > 0 ? `${totalUnread} ${t('messenger.unread')}` : t('messenger.all')}
          </p>
        </div>

        {totalUnread > 0 && (
          <div style={{ background: 'rgba(245,194,0,0.07)', border: '1px solid rgba(245,194,0,0.22)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
            <p style={{ fontSize: '0.8rem', color: 'rgba(245,194,0,0.85)', lineHeight: 1.5, margin: 0 }}>
              All replies are also forwarded to <strong>contact@win-winsolution.com</strong> so you never miss a message.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {THREADS.map(thread => (
            <div key={thread.id} onClick={() => setSelected(thread)} style={{
              background: thread.unread > 0 ? 'rgba(245,194,0,0.04)' : D.surface,
              border: `1px solid ${thread.unread > 0 ? 'rgba(245,194,0,0.2)' : D.border}`,
              borderLeft: `3px solid ${thread.unread > 0 ? D.yellow : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 14, padding: '13px 15px', cursor: 'pointer',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: D.surface2, border: `1px solid ${D.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{thread.flag}</div>
                {thread.unread > 0 && (
                  <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: D.red, borderRadius: 99, border: '2px solid #080810', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: D.white }}>{thread.unread}</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: thread.unread > 0 ? 700 : 600, color: thread.unread > 0 ? D.yellow : D.w80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{thread.name}</span>
                  <span style={{ fontSize: '0.68rem', color: D.w40, flexShrink: 0 }}>{thread.time}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: D.w40, marginBottom: 3 }}>{thread.property}</div>
                <div style={{ fontSize: '0.78rem', color: thread.unread > 0 ? D.w60 : D.w40, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.lastMsg}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
