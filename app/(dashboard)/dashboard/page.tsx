'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── 2027 Dark Palette (dashboard) ────────────────────────────────────────────
const D = {
  bg:        '#080810',
  bg2:       '#0D0D1A',
  bg3:       '#12121F',
  surface:   'rgba(255,255,255,0.04)',
  surface2:  'rgba(255,255,255,0.07)',
  surface3:  'rgba(255,255,255,0.10)',
  border:    'rgba(255,255,255,0.08)',
  border2:   'rgba(255,255,255,0.14)',
  yellow:    '#F5C200',
  yellowDim: 'rgba(245,194,0,0.15)',
  yellowGlow:'rgba(245,194,0,0.08)',
  blue:      '#3B5BDB',
  purple:    '#7048E8',
  green:     '#22C55E',
  greenDim:  'rgba(34,197,94,0.12)',
  red:       '#EF4444',
  amber:     '#F59E0B',
  white:     '#FFFFFF',
  w80:       'rgba(255,255,255,0.8)',
  w60:       'rgba(255,255,255,0.6)',
  w40:       'rgba(255,255,255,0.4)',
  w20:       'rgba(255,255,255,0.2)',
  w10:       'rgba(255,255,255,0.1)',
  grad1:     'linear-gradient(135deg, #F5C200 0%, #FF8C00 100%)',
  grad2:     'linear-gradient(135deg, #3B5BDB 0%, #7048E8 100%)',
  grad3:     'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_PROPERTIES = [
  {
    id: 'demo-1',
    type: 'Villa',
    address: 'Sveti Stefan Peninsula',
    city: 'Budva',
    country: 'Montenegro',
    price: 485000,
    currency: 'EUR',
    area: 210,
    status: 'distributing',
    matchScore: 97,
    listedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    views: 1248,
    activeAgencies: 18,
    totalAgencies: 28,
    wave: 1,
    leads: 7,
  },
  {
    id: 'demo-2',
    type: 'Apartment',
    address: 'Knez Mihailova 28',
    city: 'Belgrade',
    country: 'Serbia',
    price: 127000,
    currency: 'EUR',
    area: 75,
    status: 'wave2',
    matchScore: 84,
    listedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    views: 431,
    activeAgencies: 12,
    totalAgencies: 22,
    wave: 2,
    leads: 3,
  },
  {
    id: 'demo-3',
    type: 'Land',
    address: 'Zlatibor Mountain Zone B',
    city: 'Zlatibor',
    country: 'Serbia',
    price: 68000,
    currency: 'EUR',
    area: 1200,
    status: 'awaiting_approval',
    matchScore: 79,
    listedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    views: 84,
    activeAgencies: 0,
    totalAgencies: 18,
    wave: 0,
    leads: 0,
  },
]

const DEMO_AGENCIES = [
  { name: 'Engel & Völkers', city: 'Budva, MNE', score: 97, status: 'replied', time: '2h ago', color: D.green },
  { name: "Sotheby's Realty", city: 'Porto Montenegro', score: 94, status: 'opened', time: '5h ago', color: D.yellow },
  { name: 'Savills International', city: 'London, UK', score: 91, status: 'sent', time: '8h ago', color: D.blue },
  { name: 'Knight Frank Serbia', city: 'Belgrade, RS', score: 88, status: 'sent', time: '8h ago', color: D.blue },
  { name: 'Win-Win Solution', city: 'Belgrade, RS', score: 96, status: 'replied', time: '1h ago', color: D.green },
  { name: 'Tranio Partners', city: 'Berlin, DE', score: 85, status: 'queued', time: 'Wave 2', color: D.w40 },
]

const DEMO_ACTIVITY = [
  { icon: '💬', text: 'Engel & Völkers replied to your offer', sub: 'Villa Sveti Stefan · 2 hours ago', color: D.green },
  { icon: '👁', text: 'Win-Win Solution opened your email', sub: 'Villa Sveti Stefan · 1 hour ago', color: D.yellow },
  { icon: '📩', text: 'Wave 1 sent to 18 agencies', sub: 'Villa Sveti Stefan · 3 days ago', color: D.blue },
  { icon: '✅', text: 'Offer approved & distribution started', sub: 'Villa Sveti Stefan · 3 days ago', color: D.green },
]

