'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_PROPERTIES = [
  {
    id: 'prop-001',
    type: 'Villa',
    address: 'Sveti Stefan Peninsula',
    city: 'Budva',
    country: 'Montenegro',
    price: 890000,
    currency: 'EUR',
    area: 280,
    status: 'distributing',
    intent: 'sell',
    matchScore: 94,
    listedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    views: 847,
    activeAgencies: 18,
    totalAgencies: 28,
    wave: 1,
    leads: 3,
    img: 'from-slate-800 via-zinc-700 to-stone-800',
  },
  {
    id: 'prop-002',
    type: 'Apartment',
    address: 'Knez Mihailova 24',
    city: 'Belgrade',
    country: 'Serbia',
    price: 340000,
    currency: 'EUR',
    area: 95,
    status: 'pending_approval',
    intent: 'sell',
    matchScore: 87,
    listedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    views: 112,
    activeAgencies: 0,
    totalAgencies: 22,
    wave: 0,
    leads: 0,
    img: 'from-zinc-800 via-neutral-700 to-slate-800',
  },
  {
    id: 'prop-003',
    type: 'Land',
    address: 'Zlatibor Mountain Zone B',
    city: 'Zlatibor',
    country: 'Serbia',
    price: 180000,
    currency: 'EUR',
    area: 2400,
    status: 'wave2',
    intent: 'sell',
    matchScore: 79,
    listedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    views: 1203,
    activeAgencies: 9,
    totalAgencies: 19,
    wave: 2,
    leads: 7,
    img: 'from-emerald-900 via-stone-800 to-zinc-900',
  },
]

const DEMO_AGENCIES = [
  { name: 'Engel & Völkers Adriatic', city: 'Budva', score: 97, reason: 'Top luxury agency in Montenegro with 94% response rate. Specialises in Russian & German buyers above €500k.', tags: ['Luxury', 'Cross-border', 'Russian buyers'], wave: 1, status: 'opened', responseTime: '2h ago' },
  { name: "Sotheby's Realty MNE", city: 'Porto Montenegro', score: 94, reason: 'HNWI specialist. Strong UK and Scandinavian buyer network. Converts 1 in 3 luxury leads.', tags: ['HNWI', 'Luxury', 'UK buyers'], wave: 1, status: 'replied', responseTime: '5h ago' },
  { name: 'Savills International', city: 'London', score: 91, reason: 'Global reach agency with a dedicated Balkans desk. Actively markets Montenegro to UK pension investors.', tags: ['International', 'UK investors'], wave: 1, status: 'sent', responseTime: '' },
  { name: 'Knight Frank Serbia', city: 'Belgrade', score: 88, reason: 'Market leader in premium Balkan properties. Strong cross-border contacts across DACH region.', tags: ['Balkans', 'Premium', 'DACH'], wave: 1, status: 'sent', responseTime: '' },
  { name: 'Tranio Partners', city: 'Berlin', score: 85, reason: 'German-speaking buyer specialist. Runs dedicated digital campaigns for expat investor segments.', tags: ['German buyers', 'Expats'], wave: 1, status: 'sent', responseTime: '' },
  { name: 'RE/MAX Adriatic Coast', city: 'Split, Croatia', score: 82, reason: 'Adriatic coast network with active referral program between Montenegro and Croatia listings.', tags: ['Adriatic', 'Network'], wave: 2, status: 'queued', responseTime: '' },
  { name: 'Century 21 Montenegro', city: 'Podgorica', score: 78, reason: 'Large local network. Best suited for mid-market local buyer segment up to €600k.', tags: ['Local', 'Mid-market'], wave: 2, status: 'queued', responseTime: '' },
  { name: 'Gulf Property Investments', city: 'Dubai', score: 74, reason: 'Growing Middle East investor interest in Adriatic properties. Active in UAE HNWI segment.', tags: ['UAE', 'HNWI', 'GCC'], wave: 2, status: 'queued', responseTime: '' },
]

