'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/store/auth'

// ─── Colors ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#F8FAFC',
  white:    '#FFFFFF',
  border:   '#E2E8F0',
  border2:  '#F1F5F9',
  text:     '#0F172A',
  text2:    '#475569',
  text3:    '#94A3B8',
  green:    '#16A34A',
  greenBg:  '#DCFCE7',
  greenMid: '#22C55E',
  yellow:   '#F5C200',
  yellowBg: '#FEF9C3',
  orange:   '#EA580C',
  orangeBg: '#FFF7ED',
  blue:     '#3B5BDB',
  blueBg:   '#EEF2FF',
  red:      '#EF4444',
  redBg:    '#FEF2F2',
  purple:   '#7C3AED',
  purpleBg: '#F3E8FF',
}

// ─── Demo data ─────────────────────────────────────────────────────────────
const DEMO_ACTIVITY = [
  { id: 1, agency: 'City Expert Belgrade', flag: '🇷🇸', msg: 'Interested. Can you share the title deed?', time: '2h', unread: true, avatar: 'CE' },
  { id: 2, agency: 'FK Montenegro',        flag: '🇲🇪', msg: 'We have a German buyer ready for viewing.', time: '5h', unread: true, avatar: 'FK' },
  { id: 3, agency: 'RE/MAX Serbia',        flag: '🇷🇸', msg: 'What is the minimum acceptable price?', time: '1d', unread: false, avatar: 'RM' },
  { id: 4, agency: 'Balkanians EU',        flag: '🇩🇪', msg: 'Client requests virtual tour. Available?',  time: '2d', unread: false, avatar: 'BL' },
]

// Bar chart data — agencies contacted per day (last 7 days)
const BAR_DATA = [
  { day: 'Mo', sent: 4, replied: 1 },
  { day: 'Tu', sent: 8, replied: 3 },
  { day: 'We', sent: 6, replied: 2 },
  { day: 'Th', sent: 10, replied: 4 },
  { day: 'Fr', sent: 7, replied: 2 },
  { day: 'Sa', sent: 2, replied: 1 },
  { day: 'Su', sent: 0, replied: 0 },
]
const BAR_MAX = Math.max(...BAR_DATA.map(d => d.sent))