const AI_INSIGHTS = [
  'Your Villa in Budva has a 97/100 match score — top 5% of listings this month.',
  'Engel & Völkers replied — they have a 1-in-3 conversion rate for this price range. Respond quickly.',
  'Consider enabling Wave 2 for Belgrade Apartment to expand to 10 more agencies.',
  '3 leads received in 3 days is above average for Adriatic villas at this price point.',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(n: number, cur: string) {
  return `${cur} ${n.toLocaleString()}`
}
function statusLabel(s: string) {
  if (s === 'distributing') return 'Wave 1 Active'
  if (s === 'wave2') return 'Wave 2 Active'
  if (s === 'awaiting_approval') return 'Awaiting Approval'
  if (s === 'replied') return 'Reply Received'
  if (s === 'opened') return 'Email Opened'
  if (s === 'sent') return 'Sent'
  if (s === 'queued') return 'Queued'
  return s
}
function statusColor(s: string) {
  if (s === 'distributing' || s === 'replied') return D.green
  if (s === 'wave2' || s === 'opened' || s === 'sent') return D.yellow
  if (s === 'awaiting_approval') return D.amber
  return D.w40
}

// ─── Stagger fade ─────────────────────────────────────────────────────────────
function Stagger({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>{children}</div>
  )
}

// ─── Glass KPI Card ───────────────────────────────────────────────────────────
function KPICard({ label, value, sub, icon, gradient, delay = 0 }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; gradient?: string; delay?: number;
}) {
  const [hov, setHov] = useState(false)
  return (
    <Stagger delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: '22px 24px', borderRadius: 20,
          background: hov ? D.surface2 : D.surface,
          border: `1px solid ${hov ? D.border2 : D.border}`,
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          transform: hov ? 'translateY(-2px)' : 'none',
          boxShadow: hov ? '0 16px 48px rgba(0,0,0,0.3)' : 'none',
          position: 'relative', overflow: 'hidden',
        }}>
        {/* Gradient accent blob */}
        {gradient && (
          <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:gradient, filter:'blur(30px)', opacity:0.3, pointerEvents:'none' }}/>
        )}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14, position:'relative' }}>
          <div style={{ fontSize:'0.65rem', fontWeight:700, color:D.w60, textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</div>
          <div style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.06)', border:`1px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize:'2rem', fontWeight:800, color:D.white, lineHeight:1, marginBottom:5 }}>{value}</div>
        {sub && <div style={{ fontSize:'0.7rem', color:D.w40 }}>{sub}</div>}
      </div>
    </Stagger>
  )
}