const SCORE_DIMS = [
  { label: 'Geographic fit', val: 97 },
  { label: 'Property type match', val: 93 },
  { label: 'Buyer profile alignment', val: 89 },
  { label: 'Response rate', val: 87 },
  { label: 'Cross-border specialization', val: 85 },
  { label: 'Conversion history', val: 82 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function elapsedDays(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}
function elapsedLabel(date: Date) {
  const d = elapsedDays(date)
  if (d === 0) return 'Listed today'
  if (d === 1) return '1 day on market'
  return `${d} days on market`
}
function fmtPrice(n: number, cur: string) {
  return cur + ' ' + n.toLocaleString()
}
function statusColor(s: string) {
  if (s === 'distributing') return 'var(--green)'
  if (s === 'wave2') return 'var(--blue)'
  if (s === 'pending_approval') return 'var(--amber)'
  if (s === 'replied') return 'var(--green)'
  if (s === 'opened') return 'var(--blue)'
  return 'var(--text-tertiary)'
}
function statusLabel(s: string) {
  if (s === 'distributing') return '● Wave 1 Active'
  if (s === 'wave2') return '● Wave 2 Active'
  if (s === 'pending_approval') return '◐ Awaiting approval'
  if (s === 'replied') return '● Reply received'
  if (s === 'opened') return '◉ Email opened'
  if (s === 'queued') return '○ Queued Wave 2'
  if (s === 'sent') return '→ Sent'
  return s
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '20px 22px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: accent ? 'var(--primary)' : 'var(--text)', marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{sub}</div>}
    </div>
  )
}

// ─── Property Card ────────────────────────────────────────────────────────────
function PropertyCard({ p, onClick, active }: { p: typeof DEMO_PROPERTIES[0]; onClick: () => void; active: boolean }) {
  const [tick, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 30000); return () => clearInterval(t) }, [])
  const days = elapsedDays(p.listedAt)

  return (
    <div onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${active ? 'var(--primary-border)' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '18px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: active ? 'var(--shadow)' : 'var(--shadow-sm)',
      }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{p.intent === 'sell' ? 'FOR SALE' : 'FOR RENT'} · {p.type}</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 2 }}>{p.address}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.city}, {p.country}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{fmtPrice(p.price, p.currency)}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{p.area} m²</div>
        </div>
      </div>

      {/* Status + metrics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: statusColor(p.status) }}>
          {statusLabel(p.status)}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--border)' }}>·</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{elapsedLabel(p.listedAt)}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--border)' }}>·</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{p.views.toLocaleString()} views</span>
      </div>

      {/* Progress bar: agencies */}
      {p.totalAgencies > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: 5 }}>
            <span>{p.activeAgencies} active agencies</span>
            <span>{p.totalAgencies} in pool</span>
          </div>
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
            <div style={{ height: 3, borderRadius: 2, background: 'linear-gradient(90deg, var(--primary), var(--primary-hover))', width: `${(p.activeAgencies / p.totalAgencies) * 100}%`, transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      {/* Day timer visual */}
      <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < days ? 'var(--primary)' : 'var(--border)',
          }} />
        ))}
        <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', marginLeft: 4 }}>Day {days}/14</span>
      </div>
    </div>
  )
}

