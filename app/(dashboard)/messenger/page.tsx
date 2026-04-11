'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DEMO_MODE } from '@/store/auth';

const C = {
  bg: '#F8FAFC', white: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  green: '#16A34A', greenBg: '#DCFCE7',
  blue: '#3B5BDB', blueBg: '#EFF6FF',
  yellow: '#CA8A04', yellowBg: '#FEF9C3',
  red: '#DC2626',
};

// ─── Types ─────────────────────────────────────────────────────────────────
interface Thread {
  id: string; flag: string; name: string; city: string; country: string;
  time: string; unread: number; lastMsg: string; property: string;
  email: string; phone?: string; website?: string; specialization: string;
  messages: { from: 'agency' | 'me'; text: string; time: string }[];
  score?: number;
  wave?: number;
  realContact?: boolean; // true = from real pb_wave_log, false = demo
}

// ─── Demo threads (shown in DEMO_MODE only) ────────────────────────────────
const DEMO_THREADS: Thread[] = [
  {
    id: 't1', flag: '🇦🇹', name: 'Magnus Realty GmbH', city: 'Vienna', country: 'Austria',
    time: '2h ago', unread: 2, wave: 1, score: 94,
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
    time: '5h ago', unread: 1, wave: 1, score: 91,
    property: 'Apt · Belgrade', lastMsg: 'We have a motivated buyer offering €140,000 cash.',
    email: 'contact@adriatic-re.me', phone: '+382 20 123 456', website: 'adriatic-re.me',
    specialization: 'Residential · Serbia · Montenegro',
    messages: [
      { from: 'agency', text: 'Hello! We have a motivated buyer offering €140,000 cash. Quick close possible — 30 days. Owner direct contact preferred.', time: '5h ago' },
    ],
  },
  {
    id: 't3', flag: '🇦🇹', name: 'Euro Prime Properties', city: 'Vienna', country: 'Austria',
    time: '1d ago', unread: 0, wave: 1, score: 88,
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
    time: '2d ago', unread: 0, wave: 2, score: 85,
    property: 'Apt · Belgrade', lastMsg: 'We have set up a call for Tuesday 14:00 CET.',
    email: 'deals@berlin-invest.de', phone: '+49 30 111 2222', website: 'berlin-invest.de',
    specialization: 'Investment · Portfolio · SEE',
    messages: [
      { from: 'agency', text: 'We have set up a call for next Tuesday 14:00 CET. Our investor portfolio manager will discuss the property directly.', time: '2d ago' },
      { from: 'me', text: 'Tuesday 14:00 works. Looking forward to the call.', time: '2d ago' },
    ],
  },
];

// ─── Flag from agency ID ────────────────────────────────────────────────────
function flagFromId(id: string): string {
  const prefix = id?.split('-')[0] ?? '';
  const map: Record<string,string> = {
    me: '🇲🇪', rs: '🇷🇸', at: '🇦🇹', de: '🇩🇪',
    gb: '🇬🇧', fr: '🇫🇷', pt: '🇵🇹', es: '🇪🇸',
    hr: '🇭🇷', si: '🇸🇮', ba: '🇧🇦', sk: '🇸🇰',
    cz: '🇨🇿', bg: '🇧🇬', ro: '🇷🇴', pl: '🇵🇱',
  };
  return map[prefix] ?? '🏢';
}