// ─── Property Card 2027 ───────────────────────────────────────────────────────
function PropertyCard({ p, active, onClick }: { p: typeof DEMO_PROPERTIES[0]; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const pct = p.totalAgencies > 0 ? Math.round((p.activeAgencies / p.totalAgencies) * 100) : 0

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '20px', borderRadius: 18, cursor: 'pointer',
        background: active ? 'rgba(245,194,0,0.07)' : (hov ? D.surface2 : D.surface),
        border: `1px solid ${active ? 'rgba(245,194,0,0.35)' : (hov ? D.border2 : D.border)}`,
        transition: 'all 0.25s ease',
        boxShadow: active ? '0 0 30px rgba(245,194,0,0.08)' : 'none',
      }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <div style={{ fontSize:'0.6rem', fontWeight:700, color:D.w40, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>
            {p.type} · {p.city}
          </div>
          <div style={{ fontSize:'0.9rem', fontWeight:700, color:D.white, lineHeight:1.2 }}>{p.address}</div>
          <div style={{ fontSize:'0.7rem', color:D.w60, marginTop:3 }}>{p.country}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'1.05rem', fontWeight:800, color:D.white }}>{fmtPrice(p.price, p.currency)}</div>
          <div style={{ fontSize:'0.65rem', color:D.w40, marginTop:2 }}>{p.area} m²</div>
        </div>
      </div>

      {/* Status + score */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:statusColor(p.status), boxShadow:`0 0 6px ${statusColor(p.status)}` }}/>
          <span style={{ fontSize:'0.7rem', fontWeight:600, color:statusColor(p.status) }}>{statusLabel(p.status)}</span>
        </div>
        <div style={{ flex:1 }}/>
        <div style={{
          fontSize:'0.65rem', fontWeight:800, color:D.yellow,
          padding:'2px 8px', borderRadius:6,
          background:'rgba(245,194,0,0.12)', border:'1px solid rgba(245,194,0,0.2)',
        }}>
          AI {p.matchScore}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display:'flex', gap:16, marginBottom:12 }}>
        {[
          { v: p.views.toLocaleString(), l:'Views' },
          { v: p.leads, l:'Leads' },
          { v: p.activeAgencies, l:'Agencies' },
        ].map((m,i) => (
          <div key={i}>
            <div style={{ fontSize:'0.85rem', fontWeight:700, color:D.white }}>{m.v}</div>
            <div style={{ fontSize:'0.6rem', color:D.w40 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      {p.totalAgencies > 0 && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:'0.6rem', color:D.w40 }}>Distribution wave {p.wave || 1}</span>
            <span style={{ fontSize:'0.6rem', color:D.yellow, fontWeight:600 }}>{pct}%</span>
          </div>
          <div style={{ height:3, borderRadius:3, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:3,
              background:'linear-gradient(90deg, #F5C200, #FF8C00)',
              width:`${pct}%`,
              boxShadow:'0 0 8px rgba(245,194,0,0.4)',
              transition:'width 0.8s ease',
            }}/>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Agency Row ───────────────────────────────────────────────────────────────
function AgencyRow({ ag, delay = 0 }: { ag: typeof DEMO_AGENCIES[0]; delay?: number }) {
  const [hov, setHov] = useState(false)
  return (
    <Stagger delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
          borderRadius:12, marginBottom:4,
          background: hov ? D.surface2 : 'transparent',
          border:`1px solid ${hov ? D.border2 : 'transparent'}`,
          transition:'all 0.2s ease', cursor:'pointer',
        }}>
        {/* Avatar */}
        <div style={{
          width:36, height:36, borderRadius:10, flexShrink:0,
          background:`${ag.color}18`, border:`1px solid ${ag.color}40`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'0.6rem', fontWeight:800, color:ag.color,
        }}>
          {ag.name.charAt(0)}{ag.name.split(' ')[1]?.charAt(0) || ''}
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:'0.8rem', fontWeight:600, color:D.w80, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ag.name}</div>
          <div style={{ fontSize:'0.65rem', color:D.w40 }}>{ag.city}</div>
        </div>

        {/* Score */}
        <div style={{ fontSize:'0.75rem', fontWeight:800, color:D.yellow }}>{ag.score}</div>

        {/* Status */}
        <div style={{
          fontSize:'0.6rem', fontWeight:700, color:ag.color,
          padding:'3px 8px', borderRadius:6,
          background:`${ag.color}18`,
          minWidth:60, textAlign:'center',
        }}>
          {statusLabel(ag.status)}
        </div>

        {/* Time */}
        <div style={{ fontSize:'0.6rem', color:D.w40, minWidth:50, textAlign:'right' }}>{ag.time}</div>
      </div>
    </Stagger>
  )
}

// ─── AI Copilot Panel ─────────────────────────────────────────────────────────
function AICopilot() {
  const [expanded, setExpanded] = useState(true)
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(false)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!expanded) return
    setTyping(true)
    const t = setTimeout(() => setTyping(false), 1200)
    return () => clearTimeout(t)
  }, [idx, expanded])

  const next = () => setIdx(i => (i + 1) % AI_INSIGHTS.length)
  const prev = () => setIdx(i => (i - 1 + AI_INSIGHTS.length) % AI_INSIGHTS.length)

  return (
    <div style={{
      position:'fixed', bottom:28, right:28, zIndex:500,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition:'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {expanded ? (
        <div style={{
          width:320, borderRadius:20, overflow:'hidden',
          background:'rgba(12,12,24,0.92)',
          border:'1px solid rgba(245,194,0,0.25)',
          backdropFilter:'blur(24px)',
          boxShadow:'0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(245,194,0,0.08)',
        }}>
          {/* Header */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:10, background:'linear-gradient(135deg, #F5C200, #FF8C00)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L9.5 6H14.5L10.5 9L12 14L8 11L4 14L5.5 9L1.5 6H6.5L8 1Z" fill="#080810"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color:D.white }}>AI Copilot</div>
              <div style={{ fontSize:'0.6rem', color:D.yellow, display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:D.green, animation:'pulse 2s infinite' }}/>
                Analysing your listings
              </div>
            </div>
            <button onClick={() => setExpanded(false)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:D.w40, fontSize:'18px', lineHeight:1 }}>×</button>
          </div>

          {/* Body */}
          <div style={{ padding:'16px' }}>
            <div style={{ minHeight:80, position:'relative' }}>
              {typing ? (
                <div style={{ display:'flex', gap:4, padding:'8px 0', alignItems:'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:D.yellow, animation:`bounce${i} 1s ${i*0.2}s infinite` }}/>
                  ))}
                  <style>{`@keyframes bounce0{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes bounce1{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes bounce2{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
                </div>
              ) : (
                <div style={{ fontSize:'0.82rem', color:D.w80, lineHeight:1.6 }}>{AI_INSIGHTS[idx]}</div>
              )}
            </div>

            {/* Navigation */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', gap:4 }}>
                {AI_INSIGHTS.map((_,i) => (
                  <div key={i} onClick={() => setIdx(i)} style={{ width: i===idx ? 16 : 6, height:6, borderRadius:3, background: i===idx ? D.yellow : D.w20, cursor:'pointer', transition:'all 0.2s' }}/>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={prev} style={{ width:28, height:28, borderRadius:8, background:D.surface2, border:`1px solid ${D.border}`, cursor:'pointer', color:D.w60, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
                <button onClick={next} style={{ width:28, height:28, borderRadius:8, background:D.surface2, border:`1px solid ${D.border}`, cursor:'pointer', color:D.w60, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button onClick={() => setExpanded(true)} style={{
          width:52, height:52, borderRadius:16, border:'none', cursor:'pointer',
          background:'linear-gradient(135deg, #F5C200, #E07B00)',
          boxShadow:'0 0 30px rgba(245,194,0,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'transform 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L13 8H19L14 12L16 18L11 14L6 18L8 12L3 8H9L11 2Z" fill="#080810"/>
          </svg>
        </button>
      )}
    </div>
  )
}

// ─── Live Pulse dot ───────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <div style={{ position:'relative', width:8, height:8 }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:D.green, position:'absolute' }}/>
      <div style={{ width:8, height:8, borderRadius:'50%', background:D.green, position:'absolute', animation:'pingAnim 1.5s infinite', opacity:0.5 }}/>
      <style>{`@keyframes pingAnim{0%{transform:scale(1);opacity:0.5}100%{transform:scale(2.5);opacity:0}}`}</style>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [selectedProp, setSelectedProp] = useState(0)
  const [tick, setTick] = useState(0)
  const prop = DEMO_PROPERTIES[selectedProp]

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000)
    return () => clearInterval(id)
  }, [])

  const totalLeads = DEMO_PROPERTIES.reduce((s, p) => s + p.leads, 0)
  const totalAgencies = DEMO_PROPERTIES.reduce((s, p) => s + p.activeAgencies, 0)
  const totalViews = DEMO_PROPERTIES.reduce((s, p) => s + p.views, 0)

  return (
    <div style={{ background: D.bg, minHeight:'100vh', color:D.white, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes floatUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      `}</style>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'28px 28px 120px' }}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <Stagger delay={0}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <LiveDot />
                <span style={{ fontSize:'0.68rem', fontWeight:700, color:D.green, letterSpacing:'0.1em', textTransform:'uppercase' }}>Live distribution active</span>
              </div>
              <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:D.white, letterSpacing:'-0.02em', lineHeight:1.2 }}>
                Good morning 👋
              </h1>
              <div style={{ fontSize:'0.85rem', color:D.w60, marginTop:4 }}>
                Your properties are reaching agencies across Europe right now.
              </div>
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <Link href="/properties/new" style={{
                display:'flex', alignItems:'center', gap:8, padding:'11px 20px',
                borderRadius:12, textDecoration:'none', fontWeight:700, fontSize:'0.82rem',
                background: D.grad1, color: D.bg,
                boxShadow:'0 0 24px rgba(245,194,0,0.25)',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5V12.5M1.5 7H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Add property
              </Link>
            </div>
          </div>
        </Stagger>

        {/* ── KPI Cards ────────────────────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:28 }}>
          <KPICard
            label="Active Listings"
            value={String(DEMO_PROPERTIES.length)}
            sub="2 distributing · 1 pending"
            delay={80}
            gradient="rgba(245,194,0,0.4)"
            icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 7V14H6V10H10V14H14V7L8 1Z" stroke={D.yellow} strokeWidth="1.25"/></svg>}
          />
          <KPICard
            label="Agencies Reached"
            value={String(totalAgencies)}
            sub="across EU + MENA"
            delay={160}
            gradient="rgba(59,91,219,0.5)"
            icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="8" r="2" fill={D.blue}/><circle cx="12" cy="4" r="2" fill={D.blue} fillOpacity="0.6"/><circle cx="12" cy="12" r="2" fill={D.blue} fillOpacity="0.6"/><path d="M6 7.5L10 5M6 8.5L10 11" stroke={D.blue} strokeWidth="1"/></svg>}
          />
          <KPICard
            label="New Leads"
            value={String(totalLeads)}
            sub={`+${totalLeads} this week`}
            delay={240}
            gradient="rgba(34,197,94,0.5)"
            icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.5" stroke={D.green} strokeWidth="1.25"/><path d="M1.5 13c0-2 1.8-3.5 4-3.5M10 9.5V13M8 11.5H12" stroke={D.green} strokeWidth="1.25" strokeLinecap="round"/></svg>}
          />
          <KPICard
            label="Total Views"
            value={totalViews.toLocaleString()}
            sub="agency + buyer traffic"
            delay={320}
            gradient="rgba(112,72,232,0.5)"
            icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8C1 8 4 3 8 3C12 3 15 8 15 8C15 8 12 13 8 13C4 13 1 8 1 8Z" stroke={D.purple} strokeWidth="1.25"/><circle cx="8" cy="8" r="2" fill={D.purple} fillOpacity="0.5" stroke={D.purple} strokeWidth="1"/></svg>}
          />
        </div>

        {/* ── Main Grid ────────────────────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:20, alignItems:'start' }}>

          {/* ─ Left column: properties ─ */}
          <Stagger delay={200}>
            <div style={{ borderRadius:20, background:D.surface, border:`1px solid ${D.border}`, overflow:'hidden' }}>
              {/* Header */}
              <div style={{ padding:'16px 20px', borderBottom:`1px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:D.white }}>My Properties</div>
                <Link href="/properties" style={{ fontSize:'0.7rem', color:D.yellow, textDecoration:'none', fontWeight:600 }}>View all →</Link>
              </div>
              {/* Cards */}
              <div style={{ padding:'12px' }}>
                {DEMO_PROPERTIES.map((p, i) => (
                  <PropertyCard key={p.id} p={p} active={selectedProp === i} onClick={() => setSelectedProp(i)} />
                ))}
              </div>
              {/* Add CTA */}
              <div style={{ padding:'0 12px 12px' }}>
                <Link href="/properties/new" style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  padding:'12px', borderRadius:14, textDecoration:'none',
                  background:'rgba(245,194,0,0.06)', border:'1px dashed rgba(245,194,0,0.25)',
                  color:D.yellow, fontSize:'0.78rem', fontWeight:600,
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1.5V10.5M1.5 6H10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
                  Add new property
                </Link>
              </div>
            </div>
          </Stagger>

          {/* ─ Right column ─ */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Agency distribution panel */}
            <Stagger delay={280}>
              <div style={{ borderRadius:20, background:D.surface, border:`1px solid ${D.border}`, overflow:'hidden' }}>
                {/* Header */}
                <div style={{ padding:'16px 20px', borderBottom:`1px solid ${D.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontSize:'0.82rem', fontWeight:700, color:D.white, marginBottom:3 }}>Agency Distribution — {prop.type} {prop.city}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <LiveDot />
                      <span style={{ fontSize:'0.65rem', color:D.green }}>Wave {prop.wave || 1} active · {prop.activeAgencies} agencies notified</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{
                      fontSize:'0.7rem', fontWeight:800, color:D.yellow,
                      padding:'5px 12px', borderRadius:8,
                      background:'rgba(245,194,0,0.1)', border:'1px solid rgba(245,194,0,0.25)',
                    }}>
                      AI Score {prop.matchScore}
                    </div>
                    <Link href={`/properties/${prop.id}`} style={{ fontSize:'0.7rem', color:D.yellow, textDecoration:'none', fontWeight:600 }}>Details →</Link>
                  </div>
                </div>

                {/* Agency rows */}
                <div style={{ padding:'8px 8px' }}>
                  {DEMO_AGENCIES.map((ag, i) => <AgencyRow key={i} ag={ag} delay={i * 60} />)}
                </div>
              </div>
            </Stagger>

            {/* Bottom row: activity + mini stats */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

              {/* Recent activity */}
              <Stagger delay={360}>
                <div style={{ borderRadius:20, background:D.surface, border:`1px solid ${D.border}`, overflow:'hidden', padding:'16px 20px' }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:700, color:D.white, marginBottom:16 }}>Recent Activity</div>
                  {DEMO_ACTIVITY.map((a, i) => (
                    <div key={i} style={{ display:'flex', gap:12, marginBottom:14, paddingBottom: i < DEMO_ACTIVITY.length-1 ? 14 : 0, borderBottom: i < DEMO_ACTIVITY.length-1 ? `1px solid ${D.border}` : 'none' }}>
                      <div style={{ width:32, height:32, borderRadius:10, background:`${a.color}15`, border:`1px solid ${a.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', flexShrink:0 }}>{a.icon}</div>
                      <div>
                        <div style={{ fontSize:'0.75rem', fontWeight:600, color:D.w80, lineHeight:1.3, marginBottom:3 }}>{a.text}</div>
                        <div style={{ fontSize:'0.65rem', color:D.w40 }}>{a.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Stagger>

              {/* Quick actions + distribution stats */}
              <Stagger delay={440}>
                <div style={{ borderRadius:20, background:D.surface, border:`1px solid ${D.border}`, overflow:'hidden', padding:'16px 20px' }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:700, color:D.white, marginBottom:16 }}>Quick Actions</div>

                  {[
                    { label:'View all leads', href:'/leads', icon:'💬', color:D.green },
                    { label:'Distribution report', href:'/distribution', icon:'📊', color:D.blue },
                    { label:'Messages inbox', href:'/messenger', icon:'📩', color:D.yellow, badge:'2' },
                    { label:'Agency Portal', href:'/agency-portal', icon:'🏢', color:D.purple },
                  ].map((q, i) => (
                    <Link key={i} href={q.href} style={{
                      display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                      borderRadius:12, textDecoration:'none', marginBottom:6,
                      background:D.surface2, border:`1px solid ${D.border}`,
                      transition:'all 0.2s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = D.border2; (e.currentTarget as HTMLAnchorElement).style.background = D.surface3; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = D.border; (e.currentTarget as HTMLAnchorElement).style.background = D.surface2; }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:`${q.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', flexShrink:0 }}>{q.icon}</div>
                      <span style={{ fontSize:'0.78rem', fontWeight:600, color:D.w80, flex:1 }}>{q.label}</span>
                      {q.badge && (
                        <div style={{ background:D.grad1, color:D.bg, fontSize:'0.58rem', fontWeight:800, padding:'2px 6px', borderRadius:6 }}>{q.badge}</div>
                      )}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 2L9 6L5 10" stroke={D.w40} strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </Link>
                  ))}

                  {/* Distribution health */}
                  <div style={{ marginTop:16, padding:'12px', borderRadius:12, background:'rgba(245,194,0,0.06)', border:'1px solid rgba(245,194,0,0.15)' }}>
                    <div style={{ fontSize:'0.65rem', fontWeight:700, color:D.yellow, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Distribution Health</div>
                    {[
                      { l:'Response rate', v:67, c:D.green },
                      { l:'Open rate', v:84, c:D.yellow },
                      { l:'Reply rate', v:44, c:D.blue },
                    ].map((r, i) => (
                      <div key={i} style={{ marginBottom: i < 2 ? 8 : 0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:'0.65rem', color:D.w60 }}>{r.l}</span>
                          <span style={{ fontSize:'0.65rem', fontWeight:700, color:r.c }}>{r.v}%</span>
                        </div>
                        <div style={{ height:3, borderRadius:3, background:'rgba(255,255,255,0.07)' }}>
                          <div style={{ height:'100%', borderRadius:3, background:r.c, width:`${r.v}%`, transition:'width 1s ease 0.5s' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Stagger>
            </div>
          </div>
        </div>
      </div>

      {/* AI Copilot floating */}
      <AICopilot />
    </div>
  )
}