// ─── AI Matching Panel ────────────────────────────────────────────────────────
function AIMatchingPanel({ prop }: { prop: typeof DEMO_PROPERTIES[0] }) {
  const [selectedAgency, setSelectedAgency] = useState<number | null>(0)
  const sa = selectedAgency !== null ? DEMO_AGENCIES[selectedAgency] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>AI Matching Engine</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{prop.address} · {prop.city}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{prop.matchScore}</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>overall score</div>
        </div>
      </div>

      {/* Score bars */}
      <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Matching dimensions</div>
        {SCORE_DIMS.map((d, i) => (
          <div key={i} style={{ marginBottom: i < SCORE_DIMS.length - 1 ? 10 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
              <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{d.val}%</span>
            </div>
            <div style={{ height: 2, background: 'var(--border)', borderRadius: 1 }}>
              <div style={{ height: 2, borderRadius: 1, width: `${d.val}%`, background: `linear-gradient(90deg, var(--primary), var(--primary-hover))`, transition: 'width 0.8s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Agency pool stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Wave 1', val: '10', sub: 'sent' },
          { label: 'Opened', val: '6', sub: 'emails' },
          { label: 'Replies', val: '2', sub: 'received' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{s.label} {s.sub}</div>
          </div>
        ))}
      </div>

      {/* Agency list */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Matched agencies ({DEMO_AGENCIES.length} of {prop.totalAgencies})
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, paddingRight: 2 }}>
          {DEMO_AGENCIES.map((a, i) => (
            <div key={i} onClick={() => setSelectedAgency(selectedAgency === i ? null : i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                background: selectedAgency === i ? 'var(--primary-light)' : 'var(--surface-2)',
                border: `1px solid ${selectedAgency === i ? 'var(--primary-border)' : 'var(--border)'}`,
                transition: 'all 0.15s',
              }}>
              {/* Rank */}
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', width: 18, flexShrink: 0 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              {/* Avatar */}
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0 }}>
                {a.name.charAt(0)}
              </div>
              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{a.city}</div>
              </div>
              {/* Status */}
              <div style={{ fontSize: '0.65rem', color: statusColor(a.status), flexShrink: 0 }}>
                {statusLabel(a.status)}
              </div>
              {/* Score */}
              <div style={{ fontSize: '1rem', fontWeight: 700, flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {a.score}
              </div>
            </div>
          ))}
          {/* More agencies */}
          <div style={{ padding: '8px 12px', borderRadius: 10, border: '1px dashed var(--border)', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            +{prop.totalAgencies - DEMO_AGENCIES.length} more in pool — Wave 3
          </div>
        </div>

        {/* Reasoning panel */}
        {sa && (
          <div style={{ marginTop: 10, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)' }}>Why {sa.name}?</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {sa.tags.map((t, i) => (
                  <span key={i} style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 999, background: 'var(--green-light)', color: 'var(--green)', border: '1px solid var(--green-border)' }}>{t}</span>
                ))}
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{sa.reason}</p>
            {sa.responseTime && (
              <div style={{ marginTop: 8, fontSize: '0.65rem', color: 'var(--green)' }}>✓ {sa.status === 'replied' ? 'Replied' : 'Opened'} {sa.responseTime}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
const ACTIVITY = [
  { icon: '💬', text: 'Sotheby\'s Realty replied to Budva Villa offer', time: '5h ago', type: 'reply' },
  { icon: '📧', text: 'Engel & Völkers opened the offer email', time: '7h ago', type: 'open' },
  { icon: '🤖', text: 'AI matched 22 agencies for Budva Villa', time: '1d ago', type: 'match' },
  { icon: '✅', text: 'You approved distribution for Budva Villa', time: '1d ago', type: 'approval' },
  { icon: '🎯', text: 'Wave 1 sent to 10 agencies — Budva Villa', time: '1d ago', type: 'wave' },
  { icon: '📊', text: 'Zlatibor Land received 7th lead inquiry', time: '2d ago', type: 'lead' },
  { icon: '📨', text: 'Wave 2 auto-sent for Zlatibor Land', time: '4d ago', type: 'wave' },
]

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [selectedProp, setSelectedProp] = useState(0)
  const prop = DEMO_PROPERTIES[selectedProp]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: 0, marginBottom: 4 }}>Overview</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Active campaigns · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/properties/new" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
          borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
          color: 'white', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none',
          boxShadow: 'var(--shadow)',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1.5V10.5M1.5 6H10.5" stroke="white" strokeWidth="1.75" strokeLinecap="round"/></svg>
          Add Property
        </Link>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <KPI label="Active properties" value="3" sub="2 distributing, 1 pending" accent />
        <KPI label="Total leads received" value="10" sub="+3 this week" />
        <KPI label="Agencies contacted" value="37" sub="across all campaigns" />
        <KPI label="Avg. match score" value="87%" sub="Above platform average" />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, height: 'calc(100vh - 240px)' }}>
        {/* Left: Properties */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Your Properties</div>
          {DEMO_PROPERTIES.map((p, i) => (
            <PropertyCard key={p.id} p={p} onClick={() => setSelectedProp(i)} active={selectedProp === i} />
          ))}

          {/* Add property card */}
          <Link href="/properties/new" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '24px 18px', borderRadius: 16,
            border: '1px dashed var(--border-strong)', textDecoration: 'none', color: 'var(--text-tertiary)',
            fontSize: '0.8rem', transition: 'all 0.2s',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><path d="M12 5v14M5 12h14"/></svg>
            Add another property
          </Link>

          {/* Activity */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Recent Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACTIVITY.slice(0, 5).map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.85rem', flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text)', lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Matching Panel */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <AIMatchingPanel prop={prop} />
        </div>
      </div>
    </div>
  )
}
