'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth, DEMO_MODE } from '@/store/auth';

const C = {
  bg:       '#F3F2EF',   // LinkedIn warm gray
  white:    '#FFFFFF',
  border:   '#E0DDD8',
  text:     '#191919',
  text2:    '#666666',
  text3:    '#999999',
  blue:     '#0A66C2',   // LinkedIn blue
  blueBg:   '#EEF3F8',
  blueDark: '#004182',
  green:    '#057642',
  greenBg:  '#F0FAF4',
  gold:     '#CA8A04',
  goldBg:   '#FEFCE8',
  purple:   '#7C3AED',
  purpleBg: '#F5F3FF',
  msgMe:    '#0A66C2',
  msgThem:  '#FFFFFF',
  shadow:   '0 0 0 1px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
};

interface Attachment { name: string; size: string; type: 'pdf'|'image'|'doc'|'other' }

interface Message {
  id: string;
  from: 'me'|'agency';
  text: string;
  time: string;
  attachments?: Attachment[];
  system?: boolean;
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
  status: 'active'|'subscribed'|'pending';
  messages: Message[];
}

const DEMO_CONTACTS: Contact[] = [
  {
    id:'c1', flag:'🇦🇹', name:'Magnus Realty GmbH', city:'Vienna', country:'Austria',
    score:94, wave:1, status:'active', time:'2h ago', unread:2, lastMsg:'Can you share the floor plan?',
    messages:[
      { id:'sys1', from:'me', text:'APEX outreach sent · Wave 1 · Score 94', time:'Apr 11, 09:43', system:true },
      { id:'m1', from:'agency', text:'Hello! We have qualified buyers looking for Belgrade apartments in this price range. Very interested.', time:'Apr 11, 11:20' },
      { id:'m2', from:'agency', text:'Can you share the floor plan and arrange a virtual tour? We represent clients from Austria and Germany.', time:'Apr 11, 13:45' },
    ],
  },
  {
    id:'c2', flag:'🇲🇪', name:'Adriatic Real Estate', city:'Podgorica', country:'Montenegro',
    score:91, wave:1, status:'active', time:'5h ago', unread:1, lastMsg:'Motivated buyer — €140K cash.',
    messages:[
      { id:'sys2', from:'me', text:'APEX outreach sent · Wave 1 · Score 91', time:'Apr 11, 09:43', system:true },
      { id:'m3', from:'agency', text:'We have a motivated buyer offering €140,000 cash. Quick close possible — 30 days.', time:'Apr 11, 10:12' },
    ],
  },
  {
    id:'c3', flag:'🇦🇹', name:'Euro Prime Properties', city:'Vienna', country:'Austria',
    score:88, wave:1, status:'active', time:'1d ago', unread:0, lastMsg:'Listing live — 50k monthly visitors.',
    messages:[
      { id:'sys3', from:'me', text:'APEX outreach sent · Wave 1 · Score 88', time:'Apr 10, 09:43', system:true },
      { id:'m4', from:'agency', text:'Professional photos received. Listing is live on our platform — 50k monthly visitors.', time:'Apr 10, 14:22' },
      { id:'m5', from:'me', text:'Thank you! Please keep me updated on any buyer interest.', time:'Apr 10, 16:30' },
      { id:'m6', from:'agency', text:'Of course! We typically close within 45–60 days for Serbian properties at this price point.', time:'Apr 10, 17:00',
        attachments:[{ name:'sales-report-Q1-2026.pdf', size:'1.2 MB', type:'pdf' }] },
    ],
  },
  {
    id:'c4', flag:'🇩🇪', name:'Berlin Invest Group', city:'Berlin', country:'Germany',
    score:85, wave:2, status:'active', time:'2d ago', unread:0, lastMsg:'Call set for Tuesday 14:00 CET.',
    messages:[
      { id:'sys4', from:'me', text:'APEX outreach sent · Wave 2 · Score 85', time:'Apr 9, 09:43', system:true },
      { id:'m7', from:'agency', text:'Our portfolio manager would like to discuss this property. Can we schedule a call for Tuesday 14:00 CET?', time:'Apr 9, 16:11' },
      { id:'m8', from:'me', text:'Tuesday 14:00 works perfectly. Looking forward to it.', time:'Apr 9, 18:44' },
    ],
  },
  {
    id:'c5', flag:'🇷🇸', name:'Beograd Properties d.o.o.', city:'Belgrade', country:'Serbia',
    score:87, wave:1, status:'subscribed', time:'6h ago', unread:0, lastMsg:'Documents attached for review.',
    messages:[
      { id:'sys5', from:'me', text:'APEX outreach sent · Wave 1 · Score 87', time:'Apr 11, 09:43', system:true },
      { id:'m9', from:'agency', text:'We reviewed your listing. Attaching due diligence notes for your review.', time:'Apr 11, 11:55',
        attachments:[{ name:'due-diligence-notes.pdf', size:'800 KB', type:'pdf' }, { name:'buyer-profile.docx', size:'240 KB', type:'doc' }] },
    ],
  },
];

