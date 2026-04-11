'use client';

import React, { useState } from 'react';

// ─── Rento-style marketplace tokens ────────────────────────────────────────
const C = {
  bg:     '#F5F7FA',
  white:  '#FFFFFF',
  border: '#E4E8EF',
  text:   '#0F172A',
  text2:  '#475569',
  text3:  '#94A3B8',
  blue:   '#1D4ED8',
  blueBg: '#EFF6FF',
  blueLt: '#DBEAFE',
  green:  '#16A34A',
  greenBg:'#DCFCE7',
  yellow: '#CA8A04',
  yBg:    '#FEF9C3',
  purple: '#7C3AED',
  pBg:    '#F3E8FF',
  black:  '#0F172A',
  red:    '#DC2626',
};

const TYPES   = ['All', 'Apartment', 'House', 'Villa', 'Penthouse', 'Commercial', 'Land'];
const MARKETS = ['All markets','Montenegro','Serbia','Croatia','Portugal','Spain','Germany','Austria','France'];

const PROPERTIES = [
  { id:'p1', type:'Apartment', city:'Belgrade',  country:'Serbia',     price:420000,  beds:3, baths:2, sqm:98,  img:'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80', score:94, wave:1, listed:'2d ago', owner:'Max T.' },
  { id:'p2', type:'Villa',     city:'Budva',     country:'Montenegro', price:1200000, beds:5, baths:4, sqm:340, img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', score:97, wave:1, listed:'5h ago', owner:'A. Novak' },
  { id:'p3', type:'Penthouse', city:'Lisbon',    country:'Portugal',   price:1800000, beds:4, baths:3, sqm:210, img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', score:91, wave:1, listed:'1d ago', owner:'R. Costa' },
  { id:'p4', type:'House',     city:'Split',     country:'Croatia',    price:680000,  beds:4, baths:2, sqm:180, img:'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80', score:88, wave:2, listed:'3d ago', owner:'I. Horvat' },
  { id:'p5', type:'Apartment', city:'Berlin',    country:'Germany',    price:890000,  beds:2, baths:2, sqm:120, img:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80', score:85, wave:2, listed:'4d ago', owner:'K. Müller' },
  { id:'p6', type:'Villa',     city:'Marbella',  country:'Spain',      price:5100000, beds:7, baths:6, sqm:820, img:'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80', score:98, wave:1, listed:'12h ago', owner:'C. Garcia' },
];

function fmt(n: number) {
  if (n >= 1000000) return `€${(n/1000000).toFixed(1)}M`;
  return `€${Math.round(n/1000)}K`;
}

function ScoreBadge({ score }: { score: number }) {
  const [c, bg] = score >= 95 ? [C.green, C.greenBg] : score >= 85 ? [C.blue, C.blueBg] : [C.yellow, C.yBg];
  return <span style={{ fontSize:'0.68rem', fontWeight:800, color:c, background:bg, padding:'3px 9px', borderRadius:6 }}>APEX {score}</span>;
}

function WaveBadge({ wave }: { wave: number }) {
  return <span style={{ fontSize:'0.65rem', fontWeight:700, color:C.purple, background:C.pBg, padding:'2px 8px', borderRadius:6 }}>Wave {wave}</span>;
}

export default function AgencyPortalPage() {
  const [selType,   setSelType]   = useState('All');
  const [selMkt,    setSelMkt]    = useState('All markets');
  const [minPrice,  setMinPrice]  = useState('');
  const [maxPrice,  setMaxPrice]  = useState('');
  const [minBeds,   setMinBeds]   = useState('Any');
  const [viewMode,  setViewMode]  = useState<'grid'|'list'>('grid');
  const [sortBy,    setSortBy]    = useState('score');
  const [expanded,  setExpanded]  = useState<string|null>(null);
  const [interested,setInterested]= useState<Set<string>>(new Set());

  const toggle = (id: string) => setInterested(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });

  const list = PROPERTIES
    .filter(p => selType  === 'All'          || p.type    === selType)
    .filter(p => selMkt   === 'All markets'  || p.country === selMkt)
    .filter(p => !minPrice || p.price >= parseInt(minPrice)*1000)
    .filter(p => !maxPrice || p.price <= parseInt(maxPrice)*1000)
    .filter(p => minBeds  === 'Any'          || p.beds >= parseInt(minBeds))
    .sort((a,b) =>
      sortBy === 'score'      ? b.score - a.score :
      sortBy === 'price_asc'  ? a.price - b.price :
      sortBy === 'price_desc' ? b.price - a.price : 0
    );

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;-webkit-font-smoothing:antialiased}
        .pill-btn{padding:6px 15px;border-radius:100px;border:none;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap}
        .filter-btn{padding:5px 12px;border-radius:100px;border:1px solid ${C.border};background:${C.white};color:${C.text2};font-size:0.73rem;font-weight:600;cursor:pointer;transition:all .15s}
        .filter-btn.active{border-color:${C.blue};background:${C.blueBg};color:${C.blue}}
        .bed-btn{width:42px;height:34px;border-radius:8px;border:1px solid ${C.border};background:${C.white};color:${C.text2};font-weight:600;font-size:0.8rem;cursor:pointer;transition:all .15s}
        .bed-btn.active{border-color:${C.black};background:${C.black};color:#fff}
        .prop-card{background:${C.white};border-radius:16px;border:1px solid ${C.border};overflow:hidden;transition:box-shadow .2s,transform .2s;cursor:pointer}
        .prop-card:hover{box-shadow:0 8px 32px rgba(0,0,0,.1);transform:translateY(-3px)}
        .prop-card img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .5s}
        .prop-card:hover img{transform:scale(1.05)}
        .list-row{background:${C.white};border-radius:14px;border:1px solid ${C.border};padding:16px 20px;display:flex;gap:16px;align-items:center;transition:box-shadow .2s;cursor:pointer}
        .list-row:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .sort-select{padding:7px 12px;border:1px solid ${C.border};border-radius:8px;font-size:0.8rem;color:${C.text};background:${C.white};cursor:pointer;outline:none}
        .view-btn{width:36px;height:34px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.1rem;transition:all .15s}
        .input-field{flex:1;padding:8px 10px;border:1px solid ${C.border};border-radius:8px;font-size:0.82rem;color:${C.text};background:${C.bg};outline:none;font-family:inherit}
        .input-field:focus{border-color:${C.blue}}
        .btn-black{border:none;border-radius:9px;background:${C.black};color:#fff;font-weight:700;font-size:0.8rem;cursor:pointer;transition:all .15s}
        .btn-black:hover{background:#1e293b}
        .btn-ghost{border:1px solid ${C.border};border-radius:9px;background:${C.white};color:${C.text2};font-weight:600;font-size:0.78rem;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
        .btn-ghost:hover{border-color:${C.text2};color:${C.text}}
        .btn-blue{border:none;border-radius:9px;background:${C.blue};color:#fff;font-weight:700;font-size:0.8rem;cursor:pointer;text-decoration:none;display:block;text-align:center}
      `}</style>

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:'0 clamp(16px,3vw,32px)', height:56, display:'flex', alignItems:'center', gap:0, position:'sticky', top:0, zIndex:40, boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:28, flexShrink:0 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:C.black, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:900, color:'#fff' }}>PB</div>
          <span style={{ fontSize:'0.88rem', fontWeight:800, color:C.text, letterSpacing:'-0.02em' }}>Agency Portal</span>
          <span style={{ fontSize:'0.65rem', fontWeight:700, color:C.green, background:C.greenBg, padding:'2px 8px', borderRadius:6 }}>LIVE</span>
        </div>

        {/* Type pills */}
        <div style={{ display:'flex', gap:2, flex:1, overflowX:'auto' }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setSelType(t)} className="pill-btn"
              style={{ background: selType===t ? C.black : 'transparent', color: selType===t ? '#fff' : C.text2 }}>
              {t}
            </button>
          ))}
        </div>

        <a href="mailto:contact@win-winsolution.com" style={{ marginLeft:16, padding:'7px 16px', background:C.blue, color:'#fff', borderRadius:8, fontSize:'0.78rem', fontWeight:700, textDecoration:'none', flexShrink:0 }}>
          Contact PropBlaze
        </a>
      </div>

      {/* ── LAYOUT ──────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'268px 1fr', maxWidth:1400, margin:'0 auto', minHeight:'calc(100vh - 56px)' }}>

        {/* SIDEBAR */}
        <aside style={{ background:C.white, borderRight:`1px solid ${C.border}`, padding:'22px 18px', position:'sticky', top:56, height:'calc(100vh - 56px)', overflowY:'auto' }}>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:'0.73rem', color:C.text3, marginBottom:4 }}>{list.length} properties matched</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:C.green }} />
              <span style={{ fontSize:'0.73rem', fontWeight:600, color:C.green }}>Live APEX matching</span>
            </div>
          </div>

          <hr style={{ border:'none', borderTop:`1px solid ${C.border}`, margin:'0 0 18px' }} />

          {/* Market */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.text2, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Market</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {MARKETS.map(m => (
                <button key={m} onClick={() => setSelMkt(m)} className={`filter-btn${selMkt===m?' active':''}`}>
                  {m === 'All markets' ? 'All' : m}
                </button>
              ))}
            </div>
          </div>

          <hr style={{ border:'none', borderTop:`1px solid ${C.border}`, margin:'0 0 18px' }} />

          {/* Price */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.text2, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Price range (€K)</div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input className="input-field" type="number" placeholder="Min" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
              <span style={{ color:C.text3 }}>—</span>
              <input className="input-field" type="number" placeholder="Max" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
            </div>
          </div>

          <hr style={{ border:'none', borderTop:`1px solid ${C.border}`, margin:'0 0 18px' }} />

          {/* Bedrooms */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.text2, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Bedrooms</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['Any','1','2','3','4+'].map(b => {
                const val = b === '4+' ? '4' : b;
                return <button key={b} onClick={() => setMinBeds(val)} className={`bed-btn${minBeds===val?' active':''}`}>{b}</button>;
              })}
            </div>
          </div>

          <hr style={{ border:'none', borderTop:`1px solid ${C.border}`, margin:'0 0 18px' }} />

          {/* Wave filter */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.text2, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>APEX Wave</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['All','Wave 1','Wave 2','Wave 3'].map(w => (
                <button key={w} className="filter-btn">{w}</button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setSelType('All'); setSelMkt('All markets'); setMinPrice(''); setMaxPrice(''); setMinBeds('Any'); }}
            style={{ width:'100%', padding:'9px', border:`1px solid ${C.border}`, borderRadius:10, background:C.white, color:C.text3, fontSize:'0.82rem', fontWeight:600, cursor:'pointer', transition:'all .15s' }}
            onMouseEnter={e => { (e.currentTarget.style.borderColor=C.text2); (e.currentTarget.style.color=C.text); }}
            onMouseLeave={e => { (e.currentTarget.style.borderColor=C.border); (e.currentTarget.style.color=C.text3); }}
          >Reset filters</button>
        </aside>

        {/* MAIN */}
        <main style={{ padding:'clamp(16px,2.5vw,26px)' }}>

          {/* Toolbar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:10 }}>
            <div>
              <h1 style={{ fontSize:'1.1rem', fontWeight:800, color:C.text, letterSpacing:'-0.02em', marginBottom:2 }}>Matched for your portfolio</h1>
              <p style={{ fontSize:'0.78rem', color:C.text3 }}>{list.length} listings · sorted by APEX match score</p>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <select className="sort-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                <option value="score">APEX Score ↓</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
              </select>
              <div style={{ display:'flex', border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
                {(['grid','list'] as const).map(m => (
                  <button key={m} onClick={()=>setViewMode(m)} className="view-btn"
                    style={{ background: viewMode===m ? C.black : C.white, color: viewMode===m ? '#fff' : C.text3 }}>
                    {m==='grid' ? '⊞' : '☰'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interested CTA banner */}
          {interested.size > 0 && (
            <div style={{ background:C.blueBg, border:`1px solid ${C.blueLt}`, borderRadius:12, padding:'12px 16px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:'0.84rem', color:C.blue, fontWeight:600 }}>
                🏷️ {interested.size} propert{interested.size===1?'y':'ies'} marked
              </span>
              <a href={`mailto:contact@win-winsolution.com?subject=Agency interest — ${interested.size} PropBlaze listings`}
                style={{ padding:'7px 14px', background:C.blue, color:'#fff', borderRadius:7, fontSize:'0.78rem', fontWeight:700, textDecoration:'none' }}>
                Request details →
              </a>
            </div>
          )}

          {/* Empty state */}
          {list.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 20px', background:C.white, borderRadius:16, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:'2.5rem', marginBottom:16 }}>🔍</div>
              <h3 style={{ fontWeight:800, color:C.text, marginBottom:8 }}>No properties match</h3>
              <p style={{ fontSize:'0.85rem', color:C.text3 }}>Try adjusting or resetting your filters.</p>
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(285px,1fr))', gap:14 }}>
              {list.map(p => (
                <div key={p.id} className="prop-card">
                  {/* Image */}
                  <div style={{ position:'relative', height:185, overflow:'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt={p.type} />
                    <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:5 }}>
                      <ScoreBadge score={p.score} />
                      <WaveBadge wave={p.wave} />
                    </div>
                    <button onClick={()=>toggle(p.id)} style={{ position:'absolute', top:10, right:10, width:34, height:34, borderRadius:'50%', background: interested.has(p.id) ? C.blue : 'rgba(255,255,255,0.92)', border:'none', cursor:'pointer', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>
                      {interested.has(p.id) ? <span style={{color:'#fff'}}>★</span> : '☆'}
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ padding:'15px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:'1.1rem', fontWeight:800, color:C.text, letterSpacing:'-0.02em' }}>{fmt(p.price)}</div>
                        <div style={{ fontSize:'0.78rem', color:C.text3, marginTop:2 }}>📍 {p.city}, {p.country}</div>
                      </div>
                      <span style={{ fontSize:'0.68rem', background:C.bg, color:C.text3, padding:'3px 8px', borderRadius:6, fontWeight:600, border:`1px solid ${C.border}` }}>{p.type}</span>
                    </div>

                    <div style={{ display:'flex', gap:14, marginBottom:13 }}>
                      {[`${p.beds} beds`, `${p.baths} baths`, `${p.sqm}m²`].map(s => (
                        <span key={s} style={{ fontSize:'0.76rem', color:C.text2, fontWeight:500 }}>{s}</span>
                      ))}
                    </div>

                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={()=>setExpanded(expanded===p.id?null:p.id)}
                        style={{ flex:1, padding:'8px', border:`1px solid ${C.border}`, borderRadius:9, background:C.white, color:C.text2, fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}
                        onMouseEnter={e=>{(e.currentTarget.style.borderColor=C.text2)}}
                        onMouseLeave={e=>{(e.currentTarget.style.borderColor=C.border)}}>
                        Details
                      </button>
                      <button onClick={()=>toggle(p.id)}
                        style={{ flex:1, padding:'8px', border:'none', borderRadius:9, background: interested.has(p.id) ? C.blue : C.black, color:'#fff', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', transition:'all .15s' }}>
                        {interested.has(p.id) ? '✓ Saved' : 'Interested'}
                      </button>
                    </div>

                    {expanded === p.id && (
                      <div style={{ marginTop:12, padding:'13px', background:C.bg, borderRadius:10 }}>
                        <div style={{ fontSize:'0.7rem', fontWeight:700, color:C.text3, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>Owner details</div>
                        <div style={{ fontSize:'0.82rem', color:C.text, marginBottom:4 }}>Listed by: <strong>{p.owner}</strong></div>
                        <div style={{ fontSize:'0.74rem', color:C.text3, marginBottom:12 }}>Listed {p.listed} · APEX {p.score}</div>
                        <a href={`mailto:contact@win-winsolution.com?subject=Interest: ${p.type} ${p.city} ${fmt(p.price)}&body=Hello,%0A%0AI am interested in the ${p.type} in ${p.city} (${fmt(p.price)}).%0A%0APlease connect me with the owner.`}
                          className="btn-blue" style={{ padding:'9px' }}>
                          Request owner contact →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {list.map(p => (
                <div key={p.id} className="list-row">
                  <div style={{ width:88, height:68, borderRadius:10, overflow:'hidden', flexShrink:0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', gap:5, marginBottom:5, flexWrap:'wrap' }}>
                      <ScoreBadge score={p.score} />
                      <WaveBadge wave={p.wave} />
                      <span style={{ fontSize:'0.64rem', background:C.bg, color:C.text3, padding:'2px 8px', borderRadius:6, fontWeight:600 }}>{p.type}</span>
                    </div>
                    <div style={{ fontSize:'1rem', fontWeight:800, color:C.text }}>
                      {fmt(p.price)}{' '}
                      <span style={{ fontSize:'0.78rem', fontWeight:500, color:C.text3 }}>· {p.city}, {p.country}</span>
                    </div>
                    <div style={{ fontSize:'0.74rem', color:C.text3, marginTop:3 }}>
                      {p.beds} beds · {p.baths} baths · {p.sqm}m² · Listed {p.listed}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button onClick={()=>toggle(p.id)} className="btn-black"
                      style={{ padding:'8px 16px', background: interested.has(p.id) ? C.blue : C.black }}>
                      {interested.has(p.id) ? '✓ Saved' : 'Interested'}
                    </button>
                    <a href={`mailto:contact@win-winsolution.com?subject=Inquiry: ${p.type} ${p.city}`}
                      className="btn-ghost" style={{ padding:'8px 13px' }}>
                      Contact
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
