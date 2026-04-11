'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/auth'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        '#F7F6F3',   // warm off-white
  white:     '#FFFFFF',
  card:      '#FFFFFF',
  border:    '#EBEBEB',
  text:      '#111111',
  text2:     '#555555',
  text3:     '#999999',
  green:     '#1A7A4A',
  greenBg:   '#E8F5EE',
  greenMid:  '#22C55E',
  accent:    '#1A7A4A',
  accentBg:  '#E8F5EE',
  yellow:    '#D4A017',
  yellowBg:  '#FBF3DE',
  blue:      '#2563EB',
  blueBg:    '#EFF6FF',
  orange:    '#C2440E',
  orangeBg:  '#FEF0E7',
  red:       '#DC2626',
  shadow:    '0 2px 12px rgba(0,0,0,0.07)',
  shadowHov: '0 12px 40px rgba(0,0,0,0.14)',
}

const PROP_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
]

function buildBarData(waveLog: any[]) {
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa']
  const now = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i))
    const sent = waveLog.filter(e => {
      if (!e.sent_at) return false
      const ed = new Date(e.sent_at)
      return ed.getFullYear()===d.getFullYear() && ed.getMonth()===d.getMonth() && ed.getDate()===d.getDate()
    }).length
    return { day: days[d.getDay()], sent }
  })
}

const FLAGS: Record<string,string> = { me:'🇲🇪',rs:'🇷🇸',at:'🇦🇹',de:'🇩🇪',ch:'🇨🇭',gb:'🇬🇧',nl:'🇳🇱',hr:'🇭🇷',it:'🇮🇹',fr:'🇫🇷' }
function flagFromId(id:string){ const m=id?.match(/^([a-z]{2})-/i); return m?(FLAGS[m[1].toLowerCase()]??'🏢'):'🏢' }
function initials(name:string){ return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() }
function getGreeting(){ const h=new Date().getHours(); return h<12?'Good morning':h<18?'Good afternoon':'Good evening' }