function buildContacts(): Contact[] {
  try {
    const raw = localStorage.getItem('pb_wave_log');
    if (!raw) return DEMO_CONTACTS;
    const log: any[] = JSON.parse(raw);
    if (!log.length) return DEMO_CONTACTS;
    // Merge real wave log with demo contact details for first 5
    return log.map((entry, i) => {
      const demo = DEMO_CONTACTS[i];
      if (demo) return { ...demo, id: entry.id, name: entry.name, score: entry.score, wave: entry.wave };
      return {
        id: entry.id, flag:'🌍', name: entry.name, city:'', country:'',
        score: entry.score, wave: entry.wave, status:'active' as const,
        time: new Date(entry.sent_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}),
        unread: i < 2 ? 1 : 0, lastMsg:'Outreach sent — awaiting reply',
        messages:[{ id:`sys-${entry.id}`, from:'me' as const, text:`APEX outreach sent · Wave ${entry.wave} · Score ${entry.score}`, time: new Date(entry.sent_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}), system:true }],
      };
    });
  } catch { return DEMO_CONTACTS; }
}

function fileType(name: string): Attachment['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext==='pdf') return 'pdf';
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'image';
  if (['doc','docx','odt'].includes(ext)) return 'doc';
  return 'other';
}
function fileSize(b: number) { return b>=1e6 ? `${(b/1e6).toFixed(1)} MB` : `${Math.round(b/1000)} KB`; }

