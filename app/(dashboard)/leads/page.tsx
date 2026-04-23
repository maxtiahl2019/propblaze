'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const C = {
  bg: '#F8FAFC', white: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', text2: '#475569', text3: '#94A3B8',
  green: '#16A34A', greenBg: '#DCFCE7',
  blue: '#3B5BDB', blueBg: '#EFF6FF',
  yellow: '#CA8A04', yellowBg: '#FEF9C3',
  orange: '#EA580C', orangeBg: '#FFF7ED',
  red: '#DC2626', redBg: '#FEF2F2',
  purple: '#7C3AED', purpleBg: '#EDE9FE',
};

interface WaveEntry {
  id: string; name: string; email: string; wave: 1 | 2 | 3;
  score: number; sent_at: string;
}

const WAVE_META: Record<number, { color: string; bg: string; label: string }> = {
  1: { color: C.green,  bg: C.greenBg,  label: 'Wave 1' },
  2: { color: C.blue,   bg: C.blueBg,   label: 'Wave 2' },
  3: { color: C.purple, bg: C.purpleBg, label: 'Wave 3' },
};

const COUNTRY_FLAGS: Record<string, string> = {
  me: '🇲🇪', rs: '🇷🇸', at: '🇦🇹', de: '🇩🇪', ch: '🇨🇭',
  gb: '🇬🇧', nl: '🇳🇱', hr: '🇭🇷', gr: '🇬🇷', it: '🇮🇹',
  fr: '🇫🇷', pl: '🇵🇱', si: '🇸🇮', ae: '🇦🇪', cy: '🇨🇾',
  ru: '🇷🇺', ua: '🇺🇦', ba: '🇧🇦', mk: '🇲🇰', se: '🇸🇪',
};

function flagFromId(id: string): string {
  const m = id.match(/^([a-z]{2})-/i);
  return m ? (COUNTRY_FLAGS[m[1].toLowerCase()] ?? '🏢') : '🏢';
}

function scoreColor(score: number): string {
  if (score >= 85) return C.green;
  if (score >= 70) return C.yellow;
  return C.orange;
}

/* ─── Demo seed (shown when no real campaign data exists yet) ─────────── */
const DEMO_SEED: WaveEntry[] = (() => {
  const now = Date.now();
  return [
    { id:'rs-cityexpert-001', name:'CityExpert Serbia',     email:'listings@cityexpert.rs',     wave:1, score:94, sent_at: new Date(now - 2*3600_000).toISOString() },
    { id:'rs-knightfrank-001',name:'Knight Frank Serbia',   email:'belgrade@knightfrank.com',   wave:1, score:92, sent_at: new Date(now - 3*3600_000).toISOString() },
    { id:'rs-colliers-001',   name:'Colliers Serbia',       email:'info@colliers.rs',           wave:1, score:91, sent_at: new Date(now - 5*3600_000).toISOString() },
    { id:'at-magnus-001',     name:'Magnus Realty GmbH',    email:'info@magnus-realty.at',      wave:1, score:89, sent_at: new Date(now - 7*3600_000).toISOString() },
    { id:'de-berlin-001',     name:'Berlin Invest Group',   email:'deals@berlin-invest.de',     wave:1, score:87, sent_at: new Date(now - 26*3600_000).toISOString() },
    { id:'me-adriatic-001',   name:'Adriatic Real Estate',  email:'contact@adriatic-re.me',     wave:1, score:85, sent_at: new Date(now - 28*3600_000).toISOString() },
    { id:'ch-zurich-001',     name:'Zürich Real Estate AG', email:'info@zurich-re.ch',          wave:2, score:83, sent_at: new Date(now - 50*3600_000).toISOString() },
    { id:'at-vienna-001',     name:'Vienna City Homes',     email:'office@viennacityhomes.at',  wave:2, score:81, sent_at: new Date(now - 52*3600_000).toISOString() },
    { id:'nl-amsterdam-001',  name:'Amsterdam Invest NL',   email:'info@amsterdaminvest.nl',    wave:3, score:78, sent_at: new Date(now - 72*3600_000).toISOString() },
    { id:'fr-paris-001',      name:'Paris Premium Realty',  email:'contact@parispremium.fr',    wave:3, score:75, sent_at: new Date(now - 74*3600_000).toISOString() },
  ];
})();