// ─── Build threads from real pb_wave_log ────────────────────────────────────
function buildRealThreads(): Thread[] {
  try {
    const raw = localStorage.getItem('pb_wave_log');
    if (!raw) return [];
    const log: Array<{ id: string; name: string; email: string; wave: number; score: number; sent_at: string }> = JSON.parse(raw);
    const propRaw = localStorage.getItem('pb_wizard_props');
    let propLabel = 'Your property';
    if (propRaw) {
      const props = JSON.parse(propRaw);
      if (props.length > 0) {
        const p = props[0];
        propLabel = [p.type, p.city].filter(Boolean).join(' · ') || 'Your property';
      }
    }

    return log.map(entry => {
      const timeAgo = (() => {
        const diff = Date.now() - new Date(entry.sent_at).getTime();
        const h = Math.floor(diff / 3600000);
        const d = Math.floor(h / 24);
        return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : 'Just now';
      })();

      return {
        id: entry.id,
        flag: flagFromId(entry.id),
        name: entry.name,
        city: '',
        country: '',
        time: timeAgo,
        unread: 0,
        lastMsg: 'Outreach sent — awaiting reply',
        property: propLabel,
        email: entry.email,
        specialization: `Wave ${entry.wave} · Score ${entry.score}`,
        score: entry.score,
        wave: entry.wave,
        realContact: true,
        messages: [],
      };
    });
  } catch {
    return [];
  }
}