export default function ChatPage() {
  const { user } = useAuth();
  const [contacts, setContacts]   = useState<Contact[]>([]);
  const [activeId, setActiveId]   = useState<string|null>(null);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input,    setInput]      = useState('');
  const [atts,     setAtts]       = useState<Attachment[]>([]);
  const [search,   setSearch]     = useState('');
  const fileRef  = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const cts = DEMO_MODE ? DEMO_CONTACTS : buildContacts();
    setContacts(cts);
    if (cts.length) { setActiveId(cts[0].id); setMessages(cts[0].messages); }
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const active = contacts.find(c => c.id === activeId);
  const totalUnread = contacts.reduce((s,c) => s+c.unread, 0);
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()));

  function select(id: string) {
    const c = contacts.find(x=>x.id===id);
    if (!c) return;
    setActiveId(id); setMessages(c.messages);
    setContacts(p => p.map(x => x.id===id ? {...x,unread:0} : x));
  }

  function send() {
    if (!input.trim() && !atts.length) return;
    const msg: Message = { id:`m-${Date.now()}`, from:'me', text:input.trim(), time:'Just now', attachments:atts.length?[...atts]:undefined };
    const next = [...messages, msg];
    setMessages(next);
    setContacts(p => p.map(c => c.id===activeId ? {...c,messages:next,lastMsg:input||'Attachment',time:'Just now'} : c));
    setInput(''); setAtts([]);
  }

  function scoreColor(s?: number) { if(!s)return C.text3; return s>=90?C.green:s>=82?C.blue:C.gold; }
  function waveBg(w?: number) { return w===1?C.greenBg:w===2?C.blueBg:C.purpleBg; }
  function waveColor(w?: number) { return w===1?C.green:w===2?C.blue:C.purple; }

  return (
    <div style={{ display:'flex', height:'100vh', background:C.bg, fontFamily:"'Inter',-apple-system,system-ui,sans-serif", overflow:'hidden' }}>
      <style>{`
        .chat-input:focus{outline:none;}
        .send-btn:hover{background:${C.blueDark}!important;}
        .contact-row:hover{background:#ECEAE6;}
        .att-icon{font-size:1rem}
        @keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      `}</style>

      {/* ─────────── LEFT PANEL ─────────── */}
      <div style={{ width:320, minWidth:320, background:C.white, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'16px 16px 12px', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <h2 style={{ fontSize:'1rem', fontWeight:800, color:C.text, letterSpacing:'-0.01em', display:'flex', alignItems:'center', gap:8 }}>
                Messaging
                {totalUnread>0 && <span style={{ background:C.blue, color:C.white, fontSize:'0.62rem', fontWeight:700, padding:'1px 7px', borderRadius:99 }}>{totalUnread}</span>}
              </h2>
              <p style={{ fontSize:'0.72rem', color:C.text3, marginTop:2 }}>{contacts.length} agency contacts</p>
            </div>
            <div style={{ width:32, height:32, borderRadius:'50%', background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'1rem' }}>✏️</div>
          </div>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2" style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages" style={{ width:'100%', padding:'8px 10px 8px 32px', border:`1px solid ${C.border}`, borderRadius:20, fontSize:'0.8rem', background:C.bg, color:C.text, outline:'none', fontFamily:'inherit' }}/>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display:'flex', gap:8, padding:'10px 16px', borderBottom:`1px solid ${C.border}`, overflowX:'auto' }}>
          {['All','Wave 1','Wave 2','Wave 3'].map(f => (
            <span key={f} style={{ fontSize:'0.72rem', fontWeight:600, color:C.blue, background:C.blueBg, borderRadius:99, padding:'3px 12px', whiteSpace:'nowrap', cursor:'pointer', border:`1px solid ${C.border}` }}>{f}</span>
          ))}
        </div>

        {/* Contact list */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {filtered.map(c => (
            <div key={c.id} className="contact-row" onClick={() => select(c.id)} style={{
              padding:'12px 16px', cursor:'pointer',
              background: activeId===c.id ? C.bg : 'transparent',
              borderBottom:`1px solid ${C.border}`,
              borderLeft: activeId===c.id ? `3px solid ${C.blue}` : '3px solid transparent',
              transition:'all 0.12s',
            }}>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                {/* Avatar */}
                <div style={{ width:44, height:44, borderRadius:'50%', background: activeId===c.id ? C.blueBg : '#E9E5E0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0, position:'relative' }}>
                  {c.flag}
                  {/* Online dot */}
                  {c.unread>0 && <div style={{ position:'absolute', bottom:1, right:1, width:11, height:11, borderRadius:'50%', background:C.green, border:'2px solid #fff' }} />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:2 }}>
                    <span style={{ fontSize:'0.85rem', fontWeight: c.unread>0 ? 700 : 600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{c.name}</span>
                    <span style={{ fontSize:'0.65rem', color:C.text3, flexShrink:0, marginLeft:6 }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize:'0.74rem', color: c.unread>0 ? C.text : C.text2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:220, fontWeight: c.unread>0 ? 600 : 400, marginBottom:5 }}>
                    {c.lastMsg}
                  </div>
                  <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                    {c.score && <span style={{ fontSize:'0.62rem', fontWeight:800, color:scoreColor(c.score), background:`${scoreColor(c.score)}15`, padding:'1px 7px', borderRadius:4 }}>APEX {c.score}</span>}
                    {c.wave && <span style={{ fontSize:'0.62rem', fontWeight:700, color:waveColor(c.wave), background:waveBg(c.wave), padding:'1px 7px', borderRadius:4 }}>W{c.wave}</span>}
                    {c.unread>0 && <span style={{ marginLeft:'auto', background:C.blue, color:C.white, fontSize:'0.6rem', fontWeight:700, padding:'1px 6px', borderRadius:99 }}>{c.unread}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0 && (
            <div style={{ padding:'40px 16px', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:8 }}>💬</div>
              <p style={{ fontSize:'0.82rem', color:C.text3 }}>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* ─────────── RIGHT PANEL ─────────── */}
      {active ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, background:C.white }}>

          {/* Chat header — LinkedIn style */}
          <div style={{ padding:'12px 20px', borderBottom:`1px solid ${C.border}`, background:C.white, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', border:`1px solid ${C.border}` }}>
                {active.flag}
              </div>
              <div>
                <div style={{ fontSize:'0.95rem', fontWeight:700, color:C.text }}>{active.name}</div>
                <div style={{ fontSize:'0.74rem', color:C.text3, display:'flex', alignItems:'center', gap:6, marginTop:1 }}>
                  {active.city&&`${active.city}, `}{active.country}
                  {active.status==='active' && <span style={{ color:C.green }}>· In campaign</span>}
                  {active.status==='subscribed' && <span style={{ color:C.blue }}>· Agency subscriber</span>}
                </div>
              </div>
            </div>
            {/* Right: badges + actions */}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {active.score && <span style={{ fontSize:'0.68rem', fontWeight:800, color:scoreColor(active.score), background:`${scoreColor(active.score)}15`, padding:'4px 10px', borderRadius:6 }}>APEX {active.score}</span>}
              {active.wave && <span style={{ fontSize:'0.68rem', fontWeight:700, color:waveColor(active.wave), background:waveBg(active.wave), padding:'4px 10px', borderRadius:6 }}>Wave {active.wave}</span>}
              <div style={{ width:1, height:20, background:C.border, margin:'0 4px' }} />
              <button style={{ background:'none', border:`1px solid ${C.border}`, borderRadius:20, padding:'6px 14px', fontSize:'0.75rem', fontWeight:700, color:C.blue, cursor:'pointer' }}>View profile</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 60px', display:'flex', flexDirection:'column', gap:10, background:'#F9F9F9' }}>
            {messages.map((msg, i) => {
              if (msg.system) return (
                <div key={msg.id} style={{ textAlign:'center', margin:'8px 0' }}>
                  <span style={{ fontSize:'0.68rem', color:C.text3, background:C.bg, border:`1px solid ${C.border}`, borderRadius:99, padding:'3px 14px', display:'inline-flex', alignItems:'center', gap:6 }}>
                    <span>📡</span> {msg.text} · {msg.time}
                  </span>
                </div>
              );
              const isMe = msg.from==='me';
              return (
                <div key={msg.id} style={{ display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start', animation:'msgIn 0.2s ease both', animationDelay:`${i*0.02}s` }}>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-end', flexDirection: isMe ? 'row-reverse' : 'row', maxWidth:'72%' }}>
                    {!isMe && (
                      <div style={{ width:36, height:36, borderRadius:'50%', background:'#E9E5E0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0, marginBottom:4 }}>
                        {active.flag}
                      </div>
                    )}
                    <div>
                      {!isMe && i===0 && <div style={{ fontSize:'0.72rem', fontWeight:700, color:C.text2, marginBottom:4 }}>{active.name}</div>}
                      <div style={{
                        padding:'10px 14px',
                        borderRadius: isMe ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                        background: isMe ? C.msgMe : C.msgThem,
                        color: isMe ? C.white : C.text,
                        fontSize:'0.875rem', lineHeight:1.55,
                        boxShadow: isMe ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                        border: isMe ? 'none' : `1px solid ${C.border}`,
                      }}>
                        {msg.text}
                      </div>
                      {/* Attachments */}
                      {msg.attachments?.map((att, j) => (
                        <div key={j} style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', marginTop:6, cursor:'pointer', transition:'all 0.15s', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                          <span className="att-icon">{att.type==='pdf'?'📄':att.type==='image'?'🖼️':'📝'}</span>
                          <div>
                            <div style={{ fontSize:'0.75rem', fontWeight:600, color:C.text }}>{att.name}</div>
                            <div style={{ fontSize:'0.65rem', color:C.text3 }}>{att.size}</div>
                          </div>
                          <span style={{ fontSize:'0.7rem', color:C.blue, fontWeight:600 }}>⬇</span>
                        </div>
                      ))}
                      <div style={{ fontSize:'0.65rem', color:C.text3, marginTop:4, textAlign: isMe ? 'right' : 'left' }}>{msg.time}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Attachment preview bar */}
          {atts.length>0 && (
            <div style={{ padding:'8px 20px', background:C.white, borderTop:`1px solid ${C.border}`, display:'flex', flexWrap:'wrap', gap:8 }}>
              {atts.map((att,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, padding:'5px 10px', fontSize:'0.75rem', color:C.text2 }}>
                  <span>{att.type==='pdf'?'📄':att.type==='image'?'🖼️':'📝'}</span>
                  <span>{att.name}</span>
                  <button onClick={()=>setAtts(a=>a.filter((_,j)=>j!==i))} style={{ background:'none',border:'none',cursor:'pointer',color:C.text3,fontSize:'1rem',padding:0,lineHeight:1 }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Input bar — LinkedIn style */}
          <div style={{ padding:'12px 20px 16px', background:C.white, borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end', background:C.bg, border:`1px solid ${C.border}`, borderRadius:24, padding:'8px 8px 8px 16px' }}>
              <textarea
                ref={textRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
                placeholder={`Write a message…`}
                rows={1}
                className="chat-input"
                style={{ flex:1, border:'none', background:'transparent', fontSize:'0.875rem', color:C.text, fontFamily:'inherit', lineHeight:1.5, resize:'none', maxHeight:100, overflowY:'auto', padding:'4px 0' }}
              />
              <div style={{ display:'flex', gap:4, alignItems:'center', flexShrink:0 }}>
                {/* Attach */}
                <input ref={fileRef} type="file" multiple style={{ display:'none' }} onChange={e=>{ const files=e.target.files; if(!files)return; setAtts(p=>[...p,...Array.from(files).map(f=>({name:f.name,size:fileSize(f.size),type:fileType(f.name)}))]); }}/>
                <button onClick={()=>fileRef.current?.click()} style={{ width:36,height:36,borderRadius:'50%',border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',color:C.text3 }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=C.bg;}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                {/* Emoji */}
                <button style={{ width:36,height:36,borderRadius:'50%',border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',color:C.text3 }}>🙂</button>
                {/* Send */}
                <button onClick={send} disabled={!input.trim()&&!atts.length} className="send-btn" style={{ width:36,height:36,borderRadius:'50%',border:'none',background: (input.trim()||atts.length) ? C.blue : C.border, cursor:(input.trim()||atts.length)?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',flexShrink:0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'center', marginTop:8 }}>
              <span style={{ fontSize:'0.65rem', color:C.text3 }}>Press Enter to send · Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, background:'#F9F9F9' }}>
          <div style={{ fontSize:'3rem' }}>💬</div>
          <p style={{ fontSize:'1rem', fontWeight:700, color:C.text }}>Select a conversation</p>
          <p style={{ fontSize:'0.82rem', color:C.text3, maxWidth:280, textAlign:'center', lineHeight:1.6 }}>
            Choose an agency from the list to start messaging
          </p>
        </div>
      )}
    </div>
  );
}