// ─── Property Card with hover motion ─────────────────────────────────────────
function PropertyCard({ p, i }: { p:any; i:number }) {
  const [hovered, setHovered] = useState(false)
  const statusColor = p.status==='in_distribution'||p.status==='active' ? T.green : p.status==='draft' ? T.text3 : T.blue
  const statusBg    = p.status==='in_distribution'||p.status==='active' ? T.greenBg : p.status==='draft' ? '#F5F5F5' : T.blueBg
  const statusLabel = p.status==='in_distribution'||p.status==='active' ? 'Distributing' : p.status==='draft' ? 'Draft' : p.status||'Active'

  return (
    <Link href="/properties" style={{ textDecoration:'none' }}>
      <div
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
        style={{
          background: T.card,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: hovered ? T.shadowHov : T.shadow,
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'pointer',
          border: `1px solid ${T.border}`,
        }}
      >
        {/* Photo */}
        <div style={{ position:'relative', height: 200, overflow:'hidden', background:'#E8E8E4' }}>
          <img
            src={p.img || PROP_IMAGES[i % PROP_IMAGES.length]}
            alt=""
            style={{
              width:'100%', height:'100%', objectFit:'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.45s ease',
            }}
            onError={e=>{ (e.target as any).src = PROP_IMAGES[i%PROP_IMAGES.length] }}
          />
          {/* Status badge */}
          <div style={{
            position:'absolute', top:12, left:12,
            padding:'4px 10px', borderRadius:99,
            background: hovered ? 'rgba(0,0,0,0.75)' : statusBg,
            color: hovered ? '#fff' : statusColor,
            fontSize:'0.68rem', fontWeight:700,
            backdropFilter:'blur(4px)',
            transition:'all 0.2s ease',
          }}>
            {statusLabel}
          </div>
          {/* Price overlay on hover */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
            padding:'32px 14px 14px',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(8px)',
            transition:'all 0.25s ease',
          }}>
            <div style={{ color:'#fff', fontSize:'1.1rem', fontWeight:800, letterSpacing:'-0.02em' }}>
              {p.price > 0 ? `€${p.price.toLocaleString()}` : '—'}
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding:'14px 16px 16px' }}>
          <div style={{ fontSize:'0.9375rem', fontWeight:700, color:T.text, marginBottom:4, letterSpacing:'-0.01em' }}>
            {p.type} · {p.city}
          </div>
          <div style={{ fontSize:'0.78rem', color:T.text3, marginBottom:10 }}>
            {p.country}{p.sqm > 0 ? ` · ${p.sqm} m²` : ''}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:'1rem', fontWeight:800, color:T.text, letterSpacing:'-0.02em' }}>
              {p.price > 0 ? `€${p.price.toLocaleString()}` : <span style={{color:T.text3,fontWeight:400,fontSize:'0.85rem'}}>No price set</span>}
            </div>
            {p.agencies > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:99, background:T.greenBg }}>
                <span style={{ fontSize:10 }}>📡</span>
                <span style={{ fontSize:'0.72rem', fontWeight:700, color:T.green }}>{p.agencies} sent</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color, bg, href }: any) {
  const [hov, setHov] = useState(false)
  return (
    <Link href={href} style={{ textDecoration:'none' }}>
      <div
        onMouseEnter={()=>setHov(true)}
        onMouseLeave={()=>setHov(false)}
        style={{
          background: T.white,
          borderRadius: 16,
          padding: '18px 20px',
          border: `1px solid ${T.border}`,
          boxShadow: hov ? T.shadowHov : T.shadow,
          transform: hov ? 'translateY(-3px)' : 'none',
          transition: 'all 0.2s ease',
          display:'flex', alignItems:'center', gap:14,
        }}
      >
        <div style={{ width:46, height:46, borderRadius:14, background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize:'1.6rem', fontWeight:900, color:color, lineHeight:1, letterSpacing:'-0.03em' }}>{value}</div>
          <div style={{ fontSize:'0.72rem', color:T.text3, fontWeight:600, marginTop:3 }}>{label}</div>
          {sub && <div style={{ fontSize:'0.68rem', color:T.text3, marginTop:1 }}>{sub}</div>}
        </div>
      </div>
    </Link>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const userName = (user as any)?.profile?.full_name || (user as any)?.name || user?.email?.split('@')[0] || 'Max'
  const [localProps, setLocalProps] = useState<any[]>([])
  const [waveLog, setWaveLog]       = useState<any[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pb_wizard_props') || '[]')
      setLocalProps(Array.isArray(stored) ? stored : [])
    } catch { setLocalProps([]) }
    try {
      const wl = JSON.parse(localStorage.getItem('pb_wave_log') || '[]')
      setWaveLog(Array.isArray(wl) ? wl : [])
    } catch { setWaveLog([]) }
  }, [])

  const allProps = localProps.map((p:any, i:number) => ({
    id: p.id,
    type: p.property_type ? (p.property_type.charAt(0).toUpperCase()+p.property_type.slice(1)) : 'Property',
    city: p.city||'—', country: p.country||'',
    price: p.asking_price||0, sqm: p.area_sqm||0,
    status: p.status||'draft',
    agencies: waveLog.length > 0 ? waveLog.length : (p.agencies_sent||0),
    img: p.photos?.[0] || PROP_IMAGES[i % PROP_IMAGES.length],
  }))

  const totalAgencies = waveLog.length
  const BAR_DATA      = buildBarData(waveLog)
  const BAR_MAX       = Math.max(...BAR_DATA.map(d=>d.sent), 1)
  const waves         = waveLog.length > 0 ? [...new Set(waveLog.map((e:any)=>e.wave))].length : 0
  const activity      = waveLog.slice(-6).reverse().map((e:any,i:number)=>({
    id:e.id||i, agency:e.name, flag:flagFromId(e.id), avatar:initials(e.name),
    msg:`Offer sent · Score ${e.score}`,
    time: e.sent_at ? (()=>{ const h=Math.floor((Date.now()-new Date(e.sent_at).getTime())/3600000); return h<1?'<1h':h<24?`${h}h`:`${Math.floor(h/24)}d` })() : '—',
    wave: e.wave,
  }))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { background: ${T.bg}; }
      `}</style>

      <div style={{ minHeight:'100vh', background:T.bg, fontFamily:'Inter,system-ui,sans-serif', color:T.text }}>

        {/* ── TOP BAR ──────────────────────────────────────────────────── */}
        <div style={{ background:T.white, borderBottom:`1px solid ${T.border}`, padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:11, color:T.text3, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:2 }}>
              {getGreeting()} · {new Date().toLocaleDateString('en',{weekday:'long',day:'numeric',month:'long'})}
            </div>
            <h1 style={{ fontSize:20, fontWeight:900, color:T.text, margin:0, letterSpacing:'-0.03em' }}>
              {getGreeting()}, {userName} 👋
            </h1>
          </div>
          <Link href="/properties/new">
            <button style={{
              background:T.green, color:'#fff', border:'none', borderRadius:12,
              padding:'11px 20px', fontWeight:800, fontSize:13, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6,
              boxShadow:`0 2px 12px ${T.green}44`,
              transition:'all 0.15s',
            }}
            onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-1px)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='none')}
            >
              <span style={{ fontSize:18, lineHeight:1 }}>+</span> Add Property
            </button>
          </Link>
        </div>

        <div style={{ padding:'24px 28px', maxWidth:1280, margin:'0 auto' }}>

          {/* ── KPI ROW ───────────────────────────────────────────────── */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }}>
            <KpiCard icon="🏠" label="Properties"     value={allProps.length}  color={T.green}  bg={T.greenBg}  href="/properties"  />
            <KpiCard icon="📡" label="Agencies"       value={totalAgencies}    color={T.blue}   bg={T.blueBg}   href="/distribution"/>
            <KpiCard icon="🌊" label="Waves Sent"     value={waves}            color={T.orange} bg={T.orangeBg} href="/distribution"/>
            <KpiCard icon="💬" label="Messages"       value="→"  sub="Check inbox" color={T.text} bg="#F5F5F5" href="/messenger"  />
          </div>

          {/* ── MAIN GRID ─────────────────────────────────────────────── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20 }}>

            {/* LEFT: Properties + Chart */}
            <div>

              {/* Property cards */}
              <div style={{ background:T.white, borderRadius:20, border:`1px solid ${T.border}`, padding:'20px', marginBottom:20, boxShadow:T.shadow }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <div>
                    <h2 style={{ fontSize:16, fontWeight:900, margin:0, letterSpacing:'-0.02em' }}>My Properties</h2>
                    <p style={{ fontSize:12, color:T.text3, margin:'3px 0 0' }}>{allProps.length} listing{allProps.length!==1?'s':''}</p>
                  </div>
                  <Link href="/properties" style={{ fontSize:12, color:T.green, fontWeight:700, textDecoration:'none' }}>View all →</Link>
                </div>

                {allProps.length === 0 ? (
                  <div style={{ padding:'40px 20px', textAlign:'center' }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>🏠</div>
                    <div style={{ fontSize:15, fontWeight:700, color:T.text2, marginBottom:6 }}>No properties yet</div>
                    <div style={{ fontSize:12, color:T.text3, marginBottom:20 }}>List your first property and let APEX find the right agencies</div>
                    <Link href="/properties/new">
                      <button style={{ background:T.green, color:'#fff', border:'none', borderRadius:10, padding:'10px 22px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                        + Add Property
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
                    {allProps.map((p,i) => <PropertyCard key={p.id||i} p={p} i={i} />)}
                    {/* Add card */}
                    <Link href="/properties/new" style={{ textDecoration:'none' }}>
                      <div style={{
                        height:280, borderRadius:20, border:`2px dashed ${T.border}`,
                        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                        cursor:'pointer', transition:'all 0.2s',
                        color:T.text3,
                      }}
                      onMouseEnter={e=>{ (e.currentTarget as any).style.borderColor=T.green; (e.currentTarget as any).style.color=T.green }}
                      onMouseLeave={e=>{ (e.currentTarget as any).style.borderColor=T.border; (e.currentTarget as any).style.color=T.text3 }}
                      >
                        <div style={{ fontSize:32, marginBottom:8 }}>+</div>
                        <div style={{ fontSize:12, fontWeight:600 }}>Add property</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* APEX Activity Chart */}
              <div style={{ background:T.white, borderRadius:20, border:`1px solid ${T.border}`, padding:'20px', boxShadow:T.shadow }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                  <div>
                    <h2 style={{ fontSize:16, fontWeight:900, margin:0, letterSpacing:'-0.02em' }}>APEX Activity</h2>
                    <p style={{ fontSize:12, color:T.text3, margin:'3px 0 0' }}>Agencies contacted — last 7 days</p>
                  </div>
                  <div style={{ display:'flex', gap:12 }}>
                    {[{color:T.green,label:'Sent'}].map(l=>(
                      <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:T.text3 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:l.color }}/> {l.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:120, padding:'0 4px' }}>
                  {BAR_DATA.map(d=>(
                    <div key={d.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%' }}>
                      <div style={{ flex:1, width:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
                        <div style={{
                          width:'100%', borderRadius:'6px 6px 0 0',
                          height:`${BAR_MAX>0?(d.sent/BAR_MAX)*90:4}%`,
                          minHeight: d.sent>0 ? 6 : 2,
                          background: d.sent>0 ? `linear-gradient(180deg,${T.greenMid},${T.green})` : T.border,
                          transition:'height 0.6s ease',
                          position:'relative',
                        }}>
                          {d.sent>0&&<div style={{ position:'absolute', top:-18, left:'50%', transform:'translateX(-50%)', fontSize:9, fontWeight:800, color:T.green }}>{d.sent}</div>}
                        </div>
                      </div>
                      <div style={{ fontSize:10, fontWeight:600, color:T.text3 }}>{d.day}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:16, paddingTop:16, borderTop:`1px solid ${T.border}` }}>
                  {[
                    { label:'Total sent',   value:waveLog.length,                             color:T.green  },
                    { label:'Waves',        value:waves,                                       color:T.blue   },
                    { label:'Avg score',    value:waveLog.length ? Math.round(waveLog.reduce((s:number,e:any)=>s+(e.score||0),0)/waveLog.length) : '—', color:T.orange },
                  ].map(s=>(
                    <div key={s.label} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:22, fontWeight:900, color:s.color, letterSpacing:'-0.03em' }}>{s.value}</div>
                      <div style={{ fontSize:11, color:T.text3, marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Hero card + Activity + Quick Actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              {/* APEX status card */}
              <div style={{
                background:`linear-gradient(135deg, ${T.green} 0%, #0F5C35 100%)`,
                borderRadius:20, padding:'22px', color:'#fff',
                boxShadow:`0 8px 32px ${T.green}44`,
              }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', opacity:0.7, marginBottom:6 }}>PropBlaze APEX</div>
                <div style={{ fontSize:19, fontWeight:900, letterSpacing:'-0.02em', marginBottom:16, lineHeight:1.2 }}>
                  {allProps.length > 0 ? `${allProps.length} propert${allProps.length>1?'ies':'y'} active` : 'Ready to launch 🚀'}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { label:'Agencies reached', val:totalAgencies },
                    { label:'Waves sent',        val:waves },
                  ].map(s=>(
                    <div key={s.label} style={{ background:'rgba(255,255,255,0.15)', borderRadius:12, padding:'12px 14px', backdropFilter:'blur(4px)' }}>
                      <div style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.03em' }}>{s.val}</div>
                      <div style={{ fontSize:10, opacity:0.8, fontWeight:600, marginTop:2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity feed */}
              <div style={{ background:T.white, borderRadius:20, border:`1px solid ${T.border}`, overflow:'hidden', boxShadow:T.shadow, flex:1 }}>
                <div style={{ padding:'16px 18px 12px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <h2 style={{ fontSize:14, fontWeight:900, margin:0 }}>Activity</h2>
                  <Link href="/leads" style={{ fontSize:12, color:T.green, fontWeight:700, textDecoration:'none' }}>All →</Link>
                </div>
                {activity.length === 0 ? (
                  <div style={{ padding:'28px 18px', textAlign:'center' }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>📡</div>
                    <div style={{ fontSize:12, color:T.text3 }}>No campaign launched yet</div>
                  </div>
                ) : activity.map((a,i) => (
                  <Link key={`${a.id}-${i}`} href="/leads" style={{ textDecoration:'none' }}>
                    <div style={{
                      padding:'11px 18px',
                      borderBottom: i<activity.length-1 ? `1px solid ${T.border}` : 'none',
                      display:'flex', gap:10, alignItems:'flex-start',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e=>(e.currentTarget.style.background='#FAFAF8')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                    >
                      <div style={{ width:32, height:32, borderRadius:10, flexShrink:0, background:'#F0F0ED', color:T.text2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800 }}>
                        {a.avatar}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:T.text }}>{a.flag} {a.agency}</span>
                          <span style={{ fontSize:10, color:T.text3 }}>{a.time}</span>
                        </div>
                        <div style={{ fontSize:11, color:T.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.msg}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Quick actions */}
              <div style={{ background:T.white, borderRadius:20, border:`1px solid ${T.border}`, padding:'16px 18px', boxShadow:T.shadow }}>
                <h2 style={{ fontSize:14, fontWeight:900, margin:'0 0 12px' }}>Quick Actions</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {[
                    { icon:'🏠', label:'New Property',  sub:'Add & list',        href:'/properties/new'  },
                    { icon:'💬', label:'Messages',       sub:'Check replies',     href:'/messenger'       },
                    { icon:'📡', label:'Distribution',   sub:'View campaigns',    href:'/distribution'    },
                    { icon:'💳', label:'Billing',        sub:'Manage plan',       href:'/billing'         },
                  ].map(a=>(
                    <Link key={a.href} href={a.href} style={{ textDecoration:'none' }}>
                      <div style={{
                        display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                        borderRadius:12, transition:'all 0.15s', cursor:'pointer',
                      }}
                      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=T.greenBg }}
                      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent' }}
                      >
                        <div style={{ width:36, height:36, borderRadius:10, background:'#F5F5F2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{a.icon}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color:T.text }}>{a.label}</div>
                          <div style={{ fontSize:11, color:T.text3 }}>{a.sub}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
