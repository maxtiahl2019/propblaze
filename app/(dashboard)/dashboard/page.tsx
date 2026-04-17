'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/auth'

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        '#F7F6F3',
  white:     '#FFFFFF',
  card:      '#FFFFFF',
  border:    '#EBEBEB',
  text:      '#111111',
  text2:     '#555555',
  text3:     '#999999',
  green:     '#1A7A4A',
  greenBg:   '#E8F5EE',
  greenMid:  '#22C55E',
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

/* ─── Demo seed data (rich dashboard for demo) ─────────────────────────────── */
const DEMO_PROPERTIES = [
  {
    id: 'p-1', type: 'Villa', city: 'Belgrade', country: 'Serbia', flag: '🇷🇸',
    price: 485000, sqm: 210, beds: 4, baths: 3,
    status: 'in_distribution',
    img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
    agencies: 18, responses: 7, views: 42,
    desc: 'Luxury villa with panoramic views',
  },
  {
    id: 'p-2', type: 'Apartment', city: 'Novi Sad', country: 'Serbia', flag: '🇷🇸',
    price: 175000, sqm: 85, beds: 2, baths: 1,
    status: 'in_distribution',
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
    agencies: 12, responses: 4, views: 28,
    desc: 'Modern apartment in city center',
  },
  {
    id: 'p-3', type: 'Land', city: 'Niš', country: 'Serbia', flag: '🇷🇸',
    price: 95000, sqm: 1200, beds: 0, baths: 0,
    status: 'draft',
    img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
    agencies: 0, responses: 0, views: 0,
    desc: 'Development plot with permits',
  },
]

const DEMO_WAVE_LOG = (() => {
  const now = Date.now()
  const agencies = [
    { name: 'CityExpert Serbia', country: 'RS', score: 94 },
    { name: 'Colliers Serbia', country: 'RS', score: 91 },
    { name: 'Halo Oglasi Premium', country: 'RS', score: 89 },
    { name: 'RE/MAX Serbia', country: 'RS', score: 87 },
    { name: 'Nekretnine.rs Pro', country: 'RS', score: 85 },
    { name: 'Arion Real Estate', country: 'RS', score: 83 },
    { name: 'First Belgrade RE', country: 'RS', score: 82 },
    { name: 'Premium Nekretnine', country: 'RS', score: 80 },
    { name: 'Casa Real Estate', country: 'RS', score: 79 },
    { name: 'Knight Frank Serbia', country: 'RS', score: 92 },
    { name: 'Engel & Völkers RS', country: 'RS', score: 90 },
    { name: 'Delta Real Estate', country: 'RS', score: 86 },
    { name: 'BG Nekretnine', country: 'RS', score: 84 },
    { name: 'Zeleni Partner', country: 'RS', score: 81 },
    { name: 'Savills SEE', country: 'RS', score: 88 },
    { name: 'CBS International', country: 'RS', score: 86 },
    { name: 'Meridian Group', country: 'RS', score: 78 },
    { name: 'Nova Kuća Agency', country: 'RS', score: 77 },
  ]
  return agencies.map((a, i) => ({
    id: `rs-${i}`,
    name: a.name,
    score: a.score,
    wave: i < 10 ? 1 : i < 15 ? 2 : 3,
    sent_at: new Date(now - (i * 3600_000 + Math.random() * 86400_000 * 3)).toISOString(),
  }))
})()

const DEMO_INBOX = [
  { agency: 'CityExpert Serbia', flag: '🇷🇸', msg: 'We have 3 qualified buyers for your villa. When can we arrange a viewing?', time: '2h', unread: true },
  { agency: 'Knight Frank Serbia', flag: '🇷🇸', msg: 'Our client from Vienna is very interested. Can you provide floor plans?', time: '5h', unread: true },
  { agency: 'Colliers Serbia', flag: '🇷🇸', msg: 'Thank you for the documents. We will schedule a viewing this week.', time: '1d', unread: false },
  { agency: 'Engel & Völkers RS', flag: '🇷🇸', msg: 'Excellent property. We have two HNW clients matching this profile.', time: '1d', unread: false },
  { agency: 'Savills SEE', flag: '🇷🇸', msg: 'Interested in exclusive listing agreement. Let\'s discuss terms.', time: '2d', unread: false },
]

function getGreeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening' }
function initials(name: string) { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() }

function buildBarData(waveLog: any[]) {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const now = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6 - i))
    const sent = waveLog.filter(e => {
      if (!e.sent_at) return false
      const ed = new Date(e.sent_at)
      return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth() && ed.getDate() === d.getDate()
    }).length
    return { day: days[d.getDay()], sent }
  })
}