// Unsplash placeholder property images
const PROP_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const userName = (user as any)?.profile?.full_name || (user as any)?.name || user?.email?.split('@')[0] || 'Max'
  const [localProps, setLocalProps] = useState<any[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pb_wizard_props') || '[]')
      setLocalProps(stored)
    } catch { setLocalProps([]) }
  }, [])

  // Merge wizard props with demo data
  const allProps = [
    ...localProps.map((p: any, i: number) => ({
      id: p.id,
      type: p.property_type?.charAt(0).toUpperCase() + p.property_type?.slice(1) || 'Property',
      city: p.city || '—',
      country: p.country || '',
      price: p.asking_price || 0,
      currency: p.currency || 'EUR',
      sqm: p.area_sqm || 0,
      beds: p.bedrooms || 0,
      status: p.status || 'draft',
      agencies: p.agencies_sent || 0,
      leads: 0,
      img: p.photos?.[0] || PROP_IMAGES[i % PROP_IMAGES.length],
    })),
  ]

  const activeProps = allProps.filter(p => p.status === 'in_distribution' || p.status === 'active')
  const totalAgencies = allProps.reduce((s, p) => s + (p.agencies || 0), 0)
  const unread = DEMO_ACTIVITY.filter(a => a.unread).length

  const kpis = [
    { label: 'Properties',  value: allProps.length,      icon: '🏠', color: C.green,  bg: C.greenBg,  link: '/properties' },
    { label: 'Agencies',    value: totalAgencies || 10,  icon: '📡', color: C.blue,   bg: C.blueBg,   link: '/distribution' },
    { label: 'Leads',       value: DEMO_ACTIVITY.length, icon: '🔥', color: C.orange, bg: C.orangeBg, link: '/leads' },
    { label: 'Messages',    value: unread,               icon: '💬', color: C.purple, bg: C.purpleBg, link: '/messenger' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .db-card { transition: box-shadow 0.18s, transform 0.18s; }
        .db-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.10) !important; transform: translateY(-1px); }
        .db-btn { transition: all 0.15s; cursor: pointer; }
        .db-btn:hover { filter: brightness(0.96); }
        .db-btn:active { transform: scale(0.98); }
        .dot-pulse { animation: dotPulse 1.4s ease-in-out infinite; }
        @keyframes dotPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .slide-in { animation: slideIn 0.4s ease both; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Inter, system-ui, sans-serif', color: C.text }}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div style={{
          background: C.white, borderBottom: `1px solid ${C.border}`,
          padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: C.text3, fontWeight: 600, marginBottom: 2 }}>
              {getGreeting()}, {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.03em' }}>
              {getGreeting()}, {userName} 👋
            </h1>
          </div>
          <Link href="/properties/new" style={{ textDecoration: 'none' }}>
            <button className="db-btn" style={{
              background: C.green, color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 18px', fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Property
            </button>
          </Link>
        </div>

        <div style={{ padding: '24px 28px', maxWidth: 1200 }}>

          {/* ── KPI CARDS ──────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }} className="slide-in">
            {kpis.map(k => (
              <Link key={k.label} href={k.link} style={{ textDecoration: 'none' }}>
                <div className="db-card" style={{
                  background: C.white, borderRadius: 14, padding: '18px 20px',
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {k.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
                    <div style={{ fontSize: 12, color: C.text3, fontWeight: 600, marginTop: 2 }}>{k.label}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── MAIN 2-COL LAYOUT ──────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

            {/* LEFT: Properties + Bar chart */}
            <div>
              {/* Properties */}
              <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 20 }} className="db-card slide-in">
                <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: C.text }}>My Properties</h2>
                  <Link href="/properties" style={{ fontSize: 12, color: C.green, fontWeight: 700, textDecoration: 'none' }}>All properties →</Link>
                </div>

                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 120px', gap: 12, padding: '10px 20px', background: C.bg, borderBottom: `1px solid ${C.border2}` }}>
                  {['Property', 'Area', 'Price', 'Agencies', 'Status'].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                  ))}
                </div>

                {allProps.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>🏠</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text2, marginBottom: 6 }}>No properties yet</div>
                    <div style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>Add your first property and launch APEX distribution</div>
                    <Link href="/properties/new" style={{ textDecoration: 'none' }}>
                      <button style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        + Add Property
                      </button>
                    </Link>
                  </div>
                ) : (
                  allProps.map((p, i) => {
                    const isActive = p.status === 'in_distribution' || p.status === 'active'
                    const isDraft  = p.status === 'draft'
                    const isSold   = p.status === 'sold'
                    const statusColor = isActive ? C.green : isDraft ? C.text3 : C.blue
                    const statusBg    = isActive ? C.greenBg : isDraft ? C.bg : C.blueBg
                    const statusLabel = isActive ? '● In distribution' : isDraft ? '○ Draft' : '✓ Sold'
                    return (
                      <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 120px', gap: 12, padding: '14px 20px', borderBottom: i < allProps.length - 1 ? `1px solid ${C.border2}` : 'none', alignItems: 'center' }}>
                        {/* Property */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 52, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: C.bg }}>
                            <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as any).src = PROP_IMAGES[i % 3] }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.type} · {p.city}</div>
                            <div style={{ fontSize: 11, color: C.text3 }}>{p.country}</div>
                          </div>
                        </div>
                        {/* Sqm */}
                        <div style={{ fontSize: 13, color: C.text2, fontWeight: 500 }}>{p.sqm > 0 ? `${p.sqm} m²` : '—'}</div>
                        {/* Price */}
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>
                          {p.price > 0 ? `€${p.price.toLocaleString()}` : '—'}
                        </div>
                        {/* Agencies */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>{p.agencies || 0}</div>
                          {p.agencies > 0 && (
                            <div style={{ height: 4, flex: 1, borderRadius: 99, background: C.border2, overflow: 'hidden', maxWidth: 50 }}>
                              <div style={{ height: '100%', width: `${Math.min((p.agencies / 26) * 100, 100)}%`, background: C.green, borderRadius: 99 }} />
                            </div>
                          )}
                        </div>
                        {/* Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: statusBg, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}

                {/* Add row */}
                <Link href="/properties/new" style={{ textDecoration: 'none' }}>
                  <div className="db-btn" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8, color: C.green, fontSize: 13, fontWeight: 700, borderTop: `1px solid ${C.border2}` }}>
                    <span style={{ fontSize: 18 }}>+</span> Add Property
                  </div>
                </Link>
              </div>

              {/* Distribution Bar Chart */}
              <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '18px 20px' }} className="db-card slide-in">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px', color: C.text }}>APEX Activity</h2>
                    <div style={{ fontSize: 12, color: C.text3 }}>Sent & received over 7 days</div>
                  </div>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.text3 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: C.green }} /> Sent
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.text3 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: C.yellow }} /> Replied
                    </div>
                  </div>
                </div>

                {/* Bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
                  {BAR_DATA.map(d => (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
                      <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 3, position: 'relative' }}>
                        {/* Sent bar */}
                        <div style={{
                          width: '100%', borderRadius: '4px 4px 0 0',
                          height: `${BAR_MAX > 0 ? (d.sent / BAR_MAX) * 90 : 0}%`,
                          minHeight: d.sent > 0 ? 4 : 0,
                          background: `linear-gradient(180deg, ${C.greenMid}, ${C.green})`,
                          transition: 'height 0.6s ease',
                          position: 'relative',
                        }}>
                          {d.sent > 0 && (
                            <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: C.green }}>{d.sent}</div>
                          )}
                        </div>
                        {/* Replied bar */}
                        {d.replied > 0 && (
                          <div style={{
                            position: 'absolute', bottom: 0, left: '15%', width: '70%',
                            height: `${(d.replied / BAR_MAX) * 90}%`,
                            minHeight: 3,
                            background: C.yellow, borderRadius: '3px 3px 0 0', opacity: 0.85,
                          }} />
                        )}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.text3 }}>{d.day}</div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border2}` }}>
                  {[
                    { label: 'Total sent', value: BAR_DATA.reduce((s,d)=>s+d.sent,0), color: C.green },
                    { label: 'Replies', value: BAR_DATA.reduce((s,d)=>s+d.replied,0), color: C.yellow },
                    { label: 'Reply Rate', value: `${Math.round(BAR_DATA.reduce((s,d)=>s+d.replied,0)/Math.max(BAR_DATA.reduce((s,d)=>s+d.sent,0),1)*100)}%`, color: C.blue },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Activity + Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Greeting card with stats */}
              <div style={{ background: `linear-gradient(135deg, ${C.green} 0%, #15803D 100%)`, borderRadius: 16, padding: '20px', color: '#fff' }} className="slide-in">
                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>PropBlaze APEX</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
                  {activeProps.length > 0 ? `${activeProps.length} property in distribution` : 'Ready to launch 🚀'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Agencies reached', val: totalAgencies || 0 },
                    { label: 'New leads',         val: unread },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 22, fontWeight: 900 }}>{s.val}</div>
                      <div style={{ fontSize: 11, opacity: 0.8 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }} className="db-card slide-in">
                <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Activity</h2>
                    {unread > 0 && (
                      <span style={{ background: C.red, color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 20, padding: '2px 7px' }}>{unread}</span>
                    )}
                  </div>
                  <Link href="/leads" style={{ fontSize: 12, color: C.green, fontWeight: 700, textDecoration: 'none' }}>All →</Link>
                </div>

                {DEMO_ACTIVITY.map((a, i) => (
                  <Link key={a.id} href="/leads" style={{ textDecoration: 'none' }}>
                    <div className="db-btn" style={{
                      padding: '12px 18px',
                      borderBottom: i < DEMO_ACTIVITY.length - 1 ? `1px solid ${C.border2}` : 'none',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      background: a.unread ? '#FAFFFE' : 'transparent',
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: a.unread ? C.green : C.bg,
                        color: a.unread ? '#fff' : C.text2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800,
                      }}>
                        {a.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{a.flag} {a.agency}</span>
                          {a.unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0 }} />}
                          <span style={{ fontSize: 10, color: C.text3, marginLeft: 'auto' }}>{a.time}</span>
                        </div>
                        <div style={{ fontSize: 11, color: C.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                          {a.msg}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '16px 18px' }} className="db-card slide-in">
                <h2 style={{ fontSize: 14, fontWeight: 800, margin: '0 0 12px', color: C.text }}>Quick Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'New Property',  sub: 'Launch APEX distribution',     href: '/properties/new', color: C.green,  bg: C.greenBg,  icon: '🏠' },
                    { label: 'Messages',      sub: `${unread} unread`,              href: '/messenger',      color: C.purple, bg: C.purpleBg, icon: '💬' },
                    { label: 'Distribution',  sub: 'Wave report',                  href: '/distribution',   color: C.blue,   bg: C.blueBg,   icon: '📡' },
                    { label: 'Billing',       sub: 'Subscription & plans',         href: '/billing',        color: C.orange, bg: C.orangeBg, icon: '💳' },
                  ].map(q => (
                    <Link key={q.label} href={q.href} style={{ textDecoration: 'none' }}>
                      <div className="db-btn" style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 10,
                        background: q.bg, border: `1px solid ${q.color}20`,
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          {q.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: q.color }}>{q.label}</div>
                          <div style={{ fontSize: 11, color: C.text3 }}>{q.sub}</div>
                        </div>
                        <span style={{ color: q.color, fontSize: 14, opacity: 0.5 }}>→</span>
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