// ─── Thread detail view ────────────────────────────────────────────────────
function ThreadView({ thread, onBack }: { thread: Thread; onBack: () => void }) {
  const [replyText, setReplyText] = useState('');
  const [localMessages, setLocalMessages] = useState(thread.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const sendReply = () => {
    if (!replyText.trim()) return;
    setLocalMessages(m => [...m, { from: 'me', text: replyText, time: 'Just now' }]);
    setReplyText('');
  };

  // Real contact — no inbox messages, just direct email UI
  if (thread.realContact) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.text2, fontSize: 22, cursor: 'pointer', padding: '4px 6px', lineHeight: 1 }}>←</button>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{thread.flag}</div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>{thread.name}</div>
            <div style={{ fontSize: '0.72rem', color: C.text3 }}>Wave {thread.wave} · APEX score {thread.score} · {thread.property}</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Info card */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Agency details</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, marginBottom: 4 }}>{thread.name}</div>
            <div style={{ fontSize: '0.8rem', color: C.text3, marginBottom: 14 }}>{thread.specialization}</div>
            <a href={`mailto:${thread.email}`} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: C.blueBg, borderRadius: 10, textDecoration: 'none',
              fontSize: '0.85rem', color: C.blue, fontWeight: 600,
            }}>✉️ {thread.email}</a>
          </div>

          {/* Status */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400E', marginBottom: 6 }}>📬 Outreach delivered · Awaiting reply</div>
            <p style={{ fontSize: '0.82rem', color: '#78350F', lineHeight: 1.6, margin: 0 }}>
              Your personalised email was sent to <strong>{thread.name}</strong>. When they reply, the message will land directly in your inbox at <strong>contact@win-winsolution.com</strong>.
            </p>
            <a href={`mailto:${thread.email}?subject=Re: Property listing - follow up`}
              style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', background: C.yellow, border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, color: '#fff', textDecoration: 'none', cursor: 'pointer' }}>
              Follow up manually →
            </a>
          </div>

          {/* AI draft */}
          <div style={{ background: C.blueBg, border: '1px solid rgba(59,91,219,0.18)', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: C.blue, marginBottom: 8 }}>🤖 AI follow-up suggestion</div>
            <p style={{ fontSize: '0.82rem', color: C.blue, lineHeight: 1.6, margin: '0 0 10px', opacity: 0.85 }}>
              "Dear {thread.name.split(' ')[0]} team, I wanted to follow up on my property listing sent a few days ago. Please let me know if you have any questions or interested buyers."
            </p>
            <a href={`mailto:${thread.email}?subject=Follow up: property listing&body=Dear ${encodeURIComponent(thread.name.split(' ')[0])} team,%0A%0AI wanted to follow up on my property listing sent a few days ago.%0A%0APlease let me know if you have any questions or interested buyers.%0A%0ABest regards`}
              style={{ display: 'inline-block', padding: '6px 14px', background: C.blue, borderRadius: 7, fontSize: '0.75rem', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
              Open in email client
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Demo thread — full chat UI
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif", display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.text2, fontSize: 22, cursor: 'pointer', padding: '4px 6px', lineHeight: 1 }}>←</button>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{thread.flag}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>{thread.name}</div>
          <div style={{ fontSize: '0.72rem', color: C.text3 }}>{thread.city}{thread.country ? `, ${thread.country}` : ''} · {thread.property}</div>
        </div>
        {thread.email && <a href={`mailto:${thread.email}`} style={{ fontSize: '0.72rem', color: C.blue, textDecoration: 'none', border: `1px solid rgba(59,91,219,0.2)`, padding: '4px 10px', borderRadius: 7 }}>✉️ Email</a>}
      </div>

      {/* Contact info */}
      <div style={{ background: C.white, margin: '12px 16px 0', borderRadius: 12, border: `1px solid ${C.border}`, padding: '12px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: thread.phone ? '1fr 1fr' : '1fr', gap: 6 }}>
          <a href={`mailto:${thread.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, textDecoration: 'none', fontSize: '0.72rem', color: C.blue, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
            <span>✉️</span> {thread.email}
          </a>
          {thread.phone && <a href={`tel:${thread.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, textDecoration: 'none', fontSize: '0.72rem', color: C.green, fontWeight: 600 }}>
            <span>📞</span> {thread.phone}
          </a>}
        </div>
        <div style={{ marginTop: 6, fontSize: '0.68rem', color: C.text3, textAlign: 'center' as const }}>
          Replies forwarded automatically to your email
        </div>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingBottom: 160 }}>
        {localMessages.map((msg, i) => (
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
              <div style={{ fontSize: '0.65rem', color: C.text3, marginTop: 4, textAlign: msg.from === 'me' ? 'right' as const : 'left' as const }}>{msg.time}</div>
            </div>
          </div>
        ))}

        {/* AI suggestion */}
        <div style={{ padding: '13px 15px', borderRadius: 12, background: C.blueBg, border: 'solid 1px rgba(59,91,219,0.15)', marginTop: 4 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.blue, marginBottom: 6 }}>🤖 AI suggested reply</div>
          <p style={{ fontSize: '0.83rem', color: C.blue, lineHeight: 1.5, margin: '0 0 10px', opacity: 0.85 }}>
            "Thank you for reaching out. I can share the floor plan and schedule a virtual tour. What time works best for your clients?"
          </p>
          <button onClick={() => setReplyText("Thank you for reaching out. I can share the floor plan and schedule a virtual tour. What time works best for your clients?")}
            style={{ fontSize: '0.72rem', fontWeight: 700, color: C.white, background: C.blue, border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
            Use this reply
          </button>
        </div>

        <div ref={bottomRef} style={{ height: 100 }} />
      </div>

      {/* Reply bar */}
      <div style={{ position: 'fixed', bottom: 'calc(60px + env(safe-area-inset-bottom,0px))', left: 0, right: 0, padding: '12px 16px', background: C.white, borderTop: `1px solid ${C.border}`, boxShadow: '0 -2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: 760, margin: '0 auto' }}>
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply…"
            rows={replyText.includes('\n') || replyText.length > 60 ? 3 : 1}
            style={{ flex: 1, padding: '13px 16px', borderRadius: 14, background: C.bg, border: `1px solid ${C.border}`, color: C.text, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5, minHeight: 48 }}
            onFocus={e => (e.target.style.borderColor = C.green)} onBlur={e => (e.target.style.borderColor = C.border)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
          />
          <button onClick={sendReply} style={{ width: 52, height: 52, borderRadius: 26, background: replyText.trim() ? C.green : '#CBD5E1', border: 'none', color: C.white, fontWeight: 900, fontSize: 22, cursor: replyText.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main list ─────────────────────────────────────────────────────────────
export default function MessengerPage() {
  const [selected, setSelected] = useState<Thread | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (DEMO_MODE) {
      setThreads(DEMO_THREADS);
    } else {
      setThreads(buildRealThreads());
    }
  }, []);

  if (selected) return <ThreadView thread={selected} onBack={() => setSelected(null)} />;

  const totalUnread = threads.filter(t => !t.realContact).reduce((s, t) => s + t.unread, 0);
  const hasContacts = threads.length > 0;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>

        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem,5vw,1.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4, color: C.text }}>
            💬 Messages
          </h1>
          <p style={{ fontSize: '0.85rem', color: C.text3 }}>
            {totalUnread > 0
              ? `${totalUnread} unread — agency conversations`
              : hasContacts
              ? `${threads.length} agencies contacted`
              : 'No campaigns sent yet'}
          </p>
        </div>

        {/* Real mode info banner */}
        {!DEMO_MODE && hasContacts && (
          <div style={{ background: C.greenBg, border: `1px solid rgba(22,163,74,0.2)`, borderRadius: 12, padding: '13px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: '0.82rem', color: C.green, lineHeight: 1.5, margin: 0 }}>
              📨 <strong>Replies come to your email.</strong> When an agency replies to your outreach, the message lands in your inbox automatically. Use the thread below to follow up directly.
            </p>
          </div>
        )}

        {/* Demo mode: unread banner */}
        {DEMO_MODE && totalUnread > 0 && (
          <div style={{ background: C.greenBg, border: `1px solid rgba(22,163,74,0.2)`, borderRadius: 12, padding: '13px 16px', marginBottom: 16 }}>
            <p style={{ fontSize: '0.82rem', color: C.green, lineHeight: 1.5, margin: 0 }}>
              🤖 <strong>Demo:</strong> Agency replies are forwarded to <strong>contact@win-winsolution.com</strong> — you never miss a message.
            </p>
          </div>
        )}

        {/* Empty state — no campaign run yet */}
        {!hasContacts && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: C.white, borderRadius: 18, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
            <h3 style={{ fontWeight: 800, color: C.text, marginBottom: 8 }}>No agencies contacted yet</h3>
            <p style={{ fontSize: '0.85rem', color: C.text3, maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Once you run your first distribution campaign, all contacted agencies will appear here. Replies come directly to your email.
            </p>
            <a href="/properties" style={{ display: 'inline-block', padding: '12px 24px', background: C.green, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
              List a property →
            </a>
          </div>
        )}

        {/* Thread list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {threads.map(thread => {
            const isUnread = !thread.realContact && thread.unread > 0;
            const isReal = thread.realContact;
            return (
              <div key={thread.id} onClick={() => setSelected(thread)} style={{
                background: C.white,
                border: `1px solid ${isUnread ? 'rgba(202,138,4,0.35)' : C.border}`,
                borderLeft: `4px solid ${isUnread ? C.yellow : isReal ? '#CBD5E1' : C.border}`,
                borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.15s, transform 0.12s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: isUnread ? '#FEF9C3' : C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {thread.flag}
                    </div>
                    {isUnread && (
                      <div style={{ position: 'absolute', top: -5, right: -5, width: 22, height: 22, borderRadius: '50%', background: C.yellow, color: '#fff', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.white}` }}>
                        {thread.unread}
                      </div>
                    )}
                    {isReal && (
                      <div style={{ position: 'absolute', top: -5, right: -5, width: 22, height: 22, borderRadius: '50%', background: '#E2E8F0', color: C.text3, fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.white}` }}>
                        W{thread.wave}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: isUnread ? 800 : 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {thread.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: C.text3, flexShrink: 0 }}>{thread.time}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 5, flexWrap: 'wrap' as const }}>
                      {thread.score && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: C.blue, background: C.blueBg, padding: '2px 7px', borderRadius: 5 }}>APEX {thread.score}</span>}
                      <span style={{ fontSize: '0.65rem', color: C.text3, background: C.bg, padding: '2px 7px', borderRadius: 5 }}>{thread.property}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: isUnread ? C.text : C.text3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, fontWeight: isUnread ? 600 : 400 }}>
                      {isReal ? '📬 Outreach sent — awaiting reply' : thread.lastMsg}
                    </p>
                  </div>

                  <div style={{ color: C.text3, fontSize: 18, flexShrink: 0, lineHeight: 1, paddingTop: 2 }}>›</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