/* ─── Property Card ────────────────────────────────────────────────────────── */
function PropertyCard({ p }: { p: typeof DEMO_PROPERTIES[0] }) {
  const [hovered, setHovered] = useState(false)
  const isActive = p.status === 'in_distribution'
  return (
    <Link href="/properties" style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: T.card, borderRadius: 20, overflow: 'hidden',
          boxShadow: hovered ? T.shadowHov : T.shadow,
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'pointer', border: `1px solid ${T.border}`,
        }}
      >
        <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#E8E8E4' }}>
          <img src={p.img} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.45s ease',
          }} />
          <div style={{
            position: 'absolute', top: 12, left: 12,
            padding: '4px 10px', borderRadius: 99,
            background: isActive ? T.greenBg : '#F5F5F5',
            color: isActive ? T.green : T.text3,
            fontSize: '0.68rem', fontWeight: 700,
            backdropFilter: 'blur(4px)',
          }}>
            {isActive ? '● Distributing' : 'Draft'}
          </div>
          {p.agencies > 0 && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              padding: '4px 10px', borderRadius: 99,
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              fontSize: '0.65rem', fontWeight: 700,
              backdropFilter: 'blur(4px)',
            }}>
              📡 {p.agencies} agencies
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
            padding: '32px 14px 14px',
          }}>
            <div style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              €{p.price.toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ fontSize: '0.94rem', fontWeight: 700, color: T.text, marginBottom: 4, letterSpacing: '-0.01em' }}>
            {p.flag} {p.type} · {p.city}
          </div>
          <div style={{ fontSize: '0.78rem', color: T.text3, marginBottom: 10 }}>
            {p.sqm} m²{p.beds > 0 ? ` · ${p.beds} bed · ${p.baths} bath` : ''}
          </div>
          {isActive && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ padding: '3px 8px', borderRadius: 99, background: T.greenBg, fontSize: '0.68rem', fontWeight: 700, color: T.green }}>
                {p.responses} responses
              </div>
              <div style={{ padding: '3px 8px', borderRadius: 99, background: T.blueBg, fontSize: '0.68rem', fontWeight: 700, color: T.blue }}>
                {p.views} views
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ─── KPI Card ─────────────────────────────────────────────────────────────── */
function KpiCard({ icon, label, value, sub, color, bg, href, badge }: any) {
  const [hov, setHov] = useState(false)
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: T.white, borderRadius: 16, padding: '18px 20px',
          border: `1px solid ${T.border}`,
          boxShadow: hov ? T.shadowHov : T.shadow,
          transform: hov ? 'translateY(-3px)' : 'none',
          transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', gap: 14, position: 'relative',
        }}
      >
        <div style={{ width: 46, height: 46, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
          <div style={{ fontSize: '0.72rem', color: T.text3, fontWeight: 600, marginTop: 3 }}>{label}</div>
          {sub && <div style={{ fontSize: '0.68rem', color: T.text3, marginTop: 1 }}>{sub}</div>}
        </div>
        {badge && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            width: 20, height: 20, borderRadius: 99,
            background: T.red, color: '#fff',
            fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{badge}</div>
        )}
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth()
  const userName = (user as any)?.profile?.full_name || (user as any)?.name || user?.email?.split('@')[0] || 'Max'

  // Use localStorage data if available, otherwise fall back to demo seed
  const [props, setProps] = useState<typeof DEMO_PROPERTIES>([])
  const [waveLog, setWaveLog] = useState<any[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pb_wizard_props') || '[]')
      if (Array.isArray(stored) && stored.length > 0) {
        setProps(stored.map((p: any, i: number) => ({
          id: p.id || `p-${i}`,
          type: p.property_type ? (p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1)) : 'Property',
          city: p.city || '—', country: p.country || '', flag: '🇷🇸',
          price: p.asking_price || 0, sqm: p.area_sqm || 0, beds: p.bedrooms || 0, baths: p.bathrooms || 0,
          status: p.status || 'draft', agencies: 0, responses: 0, views: 0,
          img: p.photos?.[0] || DEMO_PROPERTIES[i % DEMO_PROPERTIES.length].img,
          desc: p.description || '',
        })))
      } else {
        setProps(DEMO_PROPERTIES)
      }
    } catch { setProps(DEMO_PROPERTIES) }

    try {
      const wl = JSON.parse(localStorage.getItem('pb_wave_log') || '[]')
      setWaveLog(Array.isArray(wl) && wl.length > 0 ? wl : DEMO_WAVE_LOG)
    } catch { setWaveLog(DEMO_WAVE_LOG) }
  }, [])

  const totalAgencies = waveLog.length
  const totalResponses = props.reduce((s, p) => s + (p.responses || 0), 0)
  const waves = waveLog.length > 0 ? [...new Set(waveLog.map((e: any) => e.wave))].length : 0
  const BAR_DATA = buildBarData(waveLog)
  const BAR_MAX = Math.max(...BAR_DATA.map(d => d.sent), 1)
  const unread = DEMO_INBOX.filter(m => m.unread).length

  const activity = waveLog.slice(-8).reverse().map((e: any, i: number) => ({
    id: e.id || i, agency: e.name, avatar: initials(e.name),
    msg: `Offer sent · Score ${e.score}`,
    time: e.sent_at ? (() => { const h = Math.floor((Date.now() - new Date(e.sent_at).getTime()) / 3600000); return h < 1 ? '<1h' : h < 24 ? `${h}h` : `${Math.floor(h / 24)}d` })() : '—',
    wave: e.wave,
    score: e.score,
  }))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { background: ${T.bg}; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .fade-up { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: 'Inter,system-ui,sans-serif', color: T.text }}>

        {/* ── TOP BAR ──────────────────────────────────────────────────── */}
        <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 2 }}>
              {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.03em' }}>
              {getGreeting()}, {userName}
            </h1>
          </div>
          <Link href="/properties/new">
            <button style={{
              background: T.green, color: '#fff', border: 'none', borderRadius: 12,
              padding: '11px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: `0 2px 12px ${T.green}44`, transition: 'all 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Property
            </button>
          </Link>
        </div>

        <div style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto' }}>

          {/* ── KPI ROW ────────────────────────────────────────────────── */}
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
            <KpiCard icon="🏠" label="Properties" value={props.length} sub={`${props.filter(p => p.status === 'in_distribution').length} active`} color={T.green} bg={T.greenBg} href="/properties" />
            <KpiCard icon="📡" label="Agencies Reached" value={totalAgencies} sub={`${waves} waves sent`} color={T.blue} bg={T.blueBg} href="/distribution" />
            <KpiCard icon="✉️" label="Responses" value={totalResponses} sub="from agencies" color={T.orange} bg={T.orangeBg} href="/leads" />
            <KpiCard icon="💬" label="Messages" value={unread} sub="unread" color={T.blue} bg={T.blueBg} href="/chat" badge={unread > 0 ? unread : undefined} />
          </div>

          {/* ── MAIN GRID ─────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

            {/* LEFT COLUMN */}
            <div>

              {/* Property cards */}
              <div className="fade-up" style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: '20px', marginBottom: 20, boxShadow: T.shadow, animationDelay: '0.1s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>My Properties</h2>
                    <p style={{ fontSize: 12, color: T.text3, margin: '3px 0 0' }}>{props.length} listing{props.length !== 1 ? 's' : ''} · {props.filter(p => p.status === 'in_distribution').length} distributing</p>
                  </div>
                  <Link href="/properties" style={{ fontSize: 12, color: T.green, fontWeight: 700, textDecoration: 'none' }}>View all →</Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                  {props.map(p => <PropertyCard key={p.id} p={p} />)}
                  <Link href="/properties/new" style={{ textDecoration: 'none' }}>
                    <div style={{
                      height: 280, borderRadius: 20, border: `2px dashed ${T.border}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s', color: T.text3,
                    }}
                      onMouseEnter={e => { (e.currentTarget as any).style.borderColor = T.green; (e.currentTarget as any).style.color = T.green }}
                      onMouseLeave={e => { (e.currentTarget as any).style.borderColor = T.border; (e.currentTarget as any).style.color = T.text3 }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>Add property</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* APEX Activity Chart */}
              <div className="fade-up" style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: '20px', boxShadow: T.shadow, animationDelay: '0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>APEX Distribution</h2>
                    <p style={{ fontSize: 12, color: T.text3, margin: '3px 0 0' }}>Agencies contacted — last 7 days</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
                  {BAR_DATA.map(d => (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
                      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div style={{
                          width: '100%', borderRadius: '6px 6px 0 0',
                          height: `${BAR_MAX > 0 ? (d.sent / BAR_MAX) * 90 : 4}%`,
                          minHeight: d.sent > 0 ? 6 : 2,
                          background: d.sent > 0 ? `linear-gradient(180deg,${T.greenMid},${T.green})` : T.border,
                          transition: 'height 0.6s ease', position: 'relative',
                        }}>
                          {d.sent > 0 && <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 800, color: T.green }}>{d.sent}</div>}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: T.text3 }}>{d.day}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
                  {[
                    { label: 'Agencies sent', value: waveLog.length, color: T.green },
                    { label: 'Waves', value: waves, color: T.blue },
                    { label: 'Avg score', value: waveLog.length ? Math.round(waveLog.reduce((s: number, e: any) => s + (e.score || 0), 0) / waveLog.length) : '—', color: T.orange },
                    { label: 'Responses', value: totalResponses, color: T.green },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* APEX Hero card */}
              <div className="fade-up" style={{
                background: `linear-gradient(135deg, ${T.green} 0%, #0F5C35 100%)`,
                borderRadius: 20, padding: '22px', color: '#fff',
                boxShadow: `0 8px 32px ${T.green}44`, animationDelay: '0.05s',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 }}>PropBlaze APEX Engine</div>
                <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 16, lineHeight: 1.2 }}>
                  {props.filter(p => p.status === 'in_distribution').length} propert{props.filter(p => p.status === 'in_distribution').length !== 1 ? 'ies' : 'y'} distributing
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Agencies reached', val: totalAgencies },
                    { label: 'Agency responses', val: totalResponses },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 14px', backdropFilter: 'blur(4px)' }}>
                      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em' }}>{s.val}</div>
                      <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages (live inbox preview) */}
              <div className="fade-up" style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: T.shadow, animationDelay: '0.15s' }}>
                <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 900, margin: 0 }}>Inbox</h2>
                    {unread > 0 && (
                      <div style={{ width: 20, height: 20, borderRadius: 99, background: T.red, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</div>
                    )}
                  </div>
                  <Link href="/chat" style={{ fontSize: 12, color: T.green, fontWeight: 700, textDecoration: 'none' }}>Open →</Link>
                </div>
                {DEMO_INBOX.map((m, i) => (
                  <Link key={i} href="/chat" style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '11px 18px',
                      borderBottom: i < DEMO_INBOX.length - 1 ? `1px solid ${T.border}` : 'none',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      background: m.unread ? '#FAFFF8' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF8')}
                      onMouseLeave={e => (e.currentTarget.style.background = m.unread ? '#FAFFF8' : 'transparent')}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        background: m.unread ? T.greenBg : '#F0F0ED',
                        color: m.unread ? T.green : T.text2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800,
                      }}>
                        {initials(m.agency)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: m.unread ? 800 : 600, color: T.text }}>{m.flag} {m.agency}</span>
                          <span style={{ fontSize: 10, color: T.text3 }}>{m.time}</span>
                        </div>
                        <div style={{ fontSize: 11, color: m.unread ? T.text2 : T.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: m.unread ? 600 : 400 }}>{m.msg}</div>
                      </div>
                      {m.unread && <div style={{ width: 8, height: 8, borderRadius: 99, background: T.green, flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Activity feed */}
              <div className="fade-up" style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: T.shadow, flex: 1, animationDelay: '0.25s' }}>
                <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 14, fontWeight: 900, margin: 0 }}>Recent Activity</h2>
                  <Link href="/leads" style={{ fontSize: 12, color: T.green, fontWeight: 700, textDecoration: 'none' }}>All →</Link>
                </div>
                {activity.map((a, i) => (
                  <div key={`${a.id}-${i}`} style={{
                    padding: '11px 18px',
                    borderBottom: i < activity.length - 1 ? `1px solid ${T.border}` : 'none',
                    display: 'flex', gap: 10, alignItems: 'center',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: a.wave === 1 ? T.greenBg : a.wave === 2 ? T.blueBg : T.orangeBg,
                      color: a.wave === 1 ? T.green : a.wave === 2 ? T.blue : T.orange,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 800,
                    }}>
                      W{a.wave}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.agency}
                      </div>
                      <div style={{ fontSize: 11, color: T.text3 }}>Score {a.score} · {a.time} ago</div>
                    </div>
                    <div style={{
                      padding: '2px 8px', borderRadius: 99,
                      background: a.score >= 90 ? T.greenBg : a.score >= 80 ? T.blueBg : T.orangeBg,
                      color: a.score >= 90 ? T.green : a.score >= 80 ? T.blue : T.orange,
                      fontSize: 10, fontWeight: 800,
                    }}>{a.score}</div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="fade-up" style={{ background: T.white, borderRadius: 20, border: `1px solid ${T.border}`, padding: '16px 18px', boxShadow: T.shadow, animationDelay: '0.3s' }}>
                <h2 style={{ fontSize: 14, fontWeight: 900, margin: '0 0 12px' }}>Quick Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { icon: '🏠', label: 'New Property', sub: 'Add & list', href: '/properties/new' },
                    { icon: '💬', label: 'Messages', sub: `${unread} unread`, href: '/chat' },
                    { icon: '📡', label: 'Distribution', sub: 'View campaigns', href: '/distribution' },
                    { icon: '💳', label: 'Billing', sub: 'Manage plan', href: '/billing' },
                  ].map(a => (
                    <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        borderRadius: 12, transition: 'all 0.15s', cursor: 'pointer',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.greenBg }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{a.icon}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{a.label}</div>
                          <div style={{ fontSize: 11, color: T.text3 }}>{a.sub}</div>
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