export default function LeadsPage() {
  const [waveLog, setWaveLog] = useState<WaveEntry[]>([]);
  const [filter,  setFilter]  = useState<string>('All');
  const [selected, setSelected] = useState<WaveEntry | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pb_wave_log');
      if (raw) {
        const parsed: WaveEntry[] = JSON.parse(raw);
        setWaveLog(parsed.length > 0 ? parsed : DEMO_SEED);
      } else {
        // No campaign data yet — show demo seed so dashboard feels alive
        setWaveLog(DEMO_SEED);
      }
    } catch {
      setWaveLog(DEMO_SEED);
    }
  }, []);

  const activewaves = ([1, 2, 3] as const).filter(w => waveLog.some(e => e.wave === w));
  const filtered = filter === 'All' ? waveLog : waveLog.filter(e => String(e.wave) === filter);

  /* ─── Detail view ─────────────────────────────────────── */
  if (selected) {
    const wm = WAVE_META[selected.wave];
    const sc = scoreColor(selected.score);
    return (
      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ maxWidth: 620, margin: '0 auto', padding: 'clamp(16px,4vw,28px)' }}>
          <button onClick={() => setSelected(null)} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:C.text2, fontSize:'0.875rem', fontWeight:600, cursor:'pointer', marginBottom:20, padding:0 }}>
            ← Back to list
          </button>

          {/* Agency card */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px', marginBottom:14, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:16 }}>
              <div style={{ width:52, height:52, borderRadius:14, background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
                {flagFromId(selected.id)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'1rem', fontWeight:700, color:C.text, marginBottom:3 }}>{selected.name}</div>
                <div style={{ fontSize:'0.8rem', color:C.text3 }}>{selected.email}</div>
              </div>
              <span style={{ padding:'4px 12px', borderRadius:99, fontSize:'0.72rem', fontWeight:700, background:wm.bg, color:wm.color, flexShrink:0 }}>{wm.label}</span>
            </div>

            {/* Stats row */}
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              {[
                { label:'APEX Score', value:`${selected.score}`, sub:'/100', color:sc, bg:sc === C.green ? C.greenBg : sc === C.yellow ? C.yellowBg : C.orangeBg },
                { label:'Wave',       value:`Wave ${selected.wave}`, sub:'', color:wm.color, bg:wm.bg },
                { label:'Sent',       value: selected.sent_at ? new Date(selected.sent_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—', sub:'', color:C.text2, bg:C.bg },
              ].map(s => (
                <div key={s.label} style={{ flex:1, padding:'10px 8px', borderRadius:10, background:s.bg, border:`1px solid ${C.border}`, textAlign:'center' as const }}>
                  <div style={{ fontSize:'0.9rem', fontWeight:700, color:s.color }}>{s.value}<span style={{ fontSize:'0.7rem', fontWeight:400 }}>{s.sub}</span></div>
                  <div style={{ fontSize:'0.62rem', color:C.text3, marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Status banner */}
            <div style={{ background:C.yellowBg, border:`1px solid rgba(202,138,4,0.25)`, borderRadius:12, padding:'12px 14px', marginBottom:16 }}>
              <p style={{ fontSize:'0.8rem', color:C.yellow, lineHeight:1.6, margin:0, fontWeight:500 }}>
                📧 <strong>Email sent.</strong> Waiting for agency reply — responses arrive in your inbox. Reply within 24 h to maximise conversion.
              </p>
            </div>

            {/* Actions */}
            <a href={`mailto:${selected.email}?subject=Follow-up: property listing`} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, background:C.green, color:C.white, fontWeight:700, fontSize:'0.875rem', textDecoration:'none', marginBottom:8 }}>
              ✉️ Follow Up by Email
            </a>
            <Link href="/messenger" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:12, background:C.blueBg, border:`1px solid rgba(59,91,219,0.2)`, color:C.blue, fontWeight:700, fontSize:'0.875rem', textDecoration:'none' }}>
              💬 Open Messages
            </Link>
          </div>

          {/* AI insight */}
          <div style={{ padding:'14px 16px', borderRadius:14, background:C.blueBg, border:`1px solid rgba(59,91,219,0.15)` }}>
            <div style={{ display:'flex', gap:10 }}>
              <span style={{ fontSize:18, flexShrink:0 }}>🤖</span>
              <p style={{ fontSize:'0.8rem', color:C.blue, lineHeight:1.6, margin:0 }}>
                <strong>APEX Score {selected.score}/100</strong> — {
                  selected.score >= 88 ? 'Top-tier match. Very high conversion probability. Prioritise this agency.' :
                  selected.score >= 75 ? 'Strong match. Good buyer network fit. Recommended for follow-up.' :
                  'Qualified match. Engaged in your target market. Follow up recommended.'
                }
              </p>
            </div>
          </div>
          <div style={{ height:40 }} />
        </div>
      </div>
    );
  }

  /* ─── Empty state ─────────────────────────────────────── */
  if (waveLog.length === 0) {
    return (
      <div style={{ background:C.bg, minHeight:'100vh', fontFamily:"'Inter',system-ui,sans-serif" }}>
        <div style={{ maxWidth:620, margin:'0 auto', padding:'clamp(16px,4vw,28px)' }}>
          <div style={{ marginBottom:20 }}>
            <h1 style={{ fontSize:'clamp(1.3rem,5vw,1.5rem)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:4, color:C.text }}>Agency Contacts</h1>
            <p style={{ fontSize:'0.85rem', color:C.text3 }}>All agencies reached by your APEX campaign</p>
          </div>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'56px 24px', textAlign:'center' as const }}>
            <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📭</div>
            <div style={{ fontSize:'1rem', fontWeight:700, color:C.text, marginBottom:6 }}>No campaign data yet</div>
            <p style={{ fontSize:'0.8125rem', color:C.text3, maxWidth:320, margin:'0 auto 24px' }}>
              Run an APEX distribution campaign to see all contacted agencies here with scores and status.
            </p>
            <Link href="/properties/new" style={{ display:'inline-flex', padding:'10px 22px', borderRadius:10, background:C.green, color:C.white, fontWeight:600, fontSize:'0.875rem', textDecoration:'none' }}>
              Start Campaign
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main list ───────────────────────────────────────── */
  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth:620, margin:'0 auto', padding:'clamp(16px,4vw,28px)' }}>

        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:'clamp(1.3rem,5vw,1.5rem)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:4, color:C.text }}>Agency Contacts</h1>
          <p style={{ fontSize:'0.85rem', color:C.text3 }}>{waveLog.length} agencies contacted · replies delivered to your inbox</p>
        </div>

        {/* Info bar */}
        <div style={{ padding:'12px 16px', background:C.blueBg, border:'1px solid rgba(59,91,219,0.2)', borderRadius:12, marginBottom:20, display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:18, flexShrink:0 }}>📧</span>
          <p style={{ fontSize:'0.78rem', color:C.blue, lineHeight:1.55, margin:0 }}>
            <strong>Replies go directly to your email.</strong> Each agency received a personalised offer. When they reply, the message lands in your inbox with a BCC copy. Use Messages to track conversations.
          </p>
        </div>

        {/* Wave stats */}
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          {activewaves.map(w => {
            const wm = WAVE_META[w];
            const cnt = waveLog.filter(e => e.wave === w).length;
            return (
              <div key={w} style={{ flex:1, padding:'10px 12px', borderRadius:10, background:wm.bg, border:`1px solid ${wm.color}22`, textAlign:'center' as const }}>
                <div style={{ fontSize:'1.25rem', fontWeight:700, color:wm.color }}>{cnt}</div>
                <div style={{ fontSize:'0.65rem', color:C.text3, marginTop:1 }}>{wm.label}</div>
              </div>
            );
          })}
          <div style={{ flex:1, padding:'10px 12px', borderRadius:10, background:C.bg, border:`1px solid ${C.border}`, textAlign:'center' as const }}>
            <div style={{ fontSize:'1.25rem', fontWeight:700, color:C.text2 }}>{waveLog.length}</div>
            <div style={{ fontSize:'0.65rem', color:C.text3, marginTop:1 }}>Total</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:16, background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:4 }}>
          {(['All', ...activewaves.map(String)] as string[]).map(f => {
            const isActive = filter === f;
            const label = f === 'All' ? 'All' : `Wave ${f}`;
            const cnt = f === 'All' ? waveLog.length : waveLog.filter(e => String(e.wave) === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                flex:1, padding:'7px 8px', borderRadius:7, fontWeight:600, fontSize:'0.78rem',
                cursor:'pointer', whiteSpace:'nowrap' as const, border:'none',
                background: isActive ? C.green : 'transparent',
                color: isActive ? C.white : C.text2,
                transition:'all 0.15s',
              }}>
                {label} ({cnt})
              </button>
            );
          })}
        </div>

        {/* List */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(entry => {
            const wm = WAVE_META[entry.wave];
            const sc = scoreColor(entry.score);
            return (
              <div
                key={entry.id}
                onClick={() => setSelected(entry)}
                style={{ background:C.white, border:`1px solid ${C.border}`, borderLeft:`3px solid ${wm.color}`, borderRadius:12, padding:'14px 15px', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', transition:'box-shadow 0.15s, transform 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform='none'; }}
              >
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:42, height:42, borderRadius:11, background:C.bg, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                    {flagFromId(entry.id)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                      <span style={{ fontSize:'0.875rem', fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const, flex:1, marginRight:8 }}>{entry.name}</span>
                      <span style={{ padding:'2px 8px', borderRadius:99, fontSize:'0.65rem', fontWeight:700, background:wm.bg, color:wm.color, flexShrink:0 }}>{wm.label}</span>
                    </div>
                    <div style={{ fontSize:'0.72rem', color:C.text3 }}>
                      Score <span style={{ color:sc, fontWeight:700 }}>{entry.score}</span>
                      {' · '}{entry.sent_at ? new Date(entry.sent_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                      {' · '}<span style={{ color:C.yellow }}>awaiting reply</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ height:40 }} />
      </div>
    </div>
  );
}
