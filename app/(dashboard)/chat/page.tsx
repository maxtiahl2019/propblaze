'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth, DEMO_MODE } from '@/store/auth';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       '#F8FAFC',
  white:    '#FFFFFF',
  border:   '#E2E8F0',
  text:     '#0F172A',
  text2:    '#475569',
  text3:    '#94A3B8',
  green:    '#16A34A',
  greenBg:  '#DCFCE7',
  blue:     '#2563EB',
  blueBg:   '#EFF6FF',
  purple:   '#7C3AED',
  purpleBg: '#F3E8FF',
  gold:     '#CA8A04',
  goldBg:   '#FEF9C3',
  red:      '#DC2626',
  shadow:   '0 1px 4px rgba(0,0,0,0.07)',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Attachment {
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
  url?: string;
}

interface Message {
  id: string;
  from: 'me' | 'agency';
  text: string;
  time: string;
  attachments?: Attachment[];
  read?: boolean;
}

interface Contact {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  score?: number;
  wave?: number;
  lastMsg: string;
  time: string;
  unread: number;
  status: 'active' | 'pending' | 'subscribed';
  messages: Message[];
}

// ─── Demo contacts (from wave log or subscribed agencies) ─────────────────────
const DEMO_CONTACTS: Contact[] = [
  {
    id: 'c1', flag: '🇦🇹', name: 'Magnus Realty GmbH', city: 'Vienna', country: 'Austria',
    score: 94, wave: 1, status: 'active',
    time: '2h ago', unread: 2, lastMsg: 'Can you share the floor plan?',
    messages: [
      { id: 'm1', from: 'agency', text: 'Hello! We have qualified buyers looking for Belgrade apartments in this price range. Very interested in this listing.', time: '3h ago' },
      { id: 'm2', from: 'agency', text: 'Can you share the floor plan and arrange a virtual tour? We represent clients from Austria and Germany.', time: '2h ago' },
    ],
  },
  {
    id: 'c2', flag: '🇲🇪', name: 'Adriatic Real Estate', city: 'Podgorica', country: 'Montenegro',
    score: 91, wave: 1, status: 'active',
    time: '5h ago', unread: 1, lastMsg: 'Motivated buyer — €140K cash offer.',
    messages: [
      { id: 'm3', from: 'agency', text: 'We have a motivated buyer offering €140,000 cash. Quick close possible — 30 days. Owner direct contact preferred.', time: '5h ago' },
    ],
  },
  {
    id: 'c3', flag: '🇦🇹', name: 'Euro Prime Properties', city: 'Vienna', country: 'Austria',
    score: 88, wave: 1, status: 'active',
    time: '1d ago', unread: 0, lastMsg: 'Listing live on our platform. 50k monthly visitors.',
    messages: [
      { id: 'm4', from: 'agency', text: 'Professional photos received. Listing is going live today on our platform (50k monthly visitors).', time: '1d ago' },
      { id: 'm5', from: 'me', text: 'Great, thank you! Please keep me updated on any buyer interest.', time: '22h ago' },
      { id: 'm6', from: 'agency', text: 'Of course! We typically close within 45–60 days for Serbian properties at this price point. I\'m attaching our recent sales report.', time: '20h ago',
        attachments: [{ name: 'sales-report-Q1-2026.pdf', size: '1.2 MB', type: 'pdf' }] },
    ],
  },
  {
    id: 'c4', flag: '🇩🇪', name: 'Berlin Invest Group', city: 'Berlin', country: 'Germany',
    score: 85, wave: 2, status: 'active',
    time: '2d ago', unread: 0, lastMsg: 'Call set for Tuesday 14:00 CET.',
    messages: [
      { id: 'm7', from: 'agency', text: 'We have set up a call for Tuesday 14:00 CET. Our investor portfolio manager will discuss the property directly.', time: '2d ago' },
      { id: 'm8', from: 'me', text: 'Tuesday 14:00 works. Looking forward to the call.', time: '2d ago' },
    ],
  },
  {
    id: 'c5', flag: '🇷🇸', name: 'Beograd Properties', city: 'Belgrade', country: 'Serbia',
    score: 87, wave: 1, status: 'subscribed',
    time: '6h ago', unread: 0, lastMsg: 'Documents sent. Awaiting your review.',
    messages: [
      { id: 'm9', from: 'agency', text: 'We received your listing. Our team reviewed and attached due diligence documents for your review.', time: '6h ago',
        attachments: [{ name: 'due-diligence-notes.pdf', size: '800 KB', type: 'pdf' }, { name: 'buyer-profile.docx', size: '240 KB', type: 'doc' }] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fileType(name: string): Attachment['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['jpg','jpeg','png','gif','webp','heic'].includes(ext)) return 'image';
  if (['doc','docx','odt'].includes(ext)) return 'doc';
  return 'other';
}

function fileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes/1_000_000).toFixed(1)} MB`;
  return `${Math.round(bytes/1000)} KB`;
}

function AttachmentIcon({ type }: { type: Attachment['type'] }) {
  if (type === 'pdf')   return <span style={{ fontSize: '1.1rem' }}>📄</span>;
  if (type === 'image') return <span style={{ fontSize: '1.1rem' }}>🖼️</span>;
  if (type === 'doc')   return <span style={{ fontSize: '1.1rem' }}>📝</span>;
  return <span style={{ fontSize: '1.1rem' }}>📎</span>;
}

function ScoreBadge({ score, wave }: { score?: number; wave?: number }) {
  if (!score) return null;
  const [color, bg] = score >= 92 ? [C.green, C.greenBg] : score >= 85 ? [C.blue, C.blueBg] : [C.gold, C.goldBg];
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      <span style={{ fontSize: '0.63rem', fontWeight: 800, color, background: bg, padding: '2px 7px', borderRadius: 5 }}>
        APEX {score}
      </span>
      {wave && (
        <span style={{ fontSize: '0.63rem', fontWeight: 700, color: C.purple, background: C.purpleBg, padding: '2px 7px', borderRadius: 5 }}>
          Wave {wave}
        </span>
      )}
    </div>
  );
}

// ─── Build contacts from real wave log or use DEMO ────────────────────────────
function buildContacts(): Contact[] {
  try {
    const raw = localStorage.getItem('pb_wave_log');
    if (!raw) return DEMO_CONTACTS;
    const log: any[] = JSON.parse(raw);
    if (!log.length) return DEMO_CONTACTS;
    // For real data: create a contact stub per agency, use DEMO messages for the first few
    return log.map((entry, i) => ({
      id: entry.id,
      flag: '🌍',
      name: entry.name,
      city: '',
      country: '',
      score: entry.score,
      wave: entry.wave,
      status: 'active' as const,
      time: entry.sent_at ? new Date(entry.sent_at).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : 'recently',
      unread: i < 2 ? 1 : 0,
      lastMsg: 'Outreach sent — awaiting reply',
      messages: [
        { id: `${entry.id}-sys`, from: 'me' as const, text: `APEX outreach sent to ${entry.name} (Wave ${entry.wave}, score ${entry.score})`, time: entry.sent_at ? new Date(entry.sent_at).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : 'recently' },
      ],
    }));
  } catch {
    return DEMO_CONTACTS;
  }
}

// ─── Attachment pill ─────────────────────────────────────────────────────────
function AttachPill({ att }: { att: Attachment }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', marginTop: 6 }}>
      <AttachmentIcon type={att.type} />
      <div>
        <div style={{ fontSize: '0.74rem', fontWeight: 600, color: C.text }}>{att.name}</div>
        <div style={{ fontSize: '0.65rem', color: C.text3 }}>{att.size}</div>
      </div>
      <button style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', color: C.text3, fontSize: '0.7rem', padding: '2px 6px', borderRadius: 5, transition: 'all 0.15s' }}>⬇</button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cts = DEMO_MODE ? DEMO_CONTACTS : buildContacts();
    setContacts(cts);
    if (cts.length) {
      setActiveId(cts[0].id);
      setMessages(cts[0].messages);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const active = contacts.find(c => c.id === activeId);

  function selectContact(id: string) {
    const c = contacts.find(x => x.id === id);
    if (!c) return;
    setActiveId(id);
    setMessages(c.messages);
    // Clear unread
    setContacts(prev => prev.map(x => x.id === id ? { ...x, unread: 0 } : x));
  }

  function sendMessage() {
    if (!input.trim() && !attachments.length) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      from: 'me',
      text: input.trim(),
      time: 'Just now',
      attachments: attachments.length ? [...attachments] : undefined,
    };
    const newMsgs = [...messages, msg];
    setMessages(newMsgs);
    setContacts(prev => prev.map(c => c.id === activeId
      ? { ...c, messages: newMsgs, lastMsg: input || 'Attachment sent', time: 'Just now' }
      : c
    ));
    setInput('');
    setAttachments([]);
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newAtts: Attachment[] = Array.from(files).map(f => ({
      name: f.name,
      size: fileSize(f.size),
      type: fileType(f.name),
      url: URL.createObjectURL(f),
    }));
    setAttachments(prev => [...prev, ...newAtts]);
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  return (
    <div style={{ display: 'flex', height: '100vh', background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", overflow: 'hidden' }}>

      {/* ── LEFT: Contacts sidebar ─────────────────────────────────────── */}
      <div style={{ width: 300, minWidth: 300, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', background: C.white }}>
        {/* Header */}
        <div style={{ padding: '18px 16px 12px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: C.text, letterSpacing: '-0.01em' }}>
                Messages
                {totalUnread > 0 && (
                  <span style={{ marginLeft: 8, background: C.green, color: C.white, fontSize: '0.65rem', fontWeight: 700, padding: '1px 7px', borderRadius: 99 }}>{totalUnread}</span>
                )}
              </h2>
              <p style={{ fontSize: '0.72rem', color: C.text3, marginTop: 2 }}>{contacts.length} agencies in your campaigns</p>
            </div>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search agencies…"
              style={{ width: '100%', padding: '8px 10px 8px 32px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: '0.8rem', background: C.bg, color: C.text, outline: 'none' }}
            />
          </div>
        </div>

        {/* Contacts list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => selectContact(c.id)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: activeId === c.id ? C.blueBg : 'transparent',
                borderLeft: activeId === c.id ? `3px solid ${C.blue}` : '3px solid transparent',
                borderBottom: `1px solid ${C.border}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (activeId !== c.id) (e.currentTarget as HTMLDivElement).style.background = C.bg; }}
              onMouseLeave={e => { if (activeId !== c.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {/* Avatar */}
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: activeId === c.id ? C.blue : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                  {c.flag}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{c.name}</span>
                    <span style={{ fontSize: '0.65rem', color: C.text3, flexShrink: 0 }}>{c.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                    <span style={{ fontSize: '0.74rem', color: C.text3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>{c.lastMsg}</span>
                    {c.unread > 0 && (
                      <span style={{ background: C.green, color: C.white, fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: 99, flexShrink: 0 }}>{c.unread}</span>
                    )}
                  </div>
                  <div style={{ marginTop: 5 }}>
                    <ScoreBadge score={c.score} wave={c.wave} />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
              <p style={{ fontSize: '0.8rem', color: C.text3 }}>No agencies found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Chat panel ──────────────────────────────────────────── */}
      {active ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Chat header */}
          <div style={{ padding: '14px 24px', borderBottom: `1px solid ${C.border}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                {active.flag}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: C.text }}>{active.name}</div>
                <div style={{ fontSize: '0.72rem', color: C.text3 }}>
                  {active.city}{active.city && ', '}{active.country}
                  {active.status === 'active' && ' · In your campaign'}
                  {active.status === 'subscribed' && ' · Agency subscriber'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ScoreBadge score={active.score} wave={active.wave} />
              {/* Status dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.greenBg, border: `1px solid rgba(22,163,74,0.2)`, borderRadius: 100, padding: '4px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: C.green }}>Active</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '72%' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.from === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.from === 'me' ? C.blue : C.white,
                    color: msg.from === 'me' ? C.white : C.text,
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    border: msg.from === 'agency' ? `1px solid ${C.border}` : 'none',
                    boxShadow: C.shadow,
                  }}>
                    {msg.text}
                  </div>
                  {msg.attachments?.map((att, i) => (
                    <AttachPill key={i} att={att} />
                  ))}
                  <div style={{ fontSize: '0.65rem', color: C.text3, marginTop: 4, textAlign: msg.from === 'me' ? 'right' : 'left' }}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div style={{ padding: '8px 24px', borderTop: `1px solid ${C.border}`, background: C.white, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {attachments.map((att, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', fontSize: '0.75rem', color: C.text2 }}>
                  <AttachmentIcon type={att.type} />
                  <span>{att.name}</span>
                  <span style={{ color: C.text3 }}>({att.size})</span>
                  <button onClick={() => setAttachments(a => a.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text3, fontSize: '0.9rem', padding: 0, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div style={{ padding: '12px 24px 16px', borderTop: `1px solid ${C.border}`, background: C.white, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            {/* Attach button */}
            <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.blueBg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.bg; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>

            {/* Text input */}
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Message ${active.name}…`}
              rows={1}
              style={{
                flex: 1, padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 12,
                fontSize: '0.875rem', color: C.text, background: C.bg, outline: 'none', resize: 'none',
                fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = C.blue; }}
              onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
            />

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() && !attachments.length}
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: input.trim() || attachments.length ? C.blue : C.bg,
                border: 'none', cursor: input.trim() || attachments.length ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() || attachments.length ? C.white : C.text3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: '3rem' }}>💬</div>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: C.text }}>No conversations yet</p>
          <p style={{ fontSize: '0.82rem', color: C.text3, maxWidth: 300, textAlign: 'center', lineHeight: 1.6 }}>
            Agencies contacted via APEX distribution can message you here. Run your first campaign to get started.
          </p>
        </div>
      )}
    </div>
  );
}
